import React, { useEffect, useState, lazy, Suspense } from 'react';
import { api, ApiError, post } from './services/apiClient.ts';
import type { AIConnection, Session } from './features.ts';
import LandingPage from './components/LandingPage.tsx';

const TeacherWorkspace = lazy(() => import('./components/TeacherWorkspace.tsx'));
const LearnerWorkspace = lazy(() => import('./components/LearnerWorkspace.tsx'));

const AUTH_ERRORS: Record<string, string> = {
  TEACHER_NOT_APPROVED: 'Tài khoản Google này đã bị thu hồi quyền hoặc không nằm trong danh sách giáo viên được phép.',
  OAUTH_STATE: 'Phiên đăng nhập Google đã hết hạn hoặc được mở ở địa chỉ khác. Vui lòng bấm “Đăng nhập bằng Google” lại.',
  OAUTH_FAILED: 'Không xác thực được tài khoản Google. Vui lòng thử lại.',
  OAUTH_CANCELLED: 'Bạn đã hủy đăng nhập Google.',
  OAUTH_NOT_CONFIGURED: 'Máy chủ chưa cấu hình Google OAuth trong Supabase.',
  SETUP_REQUIRED: 'Máy chủ chưa cấu hình đủ biến môi trường (Supabase). Liên hệ quản trị viên.',
  DATABASE_ERROR: 'Không đọc được dữ liệu tài khoản trên máy chủ. Vui lòng thử lại.',
};

interface SavedGoogleTeacher {
  email: string;
  name: string;
  avatar: string;
  lastLogin?: string;
}

const DEFAULT_SAVED_TEACHER: SavedGoogleTeacher = {
  email: 'freelife0510@gmail.com',
  name: 'Thầy Hồ Sỹ Long',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=freelife0510&gender=male',
};

