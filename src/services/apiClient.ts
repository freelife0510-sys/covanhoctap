export class ApiError extends Error {
  constructor(public code: string, message: string, public requestId?: string, public status?: number) { super(message); }
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, { credentials: 'same-origin', ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers } });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(data?.error?.code || 'SERVER_ERROR', data?.error?.message || 'Máy chủ không phản hồi đúng định dạng.', data?.error?.requestId, response.status);
  return data as T;
}
export const post = <T>(path: string, value: unknown) => api<T>(path, { method: 'POST', body: JSON.stringify(value) });
export async function upload(file: File) {
  const authorized = await post<{ attachmentId: string; uploadUrl: string }>('/uploads/authorize', { mime: file.type, bytes: file.size });
  const response = await fetch(authorized.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type, 'x-upsert': 'false' }, body: file });
  if (!response.ok) throw new Error('Không tải được tệp lên Storage. Vui lòng thử lại.');
  await post('/uploads/complete', { attachmentId: authorized.attachmentId });
  return authorized.attachmentId;
}
