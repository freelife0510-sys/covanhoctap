import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { ZodError } from 'zod';
export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string, public retryable = false) { super(message); }
}
export function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new HttpError(503, 'SETUP_REQUIRED', `Máy chủ chưa cấu hình ${name}.`);
  return value;
}
export function cookies(req: IncomingMessage): Record<string, string> {
  return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map(p => {
    const i = p.indexOf('='); return [p.slice(0, i).trim(), p.slice(i + 1)];
  }));
}
const normalizeOrigin = (value?: string | null) => (value || '').trim().replace(/\/+$/, '').toLowerCase();
const firstHeader = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value || '').split(',')[0].trim();
/** Origin the browser actually used to reach this server (Vercel/proxy aware). */
export function requestOrigin(req: IncomingMessage): string {
  const host = firstHeader(req.headers['x-forwarded-host']) || firstHeader(req.headers.host);
  const proto = firstHeader(req.headers['x-forwarded-proto']) || ((req.socket as { encrypted?: boolean } | undefined)?.encrypted ? 'https' : 'http');
  return normalizeOrigin(host ? `${proto}://${host}` : process.env.APP_ORIGIN);
}
/** Configured public origin; falls back to the request origin when APP_ORIGIN is missing. */
export function appOrigin(req?: IncomingMessage): string {
  return normalizeOrigin(process.env.APP_ORIGIN) || (req ? requestOrigin(req) : '');
}
export function cookie(name: string, value: string, maxAge: number): string {
  const secure = normalizeOrigin(process.env.APP_ORIGIN).startsWith('https:') || Boolean(process.env.VERCEL);
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}
export function mutate(req: IncomingMessage) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method || 'GET')) return;
  // CSRF guard: accept the configured origin (ignoring a trailing slash) or the
  // exact host the request was sent to (e.g. 127.0.0.1, LAN IP, Vercel preview).
  const origin = normalizeOrigin(req.headers.origin);
  const allowed = new Set([normalizeOrigin(process.env.APP_ORIGIN), requestOrigin(req)].filter(Boolean));
  if (!origin || !allowed.has(origin)) {
    throw new HttpError(403, 'ORIGIN_REJECTED', 'Nguồn yêu cầu không được phép. Hãy mở ứng dụng đúng địa chỉ chính thức rồi thử lại.');
  }
}
export async function body(req: IncomingMessage): Promise<unknown> {
  if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) throw new HttpError(415, 'JSON_REQUIRED', 'Yêu cầu phải dùng application/json.');
  const parsed = (req as IncomingMessage & { body?: unknown }).body;
  if (parsed !== undefined) {
    const raw = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
    if (Buffer.byteLength(raw) > 512000) throw new HttpError(413, 'PAYLOAD_TOO_LARGE', 'Yêu cầu vượt giới hạn.');
    try { return typeof parsed === 'string' ? JSON.parse(parsed) : parsed; } catch { throw new HttpError(400, 'INVALID_JSON', 'JSON không hợp lệ.'); }
  }
  let size = 0; const parts: Buffer[] = [];
  for await (const part of req) {
    const b = Buffer.isBuffer(part) ? part : Buffer.from(part); size += b.length;
    if (size > 512_000) throw new HttpError(413, 'PAYLOAD_TOO_LARGE', 'Yêu cầu vượt giới hạn. Tệp phải tải qua Storage.');
    parts.push(b);
  }
  try { return JSON.parse(Buffer.concat(parts).toString() || '{}'); }
  catch { throw new HttpError(400, 'INVALID_JSON', 'JSON không hợp lệ.'); }
}
export function send(res: ServerResponse, status: number, value: unknown) {
  res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(value));
}
export async function boundary(req: IncomingMessage, res: ServerResponse, fn: () => Promise<void>) {
  const requestId = randomUUID();
  res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Request-Id', requestId);
  try { mutate(req); await fn(); }
  catch (error) {
    const e = error instanceof HttpError ? error : error instanceof ZodError
      ? new HttpError(422, 'INVALID_INPUT', 'Dữ liệu không đúng định dạng.')
      : new HttpError(500, 'INTERNAL_ERROR', 'Không thể xử lý yêu cầu. Vui lòng thử lại.', true);
    // Never log provider responses, bodies, tokens, or student work.
    console.error(JSON.stringify({ requestId, code: e.code, status: e.status }));
    send(res, e.status, { error: { code: e.code, message: e.message, retryable: e.retryable, requestId } });
  }
}