function loadSavedGoogleTeachers(): SavedGoogleTeacher[] {
  try {
    const raw = localStorage.getItem('math_saved_teacher_accounts');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const lastEmail = localStorage.getItem('google_teacher_email');
    if (lastEmail) {
      const lastName = localStorage.getItem('google_teacher_name') || `Thầy/Cô (${lastEmail.split('@')[0]})`;
      return [
        {
          email: lastEmail,
          name: lastName,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(lastEmail)}&gender=male`,
        },
      ];
    }
  } catch {
    // ignore storage error
  }
  return [DEFAULT_SAVED_TEACHER];
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [login, setLogin] = useState(false);
  const [teacherGoogleOpen, setTeacherGoogleOpen] = useState(false);
  const [savedTeachers, setSavedTeachers] = useState<SavedGoogleTeacher[]>(loadSavedGoogleTeachers);
  const [showOtherAccountForm, setShowOtherAccountForm] = useState(false);
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [home, setHome] = useState(true);
  const [ai, setAi] = useState<AIConnection | null>(null);
  const [loginStep, setLoginStep] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('auth_error');
    const googlePicker = params.get('google_picker');
    if (authError) {
      setError(AUTH_ERRORS[authError] || `Đăng nhập không thành công (${authError}).`);
      params.delete('auth_error');
    }
    if (googlePicker) {
      setTeacherGoogleOpen(true);
      params.delete('google_picker');
    }
    if (authError || googlePicker) {
      window.history.replaceState(null, '', `${window.location.pathname}${params.size ? `?${params}` : ''}`);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.removeItem('gemini_api_key');
      localStorage.removeItem('math_auth_session');
    } catch {
      /* Storage may be disabled. */
    }
    api<Session>('/session')
      .then(s => {
        setSession(s);
        setHome(false);
      })
      .catch(e => {
        if (!(e instanceof ApiError) || e.status !== 401) setError(e.message);
      })
      .finally(() => setChecking(false));
  }, []);

  const run = async (fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setSession(null);
        setHome(true);
      }
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleTeacherGoogleContinue = (emailRaw: string, nameRaw?: string) => {
    const cleanEmail = emailRaw.trim().includes('@') ? emailRaw.trim().toLowerCase() : `${emailRaw.trim().toLowerCase()}@gmail.com`;
    const displayName = (nameRaw || '').trim() || `Thầy/Cô (${cleanEmail.split('@')[0]})`;
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}&gender=male`;

    void run(async () => {
      await post('/auth/teacher-google', { email: cleanEmail, name: displayName });
      try {
        localStorage.setItem('google_teacher_email', cleanEmail);
        localStorage.setItem('google_teacher_name', displayName);
        const updated: SavedGoogleTeacher[] = [
          { email: cleanEmail, name: displayName, avatar, lastLogin: new Date().toLocaleDateString('vi-VN') },
          ...savedTeachers.filter(a => a.email.toLowerCase() !== cleanEmail),
        ];
        setSavedTeachers(updated);
        localStorage.setItem('math_saved_teacher_accounts', JSON.stringify(updated));
      } catch {
        // ignore storage error
      }
      setSession(await api('/session'));
      setTeacherGoogleOpen(false);
      setShowOtherAccountForm(false);
      setHome(false);
    });
  };

  const openTeacherGooglePicker = () => {
    setSavedTeachers(loadSavedGoogleTeachers());
    setShowOtherAccountForm(false);
    setError('');
    setTeacherGoogleOpen(true);
  };

  const studentLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    void run(async () => {
      setLoginStep('Đang xác minh tài khoản & kết nối Cố vấn AI…');
      try {
        const result = await post<{ success: boolean; ai: AIConnection | null }>('/auth/student-login', {
          identifier: String(data.get('identifier') || '').trim(),
          password: data.get('password'),
        });
        setAi(result.ai);
        setLoginStep('Đang mở không gian học tập…');
        setSession(await api('/session'));
        setLogin(false);
        setHome(false);
      } finally {
        setLoginStep('');
      }
    });
  };

  const changePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    void run(async () => {
      const result = await post<{ success: boolean; relogged?: boolean; ai?: AIConnection | null }>('/auth/password', {
        password: data.get('password'),
      });
      if (result.relogged) {
        setAi(result.ai || null);
        setSession(await api('/session'));
        setHome(false);
        return;
      }
      setSession(null);
      setHome(true);
      setLogin(true);
      setError('Mật khẩu đã đổi. Vui lòng đăng nhập lại.');
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="no-print bg-white border-b px-4 py-4 flex flex-wrap items-center justify-between gap-3">
        <button className="font-black text-xl text-emerald-800" onClick={() => setHome(true)}>
          Cố Vấn Học Tập
        </button>
        <nav className="flex flex-wrap gap-3 items-center" aria-label="Điều hướng chính">
          {session ? (
            <>
              <span>{session.profile.name}</span>
              <button onClick={() => setHome(false)}>Không gian học tập</button>
              <button onClick={() => setProfileOpen(true)}>Hồ sơ</button>
              <button
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await post('/auth/logout', {});
                    setSession(null);
                    setAi(null);
                    setHome(true);
                  })
                }
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setLogin(true)}>Đăng nhập học sinh</button>
              <button type="button" className="button" onClick={openTeacherGooglePicker}>
                Đăng nhập bằng Google (Giáo viên)
              </button>
            </>
          )}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
        {error && (
          <div role="alert" className="error">
            <p>{error}</p>
            <button onClick={() => setError('')}>Đóng thông báo</button>
          </div>
        )}
        <Suspense fallback={<p role="status">Đang tải không gian làm việc…</p>}>
          {checking ? (
            <p role="status">Đang xác minh phiên đăng nhập…</p>
          ) : session?.profile.forced_password_change ? (
            <form onSubmit={changePassword} className="panel max-w-md mx-auto">
              <h1>Đổi mật khẩu được cấp</h1>
              <p>Đặt mật khẩu riêng trước khi sử dụng tài khoản.</p>
              <label>
                Mật khẩu mới (ít nhất 12 ký tự)
                <input required name="password" type="password" minLength={12} maxLength={128} autoComplete="new-password" />
              </label>
              <button className="button" disabled={busy}>
                Lưu mật khẩu
              </button>
            </form>
          ) : !session || home ? (
            <LandingPage
              onGoToStudent={() => (session?.profile.role === 'student' ? setHome(false) : setLogin(true))}
              onGoToTeacher={() => (session?.profile.role === 'teacher' ? setHome(false) : openTeacherGooglePicker())}
              onOpenStudentLogin={() => setLogin(true)}
              onOpenTeacherLogin={openTeacherGooglePicker}
            />
          ) : session.profile.role === 'teacher' ? (
            <TeacherWorkspace session={session} />
          ) : (
            <LearnerWorkspace session={session} initialAi={ai} />
          )}
        </Suspense>
      </main>

      {profileOpen && session && (
        <div className="modal">
          <section className="panel max-w-md w-full" role="dialog" aria-modal="true" aria-label="Hồ sơ tài khoản">
            <h2>Hồ sơ tài khoản</h2>
            <form
              className="space-y-3"
              onSubmit={e => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void run(async () => {
                  await post('/profile', { name: f.get('name'), school: f.get('school') });
                  setSession(await api('/session'));
                  setProfileOpen(false);
                });
              }}
            >
              <label>
                Họ tên
                <input name="name" defaultValue={session.profile.name} required maxLength={100} />
              </label>
              <label>
                Trường
                <input name="school" defaultValue={session.profile.school} maxLength={200} />
              </label>
              <button className="button" disabled={busy}>
                Lưu hồ sơ
              </button>
            </form>
            {session.profile.role === 'student' && (
              <form
                className="space-y-3 mt-4"
                onSubmit={e => {
                  setProfileOpen(false);
                  changePassword(e);
                }}
              >
                <label>
                  Mật khẩu mới (ít nhất 12 ký tự)
                  <input name="password" required type="password" minLength={12} maxLength={128} autoComplete="new-password" />
                </label>
                <button disabled={busy}>Đổi mật khẩu & đăng nhập lại</button>
              </form>
            )}
            <button className="mt-4" onClick={() => setProfileOpen(false)}>
              Đóng
            </button>
          </section>
        </div>
      )}

      {teacherGoogleOpen && (
        <div className="modal no-print">
          <section role="dialog" aria-modal="true" aria-labelledby="google-login-title" className="panel max-w-md w-full space-y-4">
            <div className="text-center border-b pb-3">
              <div className="inline-flex items-center justify-center w-10 h-10 mb-1">
                <svg className="w-8 h-8" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <h2 id="google-login-title" className="text-lg font-bold">
                Chọn tài khoản Google để tiếp tục
              </h2>
              <p className="text-xs text-slate-500">Bấm Tiếp tục trên tài khoản Gmail của Thầy/Cô để vào ngay Cố Vấn Học Tập</p>
            </div>

            {!showOtherAccountForm ? (
              <div className="space-y-3">
                <div className="divide-y rounded-xl border bg-slate-50 overflow-hidden">
                  {savedTeachers.map(acc => (
                    <div key={acc.email} className="p-3 flex items-center justify-between gap-3 bg-white hover:bg-emerald-50/40">
                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate">{acc.name}</div>
                        <div className="text-xs text-slate-500 font-mono truncate">{acc.email}</div>
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        className="button shrink-0"
                        onClick={() => handleTeacherGoogleContinue(acc.email, acc.name)}
                      >
                        {busy ? 'Đang vào…' : 'Tiếp tục'}
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={busy}
                  className="w-full text-sm py-2.5 px-4 rounded-xl border hover:bg-slate-50 font-semibold"
                  onClick={() => setShowOtherAccountForm(true)}
                >
                  + Sử dụng một tài khoản Google (Gmail) khác
                </button>
              </div>
            ) : (
              <form
                className="space-y-3"
                onSubmit={e => {
                  e.preventDefault();
                  if (!teacherEmail.trim()) return;
                  handleTeacherGoogleContinue(teacherEmail, teacherName);
                }}
              >
                <label>
                  Địa chỉ Gmail của Thầy/Cô
                  <input
                    autoFocus
                    required
                    type="text"
                    placeholder="vidu@gmail.com"
                    value={teacherEmail}
                    onChange={e => setTeacherEmail(e.target.value)}
                    maxLength={120}
                  />
                </label>
                <label>
                  Họ và tên hiển thị (tùy chọn)
                  <input
                    type="text"
                    placeholder="Thầy Hồ Sỹ Long"
                    value={teacherName}
                    onChange={e => setTeacherName(e.target.value)}
                    maxLength={100}
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button type="submit" disabled={busy} className="button">
                    {busy ? 'Đang đăng nhập…' : 'Tiếp tục với Gmail này'}
                  </button>
                  <button type="button" disabled={busy} onClick={() => setShowOtherAccountForm(false)}>
                    Quay lại danh sách
                  </button>
                </div>
              </form>
            )}

            <div className="flex justify-end border-t pt-3">
              <button type="button" disabled={busy} onClick={() => setTeacherGoogleOpen(false)}>
                Đóng
              </button>
            </div>
          </section>
        </div>
      )}

      {login && (
        <div className="modal no-print">
          <section role="dialog" aria-modal="true" aria-labelledby="login-title" className="panel max-w-md w-full">
            <h2 id="login-title">Đăng nhập học sinh</h2>
            <form onSubmit={studentLogin} className="space-y-4">
              <label>
                Mã học sinh
                <input autoFocus required name="identifier" autoComplete="username" maxLength={40} />
              </label>
              <label>
                Mật khẩu
                <input required name="password" type="password" autoComplete="current-password" maxLength={128} />
              </label>
              <button disabled={busy} className="button">
                {busy ? 'Đang đăng nhập…' : 'Đăng nhập & kết nối AI'}
              </button>{' '}
              <button type="button" disabled={busy} onClick={() => setLogin(false)}>
                Đóng
              </button>
              <p role="status" aria-live="polite" className="text-sm text-emerald-700">
                {loginStep || 'Khi đăng nhập, hệ thống gọi Gemini API ngay trên máy chủ để Cố vấn AI sẵn sàng hỗ trợ tức thì.'}
              </p>
            </form>
          </section>
        </div>
      )}

      <footer className="no-print text-center text-xs text-slate-500 py-6">
        Cố vấn Toán THPT · Kết quả AI cần được kiểm tra · Dữ liệu tài khoản được xác minh bởi máy chủ
      </footer>
    </div>
  );
}
