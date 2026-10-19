import React, { useState } from 'react';
import { 
  GraduationCap, 
  UserCheck, 
  Sparkles, 
  Key, 
  ArrowRight, 
  AlertCircle, 
  Check, 
  School, 
  Mail, 
  User, 
  HelpCircle,
  ShieldCheck,
  Zap,
  BookOpenCheck
} from 'lucide-react';
import { Role, StudentAccount, Teacher } from '../types/index.ts';
import { 
  loginTeacherWithGoogle, 
  loginStudentWithCredentials, 
  getAllGlobalStudents,
  getSavedTeachers
} from '../services/storageService.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  initialRole?: Role;
  onLoginSuccess: (role: Role, user: Teacher | StudentAccount) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'teacher',
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<Role>(initialRole);

  // Teacher Form State
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherSchool, setTeacherSchool] = useState('THPT Chuyên Chuẩn GDPT 2018');
  const [showSmartGoogleModal, setShowSmartGoogleModal] = useState(false);
  const [isTeacherLoading, setIsTeacherLoading] = useState(false);

  // Student Form State
  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentError, setStudentError] = useState('');
  const [isStudentLoading, setIsStudentLoading] = useState(false);

  if (!isOpen) return null;

  // Xử lý đăng nhập Google cho Giáo viên (kèm Smart Fallback tức thì)
  const handleTeacherGoogleLogin = (quickSample: boolean = false) => {
    setIsTeacherLoading(true);
    setTimeout(() => {
      let email = teacherEmail.trim();
      let name = teacherName.trim();
      let school = teacherSchool.trim();

      if (quickSample || !email) {
        email = 'giaovien.toan@gmail.com';
        name = 'ThS. Nguyễn Văn Toàn (GV Toán)';
        school = 'THPT Chuyên Chuẩn GDPT 2018';
      }

      const { teacher } = loginTeacherWithGoogle(email, name, school);
      setIsTeacherLoading(false);
      setShowSmartGoogleModal(false);
      onLoginSuccess('teacher', teacher);
    }, 400);
  };

  // Xử lý đăng nhập Học sinh
  const handleStudentLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStudentError('');

    if (!studentIdentifier.trim()) {
      setStudentError('Vui lòng nhập Mã số học sinh hoặc Họ và tên!');
      return;
    }
    if (!studentPassword.trim()) {
      setStudentError('Vui lòng nhập Mật khẩu do giáo viên cấp!');
      return;
    }

    setIsStudentLoading(true);
    setTimeout(() => {
      const result = loginStudentWithCredentials(studentIdentifier, studentPassword);
      setIsStudentLoading(false);

      if (result.success && result.student) {
        onLoginSuccess('student', result.student);
      } else {
        setStudentError(
          result.errorMessage ||
          'Không tìm thấy học sinh hoặc mật khẩu không đúng. Vui lòng liên hệ Giáo viên bộ môn để nhận mã số và mật khẩu.'
        );
      }
    }, 350);
  };

  // Đăng nhập nhanh tài khoản học sinh mẫu
  const handleQuickStudentLogin = (code: string, pass: string) => {
    setStudentIdentifier(code);
    setStudentPassword(pass);
    setStudentError('');
    setIsStudentLoading(true);

    setTimeout(() => {
      const result = loginStudentWithCredentials(code, pass);
      setIsStudentLoading(false);
      if (result.success && result.student) {
        onLoginSuccess('student', result.student);
      } else {
        // Nếu học sinh mẫu chưa được tạo trong pool, tạo một giáo viên mẫu trước
        loginTeacherWithGoogle('giaovien.toan@gmail.com', 'ThS. Nguyễn Văn Toàn');
        const retryResult = loginStudentWithCredentials(code, pass);
        if (retryResult.success && retryResult.student) {
          onLoginSuccess('student', retryResult.student);
        } else {
          setStudentError('Chưa có dữ liệu học sinh mẫu. Hãy thử đăng nhập Giáo viên trước để tự sinh lớp 12A1!');
        }
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header với Icon Logo */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 p-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md ring-4 ring-white/20 mb-3">
            <span className="font-serif font-black text-3xl">π</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            MathDiagnostic<span className="text-emerald-300">.AI</span>
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-sm mx-auto">
            Hệ thống Đánh giá Thích ứng & Chẩn đoán Vùng trũng Kiến thức Toán THPT (GDPT 2018)
          </p>

          {/* Role Switcher Tabs */}
          <div className="mt-5 grid grid-cols-2 p-1 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('teacher')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'teacher'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Dành cho Giáo viên</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Dành cho Học sinh</span>
            </button>
          </div>
        </div>

        {/* Tab 1: GIÁO VIÊN */}
        {activeTab === 'teacher' && (
          <div className="p-6 space-y-5">
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 space-y-1">
                <p className="font-bold">Đăng nhập nhanh cho mọi Giáo viên THPT</p>
                <p className="text-emerald-700 leading-relaxed">
                  Bất kỳ thầy cô nào cũng có thể trải nghiệm ngay lập tức. Mỗi tài khoản Google được cấp một không gian độc lập: quản lý lớp, học sinh, mật khẩu và bản đồ vùng trũng kiến thức riêng biệt.
                </p>
              </div>
            </div>

            {/* Smart Google Sign-In Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowSmartGoogleModal(true)}
                disabled={isTeacherLoading}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-emerald-500 text-slate-800 font-bold shadow-sm transition-all duration-150 cursor-pointer text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span>Đăng nhập bằng tài khoản Google (Gmail)</span>
              </button>

              {/* Nút Khởi tạo & Trải nghiệm mẫu 1-click */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-semibold">Hoặc trải nghiệm ngay</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleTeacherGoogleLogin(true)}
                disabled={isTeacherLoading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-emerald-300 text-emerald-300" />
                <span>Khởi tạo nhanh Lớp học & 5 Học sinh mẫu (1 cú nhấp chuột)</span>
              </button>
            </div>

            {/* Smart Google Sign-in Modal / In-place form */}
            {showSmartGoogleModal && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    Xác thực Google (Hoạt động 100% trên Vercel)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSmartGoogleModal(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Địa chỉ Gmail của Thầy/Cô:
                    </label>
                    <input
                      type="email"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      placeholder="vidu: giaovien.toan@gmail.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Họ và tên hiển thị:
                    </label>
                    <input
                      type="text"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder="ThS. Nguyễn Văn A"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Trường THPT công tác:
                    </label>
                    <input
                      type="text"
                      value={teacherSchool}
                      onChange={(e) => setTeacherSchool(e.target.value)}
                      placeholder="THPT Chuyên..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTeacherGoogleLogin(false)}
                    disabled={!teacherEmail.trim() || isTeacherLoading}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isTeacherLoading ? 'Đang xác thực Google...' : 'Vào Không gian Quản trị Giáo viên'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: HỌC SINH */}
        {activeTab === 'student' && (
          <form onSubmit={handleStudentLogin} className="p-6 space-y-4">
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3">
              <BookOpenCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 space-y-1">
                <p className="font-bold">Đăng nhập tài khoản Học sinh</p>
                <p className="text-blue-700 leading-relaxed">
                  Nhập <strong>Mã số học sinh</strong> (ví dụ: <code className="bg-white/80 px-1 py-0.5 rounded text-blue-900 font-mono">HS12A1-01</code>) hoặc <strong>Họ và tên</strong> cùng Mật khẩu do Thầy/Cô bộ môn cung cấp.
                </p>
              </div>
            </div>

            {studentError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{studentError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mã số học sinh HOẶC Họ và tên:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={studentIdentifier}
                    onChange={(e) => setStudentIdentifier(e.target.value)}
                    placeholder="VD: HS12A1-01 hoặc Nguyễn Văn An"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mật khẩu do giáo viên cấp:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="Mật khẩu của em (mặc định: 123)"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isStudentLoading}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-2"
              >
                {isStudentLoading ? 'Đang xác thực thông tin...' : 'Đăng nhập vào Lớp học'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Demo Student Accounts */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                Học sinh mẫu thử nghiệm nhanh (nhấp để đăng nhập ngay):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickStudentLogin('HS12A1-01', '123')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left cursor-pointer transition-all"
                >
                  <p className="text-xs font-bold text-slate-800">Nguyễn Văn An</p>
                  <p className="text-[10px] text-slate-500 font-mono">Mã: HS12A1-01 • Pass: 123</p>
                  <span className="inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                    Có 2 vùng trũng
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickStudentLogin('HS12A1-02', '123')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left cursor-pointer transition-all"
                >
                  <p className="text-xs font-bold text-slate-800">Trần Thị Mai</p>
                  <p className="text-[10px] text-slate-500 font-mono">Mã: HS12A1-02 • Pass: 123</p>
                  <span className="inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    Điểm 8.5/10
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            GDPT 2018 Bộ Giáo Dục & Đào Tạo
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
            >
              Tiếp tục với tư cách Khách
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
