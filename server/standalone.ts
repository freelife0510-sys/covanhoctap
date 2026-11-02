import { AsyncLocalStorage } from 'node:async_hooks';
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { cookie, cookies, HttpError } from './http.ts';
import { ensureNodeIds, validateDocument } from '../shared/document.ts';
import { legacyImportRequestSchema } from '../shared/contracts.ts';
import { prepareLegacyImport } from './legacy.ts';
import { existingKeys, getDoc, insertIfAbsent, isDurableStoreConfigured, loadDocs, upsertDoc, writeDocsIfUnchanged } from './persist.ts';

export const isSupabaseConfigured = (): boolean =>
  Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY && process.env.SUPABASE_SECRET_KEY);

const getSigningSecret = (): string => {
  if (process.env.SESSION_SIGNING_SECRET) return process.env.SESSION_SIGNING_SECRET;
  if (process.env.SUPABASE_SECRET_KEY) return process.env.SUPABASE_SECRET_KEY;
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (dbUrl) return createHash('sha256').update(`cv-session:${dbUrl}`).digest('hex');
  return 'covanhoctap-standalone-signing-secret-v1';
};

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

export interface StandaloneTenantData {
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
    lesson_id?: string | null;
    verified?: boolean;
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

type ArrayField = Exclude<keyof StandaloneTenantData, 'profile'>;

/** How each collection is identified and which student (if any) owns a record. */
const COLLECTIONS: Record<ArrayField, { id: (r: any) => string; owner?: (r: any) => string | null | undefined; shard?: 's' | 'p'; order?: (r: any) => string; asc?: boolean }> = {
  classes: { id: r => r.id },
  students: { id: r => r.user_id },
  assignments: { id: r => r.id },
  reviews: { id: r => r.question_id },
  importBatches: { id: r => r.id },
  submissions: { id: r => r.id, owner: r => r.student_id, shard: 's', order: r => r.created_at },
  attempts: { id: r => r.id, owner: r => r.owner_id, shard: 's', order: r => r.created_at },
  evidence: { id: r => r.id, owner: r => r.student_id, shard: 's' },
  feedback: { id: r => r.attempt_id, owner: r => r.student_id, shard: 's' },
  aiExercises: { id: r => r.id, owner: r => r.owner_id, shard: 's', order: r => r.created_at },
  conversations: { id: r => r.id, owner: r => r.owner_id, shard: 'p', order: r => r.created_at },
  messages: { id: r => r.id, owner: r => r.owner_id, shard: 'p', order: r => r.created_at, asc: true },
  documents: { id: r => r.id, owner: r => r.owner_id, shard: 'p', order: r => r.updated_at },
};
const ARRAY_FIELDS = Object.keys(COLLECTIONS) as ArrayField[];

function emptyTenant(userId: string, name: string, school = ''): StandaloneTenantData {
  return {
    profile: { user_id: userId, name, school, role: 'teacher', forced_password_change: false },
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
}

const coreKey = (tid: string) => `t:${tid}:core`;
const shardKey = (tid: string, shard: 's' | 'p', sid: string) => `t:${tid}:${shard}:${sid}`;
const codeKey = (code: string) => `code:${code.trim().toUpperCase()}`;
const teacherAuthKey = (tid: string) => `tauth:${tid}`;

/** Splits a tenant into the documents it is stored as: one core doc plus per-student shards. */
function splitTenant(tenant: StandaloneTenantData): Map<string, any> {
  const tid = tenant.profile.user_id;
  const studentIds = new Set(tenant.students.map(s => s.user_id));
  const docs = new Map<string, any>();
  const core: any = { profile: tenant.profile };
  docs.set(coreKey(tid), core);
  for (const field of ARRAY_FIELDS) {
    const spec = COLLECTIONS[field];
    core[field] = [];
    for (const row of tenant[field] as any[]) {
      const owner = spec.owner?.(row);
      if (spec.shard && owner && studentIds.has(owner)) {
        const key = shardKey(tid, spec.shard, owner);
        if (!docs.has(key)) docs.set(key, {});
        const shard = docs.get(key);
        (shard[field] ||= []).push(row);
      } else {
        core[field].push(row);
      }
    }
  }
  return docs;
}

function mergeDocs(tid: string, rows: { key: string; data: any }[], fallbackName: string, school: string): StandaloneTenantData {
  const core = rows.find(r => r.key === coreKey(tid))?.data;
  const tenant = emptyTenant(tid, core?.profile?.name || fallbackName, core?.profile?.school ?? school);
  if (core?.profile) tenant.profile = { ...tenant.profile, ...core.profile };
  for (const row of rows) {
    for (const field of ARRAY_FIELDS) {
      const items = row.data?.[field];
      if (Array.isArray(items)) (tenant[field] as any[]).push(...items);
    }
  }
  for (const field of ARRAY_FIELDS) {
    const spec = COLLECTIONS[field];
    if (!spec.order) continue;
    const order = spec.order;
    (tenant[field] as any[]).sort((a, b) => (spec.asc ? 1 : -1) * String(order(a) || '').localeCompare(String(order(b) || '')));
  }
  return tenant;
}

/** Three-way merge of one stored document: keep the other writer's records, apply ours on top. */
function mergeDoc(base: any, ours: any, theirs: any): any {
  const merged: any = { ...(theirs || {}) };
  if (ours?.profile && JSON.stringify(ours.profile) !== JSON.stringify(base?.profile)) merged.profile = ours.profile;
  for (const field of ARRAY_FIELDS) {
    const spec = COLLECTIONS[field];
    const baseRows = new Map<string, string>(((base?.[field] as any[]) || []).map(r => [spec.id(r), JSON.stringify(r)]));
    const ourRows: any[] = ours?.[field] || [];
    const ourIds = new Set(ourRows.map(r => spec.id(r)));
    let result: any[] = [...((theirs?.[field] as any[]) || [])];
    // Records we deleted.
    for (const id of baseRows.keys()) if (!ourIds.has(id)) result = result.filter(r => spec.id(r) !== id);
    // Records we added or changed win.
    for (const row of ourRows) {
      const id = spec.id(row);
      const json = JSON.stringify(row);
      if (baseRows.get(id) === json) continue;
      const idx = result.findIndex(r => spec.id(r) === id);
      if (idx >= 0) result[idx] = row;
      else result.push(row);
    }
    if (result.length || merged[field]) merged[field] = result;
  }
  return merged;
}

interface LoadedTenant {
  tenant: StandaloneTenantData;
  /** Stored JSON + version of every document read, keyed by document key. */
  snapshot: Map<string, { json: string; version: number; data: any }>;
  /** Only these shard keys may be written (others were not loaded). */
  writable: (key: string) => boolean;
  codes: Set<string>;
}

interface RequestContext {
  tenants: Map<string, LoadedTenant>;
}

const requestContext = new AsyncLocalStorage<RequestContext>();

// In-memory fallback used only when no database is configured (local dev/tests).
const globalStore: Map<string, StandaloneTenantData> = (globalThis as any).__cvStandaloneStore || new Map<string, StandaloneTenantData>();
(globalThis as any).__cvStandaloneStore = globalStore;
const studentIndex: Map<string, string> = (globalThis as any).__cvStudentIndex || new Map<string, string>(); // student_code -> teacher_id
(globalThis as any).__cvStudentIndex = studentIndex;
const teacherAuthMemory: Map<string, { salt: string; hash: string }> = (globalThis as any).__cvTeacherAuth || new Map();
(globalThis as any).__cvTeacherAuth = teacherAuthMemory;

/** Runs one API request with its own tenant cache, then saves what changed. */
export async function withStandaloneRequest<T>(fn: () => Promise<T>): Promise<T> {
  return requestContext.run({ tenants: new Map() }, fn);
}

/**
 * Loads a teacher workspace for this request. Students only load the shared
 * core plus their own records; teachers load every student's shared records.
 */
export async function hydrateTenant(teacherId: string, options: { studentId?: string; name?: string; school?: string } = {}): Promise<StandaloneTenantData> {
  const ctx = requestContext.getStore();
  const cached = ctx?.tenants.get(teacherId);
  if (cached) return cached.tenant;
  if (!isDurableStoreConfigured() || !ctx) {
    let tenant = globalStore.get(teacherId);
    if (!tenant) {
      tenant = emptyTenant(teacherId, options.name || 'Giáo viên', options.school || '');
      globalStore.set(teacherId, tenant);
    }
    ctx?.tenants.set(teacherId, { tenant, snapshot: new Map(), writable: () => false, codes: new Set() });
    return tenant;
  }
  const keys = [coreKey(teacherId)];
  const prefixes: string[] = [];
  if (options.studentId) keys.push(shardKey(teacherId, 's', options.studentId), shardKey(teacherId, 'p', options.studentId));
  else prefixes.push(`t:${teacherId}:s:`);
  const rows = await loadDocs(keys, prefixes);
  const tenant = mergeDocs(teacherId, rows, options.name || 'Giáo viên', options.school || '');
  const snapshot = new Map(rows.map(r => [r.key, { json: JSON.stringify(r.data), version: r.version, data: r.data }]));
  const writable = options.studentId
    ? (key: string) => keys.includes(key)
    : (key: string) => key === coreKey(teacherId) || key.startsWith(`t:${teacherId}:s:`);
  ctx.tenants.set(teacherId, { tenant, snapshot, writable, codes: new Set(tenant.students.map(s => s.student_code)) });
  return tenant;
}

/** Saves every tenant changed during this request. Retries with a merge on concurrent writes. */
export async function persistStandaloneRequest(): Promise<void> {
  const ctx = requestContext.getStore();
  if (!ctx || !isDurableStoreConfigured()) return;
  for (const [teacherId, loaded] of ctx.tenants) {
    const docs = splitTenant(loaded.tenant);
    let writes: { key: string; data: any; version: number | null; base: any }[] = [];
    for (const [key, data] of docs) {
      if (!loaded.writable(key)) continue;
      const before = loaded.snapshot.get(key);
      const json = JSON.stringify(data);
      if (before ? before.json === json : isEmptyDoc(data) && key !== coreKey(teacherId)) continue;
      writes.push({ key, data, version: before?.version ?? null, base: before?.data });
    }
    // Shards that became empty (e.g. records moved/removed) must be rewritten too.
    for (const [key, before] of loaded.snapshot) {
      if (!docs.has(key) && loaded.writable(key) && key !== coreKey(teacherId)) {
        writes.push({ key, data: {}, version: before.version, base: before.data });
      }
    }
    if (!writes.length) continue;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await writeDocsIfUnchanged(writes.map(w => ({ key: w.key, data: w.data, version: w.version })))) break;
      if (attempt === 2) {
        throw new HttpError(409, 'CONCURRENT_UPDATE', 'Dữ liệu vừa được cập nhật ở nơi khác. Vui lòng tải lại trang và thử lại.', true);
      }
      const latest = new Map((await loadDocs(writes.map(w => w.key))).map(r => [r.key, r]));
      writes = writes.map(w => {
        const current = latest.get(w.key);
        return { key: w.key, base: current?.data, version: current?.version ?? null, data: current ? mergeDoc(w.base, w.data, current.data) : w.data };
      });
    }
    loaded.snapshot = new Map(writes.map(w => [w.key, { json: JSON.stringify(w.data), version: (w.version ?? 0) + 1, data: w.data }]));
    const newCodes = loaded.tenant.students.filter(s => !loaded.codes.has(s.student_code));
    if (newCodes.length) {
      await insertIfAbsent(newCodes.map(s => ({ key: codeKey(s.student_code), data: { teacherId, studentId: s.user_id } })));
      for (const s of newCodes) loaded.codes.add(s.student_code);
    }
  }
}

