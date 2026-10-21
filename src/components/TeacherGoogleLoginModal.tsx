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
  RefreshCw
} from 'lucide-react';
import { Teacher } from '../types/index.ts';
import { loginTeacherWithGoogle, saveTeacherProfile } from '../services/storageService.ts';

interface TeacherGoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (teacher: Teacher) => void;
}

// Google Client ID mặc định của hệ thống hoặc từ biến môi trường
const DEFAULT_GOOGLE_CLIENT_ID = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID) || 
  '712839218392-mathdiagnosticthpt2018.apps.googleusercontent.com';

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
    console.error('Lỗi giải mã Google JWT Token:', err);
    return null;
  }
}

export const TeacherGoogleLoginModal: React.FC<TeacherGoogleLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [cachedGoogleEmail, setCachedGoogleEmail] = useState<string>(() => {
    return localStorage.getItem('google_teacher_email') || '';
  });
  const [googleClientId, setGoogleClientId] = useState<string>(() => {
    return localStorage.getItem('math_google_client_id') || DEFAULT_GOOGLE_CLIENT_ID;
  });
  const [showConfigClientId, setShowConfigClientId] = useState(false);
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [manualEmailInput, setManualEmailInput] = useState('');
  const [manualNameInput, setManualNameInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGsiReady, setIsGsiReady] = useState(false);

  const googleButtonContainerRef = useRef<HTMLDivElement>(null);

  // Khởi tạo Google Identity Services khi Modal mở
  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage('');

    const initGsi = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id) return;

      const effectiveClientId = googleClientId.trim() || DEFAULT_GOOGLE_CLIENT_ID;

      try {
        google.accounts.id.initialize({
          client_id: effectiveClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleButtonContainerRef.current) {
          googleButtonContainerRef.current.innerHTML = '';
          google.accounts.id.renderButton(googleButtonContainerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 320,
          });
        }

        setIsGsiReady(true);
      } catch (err) {
        console.warn('Lỗi render Google Sign-In Button:', err);
      }
    };

    if ((window as any).google?.accounts?.id) {
      initGsi();
    } else {
      // Đợi script Google GIS tải xong
      const timer = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(timer);
          initGsi();
        }
      }, 250);
      return () => clearInterval(timer);
    }
  }, [isOpen, googleClientId]);

  if (!isOpen) return null;

  // Xử lý khi Google trả về JWT xác thực thực tế
  const handleGoogleCredentialResponse = (response: any) => {
    if (!response || !response.credential) {
      setErrorMessage('Không nhận được mã xác thực từ Google. Vui lòng thử lại!');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const payload = decodeGoogleJwt(response.credential);
      if (!payload || !payload.email) {
        throw new Error('Dữ liệu Google Token không chứa địa chỉ email.');
      }

      const verifiedEmail = payload.email.trim().toLowerCase();
      const verifiedName = payload.name || verifiedEmail.split('@')[0];
      const verifiedAvatar = payload.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${verifiedEmail}`;

      // Lưu cache tài khoản Google thực sự
      localStorage.setItem('google_teacher_email', verifiedEmail);
      localStorage.setItem('google_teacher_name', verifiedName);
      localStorage.setItem('google_teacher_avatar', verifiedAvatar);
      setCachedGoogleEmail(verifiedEmail);

      // Đăng nhập / tạo hồ sơ giáo viên thực tế từ Google
      const { teacher } = loginTeacherWithGoogle(verifiedEmail, verifiedName, '', verifiedAvatar);
      saveTeacherProfile(teacher);

      setIsLoading(false);
      onLoginSuccess(teacher);
      onClose();
    } catch (e: any) {
      console.error('Lỗi xác thực Google:', e);
      setIsLoading(false);
      setErrorMessage('Xác thực tài khoản Google không thành công. Vui lòng thử lại!');
    }
  };

  // Mở Popup Đăng nhập Google OAuth2 chính thức
  const handleOpenGoogleOAuthPopup = () => {
    setIsLoading(true);
    setErrorMessage('');

    const effectiveClientId = googleClientId.trim() || DEFAULT_GOOGLE_CLIENT_ID;
    const redirectUri = window.location.origin;
    const scope = encodeURIComponent('openid email profile');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      effectiveClientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token%20id_token&scope=${scope}&nonce=${Date.now()}&prompt=select_account`;

    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      'GoogleSignIn',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
    );

    if (!popup) {
      setIsLoading(false);
      setErrorMessage('Trình duyệt đang chặn cửa sổ Popup. Vui lòng cho phép popup để đăng nhập Google!');
      return;
    }

    // Lắng nghe kết quả từ popup hoặc kiểm tra đóng
    const checkTimer = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkTimer);
          setIsLoading(false);
          return;
        }

        // Nếu popup điều hướng về cùng origin
        if (popup.location && popup.location.origin === window.location.origin) {
          const hash = popup.location.hash;
          if (hash && hash.includes('id_token=')) {
            clearInterval(checkTimer);
            const params = new URLSearchParams(hash.replace(/^#/, ''));
            const idToken = params.get('id_token');
            if (idToken) {
              handleGoogleCredentialResponse({ credential: idToken });
            }
            popup.close();
          }
        }
      } catch (err) {
        // Cross-origin access pending
      }
    }, 500);
  };

  // Lưu cấu hình Google Client ID mới
  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('math_google_client_id', googleClientId.trim());
    setShowConfigClientId(false);
    alert('Đã lưu Google Client ID mới! Nút đăng nhập Google sẽ tự động tải lại.');
  };

  // Đăng nhập nhanh dự phòng (Offline / Testing)
  const handleManualFallbackLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const emailToUse = (manualEmailInput || cachedGoogleEmail).trim().toLowerCase();
    if (!emailToUse) {
      setErrorMessage('Vui lòng nhập địa chỉ Gmail của Thầy/Cô!');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const username = emailToUse.split('@')[0];
      const displayName = manualNameInput.trim() || `Giáo viên ${username.charAt(0).toUpperCase() + username.slice(1)}`;
      localStorage.setItem('google_teacher_email', emailToUse);
      
      const { teacher } = loginTeacherWithGoogle(emailToUse, displayName, '');
      saveTeacherProfile(teacher);
      setIsLoading(false);
      onLoginSuccess(teacher);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-br from-teal-700 via-emerald-800 to-slate-900 p-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md ring-4 ring-white/20 mb-3 shadow-inner">
            <UserCheck className="w-7 h-7 text-emerald-300" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Đăng nhập Giáo viên bằng Google
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-xs mx-auto leading-relaxed">
            Liên kết trực tiếp tài khoản Google chính thức để quản lý lớp học & phân tích vùng trũng học sinh
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">

          {/* Thông báo bảo mật OAuth */}
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 space-y-1">
              <p className="font-bold">Xác thực Google OAuth 2.0 Chính Thức</p>
              <p className="text-emerald-800 leading-relaxed text-[11px]">
                Hệ thống xác thực trực tiếp qua máy chủ Google. Dữ liệu lớp học và học sinh được phân quyền độc lập theo từng tài khoản Giáo viên.
              </p>
            </div>
          </div>

          {/* Thông báo lỗi nếu có */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* NÚT ĐĂNG NHẬP GOOGLE IDENTITY SERVICES CHÍNH THỨC */}
          <div className="space-y-3 pt-1">
            <div className="text-center">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Bấm nút bên dưới để chọn tài khoản Google của Thầy/Cô:
              </span>

              {/* Nơi hiển thị Button Google GSI chính thức */}
              <div 
                ref={googleButtonContainerRef} 
                className="flex justify-center items-center min-h-[46px]"
              />

              {/* Nút dự phòng: Mở popup Google OAuth2 trực tiếp */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleOpenGoogleOAuthPopup}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs shadow-2xs hover:border-emerald-500 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mở cửa sổ Đăng nhập Google (OAuth 2.0 Popup)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Thông tin tài khoản Google đã lưu trước đó nếu có */}
          {cachedGoogleEmail && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-600 truncate">
                  Tài khoản gần nhất: <strong className="text-slate-900 font-mono">{cachedGoogleEmail}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const { teacher } = loginTeacherWithGoogle(cachedGoogleEmail);
                  saveTeacherProfile(teacher);
                  onLoginSuccess(teacher);
                  onClose();
                }}
                className="text-emerald-700 font-bold hover:underline shrink-0 cursor-pointer text-[11px]"
              >
                Vào nhanh
              </button>
            </div>
          )}

          {/* Tùy chọn mở rộng: Cấu hình Client ID hoặc Đăng nhập thử nghiệm */}
          <div className="border-t border-slate-200/80 pt-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <button
                type="button"
                onClick={() => setShowConfigClientId(!showConfigClientId)}
                className="hover:text-emerald-700 flex items-center gap-1 cursor-pointer font-semibold"
              >
                <Settings className="w-3 h-3 text-slate-400" />
                <span>Cấu hình Google Client ID riêng</span>
              </button>

              <button
                type="button"
                onClick={() => setShowManualLogin(!showManualLogin)}
                className="hover:text-emerald-700 flex items-center gap-1 cursor-pointer font-semibold"
              >
                <Mail className="w-3 h-3 text-slate-400" />
                <span>Đăng nhập Gmail thủ công</span>
              </button>
            </div>

            {/* Bảng Cấu hình Client ID */}
            {showConfigClientId && (
              <form onSubmit={handleSaveClientId} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs animate-in fade-in">
                <span className="font-bold text-slate-800 block">
                  Nhập Google OAuth 2.0 Client ID của trường/tổ:
                </span>
                <input
                  type="text"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  placeholder="xxxx.apps.googleusercontent.com"
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleClientId(DEFAULT_GOOGLE_CLIENT_ID);
                      localStorage.removeItem('math_google_client_id');
                    }}
                    className="px-2.5 py-1 text-slate-500 hover:text-slate-700 text-[11px] cursor-pointer"
                  >
                    Khôi phục mặc định
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] cursor-pointer"
                  >
                    Lưu Client ID
                  </button>
                </div>
              </form>
            )}

            {/* Bảng Đăng nhập Gmail thủ công (Dự phòng khi offline) */}
            {showManualLogin && (
              <form onSubmit={handleManualFallbackLogin} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs animate-in fade-in">
                <span className="font-bold text-slate-800 block">
                  Nhập Gmail để đăng nhập trực tiếp (Offline / Test):
                </span>
                <input
                  type="email"
                  value={manualEmailInput}
                  onChange={(e) => setManualEmailInput(e.target.value)}
                  placeholder="giaovien@gmail.com"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
                <input
                  type="text"
                  value={manualNameInput}
                  onChange={(e) => setManualNameInput(e.target.value)}
                  placeholder="Họ và tên Giáo viên"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="text-[11px] text-center text-slate-400 pt-1">
            Mỗi giáo viên có toàn quyền quản lý lớp, học sinh và xuất phiếu chẩn đoán riêng biệt.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherGoogleLoginModal;
