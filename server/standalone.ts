import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { cookie, cookies, HttpError } from './http.ts';
import { ensureNodeIds, validateDocument } from '../shared/document.ts';
import { legacyImportRequestSchema } from '../shared/contracts.ts';
import { prepareLegacyImport } from './legacy.ts';

export const isSupabaseConfigured = (): boolean =>
  Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY && process.env.SUPABASE_SECRET_KEY);

const getSigningSecret = (): string =>
  process.env.SESSION_SIGNING_SECRET || process.env.SUPABASE_SECRET_KEY || 'covanhoctap-standalone-signing-secret-v1';

export function deterministicUuid(namespace: string, value: string): string {
  const hex = createHash('sha256').update(`${namespace}:${value.toLowerCase().trim()}`).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export interface StandaloneTokenPayload {
  sub: string;
  role: 'teacher' | 'student';
  email: string;
  name: string;
  school?: string;
  studentCode?: string;
  classId?: string;
  teacherId?: string;
  forcedPasswordChange?: boolean;
  iat: number;
  exp: number;
}

export function signStandaloneSession(payload: Omit<StandaloneTokenPayload, 'iat' | 'exp'>, ttlSeconds = 60 * 60 * 24 * 7): string {
  const now = Math.floor(Date.now() / 1000);
  const full: StandaloneTokenPayload = {
    ...payload,
    iat: now,
    exp: now + ttlSeconds,
  };
  const bodyB64 = Buffer.from(JSON.stringify(full), 'utf8').toString('base64url');
  const sig = createHmac('sha256', getSigningSecret()).update(bodyB64).digest('base64url');
  return `st1.${bodyB64}.${sig}`;
}

export function verifyStandaloneSession(token?: string | null): StandaloneTokenPayload | null {
  if (!token || !token.startsWith('st1.')) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [, bodyB64, sig] = parts;
  const expectedSig = createHmac('sha256', getSigningSecret()).update(bodyB64).digest('base64url');
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const parsed = JSON.parse(Buffer.from(bodyB64, 'base64url').toString('utf8')) as StandaloneTokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!parsed.sub || !parsed.role || parsed.exp < now) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setStandaloneCookie(res: ServerResponse, token: string, maxAge = 60 * 60 * 24 * 7) {
  res.setHeader('Set-Cookie', [cookie('cv_access', token, maxAge), cookie('cv_refresh', token, maxAge)]);
}

interface StandaloneTenantData {
  profile: {
    user_id: string;
    name: string;
    school: string;
    role: 'teacher' | 'student';
    forced_password_change: boolean;
  };
  classes: Array<{ id: string; teacher_id: string; data: Record<string, any>; archived_at?: string | null }>;
  students: Array<{
    user_id: string;
    student_code: string;
    auth_email: string;
    password_hash: string;
    teacher_id: string;
    class_id: string;
    data: Record<string, any>;
    forced_password_change?: boolean;
  }>;
  submissions: Array<{
    id: string;
    student_id: string | null;
    teacher_id: string;
    class_id: string | null;
    data: Record<string, any>;
    created_at: string;
  }>;
  assignments: Array<{
    id: string;
    teacher_id: string;
    class_id: string;
    title: string;
    lesson_id: string;
    deadline: string | null;
    created_at: string;
  }>;
  documents: Array<{
    id: string;
    owner_id: string;
    title: string;
    content: Record<string, any>;
    revision: number;
    updated_at: string;
  }>;
  attempts: Array<{
    id: string;
    owner_id: string;
    lesson_id: string;
    format: string;
    data: Record<string, any>;
    created_at: string;
  }>;
  evidence: Array<{
    id: string;
    student_id: string;
    submission_id: string;
    skill: string;
    state: 'needs_remedy' | 'resolved';
    source: string;
    reason: string;
    reviewed_at: string;
  }>;
  feedback: Array<{
    attempt_id: string;
    teacher_id: string;
    student_id: string;
    message: string;
    updated_at: string;
  }>;
  conversations: Array<{ id: string; owner_id: string; created_at: string }>;
  messages: Array<{ id: string; conversation_id: string; owner_id: string; role: string; content: string; data: any; created_at: string }>;
  reviews: Array<{ question_id: string; reviewer_id: string; status: string; reason: string; content_hash: string; reviewed_at: string }>;
  aiExercises: Array<any>;
  importBatches: Array<any>;
}

const globalStore: Map<string, StandaloneTenantData> = (globalThis as any).__cvStandaloneStore || new Map<string, StandaloneTenantData>();
(globalThis as any).__cvStandaloneStore = globalStore;

const studentIndex: Map<string, string> = (globalThis as any).__cvStudentIndex || new Map<string, string>(); // student_code -> teacher_id
(globalThis as any).__cvStudentIndex = studentIndex;

const hashPassword = (pw: string) => createHash('sha256').update(`cv-pw:${pw}`).digest('hex');

export const generateStudentPassword = (studentCode: string): string =>
  createHmac('sha256', getSigningSecret()).update(`stu-pw:${studentCode.trim().toUpperCase()}`).digest('base64url').slice(0, 8);

export function getOrCreateTeacherTenant(userId: string, name: string, school = ''): StandaloneTenantData {
  let tenant = globalStore.get(userId);
  if (!tenant) {
    tenant = {
      profile: {
        user_id: userId,
        name,
        school,
        role: 'teacher',
        forced_password_change: false,
      },
      classes: [],
      students: [],
      submissions: [],
      assignments: [],
      documents: [],
      attempts: [],
      evidence: [],
      feedback: [],
      conversations: [],
      messages: [],
      reviews: [],
      aiExercises: [],
      importBatches: [],
    };
    globalStore.set(userId, tenant);
  } else if (name && tenant.profile.name !== name) {
    tenant.profile.name = name;
  }
  return tenant;
}

export function getStandaloneSessionFromReq(req: IncomingMessage): StandaloneTokenPayload | null {
  const saved = cookies(req);
  return verifyStandaloneSession(saved.cv_access || saved.cv_refresh);
}

export function standaloneStudentLogin(identifier: string, password: string): { token: string; payload: StandaloneTokenPayload } {
  const code = identifier.trim().toUpperCase();
  const teacherId = studentIndex.get(code);
  if (teacherId) {
    const tenant = globalStore.get(teacherId);
    const stu = tenant?.students.find(s => s.student_code === code);
    if (!stu || stu.password_hash !== hashPassword(password)) {
      throw new HttpError(401, 'LOGIN_FAILED', 'Mã học sinh hoặc mật khẩu không đúng.');
    }
    const payload: Omit<StandaloneTokenPayload, 'iat' | 'exp'> = {
      sub: stu.user_id,
      role: 'student',
      email: stu.auth_email,
      name: stu.data.name,
      school: tenant?.profile.school || '',
      studentCode: stu.student_code,
      classId: stu.class_id,
      teacherId,
      forcedPasswordChange: Boolean(stu.forced_password_change),
    };
    return {
      token: signStandaloneSession(payload),
      payload: { ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 604800 },
    };
  }

  // Stateless serverless verification across cold starts: verify deterministic HMAC password for studentCode
  const expectedPassword = generateStudentPassword(code);
  if (code.length >= 3 && password === expectedPassword) {
    const studentId = deterministicUuid('student-code', code);
    const defaultTeacherId = deterministicUuid('teacher-default', 'standalone');
    const tenant = getOrCreateTeacherTenant(defaultTeacherId, 'Giáo viên');
    let stu = tenant.students.find(s => s.student_code === code);
    if (!stu) {
      const classId = tenant.classes[0]?.id || deterministicUuid('class-default', code.split('-')[0] || '12A1');
      stu = {
        user_id: studentId,
        student_code: code,
        auth_email: `${studentId}@students.invalid`,
        password_hash: hashPassword(expectedPassword),
        teacher_id: defaultTeacherId,
        class_id: classId,
        data: { name: `Học sinh (${code})`, status: 'not_started', gapsCount: 0, testHistory: [], assignedTasks: [] },
        forced_password_change: false,
      };
      tenant.students.push(stu);
      studentIndex.set(code, defaultTeacherId);
    }
    const payload: Omit<StandaloneTokenPayload, 'iat' | 'exp'> = {
      sub: stu.user_id,
      role: 'student',
      email: stu.auth_email,
      name: stu.data.name,
      school: tenant.profile.school || '',
      studentCode: stu.student_code,
      classId: stu.class_id,
      teacherId: defaultTeacherId,
      forcedPasswordChange: false,
    };
    return {
      token: signStandaloneSession(payload),
      payload: { ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 604800 },
    };
  }

  throw new HttpError(401, 'LOGIN_FAILED', 'Mã học sinh hoặc mật khẩu không đúng.');
}

export function standaloneChangeStudentPassword(
  payload: StandaloneTokenPayload,
  newPassword: string
): { token: string; relogged: boolean } {
  const teacherId = payload.teacherId || payload.sub;
  const tenant = globalStore.get(teacherId);
  const stu = tenant?.students.find(s => s.user_id === payload.sub);
  if (stu) {
    stu.password_hash = hashPassword(newPassword);
    stu.forced_password_change = false;
  }
  const updatedPayload: Omit<StandaloneTokenPayload, 'iat' | 'exp'> = {
    ...payload,
    forcedPasswordChange: false,
  };
  return {
    token: signStandaloneSession(updatedPayload),
    relogged: true,
  };
}

export function standaloneCreateStudent(
  teacherId: string,
  input: { name: string; studentCode: string; classId: string }
): { id: string; studentCode: string; temporaryPassword: string } {
  const tenant = getOrCreateTeacherTenant(teacherId, 'Giáo viên');
  const code = input.studentCode.trim().toUpperCase();
  const ownedClass = tenant.classes.find(c => c.id === input.classId && !c.archived_at);
  if (!ownedClass) throw new HttpError(403, 'FORBIDDEN', 'Lớp không thuộc quyền quản lý.');
  if (studentIndex.has(code)) throw new HttpError(409, 'CONFLICT', 'Mã học sinh đã tồn tại.');

  const studentId = deterministicUuid('student-code', code);
  const temporaryPassword = generateStudentPassword(code);
  tenant.students.push({
    user_id: studentId,
    student_code: code,
    auth_email: `${studentId}@students.invalid`,
    password_hash: hashPassword(temporaryPassword),
    teacher_id: teacherId,
    class_id: input.classId,
    data: { name: input.name, status: 'not_started', gapsCount: 0, testHistory: [], assignedTasks: [] },
    forced_password_change: false,
  });
  studentIndex.set(code, teacherId);
  return { id: studentId, studentCode: code, temporaryPassword };
}

export function standaloneCreateStudentsBulk(
  teacherId: string,
  input: { classId: string; students: Array<{ name: string; studentCode?: string }> }
): {
  created: Array<{ id: string; name: string; studentCode: string; temporaryPassword: string }>;
  skipped: Array<{ name: string; studentCode?: string; reason: string }>;
} {
  const tenant = getOrCreateTeacherTenant(teacherId, 'Giáo viên');
  const ownedClass = tenant.classes.find(c => c.id === input.classId && !c.archived_at);
  if (!ownedClass) throw new HttpError(403, 'FORBIDDEN', 'Lớp không thuộc quyền quản lý.');

  const rawPrefix = String(ownedClass.data?.classCode || ownedClass.data?.name || 'HS')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
  const prefix = rawPrefix || 'HS';

  const created: Array<{ id: string; name: string; studentCode: string; temporaryPassword: string }> = [];
  const skipped: Array<{ name: string; studentCode?: string; reason: string }> = [];
  let seq = tenant.students.filter(s => s.class_id === input.classId).length + 1;

  for (const item of input.students) {
    const cleanName = item.name.trim();
    if (!cleanName) {
      skipped.push({ name: item.name, studentCode: item.studentCode, reason: 'Thiếu họ tên học sinh.' });
      continue;
    }

    let code = (item.studentCode || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (code) {
      if (code.length < 3) {
        skipped.push({ name: cleanName, studentCode: code, reason: 'Mã học sinh phải từ 3 ký tự trở lên.' });
        continue;
      }
      if (studentIndex.has(code)) {
        skipped.push({ name: cleanName, studentCode: code, reason: 'Mã học sinh đã tồn tại.' });
        continue;
      }
    } else {
      while (true) {
        const candidate = `${prefix}-${String(seq).padStart(3, '0')}`;
        seq += 1;
        if (!studentIndex.has(candidate)) {
          code = candidate;
          break;
        }
      }
    }

    const studentId = deterministicUuid('student-code', code);
    const temporaryPassword = generateStudentPassword(code);
    tenant.students.push({
      user_id: studentId,
      student_code: code,
      auth_email: `${studentId}@students.invalid`,
      password_hash: hashPassword(temporaryPassword),
      teacher_id: teacherId,
      class_id: input.classId,
      data: { name: cleanName, status: 'not_started', gapsCount: 0, testHistory: [], assignedTasks: [] },
      forced_password_change: false,
    });
    studentIndex.set(code, teacherId);
    created.push({ id: studentId, name: cleanName, studentCode: code, temporaryPassword });
  }

  return { created, skipped };
}

export function standaloneResetStudentPassword(teacherId: string, studentId: string): { temporaryPassword: string } {
  const tenant = getOrCreateTeacherTenant(teacherId, 'Giáo viên');
  const stu = tenant.students.find(s => s.user_id === studentId);
  if (!stu) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy học sinh.');
  const temporaryPassword = generateStudentPassword(stu.student_code);
  stu.password_hash = hashPassword(temporaryPassword);
  stu.forced_password_change = false;
  return { temporaryPassword };
}

export function standaloneSaveDocument(
  ownerId: string,
  teacherId: string,
  input: { id: string; title: string; revision: number; content: any }
): { revision: number; content: any } {
  const tenant = getOrCreateTeacherTenant(teacherId, 'Giáo viên');
  const normalizedContent = ensureNodeIds(input.content);
  const existing = tenant.documents.find(d => d.id === input.id && d.owner_id === ownerId);
  if (input.revision === 0) {
    if (existing) return { revision: existing.revision, content: existing.content };
    tenant.documents.unshift({
      id: input.id,
      owner_id: ownerId,
      title: input.title,
      content: normalizedContent,
      revision: 1,
      updated_at: new Date().toISOString(),
    });
    return { revision: 1, content: normalizedContent };
  }
  if (!existing || existing.revision !== input.revision) {
    throw new HttpError(409, 'REVISION_CONFLICT', 'Tài liệu đã được sửa ở nơi khác. Tải lại trước khi lưu.');
  }
  existing.title = input.title;
  existing.content = normalizedContent;
  existing.revision += 1;
  existing.updated_at = new Date().toISOString();
  return { revision: existing.revision, content: normalizedContent };
}

export function standaloneHandleLegacyImport(teacherId: string, rawBody: unknown) {
  const input = legacyImportRequestSchema.parse(rawBody);
  const plan = prepareLegacyImport(teacherId, input.payload);
  if (input.mode === 'preview') {
    return {
      mode: 'preview',
      checksum: plan.checksum,
      summary: plan.summary,
      warnings: plan.warnings,
    };
  }
  const tenant = getOrCreateTeacherTenant(teacherId, 'Giáo viên');
  const existingBatch = tenant.importBatches.find(b => b.source_checksum === plan.checksum && b.status === 'imported');
  if (existingBatch) {
    return {
      mode: 'commit',
      idempotent: true,
      batchId: existingBatch.id,
      checksum: plan.checksum,
      summary: existingBatch.summary,
      warnings: plan.warnings,
    };
  }
  const importedClassIds: string[] = [];
  const importedSubmissionIds: string[] = [];
  const importedDocumentIds: string[] = [];

  for (const cls of plan.classesToInsert) {
    if (!tenant.classes.some(c => c.id === cls.id)) {
      tenant.classes.push({ ...cls, archived_at: null });
      importedClassIds.push(cls.id);
    }
  }
  for (const sub of plan.submissionsToInsert) {
    if (!tenant.submissions.some(s => s.id === sub.id)) {
      tenant.submissions.unshift({ ...sub, created_at: new Date().toISOString() });
      importedSubmissionIds.push(sub.id);
    }
  }
  for (const doc of plan.documentsToInsert) {
    if (!tenant.documents.some(d => d.id === doc.id)) {
      if (validateDocument(doc.content)) {
        tenant.documents.unshift({ ...doc, updated_at: new Date().toISOString() });
        importedDocumentIds.push(doc.id);
      }
    }
  }
  const batchId = crypto.randomUUID();
  const importedIds = { classes: importedClassIds, submissions: importedSubmissionIds, documents: importedDocumentIds };
  tenant.importBatches.push({
    id: batchId,
    teacher_id: teacherId,
    source_checksum: plan.checksum,
    status: 'imported',
    summary: plan.summary,
    imported_ids: importedIds,
  });
  return {
    mode: 'commit',
    idempotent: false,
    batchId,
    checksum: plan.checksum,
    summary: plan.summary,
    importedIds,
    warnings: plan.warnings,
  };
}

export function standaloneRollbackLegacyImport(teacherId: string, batchId: string) {
  const tenant = getOrCreateTeacherTenant(teacherId, 'Giáo viên');
  const batch = tenant.importBatches.find(b => b.id === batchId);
  if (!batch) throw new HttpError(404, 'BATCH_NOT_FOUND', 'Không tìm thấy lô nhập dữ liệu.');
  if (batch.status === 'rolled_back') return { batchId, status: 'rolled_back', alreadyRolledBack: true };
  const ids = batch.imported_ids || {};
  if (Array.isArray(ids.submissions)) {
    tenant.submissions = tenant.submissions.filter(s => !ids.submissions.includes(s.id));
  }
  if (Array.isArray(ids.documents)) {
    tenant.documents = tenant.documents.filter(d => !ids.documents.includes(d.id));
  }
  if (Array.isArray(ids.classes)) {
    tenant.classes = tenant.classes.filter(c => !ids.classes.includes(c.id));
  }
  batch.status = 'rolled_back';
  return { batchId, status: 'rolled_back', rolledBackIds: ids };
}
