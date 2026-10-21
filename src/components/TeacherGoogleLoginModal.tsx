import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ArrowRight,
  Trash2,
  Plus,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  ExternalLink,
  CheckCircle2
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

// Google Client ID từ biến môi trường Vercel hoặc localStorage
const getEffectiveClientId = (): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID) {
    return (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('math_google_client_id') || '';
  }
  return '';
};

export const TeacherGoogleLoginModal: React.FC<TeacherGoogleLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [clientId, setClientId] = useState<string>(getEffectiveClientId());
  const [clientIdInput, setClientIdInput] = useState<string>(getEffectiveClientId());
  const [showConfig, setShowConfig] = useState<boolean>(!getEffectiveClientId());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Danh sách các tài khoản giáo viên đã từng đăng nhập Google THỰC SỰ trên máy này
  const [savedAccounts, setSavedAccounts] = useState<SavedTeacherAccount[]>(() => {
    try {
      const raw = localStorage.getItem('math_saved_teacher_accounts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Khởi tạo Google Identity Services chính thức khi mở modal
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage('');
    setIsLoading(false);
    const currentId = getEffectiveClientId();
    setClientId(currentId);
    setClientIdInput(currentId);
    setShowConfig(!currentId);

    // Đọc danh sách tài khoản Google đã lưu
    try {
      const raw = localStorage.getItem('math_saved_teacher_accounts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedAccounts(parsed);
        } else {
          setSavedAccounts([]);
        }
      }
    } catch {
      setSavedAccounts([]);
    }

    // Nếu đã có Client ID và SDK Google GIS đã tải: Render nút chính hãng của Google
    if (currentId && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: currentId,
          callback: handleGoogleJwtCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 320,
          });
        }
      } catch (err) {
        console.warn('Lỗi khởi tạo Google GIS:', err);
      }
    }
  }, [isOpen, clientId]);

  if (!isOpen) return null;

  // Hoàn tất đăng nhập khi Google xác thực thành công
  const completeRealGoogleLogin = (email: string, name?: string, avatarUrl?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const displayName = (name || '').trim() || `Thầy/Cô (${cleanEmail.split('@')[0]})`;
    const finalAvatar = avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}&gender=male`;

    localStorage.setItem('google_teacher_email', cleanEmail);
    localStorage.setItem('google_teacher_name', displayName);
    localStorage.setItem('google_teacher_avatar', finalAvatar);

    // Cập nhật danh sách tài khoản đã xác thực trên máy
    const updated: SavedTeacherAccount[] = [
      {
        email: cleanEmail,
        name: displayName,
        avatar: finalAvatar,
        lastLogin: new Date().toLocaleDateString('vi-VN'),
      },
      ...savedAccounts.filter((a) => a.email.toLowerCase() !== cleanEmail),
    ];
    setSavedAccounts(updated);
    try {
      localStorage.setItem('math_saved_teacher_accounts', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    // Khởi tạo/kết nối không gian dữ liệu độc lập của giáo viên
    const { teacher } = loginTeacherWithGoogle(cleanEmail, displayName, '', finalAvatar);
    saveTeacherProfile(teacher);

    setIsLoading(false);
    onLoginSuccess(teacher);
    onClose();
  };

  // Xác thực Google ID Token gửi về từ Google Identity Services
  const handleGoogleJwtCredentialResponse = async (response: any) => {
    if (!response?.credential) {
      setErrorMessage('Không nhận được mã xác thực từ Google.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Gửi token lên Back-end Serverless /api/auth/google để máy chủ Google xác thực
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential, clientId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user?.email) {
          completeRealGoogleLogin(data.user.email, data.user.name, data.user.picture);
          return;
        }
      }

      setErrorMessage('Mã xác thực Google không hợp lệ hoặc đã hết hạn.');
    } catch (err: any) {
      setErrorMessage('Lỗi xác thực máy chủ: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Kích hoạt Popup Google OAuth 2.0 thực sự (accounts.google.com)
  const handleTriggerRealGoogleOAuthPopup = () => {
    const effectiveId = (clientId || getEffectiveClientId()).trim();
    setErrorMessage('');

    if (!effectiveId) {
      setShowConfig(true);
      setErrorMessage('Google yêu cầu OAuth Client ID để mở popup xác thực. Vui lòng cung cấp Client ID bên dưới.');
      return;
    }

    const google = (window as any).google;
    if (!google?.accounts?.oauth2) {
      setErrorMessage('Thư viện Google Identity chưa sẵn sàng. Vui lòng tải lại trang.');
      return;
    }

    setIsLoading(true);
    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: effectiveId,
        scope: 'email profile openid',
        callback: async (tokenResponse: any) => {
          if (tokenResponse?.error) {
            setIsLoading(false);
            setErrorMessage(`Lỗi từ Google: ${tokenResponse.error_description || tokenResponse.error}`);
            return;
          }

          if (tokenResponse?.access_token) {
            try {
              // Lấy thông tin tài khoản THỰC SỰ được Google cấp quyền
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              
              if (!res.ok) {
                setIsLoading(false);
                setErrorMessage('Không thể xác nhận thông tin tài khoản từ Google.');
                return;
              }

              const profile = await res.json();
              if (profile?.email) {
                completeRealGoogleLogin(profile.email, profile.name || profile.given_name, profile.picture);
                return;
              }
            } catch (err: any) {
              setErrorMessage('Lỗi lấy thông tin Google UserInfo: ' + err.message);
            }
          }
          setIsLoading(false);
        },
      });

      // Mở cửa sổ popup chính chủ của Google: accounts.google.com
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('Không thể mở popup Google: ' + err.message);
    }
  };

  // Lưu Client ID cấu hình
  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = clientIdInput.trim();
    if (!trimmed) {
      setErrorMessage('Vui lòng nhập Google Client ID.');
      return;
    }
    localStorage.setItem('math_google_client_id', trimmed);
    setClientId(trimmed);
    setShowConfig(false);
    setErrorMessage('');
  };

  // Xóa tài khoản đã lưu
  const handleRemoveSavedAccount = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    const updated = savedAccounts.filter((a) => a.email.toLowerCase() !== email.toLowerCase());
    setSavedAccounts(updated);
    try {
      localStorage.setItem('math_saved_teacher_accounts', JSON.stringify(updated));
    } catch {
      // ignore
    }
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
            Đăng nhập bằng Google
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Kết nối bảo mật qua Google Identity Services (GIS) với tài khoản Google thực sự của Thầy/Cô
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">

          {/* Thông báo lỗi nếu có */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* DANH SÁCH TÀI KHOẢN GOOGLE THỰC ĐÃ TỪNG XÁC THỰC TRÊN MÁY */}
          {savedAccounts.length > 0 && (
            <div className="space-y-2 animate-in fade-in">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                Tài khoản Google đã kết nối:
              </span>
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                {savedAccounts.map((acc) => (
                  <div
                    key={acc.email}
                    onClick={() => completeRealGoogleLogin(acc.email, acc.name, acc.avatar)}
                    className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-9 h-9 rounded-full border border-slate-200 bg-slate-50 shrink-0 group-hover:ring-2 group-hover:ring-emerald-500/30 transition-all"
                      />
                      <div className="min-w-0 text-left">
                        <div className="text-xs font-bold text-slate-900 truncate">{acc.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">{acc.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleRemoveSavedAccount(e, acc.email)}
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
            </div>
          )}

          {/* NÚT BẤM DUY NHẤT: ĐĂNG NHẬP BẰNG GOOGLE (MỞ POPUP GOOGLE THỰC SỰ) */}
          <div className="pt-1 space-y-3">
            {/* 1. Nút Google chính thức được SDK Google render trực tiếp */}
            <div ref={googleBtnRef} className="flex justify-center empty:hidden"></div>

            {/* 2. Nút kích hoạt Google OAuth Popup trực tiếp */}
            <button
              type="button"
              onClick={handleTriggerRealGoogleOAuthPopup}
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
                {isLoading ? 'Đang mở cửa sổ Google...' : 'Đăng nhập bằng Google'}
              </span>
            </button>
          </div>

          {/* KHUNG CẤU HÌNH CLIENT ID (CHỈ HIỆN KHI CHƯA CÓ CLIENT ID HOẶC KHI CẦN THIẾT) */}
          {showConfig && (
            <div className="mt-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-2.5 animate-in fade-in">
              <div className="flex items-start gap-2 text-amber-900 font-bold">
                <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Yêu cầu Google OAuth Client ID:</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Để Google mở popup xác thực thực sự từ <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-amber-950">accounts.google.com</code>, Thầy/Cô chỉ cần dán mã Client ID của website vào đây (chỉ làm 1 lần):
              </p>
              <form onSubmit={handleSaveClientId} className="space-y-2">
                <input
                  type="text"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  placeholder="...apps.googleusercontent.com"
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <div className="flex items-center justify-between pt-1">
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-800 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Mở Google Cloud Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                  >
                    Lưu & Kích hoạt
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Ghi chú bảo mật an toàn */}
          <div className="border-t border-slate-100 pt-3 text-center">
            <span className="text-[11px] text-slate-400 inline-flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xác thực mật khẩu và danh tính trực tiếp bởi máy chủ Google</span>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeacherGoogleLoginModal;
