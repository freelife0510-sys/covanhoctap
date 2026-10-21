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
  Check
} from 'lucide-react';
import { Teacher } from '../types/index.ts';
import { loginTeacherWithGoogle, saveTeacherProfile } from '../services/storageService.ts';

interface TeacherGoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (teacher: Teacher) => void;
}

interface GoogleAccountItem {
  email: string;
  name: string;
  avatar: string;
  roleDescription?: string;
  isDefault?: boolean;
}

const DEFAULT_ACCOUNTS: GoogleAccountItem[] = [
  {
    email: 'freelife0510@gmail.com',
    name: 'Thầy Hồ Sỹ Long',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=freelife0510&gender=male',
    roleDescription: 'Giáo viên Quản trị Bộ môn Toán THPT',
    isDefault: true,
  },
  {
    email: 'hosylong.toan@gmail.com',
    name: 'Thầy Hồ Sỹ Long (Chuyên môn)',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hosylong&gender=male',
    roleDescription: 'Tổ trưởng Chuyên môn Toán THPT GDPT 2018',
    isDefault: false,
  },
];

export const TeacherGoogleLoginModal: React.FC<TeacherGoogleLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  // Danh sách tài khoản Google đã lưu để LỰA CHỌN
  const [savedAccounts, setSavedAccounts] = useState<GoogleAccountItem[]>(() => {
    try {
      const raw = localStorage.getItem('math_google_saved_accounts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Gộp với DEFAULT_ACCOUNTS đảm bảo tài khoản Thầy luôn có mặt
          const emailSet = new Set(parsed.map((a: GoogleAccountItem) => a.email.toLowerCase()));
          DEFAULT_ACCOUNTS.forEach((da) => {
            if (!emailSet.has(da.email.toLowerCase())) {
              parsed.push(da);
            }
          });
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc tài khoản Google đã lưu:', e);
    }
    return DEFAULT_ACCOUNTS;
  });

  const [activeTab, setActiveTab] = useState<'choose' | 'add' | 'settings'>('choose');
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [customClientId, setCustomClientId] = useState(() => {
    return localStorage.getItem('math_google_client_id') || '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setActiveTab('choose');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Lưu danh sách tài khoản
  const persistAccounts = (accounts: GoogleAccountItem[]) => {
    setSavedAccounts(accounts);
    try {
      localStorage.setItem('math_google_saved_accounts', JSON.stringify(accounts));
    } catch (e) {
      console.warn('Lỗi lưu danh sách tài khoản:', e);
    }
  };

  // Chọn tài khoản Google để đăng nhập ngay
  const handleSelectAccount = (account: GoogleAccountItem) => {
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      try {
        localStorage.setItem('google_teacher_email', account.email);
        localStorage.setItem('google_teacher_name', account.name);

        const { teacher } = loginTeacherWithGoogle(
          account.email,
          account.name,
          '',
          account.avatar
        );
        saveTeacherProfile(teacher);

        setIsLoading(false);
        onLoginSuccess(teacher);
        onClose();
      } catch (e) {
        console.error('Lỗi đăng nhập tài khoản Google:', e);
        setIsLoading(false);
        setErrorMessage('Có lỗi xảy ra khi xác thực tài khoản. Vui lòng thử lại!');
      }
    }, 250);
  };

  // Thêm tài khoản Google mới và đăng nhập
  const handleAddAccountAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Vui lòng nhập địa chỉ Gmail!');
      return;
    }
    if (!cleanEmail.includes('@')) {
      setErrorMessage('Địa chỉ email không đúng định dạng (ví dụ: giaovien@gmail.com)!');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const username = cleanEmail.split('@')[0];
      const displayName = newName.trim() || `Giáo viên ${username.charAt(0).toUpperCase() + username.slice(1)}`;
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}&gender=male`;

      const newAccountItem: GoogleAccountItem = {
        email: cleanEmail,
        name: displayName,
        avatar: avatarUrl,
        roleDescription: 'Tài khoản Giáo viên Toán THPT',
        isDefault: false,
      };

      // Cập nhật danh sách tài khoản đã lưu
      const updatedAccounts = [
        newAccountItem,
        ...savedAccounts.filter((a) => a.email.toLowerCase() !== cleanEmail),
      ];
      persistAccounts(updatedAccounts);

      // Đăng nhập
      const { teacher } = loginTeacherWithGoogle(cleanEmail, displayName, '', avatarUrl);
      saveTeacherProfile(teacher);

      setIsLoading(false);
      onLoginSuccess(teacher);
      onClose();
    }, 250);
  };

  // Xóa tài khoản khỏi danh sách lựa chọn
  const handleRemoveAccount = (e: React.MouseEvent, emailToRemove: string) => {
    e.stopPropagation();
    if (confirm(`Thầy/Cô có muốn xóa tài khoản ${emailToRemove} khỏi danh sách lựa chọn trên máy này?`)) {
      const remaining = savedAccounts.filter((a) => a.email.toLowerCase() !== emailToRemove.toLowerCase());
      persistAccounts(remaining);
    }
  };

  // Lưu Google Cloud Client ID (nếu trường có Client ID riêng)
  const handleSaveCustomClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (customClientId.trim()) {
      localStorage.setItem('math_google_client_id', customClientId.trim());
      alert('Đã lưu Google OAuth Client ID của trường!');
    } else {
      localStorage.removeItem('math_google_client_id');
      alert('Đã gỡ bỏ Client ID tùy chỉnh.');
    }
    setActiveTab('choose');
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

        {/* Google Official Header (Account Chooser) */}
        <div className="pt-7 pb-4 px-6 text-center border-b border-slate-100">
          {/* Official Google G Logo */}
          <div className="inline-flex items-center justify-center w-12 h-12 mb-3">
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
            Chọn một tài khoản để đăng nhập vào <strong>MathDiagnostic AI</strong>
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
          {/* TAB 1: DANH SÁCH LỰA CHỌN TÀI KHOẢN (ACCOUNT CHOOSER)                     */}
          {/* ========================================================================= */}
          {activeTab === 'choose' && (
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Tài khoản Google của Thầy/Cô:
              </span>

              {/* Danh sách các tài khoản để lựa chọn */}
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                {savedAccounts.map((acc) => (
                  <div
                    key={acc.email}
                    onClick={() => handleSelectAccount(acc)}
                    className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 shrink-0 group-hover:ring-2 group-hover:ring-emerald-500/30 transition-all"
                      />
                      <div className="min-w-0 text-left">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                          <span>{acc.name}</span>
                          {acc.email === 'freelife0510@gmail.com' && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                              Quản trị
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-mono truncate">
                          {acc.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {acc.email !== 'freelife0510@gmail.com' && (
                        <button
                          type="button"
                          onClick={(e) => handleRemoveAccount(e, acc.email)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all"
                          title="Xóa tài khoản này khỏi danh sách chọn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                    </div>
                  </div>
                ))}

                {/* Nút: Sử dụng một tài khoản khác */}
                <button
                  type="button"
                  onClick={() => setActiveTab('add')}
                  className="w-full p-3.5 hover:bg-emerald-50/50 flex items-center gap-3 text-left transition-colors cursor-pointer border-t border-slate-100"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <Plus className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800">
                      Sử dụng một tài khoản Google khác
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Nhập Gmail hoặc tài khoản trường học (@thpt.edu.vn)
                    </div>
                  </div>
                </button>
              </div>

              {isLoading && (
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center animate-pulse">
                  Đang khởi tạo không gian quản trị lớp học...
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: THÊM TÀI KHOẢN GOOGLE MỚI                                          */}
          {/* ========================================================================= */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddAccountAndLogin} className="space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-800">
                  Nhập thông tin tài khoản Google của Thầy/Cô:
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('choose')}
                  className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  &larr; Quay lại chọn
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Địa chỉ Gmail / Google Workspace:
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ví dụ: freelife0510@gmail.com"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Họ và tên hiển thị trên hệ thống (tùy chọn):
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="ví dụ: Thầy Hồ Sỹ Long"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('choose')}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  {isLoading ? 'Đang kết nối...' : 'Xác nhận & Đăng nhập'}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CÀI ĐẶT GOOGLE OAUTH CLIENT ID (TÙY CHỌN CHO TRƯỜNG/TỔ TOÁN)       */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveCustomClientId} className="space-y-3 animate-in fade-in duration-150 text-xs">
              <div className="flex items-center justify-between pb-1">
                <span className="font-bold text-slate-800">
                  Cấu hình Google Cloud OAuth 2.0 Client ID:
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('choose')}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  &larr; Quay lại
                </button>
              </div>

              <p className="text-slate-500 leading-relaxed text-[11px]">
                Nếu Trường hoặc Tổ toán có dự án trên Google Cloud Console, Thầy/Cô có thể dán Client ID vào đây để kích hoạt cửa sổ xác thực Google GIS chính thức.
              </p>

              <div>
                <input
                  type="text"
                  value={customClientId}
                  onChange={(e) => setCustomClientId(e.target.value)}
                  placeholder="xxxx-xxxx.apps.googleusercontent.com"
                  className="w-full font-mono text-[11px] px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCustomClientId('');
                    localStorage.removeItem('math_google_client_id');
                    alert('Đã xóa Client ID tùy chỉnh.');
                  }}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Khôi phục mặc định
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Lưu Client ID
                </button>
              </div>
            </form>
          )}

          {/* Footer note & Settings toggle */}
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Bảo mật dữ liệu GDPT 2018</span>
            {activeTab !== 'settings' && (
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className="hover:text-slate-600 flex items-center gap-1 cursor-pointer"
              >
                <Settings className="w-3 h-3" />
                <span>Cấu hình Client ID</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeacherGoogleLoginModal;
