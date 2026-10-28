import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import handler from '../../server/router.ts';

test('real HTTP router: health, fail-closed session, CSRF, body limits, and 1-click teacher Google session', async () => {
  const server = createServer((req, res) => void handler(req, res));
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  const address = server.address() as { port: number };
  const base = `http://127.0.0.1:${address.port}`;
  const oldOrigin = process.env.APP_ORIGIN;
  const oldUrl = process.env.SUPABASE_URL;
  process.env.APP_ORIGIN = base;
  delete process.env.SUPABASE_URL;
  try {
    assert.equal((await fetch(`${base}/api/health`)).status, 200);
    const session = await fetch(`${base}/api/session`);
    assert.equal(session.status, 503);
    assert.equal((await session.json()).error.code, 'SETUP_REQUIRED');
    const denied = await fetch(`${base}/api/auth/student-login`, {
      method: 'POST',
      headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' },
      body: '{}',
    });
    assert.equal(denied.status, 403);
    const huge = await fetch(`${base}/api/auth/student-login`, {
      method: 'POST',
      headers: { Origin: base, 'Content-Type': 'application/json' },
      body: ' '.repeat(512001),
    });
    assert.equal(huge.status, 413);
    const mass = await fetch(`${base}/api/auth/student-login`, {
      method: 'POST',
      headers: { Origin: base, 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'HS1', password: 'test', role: 'teacher' }),
    });
    assert.equal(mass.status, 422);
    assert.equal(mass.headers.get('cache-control'), 'no-store');
    // Login must not break on a trailing-slash APP_ORIGIN or when the app is opened on its own host without APP_ORIGIN.
    process.env.APP_ORIGIN = `${base}/`;
    const slash = await fetch(`${base}/api/auth/student-login`, {
      method: 'POST',
      headers: { Origin: base, 'Content-Type': 'application/json' },
      body: '{}',
    });
    assert.equal(slash.status, 422);
    delete process.env.APP_ORIGIN;
    const sameHost = await fetch(`${base}/api/auth/student-login`, {
      method: 'POST',
      headers: { Origin: base, 'Content-Type': 'application/json' },
      body: '{}',
    });
    assert.equal(sameHost.status, 422);
    const stillDenied = await fetch(`${base}/api/auth/student-login`, {
      method: 'POST',
      headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' },
      body: '{}',
    });
    assert.equal(stillDenied.status, 403);

    const quickTeacher = await fetch(`${base}/api/auth/teacher-google`, {
      method: 'POST',
      headers: { Origin: base, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'freelife0510@gmail.com', name: 'Thầy Hồ Sỹ Long' }),
    });
    assert.equal(quickTeacher.status, 200);
    const setCookie = quickTeacher.headers.get('set-cookie') || '';
    assert.match(setCookie, /cv_access=st1\./);
    const cookieHeader = setCookie.split(',')[0].split(';')[0];
    const authedSession = await fetch(`${base}/api/session`, { headers: { Cookie: cookieHeader } });
    assert.equal(authedSession.status, 200);
    const authedJson = await authedSession.json();
    assert.equal(authedJson.profile.role, 'teacher');
    assert.equal(authedJson.profile.name, 'Thầy Hồ Sỹ Long');

    // Create a class and bulk-create students
    const classId = crypto.randomUUID();
    const createCls = await fetch(`${base}/api/classes`, {
      method: 'POST',
      headers: { Origin: base, Cookie: cookieHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: classId, name: '12A1', grade: '12', academicYear: '2026–2027', classCode: '12A1' }),
    });
    assert.equal(createCls.status, 200);

    const bulkRes = await fetch(`${base}/api/students-bulk`, {
      method: 'POST',
      headers: { Origin: base, Cookie: cookieHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classId,
        students: [{ name: 'Nguyễn Văn An' }, { name: 'Trần Thị Bình', studentCode: '12A1-BINH' }],
      }),
    });
    assert.equal(bulkRes.status, 201);
    const bulkData = await bulkRes.json();
    assert.equal(bulkData.created.length, 2);
    assert.equal(bulkData.created[0].studentCode, '12A1-001');
    assert.equal(bulkData.created[1].studentCode, '12A1-BINH');

    // Student can log in with the generated credentials and is required to provide their own personal API key (not teacher's)
    const stuLogin = await fetch(`${base}/api/auth/student-login`, {
      method: 'POST',
      headers: { Origin: base, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: bulkData.created[0].studentCode,
        password: bulkData.created[0].temporaryPassword,
      }),
    });
    assert.equal(stuLogin.status, 200);
    const stuJson = await stuLogin.json();
    assert.equal(stuJson.ai.code, 'STUDENT_KEY_REQUIRED');
    const stuCookie = (stuLogin.headers.get('set-cookie') || '').split(',')[0].split(';')[0];

    const stuAiStatus = await fetch(`${base}/api/ai/status`, {
      headers: { Cookie: stuCookie },
    });
    assert.equal(stuAiStatus.status, 200);
    assert.equal((await stuAiStatus.json()).code, 'STUDENT_KEY_REQUIRED');

    // Logout clears session cookie and succeeds even without Supabase
    const logoutRes = await fetch(`${base}/api/logout`, {
      method: 'POST',
      headers: { Origin: base, Cookie: cookieHeader, 'Content-Type': 'application/json' },
      body: '{}',
    });
    assert.equal(logoutRes.status, 200);
    assert.match(logoutRes.headers.get('set-cookie') || '', /Max-Age=0/);
  } finally {
    if (oldOrigin === undefined) delete process.env.APP_ORIGIN;
    else process.env.APP_ORIGIN = oldOrigin;
    if (oldUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = oldUrl;
    await new Promise<void>((resolve, reject) => server.close(e => (e ? reject(e) : resolve())));
  }
});
