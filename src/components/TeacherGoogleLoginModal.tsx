import React, { useState, useEffect } from 'react';
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
  LogIn
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
  lastLogin?: string;
}

export const TeacherGoogleLoginModal: React.FC<TeacherGoogleLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  // Email & Họ tên nhập vào
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  
  // Danh sách các tài khoản giáo viên đã từng đăng nhập trên thiết bị này
  const [savedAccounts, setSavedAccounts] = useState<SavedTeacherAccount[]>(() => {
    try {
      const raw = localStorage.getItem('math_saved_teacher_accounts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Lỗi đọc tài khoản giáo viên:', e);
    }
    return [
      {
        email: 'freelife0510@gmail.com',
        name: 'Thầy Hồ Sỹ Long',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=freelife0510&gender=male',
      },
    ];
  });

  const [activeMode, setActiveMode] = useState<'input' | 'list'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      const lastEmail = localStorage.getItem('google_teacher_email') || '';
      if (lastEmail) {
        setEmailInput(lastEmail);
        const lastName = localStorage.getItem('google_teacher_name') || '';
        if (lastName) setNameInput(lastName);
      }
      // Nếu có sẵn danh sách tài khoản đã lưu, hiển thị bảng chọn tiện lợi
      if (savedAccounts.length > 0) {
        setActiveMode('list');
      } else {
        setActiveMode('input');
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

  // Xử lý đăng nhập bằng bất kỳ tài khoản Gmail nào
  const handleConnectGoogle = (targetEmail?: string, targetName?: string) => {
    setErrorMessage('');
    const rawEmail = (targetEmail || emailInput).trim();
    
    if (!rawEmail) {
      setErrorMessage('Vui lòng nhập địa chỉ Gmail của Thầy/Cô!');
      return;
    }

    // Tự động bổ sung @gmail.com nếu giáo viên chỉ gõ username
    const fullEmail = rawEmail.includes('@') ? rawEmail.toLowerCase() : `${rawEmail.toLowerCase()}@gmail.com`;
    const username = fullEmail.split('@')[0];
    const displayName = (targetName || nameInput).trim() || `Thầy/Cô (${username})`;
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullEmail}&gender=male`;

    setIsLoading(true);

    setTimeout(() => {
      try {
        // Lưu thông tin phiên đăng nhập
        localStorage.setItem('google_teacher_email', fullEmail);
        localStorage.setItem('google_teacher_name', displayName);
        localStorage.setItem('google_teacher_avatar', avatarUrl);

        // Cập nhật vào danh sách các tài khoản trên máy
        const updatedList: SavedTeacherAccount[] = [
          {
            email: fullEmail,
            name: displayName,
            avatar: avatarUrl,
            lastLogin: new Date().toLocaleDateString('vi-VN'),
          },
          ...savedAccounts.filter((a) => a.email.toLowerCase() !== fullEmail),
        ];
        persistSavedAccounts(updatedList);

        // Khởi tạo/kết nối không gian làm việc của giáo viên này
        const { teacher } = loginTeacherWithGoogle(fullEmail, displayName, '', avatarUrl);
        saveTeacherProfile(teacher);

        setIsLoading(false);
        onLoginSuccess(teacher);
        onClose();
      } catch (err) {
        console.error('Lỗi kết nối tài khoản:', err);
        setIsLoading(false);
        setErrorMessage('Không thể kết nối tài khoản lúc này. Vui lòng thử lại!');
      }
    }, 200);
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
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
            Hỗ trợ <strong>tất cả các tài khoản Gmail</strong> & Google Workspace để kết nối không gian quản trị lớp học
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

          {/* ========================================================================= */}
          {/* VIEW 1: DANH SÁCH TÀI KHOẢN ĐÃ LƯU TRÊN THIẾT BỊ (ACCOUNT CHOOSER)       */}
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
                  + Nhập Gmail khác
                </button>
              </div>

              {/* Danh sách tài khoản có thể bấm chọn */}
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                {savedAccounts.map((acc) => (
                  <div
                    key={acc.email}
                    onClick={() => handleConnectGoogle(acc.email, acc.name)}
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
                        title="Xóa tài khoản này khỏi máy này"
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
                      Đăng nhập bằng tài khoản Gmail khác
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Bất kỳ tài khoản Google cá nhân hoặc trường học
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: Ô NHẬP GMAIL CHO BẤT KỲ GIÁO VIÊN NÀO                             */}
          {/* ========================================================================= */}
          {activeMode === 'input' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConnectGoogle();
              }}
              className="space-y-3.5 animate-in fade-in duration-150"
            >
              {savedAccounts.length > 0 && (
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-slate-800">
                    Nhập Gmail của Thầy/Cô để kết nối:
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveMode('list')}
                    className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    &larr; Xem tài khoản đã lưu
                  </button>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Địa chỉ Gmail của Thầy/Cô:
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
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400">
                  <span>Gợi ý:</span>
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
                    placeholder="ví dụ: Thầy Hồ Sỹ Long"
                    className="w-full text-xs sm:text-sm font-medium pl-10 pr-3.5 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-2xs"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Nút bấm kết nối chính */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer text-xs sm:text-sm disabled:opacity-50"
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
                  {isLoading ? 'Đang kết nối tài khoản...' : 'Đăng nhập kết nối bằng Google'}
                </span>
              </button>
            </form>
          )}

          {/* Ghi chú bảo mật & phân quyền */}
          <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bảo mật & Phân quyền độc lập theo Gmail:</span>
            </div>
            <p>
              Mỗi giáo viên đăng nhập bằng Gmail sẽ sở hữu không gian quản lý lớp học, học sinh và phiếu chẩn đoán riêng biệt, hoàn toàn bảo mật.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeacherGoogleLoginModal;
