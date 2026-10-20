import React, { useState } from 'react';
import { 
  Role,
  AuthSession,
  Teacher,
  StudentAccount
} from '../types/index.ts';
import { 
  GraduationCap, 
  UserCheck, 
  Key, 
  Check, 
  HelpCircle, 
  X, 
  ShieldCheck, 
  Sparkles,
  BookOpenCheck,
  LogOut,
  User,
  LogIn,
  RotateCcw
} from 'lucide-react';

interface NavbarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  authSession?: AuthSession;
  onLogout?: () => void;
  onOpenTeacherLogin?: () => void;
  onOpenStudentLogin?: () => void;
  teacherUser?: Teacher | null;
  studentUser?: StudentAccount | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  apiKey,
  onSaveApiKey,
  authSession,
  onLogout,
  onOpenTeacherLogin,
  onOpenStudentLogin,
  teacherUser,
  studentUser,
}) => {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState(apiKey);
  const [showPedagogyModal, setShowPedagogyModal] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSaveKey = () => {
    onSaveApiKey(inputKey.trim());
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      setShowKeyModal(false);
    }, 1200);
  };

  const currentTeacher = teacherUser || authSession?.teacherUser;
  const currentStudent = studentUser || authSession?.studentUser;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-800 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/20">
              <span className="font-serif font-black text-lg">π</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base md:text-lg text-slate-900 tracking-tight">
                  MathDiagnostic<span className="text-emerald-600">.AI</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  GDPT 2018
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Hệ thống Đánh giá Thích ứng & Chẩn đoán Vùng trũng Kiến thức
              </p>
            </div>
          </div>

          {/* Central Role Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
            <button
              onClick={() => {
                onRoleChange('student');
                if (onOpenStudentLogin) onOpenStudentLogin();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentRole === 'student'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Chuyển sang Chế độ Học sinh & Mở đăng nhập Học sinh"
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Chế độ Học sinh</span>
              <span className="sm:hidden">Học sinh</span>
            </button>

            <button
              onClick={() => {
                onRoleChange('teacher');
                if (onOpenTeacherLogin) onOpenTeacherLogin();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentRole === 'teacher'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Chuyển sang Chế độ Giáo viên & Mở đăng nhập Google"
            >
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span className="hidden sm:inline">Chế độ Giáo viên</span>
              <span className="sm:hidden">Giáo viên</span>
            </button>
          </div>

          {/* Right Action Icons & Role-specific Login State */}
          <div className="flex items-center gap-2">
            
            {/* Chế độ Giáo viên: Nút Đăng nhập Google & Trạng thái */}
            {currentRole === 'teacher' && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenTeacherLogin}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  title="Đăng nhập hoặc đổi tài khoản Google của Giáo viên"
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
                  <span className="hidden lg:inline">
                    {currentTeacher?.email && currentTeacher.email !== 'giaovien@gmail.com'
                      ? currentTeacher.email
                      : 'Đăng nhập Google'}
                  </span>
                  <span className="lg:hidden">Google</span>
                </button>
              </div>
            )}

            {/* Chế độ Học sinh: Nút Đăng nhập Học sinh & Trạng thái */}
            {currentRole === 'student' && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenStudentLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-800 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  title="Đăng nhập tài khoản Học sinh (Mã HS hoặc Họ tên + Mật khẩu)"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden lg:inline">
                    {currentStudent?.name ? `HS: ${currentStudent.name}` : 'Đăng nhập Học sinh'}
                  </span>
                  <span className="lg:hidden">Đăng nhập HS</span>
                </button>
              </div>
            )}

            {/* Socratic Pedagogy Guide */}
            <button
              onClick={() => setShowPedagogyModal(true)}
              title="Tìm hiểu phương pháp Vấn đáp Socratic"
              className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Gemini API Key */}
            <button
              onClick={() => setShowKeyModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xl:inline">
                {apiKey ? 'Gemini Active' : 'Cấu hình AI'}
              </span>
            </button>

            {/* Logout button */}
            {onLogout && (
              <button
                onClick={onLogout}
                title="Đăng xuất"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Gemini API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-amber-50 text-amber-600">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Cấu hình Google Gemini AI</h3>
                  <p className="text-[11px] text-slate-500">Multimodal Vision & Phân tích Sư phạm</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Nhập Gemini API Key từ <strong>Google AI Studio</strong> để kích hoạt phân tích ảnh bài giải và thị giác máy tính:
              </p>

              <div>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {savedMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Đã lưu API Key vào trình duyệt!
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={handleSaveKey}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Lưu cấu hình
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pedagogy Explanation Modal */}
      {showPedagogyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Phương pháp Vấn đáp Socratic</h3>
                  <p className="text-[11px] text-slate-500">Khung Đánh giá Năng lực Toán GDPT 2018</p>
                </div>
              </div>
              <button
                onClick={() => setShowPedagogyModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <p>
                Khác với các ứng dụng giải toán thông thường chỉ đưa ra đáp án cuối cùng, <strong>MathDiagnostic AI</strong> ứng dụng nguyên lý sư phạm của <strong>Socrates</strong> kết hợp khung đánh giá năng lực tư duy toán học:
              </p>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <BookOpenCheck className="w-4 h-4 text-emerald-600" />
                  Quy trình Chẩn đoán & Can thiệp Vùng trũng:
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                  <li>
                    <strong>Bước 1 - Phát hiện mắt xích đứt gãy:</strong> Nhận diện chính xác bước giải sai (chưa đặt điều kiện, biến đổi đại số sai dấu...).
                  </li>
                  <li>
                    <strong>Bước 2 - Câu hỏi Socratic gợi mở:</strong> Đặt câu hỏi truy hồi tư duy để học sinh tự nhận ra lỗ hổng mà không cảm thấy nản lòng.
                  </li>
                  <li>
                    <strong>Bước 3 - Bù đắp kiến thức cốt lõi:</strong> Hệ thống hóa công thức và định lý cần dùng.
                  </li>
                  <li>
                    <strong>Bước 4 - Luyện tập tương đương & nâng cao:</strong> Giao bài tập cùng dạng để học sinh khắc sâu phản xạ.
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowPedagogyModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-black"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