const isEmptyDoc = (data: any) => ARRAY_FIELDS.every(f => !data?.[f]?.length);

export function getOrCreateTeacherTenant(userId: string, name: string, school = ''): StandaloneTenantData {
  const loaded = requestContext.getStore()?.tenants.get(userId);
  if (loaded) return loaded.tenant;
  if (isDurableStoreConfigured() && requestContext.getStore()) {
    throw new HttpError(500, 'TENANT_NOT_LOADED', 'Không tải được dữ liệu lớp học. Vui lòng thử lại.');
  }
  let tenant = globalStore.get(userId);
  if (!tenant) {
    tenant = emptyTenant(userId, name, school);
    globalStore.set(userId, tenant);
  }
  return tenant;
}

/** Codes already used by any teacher (student codes are global login names). */
export async function takenStudentCodes(codes: string[]): Promise<Set<string>> {
  const normalized = codes.map(c => c.trim().toUpperCase()).filter(Boolean);
  if (!isDurableStoreConfigured()) return new Set(normalized.filter(c => studentIndex.has(c)));
  const found = await existingKeys(normalized.map(codeKey));
  const taken = new Set(normalized.filter(c => found.has(codeKey(c))));
  for (const loaded of requestContext.getStore()?.tenants.values() || []) {
    for (const s of loaded.tenant.students) taken.add(s.student_code);
  }
  return taken;
}

