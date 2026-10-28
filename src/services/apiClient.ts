export const TEACHER_GEMINI_KEY_STORAGE = 'teacher_gemini_api_key';
export const STUDENT_GEMINI_KEY_STORAGE = 'student_gemini_api_key';
const ACTIVE_ROLE_STORAGE = 'active_math_role';
const ACTIVE_ACCOUNT_ID_STORAGE = 'active_math_account_id';

export function setActiveClientIdentity(role: 'teacher' | 'student' | null, accountId?: string): void {
  try {
    if (!role) {
      localStorage.removeItem(ACTIVE_ROLE_STORAGE);
      localStorage.removeItem(ACTIVE_ACCOUNT_ID_STORAGE);
      return;
    }
    localStorage.setItem(ACTIVE_ROLE_STORAGE, role);
    if (accountId) {
      localStorage.setItem(ACTIVE_ACCOUNT_ID_STORAGE, accountId.trim().toLowerCase());
    }
  } catch {
    // ignore storage errors
  }
}

export function getUserGeminiKey(roleOverride?: 'teacher' | 'student', accountIdOverride?: string): string {
  try {
    const role = roleOverride || (localStorage.getItem(ACTIVE_ROLE_STORAGE) as 'teacher' | 'student' | null) || 'student';
    const accountId = (accountIdOverride || localStorage.getItem(ACTIVE_ACCOUNT_ID_STORAGE) || '').trim().toLowerCase();

    if (role === 'student') {
      if (accountId) {
        const scoped = localStorage.getItem(`${STUDENT_GEMINI_KEY_STORAGE}:${accountId}`);
        if (scoped?.trim()) return scoped.trim();
      }
      return (localStorage.getItem(STUDENT_GEMINI_KEY_STORAGE) || '').trim();
    }

    if (accountId) {
      const scoped = localStorage.getItem(`${TEACHER_GEMINI_KEY_STORAGE}:${accountId}`);
      if (scoped?.trim()) return scoped.trim();
    }
    return (
      localStorage.getItem(TEACHER_GEMINI_KEY_STORAGE) ||
      localStorage.getItem('user_gemini_api_key') ||
      ''
    ).trim();
  } catch {
    return '';
  }
}

export function setUserGeminiKey(key: string, roleOverride?: 'teacher' | 'student', accountIdOverride?: string): void {
  try {
    const role = roleOverride || (localStorage.getItem(ACTIVE_ROLE_STORAGE) as 'teacher' | 'student' | null) || 'student';
    const accountId = (accountIdOverride || localStorage.getItem(ACTIVE_ACCOUNT_ID_STORAGE) || '').trim().toLowerCase();
    const trimmed = key.trim();
    const baseKey = role === 'student' ? STUDENT_GEMINI_KEY_STORAGE : TEACHER_GEMINI_KEY_STORAGE;

    if (trimmed) {
      localStorage.setItem(baseKey, trimmed);
      if (accountId) {
        localStorage.setItem(`${baseKey}:${accountId}`, trimmed);
      }
    } else {
      localStorage.removeItem(baseKey);
      if (accountId) {
        localStorage.removeItem(`${baseKey}:${accountId}`);
      }
    }
  } catch {
    // ignore storage errors
  }
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public requestId?: string,
    public status?: number
  ) {
    super(message);
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const userKey = getUserGeminiKey();
  const response = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(userKey ? { 'x-gemini-api-key': userKey } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      data?.error?.code || 'SERVER_ERROR',
      data?.error?.message || 'Máy chủ không phản hồi đúng định dạng.',
      data?.error?.requestId,
      response.status
    );
  return data as T;
}

export const post = <T>(path: string, value: unknown) => api<T>(path, { method: 'POST', body: JSON.stringify(value) });

export async function upload(file: File) {
  const authorized = await post<{ attachmentId: string; uploadUrl: string }>('/uploads/authorize', { mime: file.type, bytes: file.size });
  const response = await fetch(authorized.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type, 'x-upsert': 'false' },
    body: file,
  });
  if (!response.ok) throw new Error('Không tải được tệp lên Storage. Vui lòng thử lại.');
  await post('/uploads/complete', { attachmentId: authorized.attachmentId });
  return authorized.attachmentId;
}
