import React, { useState, useMemo } from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Eye, 
  Sparkles, 
  School, 
  BookMarked, 
  Clock, 
  X,
  Flame,
  UserCheck,
  Edit3,
  Check
} from 'lucide-react';
import { MathSubmission, Teacher, ErrorCategory } from '../types/index.ts';
import A4DiagnosticSheet from './A4DiagnosticSheet.tsx';

interface TeacherDashboardProps {
  teacher: Teacher;
  onUpdateTeacher: (teacher: Teacher) => void;
  submissions: MathSubmission[];
  onUpdateNotes: (submissionId: string, notes: string[]) => void;
  onMarkResolved: (submissionId: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  onUpdateTeacher,
  submissions,
  onUpdateNotes,
  onMarkResolved,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    teacher.classList.length > 0 ? teacher.classList[0].id : 'class-12a1'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterResolved, setFilterResolved] = useState<string>('all');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Selected submission modal
  const [inspectingSubmission, setInspectingSubmission] = useState<MathSubmission | null>(null);

  // Filter submissions by class (or show all if class has matching entries or general test pool)
  const classSubmissions = useMemo(() => {
    return submissions.filter((s) => s.classId === selectedClassId || !s.classId);
  }, [submissions, selectedClassId]);

  // Compute KPI metrics
  const totalCount = classSubmissions.length;
  const correctCount = classSubmissions.filter((s) => s.isCorrect).length;
  const incorrectCount = totalCount - correctCount;
  const firstTimePassRate = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const resolvedCount = classSubmissions.filter((s) => s.hasResolvedMistake && !s.isCorrect).length;
  const resolvedRate = incorrectCount > 0 ? Math.round((resolvedCount / incorrectCount) * 100) : 0;

  // Breakdown of Error Categories
  const errorStats = useMemo(() => {
    const counts: Record<string, number> = {
      'Chưa đặt điều kiện xác định': 0,
      'Biến đổi đại số sai': 0,
      'Nhầm lẫn định lý/công thức': 0,
      'Thiếu nghiệm ngoại lai': 0,
      'Lập luận hình học sai': 0,
      'Khác': 0,
    };

    classSubmissions.forEach((s) => {
      if (!s.isCorrect && s.errorCategory) {
        counts[s.errorCategory] = (counts[s.errorCategory] || 0) + 1;
      }
    });

    const categories = Object.keys(counts) as ErrorCategory[];
    const result = categories.map((cat) => {
      const count = counts[cat];
      const pct = incorrectCount > 0 ? Math.round((count / incorrectCount) * 100) : 0;
      return { category: cat, count, percentage: pct };
    });

    return result.sort((a, b) => b.count - a.count);
  }, [classSubmissions, incorrectCount]);

  const topError = errorStats[0]?.count > 0 ? errorStats[0] : null;

  // Filtered submissions for the table
  const filteredSubmissions = useMemo(() => {
    return classSubmissions.filter((s) => {
      const matchSearch =
        s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.problemText.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        filterCategory === 'all' ||
        (filterCategory === 'correct' && s.isCorrect) ||
        s.errorCategory === filterCategory;

      const matchResolved =
        filterResolved === 'all' ||
        (filterResolved === 'resolved' && s.hasResolvedMistake) ||
        (filterResolved === 'pending' && !s.hasResolvedMistake && !s.isCorrect);

      return matchSearch && matchCategory && matchResolved;
    });
  }, [classSubmissions, searchQuery, filterCategory, filterResolved]);

  // AI Pedagogical Recommendation based on data
  const pedagogicalRecommendation = useMemo(() => {
    if (!topError || topError.count === 0) {
      return 'Lớp học đang có phong độ làm bài rất tốt. Giáo viên có thể tăng cường các bài toán vận dụng cao và liên hệ mô hình thực tế.';
    }

    if (topError.category === 'Chưa đặt điều kiện xác định') {
      return `Vùng trũng lớn nhất của lớp hiện là "${topError.category}" (chiếm ${topError.percentage}% tổng lỗi sai). Trong tiết học sắp tới, thầy/cô nên dành 15 phút đầu giờ thực hiện chuyên đề "Kỹ năng rà soát tập xác định & phép biến đổi tương đương", đặc biệt nhấn mạnh điều kiện vế phải của phương trình vô tỉ $\\sqrt{A} = B$ và cơ số/biểu thức logarit.`;
    }

    if (topError.category === 'Biến đổi đại số sai') {
      return `Có ${topError.count} bài học sinh gặp lỗi nhầm lẫn dấu trong biến đổi đại số & đạo hàm phân thức. Khuyến nghị tổ chức hoạt động truy vết lỗi sai chéo (peer-review) trên bảng để các em phát hiện quy tắc đổi dấu ngoặc âm.`;
    }

    return `Vùng trũng kiến thức trọng tâm là "${topError.category}". Cần củng cố bảng công thức chuẩn và giao thêm bài tập phân bậc nhận biết - thông hiểu trước khi sang vận dụng.`;
  }, [topError]);

