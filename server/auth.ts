import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { cookie, cookies, HttpError, required } from './http.ts';
export const supabase = (token?: string, admin = false) => createClient(required('SUPABASE_URL'), required(admin ? 'SUPABASE_SECRET_KEY' : 'SUPABASE_PUBLISHABLE_KEY'), {
  auth: { persistSession: false, autoRefreshToken: false },
  global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
});
export function setSession(res: ServerResponse, session: { access_token: string; refresh_token: string; expires_in: number }) {
  res.setHeader('Set-Cookie', [cookie('cv_access', session.access_token, session.expires_in), cookie('cv_refresh', session.refresh_token, 60 * 60 * 24 * 7)]);
}
export function clearSession(res: ServerResponse) {
  res.setHeader('Set-Cookie', [cookie('cv_access', '', 0), cookie('cv_refresh', '', 0)]);
}
export type Identity = { id: string; role: 'teacher' | 'student'; db: SupabaseClient; name: string; forcedPasswordChange: boolean };
export async function authenticate(req: IncomingMessage, res: ServerResponse): Promise<Identity> {
  const saved = cookies(req); let token = saved.cv_access;
  const client = supabase();
  let user = token ? (await client.auth.getUser(token)).data.user : null;
  if (!user && saved.cv_refresh) {
    const refreshed = await client.auth.refreshSession({ refresh_token: saved.cv_refresh });
    if (refreshed.data.session) {
      setSession(res, refreshed.data.session); token = refreshed.data.session.access_token;
      user = (await client.auth.getUser(token)).data.user;
    }
  }
  if (!user || !token) { clearSession(res); throw new HttpError(401, 'UNAUTHENTICATED', 'Vui lòng đăng nhập lại.'); }
  const db = supabase(token);
  const { data, error } = await db.from('profiles').select('user_id,role,name,forced_password_change,revoked_before').eq('user_id', user.id).single();
  if (error || !data) throw new HttpError(403, 'PROFILE_REQUIRED', 'Tài khoản chưa được cấp quyền.');
  const issuedAt = Number(JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).iat || 0);
  if (issuedAt <= Number(data.revoked_before)) { clearSession(res); throw new HttpError(401, 'SESSION_REVOKED', 'Phiên đăng nhập đã bị thu hồi. Vui lòng đăng nhập lại.'); }
  if (data.role === 'teacher') {
    const access = await db.from('teacher_access').select('user_id').eq('user_id', user.id).eq('enabled', true).maybeSingle();
    if (!access.data) throw new HttpError(403, 'TEACHER_NOT_APPROVED', 'Giáo viên chưa được chủ ứng dụng cấp quyền.');
  }
  return { id: user.id, role: data.role, db, name: data.name, forcedPasswordChange: data.forced_password_change };
}
export function teacher(identity: Identity) {
  if (identity.role !== 'teacher') throw new HttpError(403, 'FORBIDDEN', 'Chức năng chỉ dành cho giáo viên có quyền.');
}
export function checked<T>({ data, error }: { data: T; error: { code?: string } | null }): T {
  if (error) throw new HttpError(error.code === '23505' ? 409 : 503, error.code === '23505' ? 'CONFLICT' : 'DATABASE_ERROR', 'Không lưu/đọc được dữ liệu máy chủ. Vui lòng thử lại.', true);
  return data;
}
