import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { appOrigin, boundary, body, cookie, cookies, HttpError, required, requestOrigin, send } from './http.ts';
import { authenticate, checked, clearSession, setSession, supabase, teacher } from './auth.ts';
import {
  deterministicUuid,
  getOrCreateTeacherTenant,
  isSupabaseConfigured,
  setStandaloneCookie,
  signStandaloneSession,
  standaloneChangeStudentPassword,
  standaloneCreateStudent,
  standaloneCreateStudentsBulk,
  standaloneHandleLegacyImport,
  standaloneResetStudentPassword,
  standaloneRollbackLegacyImport,
  standaloneSaveDocument,
  standaloneStudentLogin,
} from './standalone.ts';
import {
  aiDocumentPatchRequestSchema,
  aiExerciseRequestSchema,
  buildSafeCsv,
  chatRequestSchema,
  classSchema,
  documentSchema,
  loginSchema,
  selfCorrectionSchema,
  studentCreateSchema,
  uuid,
} from '../shared/contracts.ts';
import { applyDocumentNodePatch, ensureNodeIds } from '../shared/document.ts';
import { checkAIConnection, generate, generateAIExercise, generateDocumentNodePatch } from './ai.ts';
import { googleOAuthOptions, shouldGrantTeacherAccess } from './oauth.ts';

const teacherGoogleQuickSchema = z
  .object({
    email: z.string().trim().min(3).max(160),
    name: z.string().trim().max(100).optional(),
    credential: z.string().max(4096).optional(),
  })
  .strict();