async function lookupStudentTeacher(code: string): Promise<string | null> {
  if (!isDurableStoreConfigured()) return studentIndex.get(code) || null;
  return (await getDoc(codeKey(code)))?.data?.teacherId || null;
}

const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
/** Random, easy-to-read temporary password (no 0/O/1/l/I). */
export function generateStudentPassword(): string {
  const bytes = randomBytes(8);
  return Array.from(bytes, b => PASSWORD_ALPHABET[b % PASSWORD_ALPHABET.length]).join('');
}

const hashPassword = (pw: string, salt = randomBytes(12).toString('base64url')) => `s1$${salt}$${scryptSync(pw, salt, 32).toString('base64url')}`;

function verifyPassword(pw: string, stored: string): boolean {
  if (stored.startsWith('s1$')) {
    const [, salt, hash] = stored.split('$');
    const expected = Buffer.from(hash, 'base64url');
    const actual = scryptSync(pw, salt, 32);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }
  // Legacy unsalted hashes from earlier builds.
  return stored === createHash('sha256').update(`cv-pw:${pw}`).digest('hex');
}

/** Teacher accounts are protected by a password chosen on first sign-in. */
export async function verifyOrRegisterTeacherPassword(teacherId: string, password: string | undefined): Promise<'ok' | 'registered'> {
  const stored = isDurableStoreConfigured() ? (await getDoc(teacherAuthKey(teacherId)))?.data : teacherAuthMemory.get(teacherId);
  if (stored?.hash) {
    if (!password) throw new HttpError(401, 'TEACHER_PASSWORD_REQUIRED', 'Vui lòng nhập mật khẩu giáo viên của tài khoản này.');
    if (!verifyPassword(password, stored.hash)) throw new HttpError(401, 'TEACHER_PASSWORD_WRONG', 'Mật khẩu giáo viên không đúng.');
    return 'ok';
  }
  if (!password || password.length < 6) {
    throw new HttpError(401, 'TEACHER_PASSWORD_SETUP', 'Lần đầu đăng nhập: hãy đặt mật khẩu giáo viên (ít nhất 6 ký tự) để bảo vệ lớp học.');
  }
  const record = { hash: hashPassword(password), createdAt: new Date().toISOString() };
  if (isDurableStoreConfigured()) {
    const written = await insertIfAbsent([{ key: teacherAuthKey(teacherId), data: record }]);
    if (!written.size) return verifyOrRegisterTeacherPassword(teacherId, password);
  } else {
    teacherAuthMemory.set(teacherId, { salt: '', hash: record.hash });
  }
  return 'registered';
}

