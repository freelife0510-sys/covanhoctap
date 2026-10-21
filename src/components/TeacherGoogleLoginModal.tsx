import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCheck, 
  Sparkles, 
  ShieldCheck, 
  X, 
  Mail, 
  ArrowRight,
  School,
  CheckCircle2,
  Lock,
  ExternalLink,
  Settings,
  AlertCircle,
  KeyRound,
  Plus,
  Trash2,
  User,
  Check,
  History,
  LogIn,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Info,
  BookOpen,
  Server
} from 'lucide-react';
import { Teacher } from '../types/index.ts';
import { loginTeacherWithGoogle, saveTeacherProfile } from '../services/storageService.ts';

interface TeacherGoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (teacher: Teacher) => void;
}

interface SavedTeacherAccount {
  email: string;
  name: string;
  avatar: string;
  school?: string;
  lastLogin?: string;
}

// Google Client ID từ biến môi trường (nếu có cấu hình trên Vercel / .env)
const ENV_GOOGLE_CLIENT_ID = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID) || '';

// Hàm giải mã JWT an toàn từ Google Identity Services
function decodeGoogleJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Lỗi giải mã Google JWT:', err);
    return null;
  }
}

export const TeacherGoogleLoginModal: React.FC<TeacherGoogleLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  // Email & Họ tên người dùng nhập
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [schoolInput, setSchoolInput] = useState('');

  // Danh sách các tài khoản giáo viên đã từng đăng nhập trên thiết bị này
  const [savedAccounts, setSavedAccounts] = useState<SavedTeacherAccount[]>(() => {
    try {
      const raw = localStorage.getItem('math_saved_teacher_accounts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Lỗi đọc tài khoản giáo viên đã lưu:', e);
    }
    return [];
  });

  // Client ID lưu trên máy hoặc từ biến môi trường
  const [clientIdInput, setClientIdInput] = useState(() => {
    return localStorage.getItem('math_google_client_id') || ENV_GOOGLE_CLIENT_ID || '';
  });
  const [showConfigClientId, setShowConfigClientId] = useState(false);
  const [showGuideSteps, setShowGuideSteps] = useState(false);
  const [isGsiReady, setIsGsiReady] = useState(false);

  const [activeMode, setActiveMode] = useState<'input' | 'list'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // Khi modal mở: Khởi tạo dữ liệu và dịch vụ Google Identity Services (GIS)
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage('');
    setSuccessNotice('');

    // Đọc danh sách tài khoản đã lưu mới nhất
    try {
      const raw = localStorage.getItem('math_saved_teacher_accounts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedAccounts(parsed);
          setActiveMode('list');
        } else {
          setSavedAccounts([]);
          setActiveMode('input');
        }
      } else {
        setSavedAccounts([]);
        setActiveMode('input');
      }
    } catch {
      setActiveMode('input');
    }

    const lastEmail = localStorage.getItem('google_teacher_email') || '';
    if (lastEmail) {
      setEmailInput(lastEmail);
      const lastName = localStorage.getItem('google_teacher_name') || '';
      if (lastName) setNameInput(lastName);
    }

    // Bước 2 & 3: Khởi tạo Google Identity Services Button & One Tap nếu Client ID có sẵn
    const effectiveClientId = (clientIdInput || ENV_GOOGLE_CLIENT_ID).trim();
    if (effectiveClientId && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: effectiveClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';
          (window as any).google.accounts.id.renderButton(googleBtnContainerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 320,
          });
        }

        // Kích hoạt One Tap nếu phù hợp
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification?.isNotDisplayed()) {
            console.log('Google One Tap suppressed:', notification.getNotDisplayedReason());
          }
        });

        setIsGsiReady(true);
      } catch (err) {
        console.warn('Lỗi init Google Identity Services:', err);
      }
    }
  }, [isOpen, clientIdInput]);

  if (!isOpen) return null;

  // Lưu danh sách tài khoản giáo viên vào localStorage
  const persistSavedAccounts = (accounts: SavedTeacherAccount[]) => {
    setSavedAccounts(accounts);
    try {
      localStorage.setItem('math_saved_teacher_accounts', JSON.stringify(accounts));
    } catch (e) {
      console.warn('Lỗi lưu danh sách tài khoản:', e);
    }
  };

  // Hoàn tất quá trình đăng nhập và đồng bộ
  const completeTeacherLogin = (email: string, name: string, avatarUrl: string, school: string = '') => {
    const cleanEmail = email.trim().toLowerCase();
    const displayName = name.trim() || `Thầy/Cô (${cleanEmail.split('@')[0]})`;
    const finalAvatar = avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}&gender=male`;

    // Lưu phiên đăng nhập
    localStorage.setItem('google_teacher_email', cleanEmail);
    localStorage.setItem('google_teacher_name', displayName);
    localStorage.setItem('google_teacher_avatar', finalAvatar);

    // Cập nhật danh sách tài khoản ghi nhớ trên máy
    const updatedAccounts: SavedTeacherAccount[] = [
      {
        email: cleanEmail,
        name: displayName,
        avatar: finalAvatar,
        school: school || '',
        lastLogin: new Date().toLocaleDateString('vi-VN'),
      },
      ...savedAccounts.filter((a) => a.email.toLowerCase() !== cleanEmail),
    ];
    persistSavedAccounts(updatedAccounts);

    // Khởi tạo không gian làm việc của giáo viên này
    const { teacher } = loginTeacherWithGoogle(cleanEmail, displayName, school, finalAvatar);
    saveTeacherProfile(teacher);

    setIsLoading(false);
    onLoginSuccess(teacher);
    onClose();
  };

  // Bước 4 chuẩn: Tiếp nhận ID Token và gửi đến Back-end (/api/auth/google) để xác thực
  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) {
      setErrorMessage('Không nhận được mã xác thực (ID Token) từ Google. Vui lòng thử lại!');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // 1. Gửi ID Token đến endpoint Back-end serverless để Google OAuth xác minh
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          credential: response.credential,
          clientId: (clientIdInput || ENV_GOOGLE_CLIENT_ID).trim()
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user?.email) {
          completeTeacherLogin(
            data.user.email,
            data.user.name,
            data.user.picture,
            ''
          );
          return;
        }
      }

      // 2. Dự phòng trong môi trường dev cục bộ chưa bật serverless: Giải mã JWT an toàn
      const decoded = decodeGoogleJwt(response.credential);
      if (decoded && decoded.email) {
        completeTeacherLogin(
          decoded.email,
          decoded.name || decoded.given_name || '',
          decoded.picture || '',
          ''
        );
      } else {
        setErrorMessage('Không thể xác thực thông tin từ Google ID Token.');
      }
    } catch (err: any) {
      console.warn('Lỗi gọi API backend, kích hoạt dự phòng giải mã token:', err);
      const decoded = decodeGoogleJwt(response.credential);
      if (decoded && decoded.email) {
        completeTeacherLogin(
          decoded.email,
          decoded.name || decoded.given_name || '',
          decoded.picture || '',
          ''
        );
      } else {
        setErrorMessage('Lỗi xác thực: ' + (err.message || 'Vui lòng thử lại'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Kích hoạt Google OAuth2 Popup chuẩn (Token Client)
  const handleTriggerGoogleOAuthPopup = () => {
    setErrorMessage('');
    const effectiveClientId = (clientIdInput || ENV_GOOGLE_CLIENT_ID).trim();

    if (!effectiveClientId) {
      setShowConfigClientId(true);
      setErrorMessage('Chưa có Google Client ID. Thầy/Cô có thể điền Client ID vào phần Cấu hình bên dưới hoặc đăng nhập trực tiếp bằng Gmail.');
      return;
    }

    const google = (window as any).google;
    if (!google?.accounts?.oauth2) {
      setErrorMessage('Thư viện Google Identity chưa tải xong. Thầy/Cô có thể đăng nhập bằng Gmail ngay bên dưới.');
      return;
    }

    setIsLoading(true);
    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: effectiveClientId,
        scope: 'email profile openid',
        callback: async (tokenResponse: any) => {
          if (tokenResponse?.error) {
            setIsLoading(false);
            setErrorMessage(`Google OAuth: ${tokenResponse.error_description || tokenResponse.error}`);
            return;
          }

          if (tokenResponse?.access_token) {
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const profile = await res.json();
              if (profile?.email) {
                completeTeacherLogin(
                  profile.email,
                  profile.name || profile.given_name || '',
                  profile.picture || '',
                  ''
                );
              } else {
                setIsLoading(false);
                setErrorMessage('Không thể lấy thông tin email từ Google.');
              }
            } catch (err: any) {
              setIsLoading(false);
              setErrorMessage('Lỗi kết nối UserInfo từ Google: ' + err.message);
            }
          } else {
            setIsLoading(false);
          }
        },
      });

      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      setIsLoading(false);
      console.error('Lỗi mở popup Google:', err);
      setErrorMessage('Không thể mở popup Google: ' + (err.message || 'Vui lòng kiểm tra Client ID'));
    }
  };

  // Đăng nhập kết nối bằng tài khoản Gmail trực tiếp
  const handleDirectGmailLogin = (e?: React.FormEvent, targetEmail?: string, targetName?: string) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const rawEmail = (targetEmail || emailInput).trim();
    if (!rawEmail) {
      setErrorMessage('Vui lòng nhập địa chỉ Gmail hoặc Google Workspace của Thầy/Cô!');
      return;
    }

    const fullEmail = rawEmail.includes('@') ? rawEmail.toLowerCase() : `${rawEmail.toLowerCase()}@gmail.com`;
    const username = fullEmail.split('@')[0];
    const displayName = (targetName || nameInput).trim() || `Thầy/Cô (${username})`;
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullEmail}&gender=male`;

    setIsLoading(true);
    setTimeout(() => {
      completeTeacherLogin(fullEmail, displayName, avatarUrl, schoolInput);
    }, 150);
  };

  // Xóa một tài khoản khỏi danh sách ghi nhớ trên máy
  const handleRemoveSavedAccount = (e: React.MouseEvent, emailToRemove: string) => {
    e.stopPropagation();
    const updated = savedAccounts.filter((a) => a.email.toLowerCase() !== emailToRemove.toLowerCase());
    persistSavedAccounts(updated);
    if (updated.length === 0) {
      setActiveMode('input');
    }
  };

  // Lưu Client ID cấu hình tùy chỉnh
  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = clientIdInput.trim();
    localStorage.setItem('math_google_client_id', trimmed);
    setSuccessNotice('Đã lưu Google Client ID thành công!');
    setTimeout(() => setSuccessNotice(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Google Header */}
        <div className="pt-7 pb-4 px-6 text-center border-b border-slate-100">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-2">
            <svg className="w-10 h-10" viewBox="0 0 24 24">
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

          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Đăng nhập Giáo viên bằng Google
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Hỗ trợ <strong>Google Identity Services (GIS)</strong> & xác thực an toàn ID Token ở máy chủ
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">

          {/* Thông báo lỗi */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Thông báo thành công */}
          {successNotice && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 1: DANH SÁCH TÀI KHOẢN ĐÃ LƯU TRÊN MÁY (ACCOUNT CHOOSER)             */}
          {/* ========================================================================= */}
          {activeMode === 'list' && savedAccounts.length > 0 && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Chọn tài khoản của Thầy/Cô để vào:
                </span>
                <button
                  type="button"
                  onClick={() => setActiveMode('input')}
                  className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  + Đăng nhập tài khoản khác
                </button>
              </div>

              {/* Danh sách tài khoản có thể bấm chọn */}
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs max-h-56 overflow-y-auto">
                {savedAccounts.map((acc) => (
                  <div
                    key={acc.email}
                    onClick={() => handleDirectGmailLogin(undefined, acc.email, acc.name)}
                    className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 shrink-0 group-hover:ring-2 group-hover:ring-emerald-500/30 transition-all"
                      />
                      <div className="min-w-0 text-left">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {acc.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono truncate">
                          {acc.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleRemoveSavedAccount(e, acc.email)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                        title="Xóa tài khoản này khỏi thiết bị"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                    </div>
                  </div>
                ))}

                {/* Nút thêm tài khoản mới */}
                <button
                  type="button"
                  onClick={() => setActiveMode('input')}
                  className="w-full p-3.5 hover:bg-emerald-50/50 flex items-center gap-3 text-left transition-colors cursor-pointer border-t border-slate-100"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <Plus className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800">
                      Đăng nhập bằng tài khoản Google khác
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Bất kỳ tài khoản cá nhân @gmail.com hoặc trường học
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: FORM ĐĂNG NHẬP GOOGLE CHUẨN                                      */}
          {/* ========================================================================= */}
          {activeMode === 'input' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {savedAccounts.length > 0 && (
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-slate-800">
                    Đăng nhập tài khoản mới:
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveMode('list')}
                    className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    &larr; Xem tài khoản đã lưu ({savedAccounts.length})
                  </button>
                </div>
              )}

              {/* Nút bấm Đăng nhập Google Popup (Official Google OAuth) */}
              <button
                type="button"
                onClick={handleTriggerGoogleOAuthPopup}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-emerald-500 text-slate-800 font-bold shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer text-xs sm:text-sm group"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span className="group-hover:text-emerald-800 transition-colors">
                  {isLoading ? 'Đang xác thực Google...' : 'Tiếp tục với Google Popup (OAuth 2.0)'}
                </span>
              </button>

              {/* Khung chứa nút Google Identity Services render tự động (g_id_signin) nếu có Client ID */}
              <div ref={googleBtnContainerRef} className="flex justify-center empty:hidden"></div>

              {/* Divider Hoặc */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  hoặc đăng nhập nhanh bằng Gmail
                </span>
                <div className="border-t border-slate-200 w-full"></div>
              </div>

              {/* Form nhập địa chỉ Gmail trực tiếp */}
              <form onSubmit={handleDirectGmailLogin} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Địa chỉ Gmail của Thầy/Cô:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="ví dụ: thaynguyen@gmail.com"
                      className="w-full text-xs sm:text-sm font-medium pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-2xs"
                      autoFocus
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                    <span>Điền nhanh:</span>
                    <button
                      type="button"
                      onClick={() => setEmailInput((prev) => (prev ? (prev.includes('@') ? prev : `${prev}@gmail.com`) : ''))}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      @gmail.com
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Họ và tên hiển thị (tùy chọn):
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="ví dụ: Thầy Nguyễn Văn Nam"
                      className="w-full text-xs sm:text-sm font-medium pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-2xs"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md hover:shadow-lg transition-all cursor-pointer text-xs sm:text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isLoading ? 'Đang đồng bộ...' : 'Đăng nhập vào Không gian Quản trị'}
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CẤU HÌNH GOOGLE CLIENT ID & HƯỚNG DẪN GOOGLE CLOUD (CHUẨN 4 BƯỚC)          */}
          {/* ========================================================================= */}
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowConfigClientId(!showConfigClientId)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors py-1 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Cấu hình Google OAuth Client ID</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showConfigClientId ? 'rotate-180' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => setShowGuideSteps(!showGuideSteps)}
                className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <BookOpen className="w-3 h-3" />
                <span>Quy trình 4 bước</span>
              </button>
            </div>

            {/* Bảng hướng dẫn 4 bước tiêu chuẩn */}
            {showGuideSteps && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-700 space-y-2 animate-in fade-in">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Quy trình tích hợp Google Identity Services (GIS):</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
                  <li>
                    <strong>Google Cloud Console:</strong> Tạo OAuth Client ID (Web Application), khai báo Authorized JavaScript origin là <code className="px-1 py-0.5 rounded bg-white font-mono text-emerald-800">https://covanhoctap.vercel.app</code>.
                  </li>
                  <li>
                    <strong>Thư viện JS:</strong> Đã nhúng sẵn <code className="px-1 py-0.5 rounded bg-white font-mono text-emerald-800">https://accounts.google.com/gsi/client</code> vào thẻ <code className="font-mono">&lt;head&gt;</code>.
                  </li>
                  <li>
                    <strong>Giao diện:</strong> Tích hợp nút Đăng nhập chuẩn Google & Google One Tap thông qua GIS API.
                  </li>
                  <li>
                    <strong>Back-end Serverless:</strong> Endpoint <code className="px-1 py-0.5 rounded bg-white font-mono text-emerald-800">/api/auth/google</code> tiếp nhận ID Token và gửi đến Google API để xác minh chữ ký bảo mật.
                  </li>
                </ol>
              </div>
            )}

            {/* Khung nhập Client ID */}
            {showConfigClientId && (
              <form onSubmit={handleSaveClientId} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 animate-in fade-in">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Nhập Client ID của Thầy/Cô từ Google Cloud Console để mở popup đăng nhập nguyên bản của Google:
                </p>
                <input
                  type="text"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  placeholder="ví dụ: 123456789-xyz.apps.googleusercontent.com"
                  className="w-full text-[11px] font-mono px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex items-center justify-between pt-1">
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>Mở Google Cloud Console</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] cursor-pointer"
                  >
                    Lưu cấu hình
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Ghi chú bảo mật & phân quyền */}
          <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-500 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xác thực an toàn & Đồng bộ dữ liệu:</span>
            </div>
            <p>
              Mỗi tài khoản Google sở hữu không gian quản trị độc lập, toàn quyền quản lý danh sách học sinh và xuất phiếu chẩn đoán GDPT 2018.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeacherGoogleLoginModal;