const studentBulkCreateSchema = z
  .object({
    classId: uuid,
    students: z
      .array(
        z
          .object({
            name: z.string().trim().min(1).max(100),
            studentCode: z.string().trim().max(40).optional(),
          })
          .strict()
      )
      .min(1)
      .max(100),
  })
  .strict();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await boundary(req, res, async () => {
    const url = new URL(req.url || '/', 'http://internal');
    const path = url.pathname.replace(/\/$/, '');
    const method = req.method || 'GET';
    const userGeminiKey = typeof req.headers['x-gemini-api-key'] === 'string' ? req.headers['x-gemini-api-key'].trim() : '';

    if (path === '/api/health' && method === 'GET') {
      send(res, 200, { status: 'ok' });
      return;
    }
    if ((path === '/api/logout' || path === '/api/auth/logout') && method === 'POST') {
      const token = cookies(req).cv_access;
      if (token && !token.startsWith('st1.') && isSupabaseConfigured()) {
        await supabase(undefined, true)
          .auth.admin.signOut(token, 'global')
          .catch(() => null);
      }
      clearSession(res);
      send(res, 200, { success: true });
      return;
    }
    if ((path === '/api/teacher-google' || path === '/api/auth/teacher-google') && method === 'POST') {
      const input = teacherGoogleQuickSchema.parse(await body(req));
      let verifiedEmail = input.email.includes('@') ? input.email.toLowerCase() : `${input.email.toLowerCase()}@gmail.com`;
      let verifiedName = (input.name || '').trim() || `Thầy/Cô (${verifiedEmail.split('@')[0]})`;

      if (input.credential) {
        const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(input.credential)}`;
        const googleRes = await fetch(googleVerifyUrl).catch(() => null);
        if (googleRes?.ok) {
          const payload = (await googleRes.json().catch(() => null)) as any;
          if (payload?.email) {
            verifiedEmail = String(payload.email).toLowerCase();
            verifiedName = payload.name || payload.given_name || verifiedName;
          }
        }
      }

      const granted = shouldGrantTeacherAccess({
        existingAccessEnabled: null,
        email: verifiedEmail,
        allowedEmailsEnv: process.env.TEACHER_ALLOWED_EMAILS,
      });
      if (!granted) {
        throw new HttpError(403, 'TEACHER_NOT_APPROVED', 'Tài khoản Google này không nằm trong danh sách giáo viên được phép.');
      }

      const teacherUserId = deterministicUuid('teacher-google', verifiedEmail);
      getOrCreateTeacherTenant(teacherUserId, verifiedName);
      const token = signStandaloneSession({
        sub: teacherUserId,
        role: 'teacher',
        email: verifiedEmail,
        name: verifiedName,
        school: '',
      });
      setStandaloneCookie(res, token);
      send(res, 200, {
        success: true,
        profile: {
          user_id: teacherUserId,
          name: verifiedName,
          email: verifiedEmail,
          school: '',
          role: 'teacher',
          forced_password_change: false,
        },
      });
      return;
    }
    if (path === '/api/auth/google/start' && method === 'GET') {
      if (!isSupabaseConfigured()) {
        res.statusCode = 302;
        res.setHeader('Location', `${requestOrigin(req) || appOrigin(req)}/?google_picker=1`);
        res.end();
        return;
      }
      let verifier = '';
      const client = createClient(required('SUPABASE_URL'), required('SUPABASE_PUBLISHABLE_KEY'), {
        auth: {
          flowType: 'pkce',
          persistSession: true,
          autoRefreshToken: false,
          storage: {
            getItem: () => null,
            setItem: (key, value) => {
              if (key.endsWith('code-verifier')) verifier = value;
            },
            removeItem: () => {},
          },
        },
      });
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: googleOAuthOptions(requestOrigin(req) || appOrigin(req)),
      });
      if (error || !data.url || !verifier) {
        res.statusCode = 302;
        res.setHeader('Location', `${requestOrigin(req) || appOrigin(req)}/?google_picker=1`);
        res.end();
        return;
      }
      res.setHeader('Set-Cookie', cookie('cv_pkce', encodeURIComponent(verifier), 600));
      res.statusCode = 302;
      res.setHeader('Location', data.url);
      res.end();
      return;
    }
    if (path === '/api/auth/google/callback' && method === 'GET') {
      try {
        if (url.searchParams.get('error')) throw new HttpError(401, 'OAUTH_CANCELLED', 'Đăng nhập Google bị hủy.');
        const code = url.searchParams.get('code');
        const saved = cookies(req).cv_pkce;
        if (!code || !saved) throw new HttpError(400, 'OAUTH_STATE', 'Phiên đăng nhập Google hết hạn.');
        const client = createClient(required('SUPABASE_URL'), required('SUPABASE_PUBLISHABLE_KEY'), {
          auth: {
            flowType: 'pkce',
            persistSession: true,
            autoRefreshToken: false,
            storage: {
              getItem: key => (key.endsWith('code-verifier') ? decodeURIComponent(saved) : null),
              setItem: () => {},
              removeItem: () => {},
            },
          },
        });
        const result = await client.auth.exchangeCodeForSession(code);
        if (result.error || !result.data.session) throw new HttpError(401, 'OAUTH_FAILED', 'Không xác thực được Google.');
        const admin = supabase(undefined, true);
        const user = result.data.user!;
        const access = checked(await admin.from('teacher_access').select('user_id,enabled').eq('user_id', user.id).maybeSingle());
        const granted = shouldGrantTeacherAccess({
          existingAccessEnabled: access ? access.enabled : null,
          email: user.email,
          allowedEmailsEnv: process.env.TEACHER_ALLOWED_EMAILS,
        });
        if (!granted) {
          throw new HttpError(403, 'TEACHER_NOT_APPROVED', 'Tài khoản Google này không nằm trong danh sách giáo viên được phép.');
        }
        if (!access) {
          checked(await admin.from('teacher_access').upsert({ user_id: user.id, enabled: true }));
        }
        const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Giáo viên';
        const existing = checked(await admin.from('profiles').select('user_id').eq('user_id', user.id).maybeSingle());
        if (!existing) {
          checked(await admin.from('profiles').insert({ user_id: user.id, role: 'teacher', name: displayName }));
        }
        setSession(res, result.data.session);
        const set = res.getHeader('Set-Cookie') as string[];
        res.setHeader('Set-Cookie', [...set, cookie('cv_pkce', '', 0)]);
        res.statusCode = 302;
        res.setHeader('Location', `${requestOrigin(req) || appOrigin(req)}/`);
        res.end();
        return;
      } catch (error) {
        redirectAuthError(req, res, error instanceof HttpError ? error.code : 'OAUTH_FAILED');
        return;
      }
    }
    if ((path === '/api/student-login' || path === '/api/auth/student-login') && method === 'POST') {
      const input = loginSchema.parse(await body(req));
      const aiCheck = checkAIConnection(false, userGeminiKey).catch(() => null);
      if (!isSupabaseConfigured()) {
        try {
          const { token } = standaloneStudentLogin(input.identifier, input.password);
          setStandaloneCookie(res, token);
          send(res, 200, { success: true, ai: await aiCheck });
          return;
        } catch (err) {
          // If no standalone student exists and Supabase is missing, preserve the honest missing-server error when no teacher created it
          required('SUPABASE_URL');
          throw err;
        }
      }
      const admin = supabase(undefined, true);
      const rateKey = createHash('sha256').update(input.identifier.toUpperCase()).digest('hex');
      const allowed = checked(await admin.rpc('login_rate_limit', { p_key: rateKey }));
      if (!allowed) throw new HttpError(429, 'LOGIN_RATE_LIMIT', 'Thử đăng nhập quá nhiều lần. Vui lòng chờ 15 phút.', true);
      const account = checked(
        await admin.from('student_accounts').select('auth_email').eq('student_code', input.identifier.toUpperCase()).maybeSingle()
      );
      const result = await supabase().auth.signInWithPassword({
        email: account?.auth_email || 'missing@students.invalid',
        password: input.password,
      });
      if (result.error || !result.data.session || !account) throw new HttpError(401, 'LOGIN_FAILED', 'Mã học sinh hoặc mật khẩu không đúng.');
      setSession(res, result.data.session);
      send(res, 200, { success: true, ai: await aiCheck });
      return;
    }
    const identity = await authenticate(req, res);
    const { db, id, role } = identity;
    const standaloneTenant = identity.standalone ? getOrCreateTeacherTenant(identity.teacherId || id, identity.name, identity.school) : null;

    if (path === '/api/auth/password' && method === 'POST') {
      const { password } = z.object({ password: z.string().min(12).max(128) }).strict().parse(await body(req));
      if (identity.standalone) {
        const changed = standaloneChangeStudentPassword(
          {
            sub: id,
            role,
            email: identity.email || '',
            name: identity.name,
            school: identity.school,
            studentCode: identity.studentCode,
            classId: identity.classId,
            teacherId: identity.teacherId,
            forcedPasswordChange: false,
            iat: 0,
            exp: 0,
          },
          password
        );
        setStandaloneCookie(res, changed.token);
        send(res, 200, { success: true, relogged: true, ai: await checkAIConnection(false, userGeminiKey).catch(() => null) });
        return;
      }
      const admin = supabase(undefined, true);
      const changed = await admin.auth.admin.updateUserById(id, { password });
      if (changed.error) throw new HttpError(503, 'PASSWORD_CHANGE_FAILED', 'Không đổi được mật khẩu.');
      checked(await admin.from('profiles').update({ forced_password_change: false, revoked_before: Math.floor(Date.now() / 1000) }).eq('user_id', id));
      await admin.auth.admin.signOut(cookies(req).cv_access || '', 'global');
      clearSession(res);
      const email = changed.data.user?.email;
      if (role === 'student' && email) {
        await new Promise(resolve => setTimeout(resolve, 1100));
        const relogin = await supabase().auth.signInWithPassword({ email, password });
        if (relogin.data.session) {
          setSession(res, relogin.data.session);
          send(res, 200, { success: true, relogged: true, ai: await checkAIConnection(false, userGeminiKey).catch(() => null) });
          return;
        }
      }
      send(res, 200, { success: true, relogged: false });
      return;
    }
    if (path === '/api/session' && method === 'GET') {
      if (standaloneTenant) {
        const profile =
          role === 'teacher'
            ? standaloneTenant.profile
            : {
                user_id: id,
                name: identity.name,
                school: standaloneTenant.profile.school || '',
                role: 'student' as const,
                forced_password_change: identity.forcedPasswordChange,
              };
        const stuRow = role === 'student' ? standaloneTenant.students.find(s => s.user_id === id) || null : null;
        const student = stuRow
          ? {
              user_id: stuRow.user_id,
              student_code: stuRow.student_code,
              teacher_id: stuRow.teacher_id,
              class_id: stuRow.class_id,
              data: stuRow.data,
            }
          : null;
        send(res, 200, { profile, student });
        return;
      }
      const profile = checked(await db.from('profiles').select('user_id,name,school,role,forced_password_change').eq('user_id', id).single());
      const student =
        role === 'student'
          ? checked(await db.from('student_accounts').select('user_id,student_code,teacher_id,class_id,data').eq('user_id', id).single())
          : null;
      send(res, 200, { profile, student });
      return;
    }
    if (identity.forcedPasswordChange) throw new HttpError(403, 'PASSWORD_CHANGE_REQUIRED', 'Vui lòng đổi mật khẩu được cấp trước khi tiếp tục.');
    if ((path === '/api/ai-status' || path === '/api/ai/status') && method === 'GET') {
      send(res, 200, await checkAIConnection(url.searchParams.get('force') === '1', userGeminiKey));
      return;
    }
    if (path === '/api/workspace' && method === 'GET') {
      if (standaloneTenant) {
        send(res, 200, {
          classes: standaloneTenant.classes.filter(c => !c.archived_at),
          students: standaloneTenant.students.map(({ password_hash: _, auth_email: __, ...rest }) => rest),
          submissions: standaloneTenant.submissions,
          assignments: standaloneTenant.assignments,
        });
        return;
      }
      const classes = checked(await db.from('classes').select('id,teacher_id,data').is('archived_at', null));
      const students = checked(await db.from('student_accounts').select('user_id,student_code,teacher_id,class_id,data'));
      const submissions = checked(await db.from('submissions').select('id,student_id,class_id,data,created_at').order('created_at', { ascending: false }));
      const assignments = checked(await db.from('assignments').select('*'));
      send(res, 200, { classes, students, submissions, assignments });
      return;
    }
    if (path === '/api/profile' && method === 'POST') {
      const input = z.object({ name: z.string().trim().min(1).max(100), school: z.string().max(200) }).strict().parse(await body(req));
      if (standaloneTenant) {
        standaloneTenant.profile.name = input.name;
        standaloneTenant.profile.school = input.school;
        const refreshed = signStandaloneSession({
          sub: id,
          role,
          email: identity.email || '',
          name: input.name,
          school: input.school,
        });
        setStandaloneCookie(res, refreshed);
        send(res, 200, { success: true });
        return;
      }
      checked(await supabase(undefined, true).from('profiles').update(input).eq('user_id', id));
      send(res, 200, { success: true });
      return;
    }
    if (path === '/api/students/update' && method === 'POST') {
      teacher(identity);
      const input = z.object({ studentId: uuid, classId: uuid, name: z.string().trim().min(1).max(100) }).strict().parse(await body(req));
      if (standaloneTenant) {
        const stu = standaloneTenant.students.find(s => s.user_id === input.studentId);
        const ownClass = standaloneTenant.classes.find(c => c.id === input.classId && !c.archived_at);
        if (!stu || !ownClass) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy học sinh/lớp được phép cập nhật.');
        stu.class_id = input.classId;
        stu.data.name = input.name;
        send(res, 200, { success: true });
        return;
      }
      const owned = checked(await db.from('student_accounts').select('user_id').eq('user_id', input.studentId).eq('teacher_id', id).maybeSingle());
      const ownClass = checked(await db.from('classes').select('id').eq('id', input.classId).eq('teacher_id', id).is('archived_at', null).maybeSingle());
      if (!owned || !ownClass) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy học sinh/lớp được phép cập nhật.');
      checked(
        await supabase(undefined, true).rpc('update_student', {
          p_student: input.studentId,
          p_teacher: id,
          p_class: input.classId,
          p_name: input.name,
        })
      );
      send(res, 200, { success: true });
      return;
    }
    if (path === '/api/classes' && method === 'POST') {
      teacher(identity);
      const input = classSchema.parse(await body(req));
      if (standaloneTenant) {
        const existing = standaloneTenant.classes.find(c => c.id === input.id);
        if (!existing) {
          standaloneTenant.classes.push({ id: input.id, teacher_id: id, data: input, archived_at: null });
        } else {
          existing.data = input;
        }
        send(res, 200, { success: true });
        return;
      }
      const admin = supabase(undefined, true);
      const existing = checked(await db.from('classes').select('id').eq('id', input.id).maybeSingle());
      if (!existing) {
        checked(await admin.from('classes').insert({ id: input.id, teacher_id: id, data: input }));
      } else checked(await admin.from('classes').update({ data: input }).eq('id', input.id).eq('teacher_id', id));
      send(res, 200, { success: true });
      return;
    }
    if (path.startsWith('/api/classes/') && method === 'DELETE') {
      teacher(identity);
      const classId = uuid.parse(path.split('/').pop());
      if (standaloneTenant) {
        const owned = standaloneTenant.classes.find(c => c.id === classId);
        if (!owned) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy lớp.');
        owned.archived_at = new Date().toISOString();
        send(res, 200, { success: true });
        return;
      }
      const owned = checked(await db.from('classes').select('id').eq('id', classId).maybeSingle());
      if (!owned) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy lớp.');
      checked(await supabase(undefined, true).from('classes').update({ archived_at: new Date().toISOString() }).eq('id', classId).eq('teacher_id', id));
      send(res, 200, { success: true });
      return;
    }
    if ((path === '/api/students-bulk' || path === '/api/students/bulk') && method === 'POST') {
      teacher(identity);
      const input = studentBulkCreateSchema.parse(await body(req));
      if (standaloneTenant) {
        send(res, 201, standaloneCreateStudentsBulk(id, input));
        return;
      }
      const owned = checked(await db.from('classes').select('id,data').eq('id', input.classId).eq('teacher_id', id).is('archived_at', null).maybeSingle());
      if (!owned) throw new HttpError(403, 'FORBIDDEN', 'Lớp không thuộc quyền quản lý.');
      const admin = supabase(undefined, true);
      const rawPrefix = String((owned.data as any)?.classCode || (owned.data as any)?.name || 'HS')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 8) || 'HS';
      const created: Array<{ id: string; name: string; studentCode: string; temporaryPassword: string }> = [];
      const skipped: Array<{ name: string; studentCode?: string; reason: string }> = [];
      let seq = 1;

      for (const item of input.students) {
        const cleanName = item.name.trim();
        let code = (item.studentCode || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
        if (!code) {
          code = `${rawPrefix}-${String(seq).padStart(3, '0')}-${randomBytes(2).toString('hex').toUpperCase()}`;
          seq += 1;
        }
        let studentId: string = randomUUID();
        const email = `${studentId}@students.invalid`;
        const password = randomBytes(6).toString('base64url');
        const userRes = await admin.auth.admin.createUser({ id: studentId, email, password, email_confirm: true });
        if (userRes.error || !userRes.data.user) {
          skipped.push({ name: cleanName, studentCode: code, reason: 'Không tạo được tài khoản Auth.' });
          continue;
        }
        studentId = userRes.data.user.id;
        try {
          checked(await admin.from('profiles').insert({ user_id: studentId, role: 'student', name: cleanName, forced_password_change: false }));
          checked(
            await admin.from('student_accounts').insert({
              user_id: studentId,
              student_code: code,
              auth_email: email,
              teacher_id: id,
              class_id: input.classId,
              data: { name: cleanName, status: 'not_started', gapsCount: 0, testHistory: [], assignedTasks: [] },
            })
          );
          created.push({ id: studentId, name: cleanName, studentCode: code, temporaryPassword: password });
        } catch {
          await admin.from('profiles').delete().eq('user_id', studentId);
          await admin.auth.admin.deleteUser(studentId);
          skipped.push({ name: cleanName, studentCode: code, reason: 'Mã học sinh đã tồn tại hoặc lỗi dữ liệu.' });
        }
      }
      send(res, 201, { created, skipped });
      return;
    }
    if (path === '/api/students' && method === 'POST') {
      teacher(identity);
      const input = studentCreateSchema.parse(await body(req));
      if (standaloneTenant) {
        send(res, 201, standaloneCreateStudent(id, input));
        return;
      }
      const owned = checked(await db.from('classes').select('id').eq('id', input.classId).eq('teacher_id', id).is('archived_at', null).maybeSingle());
      if (!owned) throw new HttpError(403, 'FORBIDDEN', 'Lớp không thuộc quyền quản lý.');
      const admin = supabase(undefined, true);
      let studentId: string = randomUUID();
      const email = `${studentId}@students.invalid`;
      const password = randomBytes(18).toString('base64url');
      const created = await admin.auth.admin.createUser({ id: studentId, email, password, email_confirm: true });
      if (created.error || !created.data.user) throw new HttpError(503, 'ACCOUNT_CREATE_FAILED', 'Không tạo được tài khoản Auth.');
      studentId = created.data.user.id;
      try {
        checked(await admin.from('profiles').insert({ user_id: studentId, role: 'student', name: input.name, forced_password_change: false }));
        checked(
          await admin.from('student_accounts').insert({
            user_id: studentId,
            student_code: input.studentCode.toUpperCase(),
            auth_email: email,
            teacher_id: id,
            class_id: input.classId,
            data: { name: input.name, status: 'not_started', gapsCount: 0, testHistory: [], assignedTasks: [] },
          })
        );
      } catch (error) {
        await admin.from('profiles').delete().eq('user_id', studentId);
        await admin.auth.admin.deleteUser(studentId);
        throw error;
      }
      send(res, 201, { id: studentId, studentCode: input.studentCode.toUpperCase(), temporaryPassword: password });
      return;
    }
    if (path === '/api/students/reset-password' && method === 'POST') {
      teacher(identity);
      const input = z.object({ studentId: uuid }).strict().parse(await body(req));
      if (standaloneTenant) {
        send(res, 200, standaloneResetStudentPassword(id, input.studentId));
        return;
      }
      const owned = checked(await db.from('student_accounts').select('user_id').eq('user_id', input.studentId).eq('teacher_id', id).maybeSingle());
      if (!owned) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy học sinh.');
      const password = randomBytes(18).toString('base64url');
      const admin = supabase(undefined, true);
      const result = await admin.auth.admin.updateUserById(input.studentId, { password });
      if (result.error) throw new HttpError(503, 'PASSWORD_RESET_FAILED', 'Không đặt lại được mật khẩu.');
      checked(
        await admin
          .from('profiles')
          .update({ forced_password_change: true, revoked_before: Math.floor(Date.now() / 1000) })
          .eq('user_id', input.studentId)
      );
      send(res, 200, { temporaryPassword: password });
      return;
    }
    if (path === '/api/conversations' && method === 'GET') {
      if (standaloneTenant) {
        send(
          res,
          200,
          standaloneTenant.conversations
            .filter(c => c.owner_id === id)
            .slice(0, 50)
            .map(c => ({ id: c.id, created_at: c.created_at }))
        );
        return;
      }
      send(
        res,
        200,
        checked(await db.from('conversations').select('id,created_at').eq('owner_id', id).order('created_at', { ascending: false }).limit(50))
      );
      return;
    }
    if (path === '/api/messages' && method === 'GET') {
      const conversationId = uuid.parse(url.searchParams.get('conversationId'));
      if (standaloneTenant) {
        send(
          res,
          200,
          standaloneTenant.messages.filter(m => m.conversation_id === conversationId && m.owner_id === id).slice(0, 200)
        );
        return;
      }
      send(res, 200, checked(await db.from('messages').select('*').eq('conversation_id', conversationId).eq('owner_id', id).order('created_at').limit(200)));
      return;
    }
    if (path === '/api/ai/chat' && method === 'POST') {
      const input = chatRequestSchema.parse(await body(req));
      if (standaloneTenant) {
        if (!userGeminiKey) {
          required('GEMINI_API_KEY');
          required('GEMINI_PRIMARY_MODEL');
        }
        if (!standaloneTenant.conversations.some(c => c.id === input.conversationId)) {
          standaloneTenant.conversations.unshift({ id: input.conversationId, owner_id: id, created_at: new Date().toISOString() });
        }
        const history = standaloneTenant.messages
          .filter(m => m.conversation_id === input.conversationId && m.owner_id === id)
          .slice(-12)
          .map(m => ({
            role: m.role,
            content: m.role === 'assistant' ? [m.content, m.data?.detailedSolution, m.data?.theorySummary].filter(Boolean).join('\n') : m.content,
          }));
        const result = await generate(
          [...history, { role: 'user', content: input.message || 'Phân tích nội dung bài toán.' }],
          input.intent,
          [],
          userGeminiKey
        );
        standaloneTenant.messages.push(
          {
            id: randomUUID(),
            conversation_id: input.conversationId,
            owner_id: id,
            role: 'user',
            content: input.message,
            data: { attachmentIds: input.attachmentIds },
            created_at: new Date().toISOString(),
          },
          {
            id: randomUUID(),
            conversation_id: input.conversationId,
            owner_id: id,
            role: 'assistant',
            content: result.chatReply,
            data: result,
            created_at: new Date().toISOString(),
          }
        );
        if (input.intent === 'submit_solution') {
          standaloneTenant.submissions.unshift({
            id: randomUUID(),
            student_id: id,
            teacher_id: standaloneTenant.profile.user_id,
            class_id: identity.classId || standaloneTenant.classes[0]?.id || null,
            created_at: new Date().toISOString(),
            data: {
              problemText: input.message,
              evaluation: { ...result, reviewState: 'unreviewed' },
              hasResolvedMistake: false,
            },
          });
        }
        send(res, 200, result);
        return;
      }
      const admin = supabase(undefined, true);
      const existing = checked(await admin.from('conversations').select('owner_id').eq('id', input.conversationId).maybeSingle());
      if (existing && existing.owner_id !== id) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy hội thoại.');
      if (!existing) checked(await admin.from('conversations').insert({ id: input.conversationId, owner_id: id }));
      let history =
        checked(
          await db.from('messages').select('role,content,data').eq('conversation_id', input.conversationId).order('created_at', { ascending: false }).limit(12)
        )?.reverse() || [];
      const historicalAttachmentIds = history.filter(m => m.role === 'user').at(-1)?.data?.attachmentIds || [];
      const contextAttachments = input.attachmentIds.length ? input.attachmentIds : historicalAttachmentIds;
      history = history.map(m => ({
        ...m,
        content: m.role === 'assistant' ? [m.content, m.data?.detailedSolution, m.data?.theorySummary].filter(Boolean).join('\n') : m.content,
      }));
      let historyBudget = 24000 - input.message.length;
      history = history
        .reverse()
        .filter(message => {
          historyBudget -= message.content.length;
          return historyBudget >= 0;
        })
        .reverse();
      const parts: { mimeType: string; data: string }[] = [];
      for (const attachmentId of contextAttachments) {
        const file = checked(await db.from('attachments').select('*').eq('id', attachmentId).eq('owner_id', id).eq('status', 'ready').maybeSingle());
        if (!file) throw new HttpError(404, 'FILE_NOT_FOUND', 'Không tìm thấy tệp được phép sử dụng.');
        if (file.mime.includes('wordprocessingml'))
          throw new HttpError(422, 'DOCX_REQUIRES_PDF', 'Vui lòng xuất DOCX thành PDF để AI đọc nguyên cấu trúc công thức/hình.');
        const download = await admin.storage.from('attachments').download(file.path);
        if (download.error || !download.data) throw new HttpError(503, 'FILE_DOWNLOAD_FAILED', 'Không đọc được tệp.');
        parts.push({ mimeType: file.mime, data: Buffer.from(await download.data.arrayBuffer()).toString('base64') });
      }
      if (!userGeminiKey) {
        required('GEMINI_API_KEY');
        required('GEMINI_PRIMARY_MODEL');
      }
      const state = checked(
        await admin.rpc('reserve_ai', {
          p_id: input.requestId,
          p_owner: id,
          p_conversation: input.conversationId,
          p_limit: Number(required('AI_DAILY_REQUEST_LIMIT_PER_USER')),
          p_global_tokens: Number(required('AI_GLOBAL_DAILY_TOKEN_LIMIT')),
        })
      );
      if (state === 'quota') throw new HttpError(429, 'AI_QUOTA', 'Đã đạt hạn mức sử dụng AI.', true);
      if (state !== 'reserved') {
        const previous = checked(await admin.from('ai_requests').select('result,status').eq('id', input.requestId).eq('owner_id', id).single());
        if (previous?.status === 'done' && previous.result) {
          send(res, 200, previous.result);
          return;
        }
        throw new HttpError(409, 'REQUEST_ALREADY_PROCESSED', 'Yêu cầu đang xử lý hoặc đã thất bại. Kiểm tra lịch sử trước khi gửi lại.');
      }
      try {
        const result = await generate(
          [...history, { role: 'user', content: input.message || 'Phân tích nội dung tệp đính kèm.' }],
          input.intent,
          parts,
          userGeminiKey
        );
        checked(
          await admin.rpc('finish_ai', {
            p_id: input.requestId,
            p_owner: id,
            p_message: input.message,
            p_result: result,
            p_attachments: input.attachmentIds,
          })
        );
        send(res, 200, result);
        return;
      } catch (error) {
        await admin.from('ai_requests').update({ status: 'failed' }).eq('id', input.requestId).eq('owner_id', id);
        throw error;
      }
    }
    if (path === '/api/ai/exercises' && method === 'GET') {
      const lessonId = url.searchParams.get('lessonId');
      if (standaloneTenant) {
        const list = lessonId ? standaloneTenant.aiExercises.filter(x => x.lesson_id === lessonId) : standaloneTenant.aiExercises;
        send(res, 200, list.slice(0, 50));
        return;
      }
      let query = db.from('ai_generated_questions').select('*').order('created_at', { ascending: false }).limit(50);
      if (lessonId) query = query.eq('lesson_id', lessonId);
      send(res, 200, checked(await query));
      return;
    }
    if (path === '/api/ai/exercises' && method === 'POST') {
      const input = aiExerciseRequestSchema.parse(await body(req));
      const { lessons, questionHash } = await import('./study.ts');
      const lesson = lessons.find(l => l.id === input.lessonId);
      if (!lesson) throw new HttpError(404, 'LESSON_NOT_FOUND', 'Không tìm thấy bài học.');
      if (!userGeminiKey) {
        required('GEMINI_API_KEY');
        required('GEMINI_PRIMARY_MODEL');
      }
      if (standaloneTenant) {
        const generated = await generateAIExercise(
          {
            lessonTitle: lesson.title,
            grade: Number(lesson.grade),
            format: input.format,
            difficulty: input.difficulty,
          },
          userGeminiKey
        );
        const qId = `ai-${lesson.id}-${input.requestId.slice(0, 8)}`;
        const questionRecord = { ...generated.question, id: qId, source: 'ai_draft', reviewState: 'draft_ai' };
        standaloneTenant.aiExercises.unshift({
          id: input.requestId,
          owner_id: id,
          lesson_id: lesson.id,
          format: input.format,
          status: 'draft_ai',
          content_hash: questionHash(questionRecord),
          data: questionRecord,
          created_at: new Date().toISOString(),
        });
        send(res, 201, {
          id: input.requestId,
          lessonId: lesson.id,
          format: input.format,
          status: 'draft_ai',
          notice: 'Bài tập do AI đề xuất (chưa thẩm định). Chỉ dùng tham khảo cho đến khi giáo viên duyệt.',
          question: questionRecord,
        });
        return;
      }
      const admin = supabase(undefined, true);
      const convId = input.requestId;
      checked(await admin.from('conversations').upsert({ id: convId, owner_id: id }));
      const state = checked(
        await admin.rpc('reserve_ai', {
          p_id: input.requestId,
          p_owner: id,
          p_conversation: convId,
          p_limit: Number(required('AI_DAILY_REQUEST_LIMIT_PER_USER')),
          p_global_tokens: Number(required('AI_GLOBAL_DAILY_TOKEN_LIMIT')),
        })
      );
      if (state === 'quota') throw new HttpError(429, 'AI_QUOTA', 'Đã đạt hạn mức sử dụng AI.', true);
      if (state !== 'reserved') {
        const previous = checked(await admin.from('ai_requests').select('result,status').eq('id', input.requestId).eq('owner_id', id).single());
        if (previous?.status === 'done' && previous.result) {
          send(res, 200, previous.result);
          return;
        }
        throw new HttpError(409, 'REQUEST_ALREADY_PROCESSED', 'Yêu cầu đang xử lý hoặc đã thất bại.');
      }
      try {
        const generated = await generateAIExercise(
          {
            lessonTitle: lesson.title,
            grade: Number(lesson.grade),
            format: input.format,
            difficulty: input.difficulty,
          },
          userGeminiKey
        );
        const qId = `ai-${lesson.id}-${input.requestId.slice(0, 8)}`;
        const questionRecord = { ...generated.question, id: qId, source: 'ai_draft', reviewState: 'draft_ai' };
        const hash = questionHash(questionRecord);
        checked(
          await admin.from('ai_generated_questions').insert({
            id: input.requestId,
            owner_id: id,
            lesson_id: lesson.id,
            format: input.format,
            status: 'draft_ai',
            content_hash: hash,
            data: questionRecord,
          })
        );
        await admin.from('ai_requests').update({ status: 'done', result: questionRecord }).eq('id', input.requestId).eq('owner_id', id);
        send(res, 201, {
          id: input.requestId,
          lessonId: lesson.id,
          format: input.format,
          status: 'draft_ai',
          notice: 'Bài tập do AI đề xuất (chưa thẩm định). Chỉ dùng tham khảo cho đến khi giáo viên duyệt.',
          question: questionRecord,
        });
        return;
      } catch (error) {
        await admin.from('ai_requests').update({ status: 'failed' }).eq('id', input.requestId).eq('owner_id', id);
        throw error;
      }
    }
    if (path === '/api/ai/document-patch' && method === 'POST') {
      const input = aiDocumentPatchRequestSchema.parse(await body(req));
      const doc = standaloneTenant
        ? standaloneTenant.documents.find(d => d.id === input.documentId && d.owner_id === id)
        : checked(await db.from('documents').select('*').eq('id', input.documentId).eq('owner_id', id).maybeSingle());
      if (!doc) throw new HttpError(404, 'DOCUMENT_NOT_FOUND', 'Không tìm thấy tài liệu.');
      if (doc.revision !== input.revision) {
        throw new HttpError(409, 'REVISION_CONFLICT', 'Tài liệu đã thay đổi phiên bản trong lúc chờ AI. Vui lòng tải lại trước khi áp dụng chỉnh sửa.');
      }
      if (!userGeminiKey) {
        required('GEMINI_API_KEY');
        required('GEMINI_PRIMARY_MODEL');
      }
      if (standaloneTenant) {
        const patchResult = await generateDocumentNodePatch(
          {
            currentText: input.currentText,
            instruction: input.instruction,
          },
          userGeminiKey
        );
        const proposedNode = {
          type: 'paragraph',
          attrs: { nodeId: input.targetNodeId },
          content: [{ type: 'text', text: patchResult.revisedText }],
        };
        const applied = applyDocumentNodePatch(doc.content, input.revision, doc.revision, input.targetNodeId, proposedNode);
        if (!applied.ok) {
          throw new HttpError(422, applied.reason, 'Không tìm thấy đoạn văn mục tiêu hoặc cấu trúc bản vá không hợp lệ.');
        }
        send(res, 200, {
          documentId: input.documentId,
          baseRevision: input.revision,
          targetNodeId: input.targetNodeId,
          revisedText: patchResult.revisedText,
          summary: patchResult.summary,
          patchedContentPreview: applied.document,
        });
        return;
      }
      const admin = supabase(undefined, true);
      checked(await admin.from('conversations').upsert({ id: input.requestId, owner_id: id }));
      const state = checked(
        await admin.rpc('reserve_ai', {
          p_id: input.requestId,
          p_owner: id,
          p_conversation: input.requestId,
          p_limit: Number(required('AI_DAILY_REQUEST_LIMIT_PER_USER')),
          p_global_tokens: Number(required('AI_GLOBAL_DAILY_TOKEN_LIMIT')),
        })
      );
      if (state === 'quota') throw new HttpError(429, 'AI_QUOTA', 'Đã đạt hạn mức sử dụng AI.', true);
      try {
        const patchResult = await generateDocumentNodePatch(
          {
            currentText: input.currentText,
            instruction: input.instruction,
          },
          userGeminiKey
        );
        const proposedNode = {
          type: 'paragraph',
          attrs: { nodeId: input.targetNodeId },
          content: [{ type: 'text', text: patchResult.revisedText }],
        };
        const latestDoc = checked(await db.from('documents').select('revision,content').eq('id', input.documentId).eq('owner_id', id).single());
        if (!latestDoc) throw new HttpError(404, 'DOCUMENT_NOT_FOUND', 'Không tìm thấy tài liệu.');
        const applied = applyDocumentNodePatch(latestDoc.content, input.revision, latestDoc.revision, input.targetNodeId, proposedNode);
        if (!applied.ok) {
          throw new HttpError(
            applied.reason === 'REVISION_CONFLICT' ? 409 : 422,
            applied.reason,
            applied.reason === 'REVISION_CONFLICT'
              ? 'Tài liệu đã được chỉnh sửa trong lúc AI đang xử lý; bản vá đã bị từ chối để tránh ghi đè.'
              : 'Không tìm thấy đoạn văn mục tiêu hoặc cấu trúc bản vá không hợp lệ.'
          );
        }
        await admin.from('ai_requests').update({ status: 'done', result: patchResult }).eq('id', input.requestId).eq('owner_id', id);
        send(res, 200, {
          documentId: input.documentId,
          baseRevision: input.revision,
          targetNodeId: input.targetNodeId,
          revisedText: patchResult.revisedText,
          summary: patchResult.summary,
          patchedContentPreview: applied.document,
        });
        return;
      } catch (error) {
        await admin.from('ai_requests').update({ status: 'failed' }).eq('id', input.requestId).eq('owner_id', id);
        throw error;
      }
    }
    if (path === '/api/documents' && method === 'GET') {
      const documentId = url.searchParams.get('id');
      if (standaloneTenant) {
        let list = standaloneTenant.documents.filter(d => d.owner_id === id);
        if (documentId) {
          const parsedId = uuid.parse(documentId);
          list = list.filter(d => d.id === parsedId);
        }
        send(res, 200, list.slice(0, 50));
        return;
      }
      let query = db.from('documents').select('*').eq('owner_id', id);
      if (documentId) query = query.eq('id', uuid.parse(documentId));
      send(res, 200, checked(await query.order('updated_at', { ascending: false }).limit(50)));
      return;
    }
    if (path === '/api/documents' && method === 'POST') {
      const input = documentSchema.parse(await body(req));
      if (standaloneTenant) {
        send(res, 200, standaloneSaveDocument(id, identity.teacherId || id, input));
        return;
      }
      const normalizedContent = ensureNodeIds(input.content);
      const revision = checked(
        await supabase(undefined, true).rpc('save_document', {
          p_id: input.id,
          p_owner: id,
          p_revision: input.revision,
          p_title: input.title,
          p_content: normalizedContent,
        })
      );
      if (!revision) throw new HttpError(409, 'REVISION_CONFLICT', 'Tài liệu đã được sửa ở nơi khác. Tải lại trước khi lưu.');
      send(res, 200, { revision, content: normalizedContent });
      return;
    }
    if (path === '/api/exports/docx' && method === 'POST') {
      const input = z
        .object({
          title: z.string().trim().min(1).max(200),
          content: documentSchema.shape.content,
        })
        .strict()
        .parse(await body(req));
      const { buildDocx } = await import('../src/documents/exportDocx.ts');
      const bytes = await buildDocx(input.content as any, input.title);
      const safeFilename = encodeURIComponent(`${input.title.slice(0, 80)}.docx`);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${safeFilename}`);
      res.end(Buffer.from(bytes));
      return;
    }
    if (path === '/api/uploads/authorize' && method === 'POST') {
      const input = z
        .object({ mime: z.enum(['image/png', 'image/jpeg', 'image/webp', 'application/pdf']), bytes: z.number().int().min(1).max(10485760) })
        .strict()
        .parse(await body(req));
      const attachmentId = randomUUID();
      const objectPath = `${id}/${attachmentId}`;
      const admin = supabase(undefined, true);
      const upload = await admin.storage.from('attachments').createSignedUploadUrl(objectPath, { upsert: false });
      if (upload.error || !upload.data) throw new HttpError(503, 'UPLOAD_UNAVAILABLE', 'Không tạo được URL tải tệp.');
      checked(await admin.from('attachments').insert({ id: attachmentId, owner_id: id, path: objectPath, mime: input.mime, bytes: input.bytes }));
      send(res, 201, { attachmentId, uploadUrl: upload.data.signedUrl });
      return;
    }
    if (path === '/api/uploads/complete' && method === 'POST') {
      const input = z.object({ attachmentId: uuid }).strict().parse(await body(req));
      const file = checked(await db.from('attachments').select('*').eq('id', input.attachmentId).eq('owner_id', id).maybeSingle());
      if (!file) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy tệp.');
      const admin = supabase(undefined, true);
      const object = await admin.storage.from('attachments').download(file.path);
      if (object.error || !object.data) throw new HttpError(422, 'UPLOAD_INCOMPLETE', 'Tệp chưa tải xong.');
      const bytes = Buffer.from(await object.data.arrayBuffer());
      const { inspectFile } = await import('./files.ts');
      await inspectFile(bytes, file.mime, file.bytes);
      checked(
        await admin
          .from('attachments')
          .update({ status: 'ready', sha256: createHash('sha256').update(bytes).digest('hex') })
          .eq('id', file.id)
          .eq('owner_id', id)
      );
      send(res, 200, { attachmentId: file.id });
      return;
    }
    if (path.startsWith('/api/uploads/') && (method === 'GET' || method === 'DELETE')) {
      const attachmentId = uuid.parse(path.split('/').pop());
      const file = checked(await db.from('attachments').select('*').eq('id', attachmentId).eq('owner_id', id).eq('status', 'ready').maybeSingle());
      if (!file) throw new HttpError(404, 'NOT_FOUND', 'Tệp không tồn tại hoặc không thuộc quyền truy cập.');
      const admin = supabase(undefined, true);
      if (method === 'GET') {
        const signed = await admin.storage.from('attachments').createSignedUrl(file.path, 60);
        if (signed.error || !signed.data) throw new HttpError(503, 'DOWNLOAD_UNAVAILABLE', 'Không cấp được quyền tải tệp.');
        send(res, 200, { url: signed.data.signedUrl });
        return;
      }
      const removed = await admin.storage.from('attachments').remove([file.path]);
      if (removed.error) throw new HttpError(503, 'FILE_DELETE_FAILED', 'Không xóa được tệp.');
      checked(await admin.from('attachments').update({ status: 'deleted' }).eq('id', file.id).eq('owner_id', id));
      send(res, 200, { success: true });
      return;
    }
    if (path === '/api/teacher/attempts' && method === 'GET') {
      teacher(identity);
      if (standaloneTenant) {
        send(
          res,
          200,
          standaloneTenant.attempts
            .filter(a => a.data.submitted)
            .map(a => ({
              id: a.id,
              studentId: a.owner_id,
              lessonId: a.lesson_id,
              assignmentId: a.data.assignmentId,
              answers: a.data.answers,
              result: a.data.result,
              createdAt: a.created_at,
            }))
        );
        return;
      }
      const students = checked(await db.from('student_accounts').select('user_id').eq('teacher_id', id));
      const ids = (students || []).map(s => s.user_id);
      if (!ids.length) {
        send(res, 200, []);
        return;
      }
      const attempts = checked(
        await supabase(undefined, true).from('attempts').select('*').in('owner_id', ids).order('created_at', { ascending: false }).limit(200)
      );
      send(
        res,
        200,
        (attempts || [])
          .filter(a => a.data.submitted)
          .map(a => ({
            id: a.id,
            studentId: a.owner_id,
            lessonId: a.lesson_id,
            assignmentId: a.data.assignmentId,
            answers: a.data.answers,
            result: a.data.result,
            createdAt: a.created_at,
          }))
      );
      return;
    }
    if (path === '/api/analytics/class' && method === 'GET') {
      teacher(identity);
      const classId = url.searchParams.get('classId');
      const daysParam = url.searchParams.get('days');
      const days = daysParam ? Number(daysParam) : null;
      const { computeClassAnalytics } = await import('./analytics.ts');
      if (standaloneTenant) {
        send(
          res,
          200,
          computeClassAnalytics({
            classId,
            days,
            students: standaloneTenant.students,
            submissions: standaloneTenant.submissions,
            evidence: standaloneTenant.evidence,
            attempts: standaloneTenant.attempts,
          })
        );
        return;
      }
      const students = checked(await db.from('student_accounts').select('user_id,student_code,class_id,data').eq('teacher_id', id)) || [];
      const submissions = checked(await db.from('submissions').select('id,student_id,class_id,data,created_at').eq('teacher_id', id)) || [];
      const evidence = checked(await db.from('mastery_evidence').select('id,student_id,submission_id,skill,state,reviewed_at')) || [];
      const studentIds = students.map(s => s.user_id);
      const attempts = studentIds.length
        ? checked(await supabase(undefined, true).from('attempts').select('id,owner_id,lesson_id,format,data,created_at').in('owner_id', studentIds)) || []
        : [];
      send(res, 200, computeClassAnalytics({ classId, days, students, submissions, evidence, attempts }));
      return;
    }
    if (path === '/api/exports/students.csv' && method === 'GET') {
      teacher(identity);
      const classId = url.searchParams.get('classId');
      const classes = standaloneTenant
        ? standaloneTenant.classes
        : checked(await db.from('classes').select('id,data').eq('teacher_id', id)) || [];
      const classMap = new Map(classes.map(c => [c.id, c.data?.name || c.id]));
      let students: any[];
      let evidence: any[];
      if (standaloneTenant) {
        students = classId ? standaloneTenant.students.filter(s => s.class_id === uuid.parse(classId)) : standaloneTenant.students;
        evidence = standaloneTenant.evidence;
      } else {
        let studentQuery = db.from('student_accounts').select('user_id,student_code,class_id,data').eq('teacher_id', id);
        if (classId) studentQuery = studentQuery.eq('class_id', uuid.parse(classId));
        students = checked(await studentQuery) || [];
        evidence = checked(await db.from('mastery_evidence').select('student_id,state')) || [];
      }
      const csv = buildSafeCsv(
        ['Mã học sinh', 'Họ và tên', 'Lớp', 'Số lỗi cần khắc phục', 'Số lỗi đã khắc phục'],
        students.map(s => {
          const unresolved = evidence.filter(e => e.student_id === s.user_id && e.state === 'needs_remedy').length;
          const resolved = evidence.filter(e => e.student_id === s.user_id && e.state === 'resolved').length;
          return [s.student_code, s.data?.name || '', classMap.get(s.class_id) || s.class_id, unresolved, resolved];
        })
      );
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="danh-sach-hoc-sinh.csv"');
      res.end('\uFEFF' + csv);
      return;
    }
    if (path === '/api/import/legacy' && method === 'POST') {
      teacher(identity);
      if (standaloneTenant) {
        send(res, 200, standaloneHandleLegacyImport(id, await body(req)));
        return;
      }
      const { handleLegacyImport } = await import('./legacy.ts');
      send(res, 200, await handleLegacyImport(identity, await body(req)));
      return;
    }
    if (path === '/api/import/legacy/rollback' && method === 'POST') {
      teacher(identity);
      const input = z.object({ batchId: uuid }).strict().parse(await body(req));
      if (standaloneTenant) {
        send(res, 200, standaloneRollbackLegacyImport(id, input.batchId));
        return;
      }
      const { rollbackLegacyImport } = await import('./legacy.ts');
      send(res, 200, await rollbackLegacyImport(identity, input.batchId));
      return;
    }
    if (path === '/api/feedback' && method === 'GET') {
      if (standaloneTenant) {
        send(res, 200, standaloneTenant.feedback);
        return;
      }
      send(res, 200, checked(await db.from('assignment_feedback').select('attempt_id,student_id,message,updated_at')));
      return;
    }
    if (path === '/api/feedback' && method === 'POST') {
      teacher(identity);
      const input = z.object({ attemptId: uuid, message: z.string().trim().min(1).max(5000) }).strict().parse(await body(req));
      if (standaloneTenant) {
        const attempt = standaloneTenant.attempts.find(a => a.id === input.attemptId && a.data.submitted);
        if (!attempt) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy bài đã nộp.');
        const existing = standaloneTenant.feedback.find(f => f.attempt_id === input.attemptId);
        if (existing) {
          existing.message = input.message;
          existing.updated_at = new Date().toISOString();
        } else {
          standaloneTenant.feedback.push({
            attempt_id: input.attemptId,
            teacher_id: id,
            student_id: attempt.owner_id,
            message: input.message,
            updated_at: new Date().toISOString(),
          });
        }
        send(res, 200, { success: true });
        return;
      }
      const admin = supabase(undefined, true);
      const attempt = checked(await admin.from('attempts').select('owner_id,data').eq('id', input.attemptId).maybeSingle());
      if (!attempt || !attempt.data.submitted) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy bài đã nộp.');
      const own = checked(await db.from('student_accounts').select('user_id').eq('user_id', attempt.owner_id).eq('teacher_id', id).maybeSingle());
      if (!own) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy học sinh thuộc lớp mình.');
      checked(
        await admin
          .from('assignment_feedback')
          .upsert({ attempt_id: input.attemptId, teacher_id: id, student_id: attempt.owner_id, message: input.message, updated_at: new Date().toISOString() })
      );
      send(res, 200, { success: true });
      return;
    }
    if (path === '/api/evidence' && method === 'GET') {
      if (standaloneTenant) {
        send(res, 200, role === 'student' ? standaloneTenant.evidence.filter(e => e.student_id === id) : standaloneTenant.evidence);
        return;
      }
      send(res, 200, checked(await db.from('mastery_evidence').select('id,student_id,submission_id,skill,state,source,reason,reviewed_at')));
      return;
    }
    if (path === '/api/recommendations' && method === 'GET') {
      const { computeAdaptiveRecommendations } = await import('./study.ts');
      if (standaloneTenant) {
        const evidence = standaloneTenant.evidence.filter(e => e.student_id === id);
        const attempts = standaloneTenant.attempts.filter(a => a.owner_id === id);
        send(res, 200, computeAdaptiveRecommendations(evidence, attempts));
        return;
      }
      const evidence = checked(await db.from('mastery_evidence').select('skill,state').eq('student_id', id)) || [];
      const attempts = checked(await supabase(undefined, true).from('attempts').select('lesson_id,data').eq('owner_id', id).limit(50)) || [];
      send(res, 200, computeAdaptiveRecommendations(evidence, attempts));
      return;
    }
    if (path === '/api/assignments' && method === 'POST') {
      teacher(identity);
      const input = z
        .object({
          id: uuid,
          classId: uuid,
          title: z.string().min(1).max(200),
          lessonId: z.string().min(1).max(80),
          deadline: z.string().datetime().nullable(),
        })
        .strict()
        .parse(await body(req));
      if (standaloneTenant) {
        const owned = standaloneTenant.classes.find(c => c.id === input.classId && !c.archived_at);
        if (!owned) throw new HttpError(403, 'FORBIDDEN', 'Không được giao bài cho lớp này.');
        standaloneTenant.assignments.push({
          id: input.id,
          teacher_id: id,
          class_id: input.classId,
          title: input.title,
          lesson_id: input.lessonId,
          deadline: input.deadline,
          created_at: new Date().toISOString(),
        });
        send(res, 201, { success: true });
        return;
      }
      const owned = checked(await db.from('classes').select('id').eq('id', input.classId).eq('teacher_id', id).is('archived_at', null).maybeSingle());
      if (!owned) throw new HttpError(403, 'FORBIDDEN', 'Không được giao bài cho lớp này.');
      checked(
        await supabase(undefined, true)
          .from('assignments')
          .insert({ id: input.id, teacher_id: id, class_id: input.classId, title: input.title, lesson_id: input.lessonId, deadline: input.deadline })
      );
      send(res, 201, { success: true });
      return;
    }
    if (path === '/api/curriculum' && method === 'GET') {
      const { publicCurriculum } = await import('./study.ts');
      send(res, 200, publicCurriculum());
      return;
    }
    if (path === '/api/attempts' && method === 'GET') {
      const rows = standaloneTenant
        ? standaloneTenant.attempts.filter(a => a.owner_id === id).slice(0, 100)
        : checked(
            await supabase(undefined, true)
              .from('attempts')
              .select('id,owner_id,lesson_id,format,created_at,data')
              .eq('owner_id', id)
              .order('created_at', { ascending: false })
              .limit(100)
          );
      send(
        res,
        200,
        (rows || []).map(row => ({
          id: row.id,
          lessonId: row.lesson_id,
          format: row.format,
          scoringMode: row.data.scoringMode ?? 'practice',
          createdAt: row.created_at,
          submitted: row.data.submitted,
          result: row.data.result,
        }))
      );
      return;
    }
    if (path === '/api/attempts' && method === 'POST') {
      const { createAttempt } = await import('./study.ts');
      send(res, 201, await createAttempt(identity, await body(req)));
      return;
    }
    if (path === '/api/attempts/submit' && method === 'POST') {
      const { submitAttempt } = await import('./study.ts');
      send(res, 200, await submitAttempt(identity, await body(req)));
      return;
    }
    if (path === '/api/content/review' && method === 'GET') {
      teacher(identity);
      const { lessons } = await import('./study.ts');
      const reviews = standaloneTenant
        ? standaloneTenant.reviews
        : checked(await db.from('question_reviews').select('question_id,status,reason,reviewed_at')) || [];
      send(res, 200, {
        lessons: lessons.map(l => ({ id: l.id, title: l.title, exercises: l.exercises })),
        reviews,
      });
      return;
    }
    if (path === '/api/content/review' && method === 'POST') {
      teacher(identity);
      const input = z
        .object({ questionId: z.string(), reason: z.string().min(10).max(2000), status: z.enum(['reviewed', 'withdrawn']) })
        .strict()
        .parse(await body(req));
      const { lessons, questionHash } = await import('./study.ts');
      const question = lessons
        .flatMap(l => [...l.exercises.multipleChoice, ...l.exercises.trueFalse, ...l.exercises.shortAnswer])
        .find(q => q.id === input.questionId);
      const exists = Boolean(question);
      if (!exists) throw new HttpError(404, 'NOT_FOUND', 'Không có câu hỏi này.');
      if (standaloneTenant) {
        const idx = standaloneTenant.reviews.findIndex(r => r.question_id === input.questionId);
        const rec = {
          question_id: input.questionId,
          reviewer_id: id,
          reason: input.reason,
          status: input.status,
          content_hash: questionHash(question),
          reviewed_at: new Date().toISOString(),
        };
        if (idx >= 0) standaloneTenant.reviews[idx] = rec;
        else standaloneTenant.reviews.push(rec);
        send(res, 200, { success: true });
        return;
      }
      checked(
        await supabase(undefined, true).from('question_reviews').upsert({
          question_id: input.questionId,
          reviewer_id: id,
          reason: input.reason,
          status: input.status,
          content_hash: questionHash(question),
          reviewed_at: new Date().toISOString(),
        })
      );
      send(res, 200, { success: true });
      return;
    }
    if (path === '/api/submissions/self-correction' && method === 'POST') {
      const input = z.object({ submissionId: uuid, note: selfCorrectionSchema.shape.note }).strict().parse(await body(req));
      if (standaloneTenant) {
        const sub = standaloneTenant.submissions.find(s => s.id === input.submissionId && s.student_id === id);
        if (!sub) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy bài nộp của em.');
        sub.data = {
          ...sub.data,
          selfCorrectionNote: input.note,
          selfCorrectedAt: new Date().toISOString(),
          workflowState: 'self_correction_submitted',
          hasResolvedMistake: false,
        };
        send(res, 200, { success: true, data: sub.data });
        return;
      }
      const owned = checked(await db.from('submissions').select('id').eq('id', input.submissionId).eq('student_id', id).maybeSingle());
      if (!owned) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy bài nộp của em.');
      const updated = checked(
        await supabase(undefined, true).rpc('submit_self_correction', {
          p_id: input.submissionId,
          p_student: id,
          p_note: input.note,
        })
      );
      if (!updated) throw new HttpError(404, 'NOT_FOUND', 'Không cập nhật được ghi chú tự sửa.');
      send(res, 200, { success: true, data: updated });
      return;
    }
    if (path === '/api/submissions/review' && method === 'POST') {
      teacher(identity);
      const input = z
        .object({
          submissionId: uuid,
          verdict: z.enum(['correct', 'incorrect', 'inconclusive']),
          reason: z.string().min(10).max(2000),
          resolved: z.boolean(),
        })
        .strict()
        .parse(await body(req));
      if (standaloneTenant) {
        const sub = standaloneTenant.submissions.find(s => s.id === input.submissionId);
        if (!sub) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy bài nộp.');
        sub.data.evaluation.verdict = input.verdict;
        sub.data.evaluation.reviewState = 'verified';
        sub.data.hasResolvedMistake = input.resolved;
        const skill = sub.data.evaluation.errorCategory || 'Khác';
        const state: 'needs_remedy' | 'resolved' = input.resolved || input.verdict === 'correct' ? 'resolved' : 'needs_remedy';
        const existingEv = standaloneTenant.evidence.find(e => e.submission_id === sub.id);
        if (existingEv) {
          existingEv.state = state;
          existingEv.reason = input.reason;
          existingEv.reviewed_at = new Date().toISOString();
        } else if (sub.student_id) {
          standaloneTenant.evidence.push({
            id: randomUUID(),
            student_id: sub.student_id,
            submission_id: sub.id,
            skill,
            state,
            source: 'teacher_review',
            reason: input.reason,
            reviewed_at: new Date().toISOString(),
          });
        }
        send(res, 200, { success: true });
        return;
      }
      const owned = checked(await db.from('submissions').select('id').eq('id', input.submissionId).eq('teacher_id', id).maybeSingle());
      if (!owned) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy bài nộp.');
      checked(
        await supabase(undefined, true).rpc('review_submission', {
          p_id: input.submissionId,
          p_teacher: id,
          p_verdict: input.verdict,
          p_reason: input.reason,
          p_resolved: input.resolved,
        })
      );
      send(res, 200, { success: true });
      return;
    }
    throw new HttpError(404, 'NOT_FOUND', 'Không có chức năng API này.');
  });
}

function redirectAuthError(req: IncomingMessage, res: ServerResponse, code: string) {
  res.setHeader('Set-Cookie', [cookie('cv_pkce', '', 0), cookie('cv_access', '', 0), cookie('cv_refresh', '', 0)]);
  res.statusCode = 302;
  res.setHeader('Location', `${requestOrigin(req) || appOrigin(req)}/?auth_error=${encodeURIComponent(code)}`);
  res.end();
}