  return (
    <div className="space-y-8">
      {/* Teacher Profile & Class Navigation Bar (Auto-fills when data exists or lets user input) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-13 h-13 rounded-2xl bg-teal-50 border-2 border-teal-500/40 flex items-center justify-center text-teal-700 shadow-xs shrink-0">
            <UserCheck className="w-7 h-7" />
          </div>

          <div className="space-y-1 flex-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Cổng Quản trị Sư phạm
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-slate-400" />
                {teacher.school ? teacher.school : '(Chưa cập nhật trường)'}
              </span>
            </div>

            {/* If Teacher profile is not set or in edit mode, provide input fields */}
            {(!teacher.name || isEditingProfile) ? (
              <div className="pt-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={teacher.name}
                    onChange={(e) => onUpdateTeacher({ ...teacher, name: e.target.value })}
                    placeholder="Họ và tên giáo viên (để trống nếu chưa có)..."
                    className="text-sm font-semibold px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50 min-w-[240px]"
                  />
                  <input
                    type="text"
                    value={teacher.school}
                    onChange={(e) => onUpdateTeacher({ ...teacher, school: e.target.value })}
                    placeholder="Tên trường THPT..."
                    className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50 min-w-[200px]"
                  />
                  {isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" /> Lưu
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Dữ liệu giáo viên sẽ tự động cập nhật khi có tài khoản đăng nhập hoặc thầy/cô có thể nhập tại đây.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold text-slate-900">
                  {teacher.name}
                </h1>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  title="Chỉnh sửa thông tin giáo viên"
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Class Selector */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-emerald-50/80 px-3.5 py-2.5 rounded-xl border border-emerald-200">
            <label htmlFor="class-select" className="text-xs font-bold text-emerald-900 whitespace-nowrap">Lớp theo dõi:</label>
            <select
              id="class-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="text-xs font-bold text-emerald-800 bg-transparent focus:outline-none cursor-pointer"
            >
              {teacher.classList.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.studentCount > 0 ? `Sĩ số: ${cls.studentCount}` : 'Tất cả học sinh'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total submissions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Bài nộp trong tuần</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalCount}</span>
            <span className="text-xs text-emerald-600 font-semibold">+18% so với tuần trước</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Đồng bộ tự động theo thời gian thực</p>
        </div>

        {/* Card 2: First-time pass rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Đúng ngay lần đầu</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{firstTimePassRate}%</span>
            <span className="text-xs text-slate-500">({correctCount}/{totalCount} bài)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${firstTimePassRate}%` }}
            ></div>
          </div>
        </div>

        {/* Card 3: Top Error */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Vùng trũng lớn nhất</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="truncate">
            <span className="text-sm font-bold text-rose-700 block truncate" title={topError?.category}>
              {topError ? topError.category : 'Chưa có lỗi ghi nhận'}
            </span>
            <span className="text-xs text-slate-500 font-medium mt-0.5 block">
              Chiếm {topError ? topError.percentage : 0}% tổng bài sai ({topError?.count} bài)
            </span>
          </div>
        </div>

        {/* Card 4: Socratic Resolution Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tự khắc phục lỗi sai</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-700">{resolvedRate}%</span>
            <span className="text-xs text-slate-500">sau câu hỏi Socratic</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-teal-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${resolvedRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Mid Section: Heatmap Chart & AI Pedagogical Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Heatmap: Bản đồ nhiệt vùng trũng kiến thức (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  Bản đồ nhiệt Vùng trũng Kiến thức (Error Heatmap)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phân bổ tần suất các nhóm lỗi sai theo chuẩn kiến thức kỹ năng GDPT 2018
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                {incorrectCount} bài cần hỗ trợ
              </span>
            </div>

            {/* Error distribution bars */}
            <div className="space-y-3.5 my-2">
              {errorStats.map((stat, idx) => {
                const isAlarm = stat.percentage >= 35;
                const isMedium = stat.percentage >= 15;
                const barColor = isAlarm
                  ? 'bg-rose-500'
                  : isMedium
                  ? 'bg-amber-500'
                  : 'bg-emerald-500';
                const tagColor = isAlarm
                  ? 'text-rose-700 bg-rose-50 border-rose-200'
                  : isMedium
                  ? 'text-amber-800 bg-amber-50 border-amber-200'
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200';

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{stat.category}</span>
                        {stat.count > 0 && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${tagColor}`}>
                            {isAlarm ? 'Vùng trũng đỏ' : isMedium ? 'Cần củng cố' : 'Mức nhẹ'}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 font-mono text-xs">
                        <strong>{stat.count}</strong> bài ({stat.percentage}%)
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${Math.max(stat.percentage, stat.count > 0 ? 5 : 0)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Dữ liệu tính trên toàn bộ bài nộp của lớp {teacher.classList.find((c) => c.id === selectedClassId)?.name}</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Nguy cơ cao &ge; 35%
            </span>
          </div>
        </div>

        {/* Right side: AI Pedagogical Recommendation (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 rounded-2xl text-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Khuyến nghị Sư phạm Tự động từ AI
                </h3>
                <p className="text-[11px] text-emerald-300">
                  Phân tích chẩn đoán phục vụ soạn giáo án tiết học tới
                </p>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4 border border-white/10 backdrop-blur-xs text-xs leading-relaxed text-slate-200 space-y-3">
              <p>{pedagogicalRecommendation}</p>
            </div>

            <div className="mt-4 space-y-2">
              <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                3 Hành động can thiệp tức thời đề xuất:
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-start gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-emerald-400 font-bold">1.</span>
                  <span>Chiếu trực tiếp 2 bài tập củng cố Socratic lên màn hình lớp học đầu giờ.</span>
                </div>
                <div className="flex items-start gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-emerald-400 font-bold">2.</span>
                  <span>Yêu cầu nhóm học sinh chưa đặt điều kiện làm lại phiếu A4 trước khi nộp vở.</span>
                </div>
                <div className="flex items-start gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-emerald-400 font-bold">3.</span>
                  <span>Giao bộ bài tập phân hóa mức độ nâng cao cho {correctCount} bài đã làm đúng.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-slate-400 text-right">
            Mô hình Sư phạm THPT GDPT 2018
          </div>
        </div>
      </div>

      {/* Bottom Section: Detailed Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter and Header Bar */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-emerald-600" />
              Sổ theo dõi Chi tiết Bài nộp của Học sinh
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhấp vào "Xem A4" để mở tờ phiếu chẩn đoán tư duy của từng học sinh
            </p>
          </div>

          {/* Filters & Search input */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã hoặc bài nộp..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50 text-slate-800"
              />
            </div>

            {/* Error Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs p-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="correct">Đúng 100%</option>
              <option value="Chưa đặt điều kiện xác định">Chưa đặt điều kiện xác định</option>
              <option value="Biến đổi đại số sai">Biến đổi đại số sai</option>
              <option value="Nhầm lẫn định lý/công thức">Nhầm lẫn định lý/công thức</option>
              <option value="Thiếu nghiệm ngoại lai">Thiếu nghiệm ngoại lai</option>
              <option value="Lập luận hình học sai">Lập luận hình học sai</option>
            </select>

            {/* Resolution Filter */}
            <select
              value={filterResolved}
              onChange={(e) => setFilterResolved(e.target.value)}
              className="text-xs p-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả tiến độ</option>
              <option value="resolved">Đã tự sửa xong</option>
              <option value="pending">Chưa sửa xong</option>
            </select>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Định danh / Học sinh</th>
                <th className="py-3 px-4">Thời gian nộp</th>
                <th className="py-3 px-4">Dạng bài toán</th>
                <th className="py-3 px-4">Chẩn đoán lỗi sai</th>
                <th className="py-3 px-4">Tiến độ Socratic</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                          {sub.studentName ? sub.studentName.charAt(0) : '#'}
                        </div>
                        <div>
                          <span>{sub.studentName ? sub.studentName : '(Chưa điền tên)'}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">
                            #{sub.id.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {sub.timestamp}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate" title={sub.problemText}>
                      {sub.problemText.replace(/\$+/g, '').slice(0, 40)}...
                    </td>

                    <td className="py-3.5 px-4">
                      {sub.isCorrect ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Chuẩn mực 100%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          {sub.errorCategory || 'Lỗi lập luận'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {sub.isCorrect ? (
                        <span className="text-[11px] text-slate-400 italic">Đã đạt chuẩn</span>
                      ) : sub.hasResolvedMistake ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          <CheckCircle2 className="w-3 h-3" /> Đã tự sửa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Đang suy ngẫm
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setInspectingSubmission(sub)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Xem A4
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Không tìm thấy bài nộp nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Modal: View Full Student A4 Diagnostic Sheet */}
      {inspectingSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-100 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-300 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <h3 className="text-sm font-bold text-slate-800">
                  Thanh tra Bài làm: {inspectingSubmission.studentName || 'Học sinh'} (#{inspectingSubmission.id.toUpperCase()})
                </h3>
              </div>
              <button
                onClick={() => setInspectingSubmission(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-slate-200/50">
              <A4DiagnosticSheet
                submission={inspectingSubmission}
                onUpdateNotes={onUpdateNotes}
                onMarkResolved={(id) => {
                  onMarkResolved(id);
                  setInspectingSubmission((prev) => (prev ? { ...prev, hasResolvedMistake: true } : null));
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-white border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setInspectingSubmission(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
