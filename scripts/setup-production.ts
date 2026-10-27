// One-command production setup: asks only for the owner's secrets, verifies them,
// prepares Supabase, stores them in Vercel (never in git/VITE_*), then deploys
// Production and smoke-tests it. Run:  npm run setup:production
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const ORIGIN = 'https://covanhoctap.vercel.app';
const rl = createInterface({ input: stdin, output: stdout });
const ask = async (label: string, fallback = '', optional = false): Promise<string> => {
  for (;;) {
    const value = (await rl.question(`${label}${fallback ? ` [${fallback}]` : ''}: `)).trim() || fallback;
    if (value || optional) return value;
    console.log('  → Bắt buộc nhập.');
  }
};
const run = (args: string[], input?: string) => {
  const result = spawnSync('vercel', args, { input, shell: true, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`vercel ${args.slice(0, 3).join(' ')} thất bại:\n${result.stderr || result.stdout}`);
  return result.stdout;
};
const step = (text: string) => console.log(`\n▶ ${text}`);

console.log('=== Cấu hình Production cho Cố Vấn Học Tập ===');
console.log('Lấy khóa Supabase: Dashboard → Project Settings → API Keys. Gemini key: https://aistudio.google.com/apikey\n');
const env: Record<string, string> = {
  SUPABASE_URL: (await ask('SUPABASE_URL (https://xxxx.supabase.co)')).replace(/\/+$/, ''),
  SUPABASE_PUBLISHABLE_KEY: await ask('SUPABASE_PUBLISHABLE_KEY (sb_publishable_… hoặc anon key)'),
  SUPABASE_SECRET_KEY: await ask('SUPABASE_SECRET_KEY (sb_secret_… hoặc service_role key)'),
  GEMINI_API_KEY: await ask('GEMINI_API_KEY'),
  GEMINI_PRIMARY_MODEL: await ask('GEMINI_PRIMARY_MODEL', 'gemini-2.5-flash'),
  AI_DAILY_REQUEST_LIMIT_PER_USER: await ask('Số lượt AI tối đa/học sinh/ngày', '50'),
  AI_GLOBAL_DAILY_TOKEN_LIMIT: await ask('Tổng token AI tối đa/ngày (toàn hệ thống)', '3000000'),
};
const dbUrl = await ask('Chuỗi kết nối Postgres để tự chạy migration (Settings → Database → Connection string, Enter để bỏ qua)', '', true);
const teacherEmail = await ask('Email Google của giáo viên cần cấp quyền (Enter để bỏ qua)', '', true);
rl.close();

step('Kiểm tra Gemini API key…');
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
await ai.models.get({ model: env.GEMINI_PRIMARY_MODEL }).catch((error: { status?: number }) => {
  throw new Error(`Gemini từ chối key/model (HTTP ${error.status ?? '?'}). Kiểm tra lại GEMINI_API_KEY và tên model.`);
});
console.log('  ✓ Gemini key hợp lệ, model truy cập được.');

step('Kiểm tra Supabase…');
const settings = await fetch(`${env.SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: env.SUPABASE_PUBLISHABLE_KEY } });
if (!settings.ok) throw new Error(`Supabase URL/publishable key không hợp lệ (HTTP ${settings.status}).`);
const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const probe = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
if (probe.error) throw new Error(`Supabase secret key không hợp lệ: ${probe.error.message}`);
const google = ((await settings.json()) as { external?: { google?: boolean } }).external?.google;
console.log(`  ✓ Supabase kết nối được. Google provider: ${google ? 'đã bật' : 'CHƯA BẬT'}`);

if (dbUrl) {
  step('Chạy migration database…');
  const { default: pg } = await import('pg');
  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const exists = (await client.query("select to_regclass('public.profiles') as t")).rows[0].t;
    if (exists) console.log('  ✓ Schema đã có sẵn, bỏ qua migration.');
    else {
      for (const file of readdirSync('supabase/migrations').filter(f => f.endsWith('.sql')).sort()) {
        await client.query('begin');
        try { await client.query(readFileSync(`supabase/migrations/${file}`, 'utf8')); await client.query('commit'); console.log(`  ✓ ${file}`); }
        catch (error) { await client.query('rollback'); throw new Error(`Migration ${file} lỗi: ${(error as Error).message}`); }
      }
    }
  } finally { await client.end(); }
}

if (teacherEmail) {
  step(`Cấp quyền giáo viên cho ${teacherEmail}…`);
  let userId: string | undefined;
  for (let page = 1; !userId; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    userId = data.users.find(u => u.email?.toLowerCase() === teacherEmail.toLowerCase())?.id;
    if (data.users.length < 1000) break;
  }
  if (!userId) {
    // Pre-create the verified identity; Supabase links Google sign-in with the same verified email.
    const created = await admin.auth.admin.createUser({ email: teacherEmail, email_confirm: true });
    if (created.error || !created.data.user) throw new Error(`Không tạo được tài khoản giáo viên: ${created.error?.message}`);
    userId = created.data.user.id;
  }
  const granted = await admin.from('teacher_access').upsert({ user_id: userId, enabled: true });
  if (granted.error) throw new Error(`Không ghi được teacher_access (đã chạy migration chưa?): ${granted.error.message}`);
  console.log('  ✓ Đã cấp quyền giáo viên.');
}

step('Lưu biến môi trường lên Vercel (Production + Preview)…');
const sha = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
const secrets = new Set(['SUPABASE_SECRET_KEY', 'GEMINI_API_KEY']);
for (const target of ['production', 'preview']) {
  for (const [name, value] of Object.entries({ ...env, ...(target === 'production' ? { APP_ORIGIN: ORIGIN, PRODUCTION_ACCEPTANCE_SHA: sha } : {}) })) {
    run(['env', 'add', name, target, '--force', '--yes', secrets.has(name) ? '--sensitive' : '--no-sensitive'], value);
    console.log(`  ✓ ${name} → ${target}`);
  }
}

step('Build & deploy Production…');
console.log(run(['deploy', '--prod', '--yes']).split('\n').filter(l => /Production|Inspect|ready/i.test(l)).join('\n'));

step('Kiểm tra Production…');
const health = await fetch(`${ORIGIN}/api/health`);
const session = await fetch(`${ORIGIN}/api/session`);
console.log(`  /api/health → ${health.status}   /api/session (chưa đăng nhập, mong đợi 401) → ${session.status}`);
if (health.status !== 200 || session.status !== 401) process.exitCode = 1;
else console.log(`\n✅ Hoàn tất. Mở ${ORIGIN} để đăng nhập.`);
if (!google) console.log(`\n⚠️ Còn 1 bước thủ công cho giáo viên: Supabase → Authentication → Sign In / Providers → bật Google (Client ID/Secret từ Google Cloud), và thêm ${ORIGIN}/api/auth/google/callback vào Authentication → URL Configuration → Redirect URLs.`);