export async function changeTeacherPassword(teacherId: string, password: string): Promise<void> {
  const record = { hash: hashPassword(password), createdAt: new Date().toISOString() };
  if (isDurableStoreConfigured()) await upsertDoc(teacherAuthKey(teacherId), record);
  else teacherAuthMemory.set(teacherId, { salt: '', hash: record.hash });
}

export function getStandaloneSessionFromReq(req: IncomingMessage): StandaloneTokenPayload | null {
  const saved = cookies(req);
  return verifyStandaloneSession(saved.cv_access || saved.cv_refresh);
}

export async function standaloneStudentLogin(identifier: string, password: string): Promise<{ token: string; payload: StandaloneTokenPayload }> {
  const code = identifier.trim().toUpperCase();
  const teacherId = await lookupStudentTeacher(code);
  if (teacherId) {
    const tenant = await hydrateTenant(teacherId);
    const stu = tenant.students.find(s => s.student_code === code);
    if (stu && verifyPassword(password, stu.password_hash)) {
      const payload: Omit<StandaloneTokenPayload, 'iat' | 'exp'> = {
        sub: stu.user_id,
        role: 'student',
        email: stu.auth_email,
        name: stu.data.name,
        school: tenant.profile.school || '',
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
  }
  throw new HttpError(401, 'LOGIN_FAILED', 'Mã học sinh hoặc mật khẩu không đúng.');
}

export function standaloneChangeStudentPassword(
  payload: StandaloneTokenPayload,
  newPassword: string
): { token: string; relogged: boolean } {
  const teacherId = payload.teacherId || payload.sub;
  const tenant = getOrCreateTeacherTenant(teacherId, 'Giáo viên');
  const stu = tenant.students.find(s => s.user_id === payload.sub);
  if (!stu) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy tài khoản học sinh.');
  stu.password_hash = hashPassword(newPassword);
  stu.forced_password_change = false;
  const updatedPayload: Omit<StandaloneTokenPayload, 'iat' | 'exp'> = {
    ...payload,
    forcedPasswordChange: false,
  };
  return {
    token: signStandaloneSession(updatedPayload),
    relogged: true,
  };
}

const newStudentRecord = (teacherId: string, classId: string, code: string, name: string, temporaryPassword: string) => {
  const studentId = deterministicUuid('student-code', code);
  return {
    user_id: studentId,
    student_code: code,
    auth_email: `${studentId}@students.invalid`,
    password_hash: hashPassword(temporaryPassword),
    teacher_id: teacherId,
    class_id: classId,
    data: { name, status: 'not_started', gapsCount: 0, testHistory: [], assignedTasks: [] },
    forced_password_change: false,
  };
};

export async function standaloneCreateStudent(
  teacherId: string,
  input: { name: string; studentCode: string; classId: string }
): Promise<{ id: string; studentCode: string; temporaryPassword: string }> {
  const tenant = getOrCreateTeacherTenant(teacherId, 'Giáo viên');
  const code = input.studentCode.trim().toUpperCase();
  const ownedClass = tenant.classes.find(c => c.id === input.classId && !c.archived_at);
  if (!ownedClass) throw new HttpError(403, 'FORBIDDEN', 'Lớp không thuộc quyền quản lý.');
  if ((await takenStudentCodes([code])).has(code)) throw new HttpError(409, 'CONFLICT', 'Mã học sinh đã tồn tại.');

  const temporaryPassword = generateStudentPassword();
  const record = newStudentRecord(teacherId, input.classId, code, input.name, temporaryPassword);
  tenant.students.push(record);
  if (!isDurableStoreConfigured()) studentIndex.set(code, teacherId);
  return { id: record.user_id, studentCode: code, temporaryPassword };
}

export async function standaloneCreateStudentsBulk(
  teacherId: string,
  input: { classId: string; students: Array<{ name: string; studentCode?: string }> }
): Promise<{
  created: Array<{ id: string; name: string; studentCode: string; temporaryPassword: string }>;
  skipped: Array<{ name: string; studentCode?: string; reason: string }>;
}> {
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

  // Reserve candidate codes up front with one lookup.
  const explicit = input.students.map(s => (s.studentCode || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')).filter(Boolean);
  const generatedCandidates = Array.from({ length: input.students.length + 50 }, (_, i) => `${prefix}-${String(seq + i).padStart(3, '0')}`);
  const taken = await takenStudentCodes([...explicit, ...generatedCandidates]);

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
      if (taken.has(code)) {
        skipped.push({ name: cleanName, studentCode: code, reason: 'Mã học sinh đã tồn tại.' });
        continue;
      }
    } else {
      while (true) {
        const candidate = `${prefix}-${String(seq).padStart(3, '0')}`;
        seq += 1;
        if (!taken.has(candidate)) {
          code = candidate;
          break;
        }
      }
    }

    taken.add(code);
    const temporaryPassword = generateStudentPassword();
    const record = newStudentRecord(teacherId, input.classId, code, cleanName, temporaryPassword);
    tenant.students.push(record);
    if (!isDurableStoreConfigured()) studentIndex.set(code, teacherId);
    created.push({ id: record.user_id, name: cleanName, studentCode: code, temporaryPassword });
  }

  return { created, skipped };
}

export function standaloneResetStudentPassword(teacherId: string, studentId: string): { temporaryPassword: string } {
  const tenant = getOrCreateTeacherTenant(teacherId, 'Giáo viên');
  const stu = tenant.students.find(s => s.user_id === studentId);
  if (!stu) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy học sinh.');
  const temporaryPassword = generateStudentPassword();
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
