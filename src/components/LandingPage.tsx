import React from 'react';
import { 
  GraduationCap, 
  UserCheck, 
  User,
  School,
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  TrendingUp, 
  Bot, 
  BookOpen, 
  Compass, 
  HeartHandshake, 
  BrainCircuit, 
  ShieldCheck, 
  Clock, 
  Check, 
  Award, 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquareQuote,
  Target,
  Flame,
  Activity,
  Smile,
  Zap,
  HelpCircle
} from 'lucide-react';
import { Role } from '../types/index.ts';

interface LandingPageProps {
  onGoToStudent: () => void;
  onGoToTeacher: () => void;
  onOpenStudentLogin: () => void;
  onOpenTeacherLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToStudent,
  onGoToTeacher,
  onOpenStudentLogin,
  onOpenTeacherLogin,
}) => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-12 animate-in fade-in duration-300">
      
      {/* ==================================================== */}
      {/* 1. HERO SECTION                                     */}
      {/* ==================================================== */}
      <section className="text-center pt-4 sm:pt-10 max-w-4xl mx-auto px-4">
        
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm font-bold shadow-2xs mb-6 hover:bg-emerald-100/70 transition-colors">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Nền Tảng Cố Vấn 4 lựa chọn Cá Nhân Hóa Dành Riêng Cho Học Sinh</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.18] sm:leading-[1.15]">
          Định Hướng Tương Lai, <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600">
            Khơi Mở Tiềm Năng
          </span>{' '}
          Cùng Cố Vấn Đồng Hành
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Hệ thống hỗ trợ học tập thông minh giúp bạn khám phá thế mạnh của bản thân, xây dựng lộ trình học tập tối ưu, vượt qua áp lực học đường và tự tin chinh phục mục tiêu mơ ước.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
          <button
            onClick={onOpenStudentLogin}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 hover:from-emerald-700 hover:to-black text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-700/25 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Đăng nhập vào hệ thống</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onGoToStudent}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 font-bold text-sm sm:text-base shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Trải nghiệm thử không cần tài khoản</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto">
          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200 shadow-2xs flex items-center gap-3 text-left">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">10 – 11 – 12</div>
              <div className="text-xs text-slate-500 font-medium">Chương trình Toán THPT GDPT 2018</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200 shadow-2xs flex items-center gap-3 text-left">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">24 Chương</div>
              <div className="text-xs text-slate-500 font-medium">Ngân hàng lý thuyết & bài tập chuẩn</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200 shadow-2xs flex items-center gap-3 text-left">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">3 Dạng thức</div>
              <div className="text-xs text-slate-500 font-medium">Trắc nghiệm • Đúng/Sai • Trả lời ngắn</div>
            </div>
          </div>
        </div>
      </section>


      {/* ==================================================== */}
      {/* 2. CHỌN CHẾ ĐỘ TRUY CẬP CỦA BẠN                      */}
      {/* ==================================================== */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
            Không Gian Làm Việc Tương Tác
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2">
            Chọn Chế Độ Truy Cập Của Bạn
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Trải nghiệm bảng điều khiển được cá nhân hóa theo từng vai trò
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Card 1: Dành cho Học sinh */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-200 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Dành cho Học sinh
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Khối 10 - 11 - 12 (GDPT)
                </span>
              </div>

              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Chế Độ Học Sinh
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Tự khám phá lộ trình học tập, giải tỏa những vướng mắc học đường, hoàn thành nhiệm vụ hàng ngày và kết nối với sự hỗ trợ từ thầy cô và nền tảng thông minh.
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 mb-6">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span>Hoạt động gợi ý hôm nay:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Làm bài tập chẩn đoán</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                    <Bot className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Hỏi Cố vấn AI 24/7</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="flex -space-x-1.5 overflow-hidden">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white">A</div>
                  <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white">M</div>
                  <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white">N</div>
                </div>
                <span>Không gian học Toán THPT</span>
              </div>

              <button
                onClick={onGoToStudent}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span>Vào không gian Học sinh</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Dành cho Thầy cô / Cố vấn */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 hover:border-teal-400 hover:shadow-xl transition-all duration-200 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                  Dành cho Giáo viên & Cố vấn
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  Cổng Quản Trị Học Đường
                </span>
              </div>

              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Chế Độ Thầy Cô / Cố Vấn
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Bảng quản trị toàn diện giúp theo dõi trực quan, quản lý lớp học toán năm cấp, ghi nhận học sinh và tiếp cận kịp thời các bài toán học sinh đang bị hổng kiến thức.
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 mb-6">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  <span>Bảng quản trị học sinh tuần này:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">Quản lý lớp & cấp mã học sinh</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">Bản đồ Vùng trũng Toán</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Đã đồng bộ dữ liệu lớp học GDPT 2018
              </div>

              <button
                onClick={onGoToTeacher}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span>Đăng nhập bằng Google (Giáo viên)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>


      {/* ==================================================== */}
      {/* 3. TẠI SAO HỌC SINH CẦN CỐ VẤN HỌC TẬP ĐỒNG HÀNH    */}
      {/* ==================================================== */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
            Giá Trị Cốt Lõi Dành Cho Bạn
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2">
            Tại Sao Học Sinh Cần Một Cố Vấn Học Tập Đồng Hành?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Cố vấn không chỉ là người sửa lỗi hay nhắc nhở nộp bài, mà là người dẫn dắt tư duy, thấu cảm tâm lý và bảo đảm mọi tiềm năng của bạn không bị bỏ quên.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Pillar 1 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-1">
              Khám Phá Nội Tại
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Thấu hiểu bản thân & Định vị thế mạnh
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Không còn mông lung trong việc chọn khối thi hay định hướng tương lai. Bộ công cụ phân tích tâm lý & năng lực toán học giúp bạn tự tin lựa chọn ngách học đúng đắn.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-1">
              Lộ Trình Thích Ứng
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Cá nhân hóa lộ trình & bù đắp vùng trũng
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mỗi học sinh là một cá tính riêng biệt với nhịp độ tiếp thu khác nhau. Cố vấn giúp phân bổ thời gian biểu thông minh, giảm áp lực học tập và tối ưu hóa thời gian tự học.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600 mb-1">
              Sức Khỏe Tinh Thần
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Điểm tựa tâm lý & Động lực bền bỉ
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Chia sẻ những khó khăn, bế tắc học đường trong không gian lắng nghe an toàn và kín đáo. Nhận lời khuyên chân thành, giải tỏa căng thẳng và nguồn năng lượng tích cực.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-1">
              Kết Nối Đa Chiều
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Cầu nối gắn kết Thầy cô - Trò
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Giúp nhà trường và giáo viên nắm bắt kịp thời tâm tư, nguyện vọng và vấn đề học tập để hỗ trợ đúng lúc, đúng chỗ — không để bất kỳ học sinh nào cảm thấy bị cô độc.
            </p>
          </div>

        </div>
      </section>


      {/* ==================================================== */}
      {/* 4. BỘ CÔNG CỤ TIẾP LỬA CHO HỌC SINH MỖI NGÀY         */}
      {/* ==================================================== */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
              Học Tập Từng Ngày Bứt Phá
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2">
              Bộ Công Cụ Tiếp Lửa Cho Học Sinh Mỗi Ngày
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            Biến việc học trở thành một cuộc phiêu lưu thú vị với mục tiêu rõ ràng, từng thói quen tích cực và trợ lý AI thông minh luôn túc trực.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Cột trái: Nhiệm vụ & Bánh xe cuộc sống (5 cột) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Nhiệm vụ học tập */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 text-sm">Nhiệm Vụ Học Tập & Bảng Vinh Danh</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Chuỗi 7 ngày liên tiếp
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block">Ôn tập 20 câu Vùng Trọng Tâm Chuyên đề</span>
                      <span className="text-[10px] text-slate-500">Toán Giải tích 12 • 25 phút</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-700">Đã thẩm định</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block">30 phút Deep Work: Giải đề Toán Chuyên</span>
                      <span className="text-[10px] text-slate-500">Khảo sát hàm số & logarit</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500">Chưa bắt đầu</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs">
                    <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block">Làm thử bài kiểm tra tâm lý định kỳ tuần</span>
                      <span className="text-[10px] text-slate-500">Bộ 10 câu hỏi Socratic • 5 phút</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500">Còn 2 ngày</span>
                </div>
              </div>
            </div>

            {/* Bánh xe cân bằng cuộc sống học sinh */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Bánh Xe Cân Bằng Cuộc Sống Học Sinh
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                Một học sinh xuất sắc là một bạn trẻ biết hài hòa giữa việc học, rèn luyện thể chất, nuôi dưỡng đam mê và nghỉ ngơi phục hồi.
              </p>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="text-base font-black text-blue-600">MC</div>
                  <div className="text-[10px] font-semibold text-slate-600 mt-0.5">Học Tập</div>
                </div>
                <div className="p-2 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="text-base font-black text-emerald-600">Đ/S</div>
                  <div className="text-[10px] font-semibold text-slate-600 mt-0.5">4 mệnh đề</div>
                </div>
                <div className="p-2 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="text-base font-black text-amber-600">TLN</div>
                  <div className="text-[10px] font-semibold text-slate-600 mt-0.5">Điền đáp số</div>
                </div>
                <div className="p-2 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="text-base font-black text-purple-600">A4</div>
                  <div className="text-[10px] font-semibold text-slate-600 mt-0.5">Xuất DOCX</div>
                </div>
              </div>
            </div>

          </div>

          {/* Cột phải: Khung mô phỏng Cố Vấn Đồng Hành AI 24/7 (7 cột) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col justify-between h-full min-h-[460px]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold shadow-xs">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      Cố Vấn Đồng Hành AI 24/7
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Sẵn sàng phản hồi mọi thắc mắc học tập</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  Chế độ Vấn đáp Socratic
                </span>
              </div>

              {/* Chat Dialogue Preview */}
              <div className="space-y-3 text-xs">
                {/* Học sinh hỏi */}
                <div className="flex items-start gap-2.5 justify-end">
                  <div className="bg-emerald-600 text-white p-3.5 rounded-2xl rounded-tr-none max-w-sm shadow-xs leading-relaxed">
                    {"Thầy ơi em vẫn bị lúng túng khi đặt điều kiện vế phải của phương trình vô tỉ $\\sqrt{A} = B$, em hay quên điều kiện $B \\ge 0$ dẫn đến ra nghiệm ngoại lai ạ..."}
                  </div>
                </div>

                {/* AI trả lời */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shrink-0 text-xs">
                    π
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl rounded-tl-none max-w-md text-slate-800 space-y-2 leading-relaxed">
                    <p>
                      Đừng lo nhé! Đây là lỗi sai rất phổ biến khi mới học Toán 12. Thầy lưu ý em một mẹo ghi nhớ tự nhiên:
                    </p>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] text-emerald-800">
                      {'\\sqrt{A} = B \\Leftrightarrow \\begin{cases} B \\ge 0 \\\\ A = B^2 \\end{cases}'}
                    </div>
                    <p>
                      Bởi vì vế trái mang căn bậc chẵn luôn không âm, nên vế phải $B$ cũng bắt buộc phải không âm trước khi được phép bình phương hai vế!
                    </p>
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Đã phát hiện vùng trũng: Thiếu ĐK xác định
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                        Gợi ý 2 bài tương đương
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input simulator */}
            <div className="pt-4 border-t border-slate-100 mt-6">
              <div 
                onClick={onGoToStudent}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-400 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all"
              >
                <span>Nhập câu hỏi hoặc tải ảnh bài tập lên để cố vấn AI hỗ trợ bạn...</span>
                <button className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1">
                  <span>Trải nghiệm ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ==================================================== */}
      {/* 5. QUOTE SECTION (THẦY HỒ SỸ LONG)                   */}
      {/* ==================================================== */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <MessageSquareQuote className="w-40 h-40 text-white" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="text-emerald-400 font-serif text-5xl mb-2 leading-none">“</div>
            <p className="text-base sm:text-xl md:text-2xl font-bold leading-relaxed tracking-tight text-emerald-50">
              Mỗi học sinh đều mang trong mình một ngọn lửa riêng. Nhiệm vụ của người cố vấn không phải là ép các em vào cùng một khuôn mẫu, mà là trao chiếc la bàn để các em tự tin vẽ nên hải trình của chính mình.
            </p>

            <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-400 flex items-center justify-center font-bold text-slate-950 text-base shadow-sm ring-2 ring-white/20">
                L
              </div>
              <div>
                <h4 className="font-bold text-white text-base">
                  Thầy Hồ Sỹ Long
                </h4>
                <p className="text-xs text-emerald-300 font-medium">
                  Cố vấn Học tập & Giáo viên Toán THPT • Hotline/Zalo: 0943278804
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ==================================================== */}
      {/* 6. CALL TO ACTION BANNER                             */}
      {/* ==================================================== */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-emerald-100 shadow-lg shadow-emerald-600/5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
            Khởi Đầu Bứt Phá Năng Lượng Tương Lai
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3">
            Bắt đầu hành trình bứt phá cùng Cố Vấn Học Tập ngay hôm nay!
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mt-2 leading-relaxed">
            Dù bạn đang tìm kiếm phương pháp học tập hiệu quả hay thầy cô mong muốn sát cánh cùng học sinh, hệ thống luôn sẵn sàng đồng hành.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenStudentLogin}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Tôi là Học sinh</span>
            </button>

            <button
              onClick={onOpenTeacherLogin}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Giáo viên · Đăng nhập bằng Google</span>
            </button>
          </div>
        </div>
      </section>


      {/* ==================================================== */}
      {/* 7. FOOTER                                            */}
      {/* ==================================================== */}
      <footer className="border-t border-slate-200/80 pt-12 text-slate-600 text-xs">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8 pb-10">
          
          {/* Logo & Description */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-700 flex items-center justify-center text-white font-serif font-black text-base shadow-sm">
                π
              </div>
              <span className="font-bold text-base text-slate-900 tracking-tight">
                MathDiagnostic<span className="text-emerald-600">.AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Nền tảng Cố vấn Học Đường cá nhân hóa thông minh, đồng hành cùng học sinh THPT Việt Nam trên hành trình khai phá tiềm năng, định hướng phương pháp học tập chủ động và chẩn đoán vùng trũng kiến thức Toán GDPT 2018.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Khung Chuẩn Năng Lực Toán THPT • Bộ GD&ĐT</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
              Liên Kết Nhanh
            </h4>
            <ul className="space-y-1.5 text-slate-500">
              <li>
                <button onClick={onGoToStudent} className="hover:text-emerald-700 cursor-pointer">
                  Không gian Học sinh
                </button>
              </li>
              <li>
                <button onClick={onGoToTeacher} className="hover:text-emerald-700 cursor-pointer">
                  Cổng Quản trị Thầy Cô
                </button>
              </li>
              <li>
                <button onClick={onOpenStudentLogin} className="hover:text-emerald-700 cursor-pointer">
                  Đăng nhập Học sinh
                </button>
              </li>
              <li>
                <button onClick={onOpenTeacherLogin} className="hover:text-emerald-700 cursor-pointer">
                  Đăng nhập bằng Google (Giáo viên)
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="md:col-span-4 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
              Thông Tin Liên Hệ
            </h4>
            <div className="space-y-2 text-slate-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-800">Thầy Hồ Sỹ Long</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Số điện thoại / Zalo: <strong className="text-slate-900 font-mono">0943278804</strong></span>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <div>
            © 2026 MathDiagnostic AI • Cố vấn Học đường bản quyền thuộc về Thầy Hồ Sỹ Long.
          </div>
          <div className="flex items-center gap-4">
            <span>Điều khoản sử dụng</span>
            <span>•</span>
            <span>Chính sách quyền riêng tư</span>
            <span>•</span>
            <span>Tiêu chuẩn GDPT 2018</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
