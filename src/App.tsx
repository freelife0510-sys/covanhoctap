import React, { useEffect, useState, lazy, Suspense } from 'react';
import { api, ApiError, post } from './services/apiClient.ts';
import type { AIConnection, Session } from './features.ts';
import LandingPage from './components/LandingPage.tsx';
const TeacherWorkspace=lazy(()=>import('./components/TeacherWorkspace.tsx'));
const LearnerWorkspace=lazy(()=>import('./components/LearnerWorkspace.tsx'));
const AUTH_ERRORS: Record<string, string> = {
  TEACHER_NOT_APPROVED: 'Tài khoản Google này đã bị thu hồi quyền hoặc không nằm trong danh sách giáo viên được phép.',
  OAUTH_STATE: 'Phiên đăng nhập Google đã hết hạn hoặc được mở ở địa chỉ khác. Vui lòng bấm “Đăng nhập bằng Google” lại.',
  OAUTH_FAILED: 'Không xác thực được tài khoản Google. Vui lòng thử lại.',
  OAUTH_CANCELLED: 'Bạn đã hủy đăng nhập Google.',
  OAUTH_NOT_CONFIGURED: 'Máy chủ chưa cấu hình Google OAuth trong Supabase.',
  SETUP_REQUIRED: 'Máy chủ chưa cấu hình đủ biến môi trường (Supabase). Liên hệ quản trị viên.',
  DATABASE_ERROR: 'Không đọc được dữ liệu tài khoản trên máy chủ. Vui lòng thử lại.',
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [login, setLogin] = useState(false);
  const [profileOpen,setProfileOpen]=useState(false);
  const [busy, setBusy] = useState(false);
  const [home, setHome] = useState(true);
  const [ai, setAi] = useState<AIConnection | null>(null);
  const [loginStep, setLoginStep] = useState('');
  useEffect(() => {
    // Show Google sign-in failures returned by /api/auth/google/callback, then clean the URL.
    const params = new URLSearchParams(window.location.search); const authError = params.get('auth_error');
    if (authError) { setError(AUTH_ERRORS[authError] || `Đăng nhập không thành công (${authError}).`); params.delete('auth_error'); window.history.replaceState(null, '', `${window.location.pathname}${params.size ? `?${params}` : ''}`); }
  }, []);
  useEffect(() => {
    // Stop using old browser credentials; do not erase legacy workspaces/backups.
    try { localStorage.removeItem('gemini_api_key'); localStorage.removeItem('math_auth_session'); } catch { /* Storage may be disabled. */ }
    api<Session>('/session').then(s => { setSession(s); setHome(false); }).catch(e => {
      if (!(e instanceof ApiError) || e.status !== 401) setError(e.message);
    }).finally(() => setChecking(false));
  }, []);
  const run = async (fn: () => Promise<void>) => { if (busy) return; setBusy(true); setError(''); try { await fn(); } catch (e) { if(e instanceof ApiError && e.status===401){setSession(null);setHome(true);} setError((e as Error).message); } finally { setBusy(false); } };
  const studentLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const data = new FormData(e.currentTarget);
    void run(async () => {
      setLoginStep('Đang xác minh tài khoản & kết nối Cố vấn AI…');
      try {
        // The server checks the student's password and calls Gemini with its API key in parallel.
        const result = await post<{ success: boolean; ai: AIConnection | null }>('/auth/student-login', { identifier: String(data.get('identifier') || '').trim(), password: data.get('password') });
        setAi(result.ai); setLoginStep('Đang mở không gian học tập…');
        setSession(await api('/session')); setLogin(false); setHome(false);
      } finally { setLoginStep(''); }
    });
  };
  const changePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const data = new FormData(e.currentTarget);
    void run(async () => {
      const result = await post<{ success: boolean; relogged?: boolean; ai?: AIConnection | null }>('/auth/password', { password: data.get('password') });
      if (result.relogged) { setAi(result.ai || null); setSession(await api('/session')); setHome(false); return; }
      setSession(null); setHome(true); setLogin(true); setError('Mật khẩu đã đổi. Vui lòng đăng nhập lại.');
    });
  };
  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <header className="no-print bg-white border-b px-4 py-4 flex flex-wrap items-center justify-between gap-3">
      <button className="font-black text-xl text-emerald-800" onClick={() => setHome(true)}>Cố Vấn Học Tập</button>
      <nav className="flex flex-wrap gap-3 items-center" aria-label="Điều hướng chính">
        {session ? <><span>{session.profile.name}</span><button onClick={() => setHome(false)}>Không gian học tập</button><button onClick={()=>setProfileOpen(true)}>Hồ sơ</button><button disabled={busy} onClick={() => void run(async () => { await post('/auth/logout', {}); setSession(null); setAi(null); setHome(true); })}>Đăng xuất</button></> : <><button onClick={() => setLogin(true)}>Đăng nhập học sinh</button><a className="button" href="/api/auth/google/start">Đăng nhập bằng Google (Giáo viên)</a></>}
      </nav>
    </header>
    <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
      {error && <div role="alert" className="error"><p>{error}</p><button onClick={() => setError('')}>Đóng thông báo</button></div>}
      <Suspense fallback={<p role="status">Đang tải không gian làm việc…</p>}>{checking ? <p role="status">Đang xác minh phiên đăng nhập…</p> : session?.profile.forced_password_change ? <form onSubmit={changePassword} className="panel max-w-md mx-auto"><h1>Đổi mật khẩu được cấp</h1><p>Đặt mật khẩu riêng trước khi sử dụng tài khoản.</p><label>Mật khẩu mới (ít nhất 12 ký tự)<input required name="password" type="password" minLength={12} maxLength={128} autoComplete="new-password"/></label><button className="button" disabled={busy}>Lưu mật khẩu</button></form> : !session || home ? <LandingPage onGoToStudent={() => session?.profile.role === 'student' ? setHome(false) : setLogin(true)} onGoToTeacher={() => session?.profile.role === 'teacher' ? setHome(false) : window.location.assign('/api/auth/google/start')} onOpenStudentLogin={() => setLogin(true)} onOpenTeacherLogin={() => window.location.assign('/api/auth/google/start')}/> : session.profile.role === 'teacher' ? <TeacherWorkspace session={session}/> : <LearnerWorkspace session={session} initialAi={ai}/>}</Suspense>
    </main>
    {profileOpen&&session&&<div className="modal"><section className="panel max-w-md w-full" role="dialog" aria-modal="true" aria-label="Hồ sơ tài khoản"><h2>Hồ sơ tài khoản</h2><form className="space-y-3" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);void run(async()=>{await post('/profile',{name:f.get('name'),school:f.get('school')});setSession(await api('/session'));setProfileOpen(false);});}}><label>Họ tên<input name="name" defaultValue={session.profile.name} required maxLength={100}/></label><label>Trường<input name="school" defaultValue={session.profile.school} maxLength={200}/></label><button className="button" disabled={busy}>Lưu hồ sơ</button></form>{session.profile.role==='student'&&<form className="space-y-3 mt-4" onSubmit={e=>{setProfileOpen(false);changePassword(e);}}><label>Mật khẩu mới (ít nhất 12 ký tự)<input name="password" required type="password" minLength={12} maxLength={128} autoComplete="new-password"/></label><button disabled={busy}>Đổi mật khẩu & đăng nhập lại</button></form>}<button className="mt-4" onClick={()=>setProfileOpen(false)}>Đóng</button></section></div>}
    {login && <div className="modal no-print"><section role="dialog" aria-modal="true" aria-labelledby="login-title" className="panel max-w-md w-full"><h2 id="login-title">Đăng nhập học sinh</h2><form onSubmit={studentLogin} className="space-y-4"><label>Mã học sinh<input autoFocus required name="identifier" autoComplete="username" maxLength={40}/></label><label>Mật khẩu<input required name="password" type="password" autoComplete="current-password" maxLength={128}/></label><button disabled={busy} className="button">{busy ? 'Đang đăng nhập…' : 'Đăng nhập & kết nối AI'}</button> <button type="button" disabled={busy} onClick={() => setLogin(false)}>Đóng</button><p role="status" aria-live="polite" className="text-sm text-emerald-700">{loginStep || 'Khi đăng nhập, hệ thống gọi Gemini API ngay trên máy chủ để Cố vấn AI sẵn sàng hỗ trợ tức thì.'}</p></form></section></div>}
    <footer className="no-print text-center text-xs text-slate-500 py-6">Cố vấn Toán THPT · Kết quả AI cần được kiểm tra · Dữ liệu tài khoản được xác minh bởi máy chủ</footer>
  </div>;
}
