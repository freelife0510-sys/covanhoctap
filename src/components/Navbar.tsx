import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown, 
  Home, 
  ArrowRight
} from 'lucide-react';

interface NavbarProps {
  currentRole: Role;
  currentView: 'landing' | 'student' | 'teacher';
  onNavigate: (view: 'landing' | 'student' | 'teacher') => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  authSession?: AuthSession;
  onLogout?: () => void;
  onOpenTeacherLogin?: () => void;
  onOpenStudentLogin?: () => void;
  onOpenAccountInfo?: () => void;
  teacherUser?: Teacher | null;
  studentUser?: StudentAccount | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentView,
  onNavigate,
  apiKey,
  onSaveApiKey,
  authSession,
  onLogout,
  onOpenTeacherLogin,
  onOpenStudentLogin,
  onOpenAccountInfo,
  teacherUser,
  studentUser,
}) => {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState(apiKey);
  const [showPedagogyModal, setShowPedagogyModal] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  // Dropdown states
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const loginDropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi nhấp ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target as Node)) {
        setShowLoginDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
  const isLanding = currentView === 'landing';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 shrink-0 cursor-pointer group"
            title="Nhấp để về Trang bìa"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-800 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform">
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
                Cố Vấn Học Tập & Chẩn Đoán Vùng Trũng Toán THPT
              </p>
            </div>
          </div>

          {/* ========================================================= */}
          {/* PHẦN GIỮA:                                                */}
          {/* - CHƯA ĐĂNG NHẬP: Hiển thị Chế độ Giáo viên & Học sinh để  */}
          {/*   lựa chọn đăng nhập.                                     */}
          {/* - ĐÃ ĐĂNG NHẬP RỒI: Ẩn hoàn toàn, không hiển thị nữa.     */}
          {/* ========================================================= */}
          {!authSession?.isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={onOpenStudentLogin}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Đăng nhập Chế độ Học sinh"
              >
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Chế độ Học sinh</span>
              </button>
              <button
                onClick={onOpenTeacherLogin}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Đăng nhập Chế độ Giáo viên"
              >
                <UserCheck className="w-4 h-4 text-teal-600" />
                <span>Chế độ Giáo viên</span>
              </button>
            </div>
          ) : (
            /* Khi đã đăng nhập rồi: Chỉ hiển thị tên không gian làm việc hiện tại, KHÔNG hiển thị 2 chế độ nữa */
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                currentRole === 'teacher'
                  ? 'bg-teal-50 text-teal-900 border-teal-200'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-200'
              }`}>
                {currentRole === 'teacher' ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Không Gian Quản Trị Giáo Viên</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Không Gian Học Sinh & Cố Vấn AI</span>
                  </>
                )}
              </span>
            </div>
          )}

          {/* ========================================================= */}
          {/* PHẦN PHẢI: NÚT ĐĂNG NHẬP / MENU TÊN TÀI KHOẢN KÈM MŨI TÊN */}
          {/* ========================================================= */}
          <div className="flex items-center gap-2">
            
            {/* 1. Nút "Đăng nhập" (với dropdown chọn GV hoặc HS) khi chưa đăng nhập hoặc đang ở Trang bìa */}
            {(!authSession?.isAuthenticated || isLanding) && (
              <div className="relative" ref={loginDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  title="Bấm để chọn Đăng nhập Chế độ Giáo viên hoặc Chế độ Học sinh"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đăng nhập</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showLoginDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu Đăng nhập */}
                {showLoginDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Chọn đối tượng đăng nhập
                    </div>

                    {/* Chế độ Giáo viên */}
                    <button
                      onClick={() => {
                        setShowLoginDropdown(false);
                        if (onOpenTeacherLogin) onOpenTeacherLogin();
                      }}
                      className="w-full px-3.5 py-2.5 text-left flex items-start gap-3 hover:bg-teal-50/70 transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block group-hover:text-teal-800">
                          Chế độ Giáo viên
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Đăng nhập 1-Click bằng Google (Gmail)
                        </span>
                      </div>
                    </button>

                    {/* Chế độ Học sinh */}
                    <button
                      onClick={() => {
                        setShowLoginDropdown(false);
                        if (onOpenStudentLogin) onOpenStudentLogin();
                      }}
                      className="w-full px-3.5 py-2.5 text-left flex items-start gap-3 hover:bg-emerald-50/70 transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-800">
                          Chế độ Học sinh
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Nhập Mã số / Họ tên + Mật khẩu
                        </span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 2. Menu Tên tài khoản kèm Mũi tên (CHỈ HIỂN THỊ KHI ĐÃ ĐĂNG NHẬP THÀNH CÔNG) */}
            {authSession?.isAuthenticated && (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  title="Bấm vào mũi tên để xem Thông tin tài khoản hoặc Đăng xuất"
                >
                  {/* User Avatar */}
                  <div className={`w-6 h-6 rounded-lg text-white flex items-center justify-center text-[11px] font-bold ${
                    currentRole === 'teacher' ? 'bg-teal-700' : 'bg-emerald-600'
                  }`}>
                    {currentRole === 'teacher'
                      ? (currentTeacher?.name ? currentTeacher.name.charAt(0).toUpperCase() : 'G')
                      : (currentStudent?.name ? currentStudent.name.charAt(0).toUpperCase() : 'H')}
                  </div>

                  {/* User Name */}
                  <span className="max-w-[110px] sm:max-w-[150px] truncate font-bold">
                    {currentRole === 'teacher'
                      ? (currentTeacher?.name || 'Giáo viên')
                      : (currentStudent?.name || 'Học sinh')}
                  </span>

                  {/* Mũi tên (ChevronDown) */}
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu bên cạnh Tên tài khoản */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* Account Header info */}
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
                        {currentRole === 'teacher' ? '👨‍🏫 Quản trị Giáo viên' : '🎓 Học sinh THPT'}
                      </span>
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {currentRole === 'teacher'
                          ? (currentTeacher?.name || 'Giáo viên Bộ môn')
                          : (currentStudent?.name || 'Học sinh')}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono block truncate">
                        {currentRole === 'teacher'
                          ? (currentTeacher?.email || 'giaovien@gmail.com')
                          : (currentStudent?.id ? `Mã HS: ${currentStudent.id}` : 'Học sinh')}
                      </span>
                    </div>

                    {/* Mục 1: Thông tin tài khoản */}
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        if (onOpenAccountInfo) onOpenAccountInfo();
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>Thông tin tài khoản</span>
                    </button>

                    {/* Divider */}
                    <div className="my-1 border-t border-slate-100"></div>

                    {/* Mục 2: ĐĂNG XUẤT (Về ngay nội dung trang bìa) */}
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
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
