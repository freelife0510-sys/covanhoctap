import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Sparkles, 
  ShieldCheck, 
  X, 
  Mail, 
  ArrowRight,
  School,
  CheckCircle2
} from 'lucide-react';
import { Teacher } from '../types/index.ts';
import { loginTeacherWithGoogle } from '../services/storageService.ts';

interface TeacherGoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (teacher: Teacher) => void;
}

export const TeacherGoogleLoginModal: React.FC<TeacherGoogleLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [cachedGoogleEmail, setCachedGoogleEmail] = useState<string>(() => {
    return localStorage.getItem('google_teacher_email') || '';
  });
  const [teacherEmailInput, setTeacherEmailInput] = useState('');
  const [teacherNameInput, setTeacherNameInput] = useState('');
  const [showCustomEmailInput, setShowCustomEmailInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('google_teacher_email');
    if (saved) {
      setCachedGoogleEmail(saved);
      setTeacherEmailInput(saved);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Thực hiện đăng nhập Google
  const handleGoogleLogin = (targetEmail?: string, targetName?: string) => {
    const emailToUse = (targetEmail || teacherEmailInput || cachedGoogleEmail).trim().toLowerCase();

    // Nếu chưa có email nào, hiển thị ô nhập email
    if (!emailToUse) {
      setShowCustomEmailInput(true);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem('google_teacher_email', emailToUse);
      setCachedGoogleEmail(emailToUse);

      const username = emailToUse.split('@')[0];
      const displayName = targetName?.trim() || teacherNameInput.trim() || `Giáo viên ${username.charAt(0).toUpperCase() + username.slice(1)}`;
      const schoolName = 'Trường THPT Chuẩn GDPT 2018';

      const { teacher } = loginTeacherWithGoogle(emailToUse, displayName, schoolName);
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
            Cổng Quản trị Lớp học, Quản lý Học sinh & Chẩn đoán Vùng trũng Kiến thức (GDPT 2018)
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 space-y-1">
              <p className="font-bold">Xác thực Google 1-Click an toàn</p>
              <p className="text-emerald-800 leading-relaxed text-[11px]">
                Mỗi Giáo viên đăng nhập bằng Gmail sẽ có không gian quản trị độc lập (lớp học, học sinh, bảng điểm và vùng trũng kiến thức riêng).
              </p>
            </div>
          </div>

          {/* Nếu có email đã ghi nhớ và không mở ô nhập tuỳ chỉnh */}
          {cachedGoogleEmail && !showCustomEmailInput && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {cachedGoogleEmail.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-500 font-semibold block">Tài khoản Google đã ghi nhớ:</span>
                  <span className="text-xs font-bold text-slate-800 font-mono truncate block">{cachedGoogleEmail}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCustomEmailInput(true)}
                className="text-[11px] text-emerald-600 hover:text-emerald-800 font-bold hover:underline cursor-pointer shrink-0"
              >
                Đổi Gmail
              </button>
            </div>
          )}

          {/* Ô nhập Gmail nếu cần đổi hoặc chưa có email ghi nhớ */}
          {showCustomEmailInput && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  Nhập địa chỉ Gmail của Thầy/Cô:
                </span>
                {cachedGoogleEmail && (
                  <button
                    type="button"
                    onClick={() => setShowCustomEmailInput(false)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Hủy
                  </button>
                )}
              </div>

              <input
                type="email"
                value={teacherEmailInput}
                onChange={(e) => setTeacherEmailInput(e.target.value)}
                placeholder="ví dụ: giaovien.toan@gmail.com"
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                autoFocus
              />

              <input
                type="text"
                value={teacherNameInput}
                onChange={(e) => setTeacherNameInput(e.target.value)}
                placeholder="Họ và tên hiển thị (tùy chọn)"
                className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          )}

          {/* Nút Đăng nhập Google chính */}
          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-emerald-500 text-slate-800 font-bold shadow-xs hover:shadow transition-all duration-150 cursor-pointer text-xs sm:text-sm"
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
            <span>
              {isLoading
                ? 'Đang xác nhận tài khoản Google...'
                : cachedGoogleEmail && !showCustomEmailInput
                ? `Tiếp tục với Google (${cachedGoogleEmail.split('@')[0]})`
                : 'Đăng nhập bằng tài khoản Google (Gmail)'}
            </span>
          </button>

          <p className="text-[11px] text-center text-slate-500 pt-2">
            Mỗi giáo viên có toàn quyền thêm/xóa lớp, nhập danh sách học sinh và xuất file điểm riêng của lớp mình.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherGoogleLoginModal;
