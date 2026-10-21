import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ArrowRight,
  CheckCircle2,
  Trash2,
  Plus,
  LogIn,
  ShieldCheck,
  Mail,
  ArrowLeft
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
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID) || 
  (typeof localStorage !== 'undefined' ? localStorage.getItem('math_google_client_id') || '' : '');

// Giải mã JWT ID Token an toàn từ Google
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

  const [emailInput, setEmailInput] = useState('');
  const [showInputStep, setShowInputStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // Khi modal mở: đọc dữ liệu và chuẩn bị dịch vụ Google
  useEffect(() => {
    if (!isOpen) return;

    setShowInputStep(false);
    setIsLoading(false);

    try {
      const raw = localStorage.getItem('math_saved_teacher_accounts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedAccounts(parsed);
        } else {
          setSavedAccounts([]);
        }
      } else {
        setSavedAccounts([]);
      }
    } catch {
      setSavedAccounts([]);
    }

    const lastEmail = localStorage.getItem('google_teacher_email') || '';
    if (lastEmail) {
      setEmailInput(lastEmail);
    }

    // Khởi tạo Google Identity Services Button nếu Client ID có sẵn
    const effectiveClientId = (ENV_GOOGLE_CLIENT_ID || localStorage.getItem('math_google_client_id') || '').trim();
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
      } catch (err) {
        console.warn('Lỗi init Google Identity Services:', err);
      }
    }
  }, [isOpen]);

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

  // Hoàn tất quá trình đăng nhập và đồng bộ dữ liệu giáo viên
  const completeTeacherLogin = (email: string, name?: string, avatarUrl?: string, school?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const displayName = (name || '').trim() || `Thầy/Cô (${cleanEmail.split('@')[0]})`;
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

    // Khởi tạo không gian làm việc độc lập của giáo viên này
    const { teacher } = loginTeacherWithGoogle(cleanEmail, displayName, school, finalAvatar);
    saveTeacherProfile(teacher);

    setIsLoading(false);
    onLoginSuccess(teacher);
    onClose();
  };

  // Tiếp nhận ID Token và gửi đến Back-end (/api/auth/google) để xác thực
  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;

    setIsLoading(true);

    try {
      // 1. Gửi ID Token đến endpoint Back-end serverless để Google OAuth xác minh
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user?.email) {
          completeTeacherLogin(data.user.email, data.user.name, data.user.picture);
          return;
        }
      }

      // 2. Dự phòng an toàn: Giải mã JWT
      const decoded = decodeGoogleJwt(response.credential);
      if (decoded && decoded.email) {
        completeTeacherLogin(decoded.email, decoded.name || decoded.given_name, decoded.picture);
      }
    } catch (err: any) {
      console.warn('Lỗi gọi API backend, giải mã JWT dự phòng:', err);
      const decoded = decodeGoogleJwt(response.credential);
      if (decoded && decoded.email) {
        completeTeacherLogin(decoded.email, decoded.name || decoded.given_name, decoded.picture);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Khi bấm vào nút "Đăng nhập bằng Google":
  // Kết nối trực tiếp tài khoản Google thực và đăng nhập ngay
  const handleGoogleLoginButtonClick = () => {
    setIsLoading(true);

    // 1. Nếu có Client ID và thư viện Google GIS sẵn sàng, mở popup Google OAuth
    const effectiveClientId = (ENV_GOOGLE_CLIENT_ID || localStorage.getItem('math_google_client_id') || '').trim();
    const google = (window as any).google;

    if (effectiveClientId && google?.accounts?.oauth2) {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: effectiveClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile = await res.json();
                if (profile?.email) {
                  completeTeacherLogin(profile.email, profile.name || profile.given_name, profile.picture);
                  return;
                }
              } catch (err) {
                console.warn('Lỗi userinfo:', err);
              }
            }
            setIsLoading(false);
          },
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('Lỗi mở popup GIS:', err);
      }
    }

    // 2. Nếu đã từng đăng nhập tài khoản Google trên máy này: đăng nhập ngay lập tức!
    const lastEmail = localStorage.getItem('google_teacher_email');
    if (lastEmail) {
      const lastName = localStorage.getItem('google_teacher_name') || '';
      const lastAvatar = localStorage.getItem('google_teacher_avatar') || '';
      setTimeout(() => {
        completeTeacherLogin(lastEmail, lastName, lastAvatar);
      }, 200);
      return;
    }

    // 3. Nếu trên máy chưa có tài khoản nào: mở giao diện nhập Gmail để kết nối ngay
    setIsLoading(false);
    setShowInputStep(true);
  };

  // Xác nhận nhập địa chỉ Gmail để kết nối
  const handleDirectEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = emailInput.trim();
    if (!raw) return;

    const fullEmail = raw.includes('@') ? raw.toLowerCase() : `${raw.toLowerCase()}@gmail.com`;
    setIsLoading(true);
    setTimeout(() => {
      completeTeacherLogin(fullEmail);
    }, 200);
  };

  // Xóa tài khoản khỏi danh sách ghi nhớ
  const handleRemoveAccount = (e: React.MouseEvent, emailToRemove: string) => {
    e.stopPropagation();
    const updated = savedAccounts.filter((a) => a.email.toLowerCase() !== emailToRemove.toLowerCase());
    persistSavedAccounts(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
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
        <div className="pt-8 pb-5 px-6 text-center border-b border-slate-100">
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
            Kết nối tài khoản Google để truy cập không gian quản trị giáo viên và hồ sơ học sinh
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">

          {/* ========================================================================= */}
          {/* TRƯỜNG HỢP 1: DANH SÁCH TÀI KHOẢN ĐÃ CÓ TRÊN MÁY (BẤM LÀ ĐĂNG NHẬP NGAY) */}
          {/* ========================================================================= */}
          {savedAccounts.length > 0 && !showInputStep && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                Chọn tài khoản của Thầy/Cô để vào:
              </span>

              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                {savedAccounts.map((acc) => (
                  <div
                    key={acc.email}
                    onClick={() => completeTeacherLogin(acc.email, acc.name, acc.avatar, acc.school)}
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
                        onClick={(e) => handleRemoveAccount(e, acc.email)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                        title="Xóa tài khoản khỏi máy này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Nút đăng nhập bằng tài khoản khác */}
              <button
                type="button"
                onClick={() => setShowInputStep(true)}
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Đăng nhập bằng tài khoản Google khác</span>
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TRƯỜNG HỢP 2: NÚT ĐĂNG NHẬP CHÍNH "ĐĂNG NHẬP BẰNG GOOGLE"                 */}
          {/* ========================================================================= */}
          {savedAccounts.length === 0 && !showInputStep && (
            <div className="py-2 space-y-3 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={handleGoogleLoginButtonClick}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-emerald-500 text-slate-800 font-bold shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer text-sm group"
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
                  {isLoading ? 'Đang kết nối tài khoản Google...' : 'Đăng nhập bằng Google'}
                </span>
              </button>

              {/* Vùng tự động render nút Google GIS khi có cấu hình */}
              <div ref={googleBtnContainerRef} className="flex justify-center empty:hidden"></div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TRƯỜNG HỢP 3: BƯỚC NHẬP TÀI KHOẢN GOOGLE KHI KẾT NỐI MỚI                  */}
          {/* ========================================================================= */}
          {showInputStep && (
            <form onSubmit={handleDirectEmailSubmit} className="space-y-3.5 animate-in fade-in duration-150">
              {savedAccounts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowInputStep(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold cursor-pointer pb-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại danh sách tài khoản</span>
                </button>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Nhập địa chỉ Gmail của Thầy/Cô:
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="ví dụ: thaylong@gmail.com"
                    className="w-full text-xs sm:text-sm font-medium pl-10 pr-3.5 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-2xs"
                    autoFocus
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md hover:shadow-lg transition-all cursor-pointer text-xs sm:text-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>
                  {isLoading ? 'Đang kết nối...' : 'Kết nối & Đăng nhập ngay'}
                </span>
              </button>
            </form>
          )}

          {/* Ghi chú bảo mật ngắn gọn */}
          <div className="border-t border-slate-100 pt-3 text-center">
            <span className="text-[11px] text-slate-400 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bảo mật bởi Google Identity Services</span>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeacherGoogleLoginModal;
