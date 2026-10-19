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
  LogIn
} from 'lucide-react';

interface NavbarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  authSession?: AuthSession;
  onLogout?: () => void;
  onOpenLoginModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  apiKey,
  onSaveApiKey,
  authSession,
  onLogout,
  onOpenLoginModal,
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

  const currentUser = currentRole === 'teacher' ? authSession?.teacherUser : authSession?.studentUser;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
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
              onClick={() => onRoleChange('student')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentRole === 'student'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Chế độ Học sinh</span>
              <span className="sm:hidden">Học sinh</span>
            </button>

            <button
              onClick={() => onRoleChange('teacher')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentRole === 'teacher'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span className="hidden sm:inline">Chế độ Giáo viên</span>
              <span className="sm:hidden">Giáo viên</span>
            </button>
          </div>

          {/* Right Action Icons & User Identity */}
          <div className="flex items-center gap-2">
            
            {/* User Profile / Login status */}
            {authSession?.isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-800 line-clamp-1 leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {currentRole === 'teacher'
                      ? (currentUser as Teacher).email
                      : `${(currentUser as StudentAccount).id} • ${(currentUser as StudentAccount).className || 'Lớp'}`}
                  </p>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="Đổi tài khoản hoặc Đăng xuất"
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              onOpenLoginModal && (
                <button
                  onClick={onOpenLoginModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng nhập</span>
                </button>
              )
            )}

            {/* Socratic Pedagogy Guide */}
            <button
              onClick={() => setShowPedagogyModal(true)}
              title="Tìm hiểu phương pháp Socratic"
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
                {apiKey ? 'Gemini 2.5 Active' : 'Cấu hình AI'}
              </span>
            </button>
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

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Nhập <strong>Google Gemini API Key</strong> để sử dụng mô hình <code>gemini-2.5-flash</code> trực tiếp phân tích chữ viết tay và bài làm. Nếu để trống, hệ thống sẽ tự động dùng <strong>Bộ quy tắc Sư phạm THPT GDPT 2018 (Mock Fallback Engine)</strong> hoạt động mượt mà ngay lập tức.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Lưu an toàn trên trình duyệt
                </span>
                {savedMessage && (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Đã lưu thành công!
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
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
