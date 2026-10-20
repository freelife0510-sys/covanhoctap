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
  getAllGlobalStudents,
  loginTeacherWithGoogle
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

  // Lấy danh sách học sinh mẫu có sẵn
  const allStudents = getAllGlobalStudents();
  const demoStudents = allStudents.slice(0, 4);

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

  // Đăng nhập nhanh 1-chạm học sinh mẫu
  const handleQuickStudentSelect = (code: string, pass: string) => {
    setIdentifier(code);
    setPassword(pass);
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const result = loginStudentWithCredentials(code, pass);
      setIsLoading(false);

      if (result.success && result.student) {
        onLoginSuccess(result.student);
        onClose();
      } else {
        // Tự động khởi tạo giáo viên mẫu nếu chưa có dữ liệu trong hệ thống
        loginTeacherWithGoogle('giaovien.demo@gmail.com', 'Giáo viên Bộ môn Toán', 'THPT Chuẩn GDPT 2018');
        const retryResult = loginStudentWithCredentials(code, pass);
        if (retryResult.success && retryResult.student) {
          onLoginSuccess(retryResult.student);
          onClose();
        } else {
          setErrorMessage('Chưa có dữ liệu học sinh mẫu. Thầy/Cô hãy đăng nhập Giáo viên trước để sinh lớp!');
        }
      }
    }, 250);
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
                placeholder="Ví dụ: HS12A1-01 hoặc Nguyễn Văn An"
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                autoFocus
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Không phân biệt chữ hoa/thường, tự động loại bỏ khoảng trắng thừa.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                Mật khẩu (do Thầy/Cô cấp):
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu khởi tạo (mặc định: 123)"
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
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

          {/* Tài khoản mẫu 1-chạm */}
          <div className="pt-2">
            <div className="relative py-1 mb-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-slate-400 font-bold">Học sinh mẫu (Bấm 1-chạm vào ngay)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              {[
                { code: 'HS12A1-01', name: 'Nguyễn Văn An', pass: '123', tag: 'Lớp 12A1' },
                { code: 'HS12A1-02', name: 'Trần Thị Mai', pass: '123', tag: 'Lớp 12A1' },
                { code: 'HS12A1-03', name: 'Lê Hoàng Nam', pass: '123', tag: 'Lớp 12A1' },
              ].map((st) => (
                <button
                  key={st.code}
                  type="button"
                  onClick={() => handleQuickStudentSelect(st.code, st.pass)}
                  disabled={isLoading}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 text-left flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {st.code}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{st.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <span>{st.tag}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-center text-slate-500 pt-1">
            Nếu Thầy/Cô chưa cấp mật khẩu, các em hãy liên hệ trực tiếp Thầy/Cô bộ môn Toán.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLoginModal;
