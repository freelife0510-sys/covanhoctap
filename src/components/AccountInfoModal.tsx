import React from 'react';
import { 
  X, 
  User, 
  Mail, 
  School, 
  GraduationCap, 
  UserCheck, 
  ShieldCheck, 
  Calendar, 
  BookOpen, 
  Key,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { Role, Teacher, StudentAccount } from '../types/index.ts';

interface AccountInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  teacher?: Teacher | null;
  student?: StudentAccount | null;
}

export const AccountInfoModal: React.FC<AccountInfoModalProps> = ({
  isOpen,
  onClose,
  role,
  teacher,
  student,
}) => {
  if (!isOpen) return null;

  const isTeacher = role === 'teacher';

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
        <div className={`p-6 text-white text-center relative ${
          isTeacher 
            ? 'bg-gradient-to-br from-teal-700 via-emerald-800 to-slate-900' 
            : 'bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900'
        }`}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md ring-4 ring-white/20 mb-3 shadow-inner">
            {isTeacher ? (
              <UserCheck className="w-8 h-8 text-emerald-300" />
            ) : (
              <GraduationCap className="w-8 h-8 text-emerald-300" />
            )}
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">
            Thông Tin Tài Khoản
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            {isTeacher ? 'Tài khoản Quản trị Giáo viên / Cố vấn' : 'Tài khoản Học sinh THPT'}
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            
            {/* Họ và tên */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
              <span className="text-xs text-slate-500 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Họ và tên:
              </span>
              <span className="text-xs font-bold text-slate-900">
                {isTeacher ? (teacher?.name || 'Giáo viên Bộ môn') : (student?.name || 'Học sinh')}
              </span>
            </div>

            {/* Vai trò */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
              <span className="text-xs text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                Vai trò hệ thống:
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                {isTeacher ? 'Giáo viên & Cố vấn' : 'Học sinh'}
              </span>
            </div>

            {/* Email hoặc Mã Học sinh */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
              <span className="text-xs text-slate-500 flex items-center gap-2">
                {isTeacher ? <Mail className="w-3.5 h-3.5 text-slate-400" /> : <Key className="w-3.5 h-3.5 text-slate-400" />}
                {isTeacher ? 'Email Google:' : 'Mã số học sinh:'}
              </span>
              <span className="text-xs font-mono font-bold text-slate-800">
                {isTeacher ? (teacher?.email || 'giaovien@gmail.com') : (student?.id || student?.studentCode || 'HS12A1-01')}
              </span>
            </div>

            {/* Lớp học hoặc Trường */}
            {!isTeacher && (
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
                <span className="text-xs text-slate-500 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  Lớp học:
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {student?.className || 'Lớp 12A1 (Toán THPT)'}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
              <span className="text-xs text-slate-500 flex items-center gap-2">
                <School className="w-3.5 h-3.5 text-slate-400" />
                Đơn vị trường:
              </span>
              <span className="text-xs font-medium text-slate-800">
                {isTeacher ? (teacher?.school || 'THPT Chuẩn GDPT 2018') : (student?.school || 'THPT Chuẩn GDPT 2018')}
              </span>
            </div>

            {/* Trạng thái xác thực */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Trạng thái hoạt động:
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Đang trực tuyến
              </span>
            </div>
          </div>

          {/* Khối Cố vấn & Liên hệ */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-emerald-900">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              Cố vấn phụ trách hệ thống:
            </p>
            <p className="text-emerald-800 leading-relaxed text-[11px]">
              Thầy Hồ Sỹ Long • Hotline / Zalo: <strong>0943278804</strong>
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Đóng thông tin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfoModal;
