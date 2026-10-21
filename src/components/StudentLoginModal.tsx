import React, { useState } from 'react';
import { 
  GraduationCap, 
  Key, 
  User, 
  ArrowRight, 
  AlertCircle, 
  X, 
  Sparkles, 
  Check, 
  BookOpenCheck
} from 'lucide-react';
import { StudentAccount } from '../types/index.ts';
import { 
  loginStudentWithCredentials, 
  getAllGlobalStudents
} from '../services/storageService.ts';

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (student: StudentAccount) => void;
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Xử lý nộp form đăng nhập
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Vui lòng nhập Mã số học sinh hoặc Họ và tên!');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Vui lòng nhập Mật khẩu do Thầy/Cô cấp!');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = loginStudentWithCredentials(identifier, password);
      setIsLoading(false);

      if (result.success && result.student) {
        onLoginSuccess(result.student);
        onClose();
      } else {
        setErrorMessage(
          result.errorMessage ||
          'Không tìm thấy học sinh hoặc sai mật khẩu. Vui lòng liên hệ Thầy/Cô bộ môn để nhận mã số và mật khẩu.'
        );
      }
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
        <div className="bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 p-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md ring-4 ring-white/20 mb-3 shadow-inner">
            <GraduationCap className="w-7 h-7 text-emerald-300" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Đăng nhập Dành cho Học sinh
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-xs mx-auto leading-relaxed">
            Nhập Mã số hoặc Họ và tên kèm Mật khẩu do Thầy/Cô bộ môn cung cấp
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Gợi ý tài khoản mẫu tiện lợi */}
          <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div className="text-left">
              <div className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Tài khoản học sinh mẫu:</span>
              </div>
              <div className="text-[10px] text-emerald-800 mt-0.5">
                Tên: <span className="font-bold text-emerald-950">Nguyễn Duy An</span> | Mật khẩu: <span className="font-bold text-emerald-950">123</span> (hoặc 123456)
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIdentifier('Nguyễn Duy An');
                setPassword('123456');
                setErrorMessage('');
              }}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shrink-0 shadow-xs cursor-pointer transition-colors"
            >
              Điền nhanh
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Mã số học sinh HOẶC Họ và tên:
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ví dụ: Nguyễn Duy An hoặc HS12A1-01"
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                autoFocus
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Không phân biệt chữ hoa/thường, có dấu hoặc không dấu.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                Mật khẩu:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu mặc định: 123 hoặc 123456"
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Hệ thống hỗ trợ mật khẩu 123, 123456 hoặc mật khẩu do Thầy/Cô cấp.
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>{isLoading ? 'Đang xác thực thông tin...' : 'Đăng nhập vào Lớp học'}</span>
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-500 pt-1">
            Thông tin liên hệ Thầy/Cô: <span className="font-semibold text-slate-700">Thầy Hồ Sỹ Long - SĐT 0943278804</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLoginModal;
