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
  Check,
  Plus,
  Trash2,
  FileSpreadsheet,
  Download,
  Copy,
  Key,
  FolderPlus,
  Upload,
  Calendar,
  Layers,
  ArrowRight,
  Filter,
  UserPlus
} from 'lucide-react';
import { MathSubmission, Teacher, ErrorCategory, ClassRoom, StudentAccount } from '../types/index.ts';
import A4DiagnosticSheet from './A4DiagnosticSheet.tsx';
import StudentProfileModal from './StudentProfileModal.tsx';
import { 
  generateRandomId, 
  generateRandomPassword, 
  parseBulkStudents,
  createSampleDataForTeacher
} from '../services/storageService.ts';

interface TeacherDashboardProps {
  teacher: Teacher;
  onUpdateTeacher: (teacher: Teacher) => void;
  classes: ClassRoom[];
  onUpdateClasses: (classes: ClassRoom[]) => void;
  students: StudentAccount[];
  onUpdateStudents: (students: StudentAccount[]) => void;
  submissions: MathSubmission[];
  onUpdateNotes: (submissionId: string, notes: string[]) => void;
  onMarkResolved: (submissionId: string) => void;
  onExportJson?: () => void;
  onImportJson?: (json: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  onUpdateTeacher,
  classes,
  onUpdateClasses,
  students,
  onUpdateStudents,
  submissions,
  onUpdateNotes,
  onMarkResolved,
  onExportJson,
  onImportJson,
}) => {
  // Main view switcher
  const [activeMainTab, setActiveMainTab] = useState<'analytics' | 'classes' | 'students'>('students');

  // Selected class for student view and analytics
  const [selectedClassId, setSelectedClassId] = useState<string>(
    classes.length > 0 ? classes[0].id : ''
  );

  // Search & Filters for submissions
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterResolved, setFilterResolved] = useState<string>('all');

  // Search & Filters for students
  const [studentSearch, setStudentSearch] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'all' | 'diagnosed' | 'not_started' | 'needs_remedy'>('all');

  // Modal inspection states
  const [inspectingSubmission, setInspectingSubmission] = useState<MathSubmission | null>(null);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<StudentAccount | null>(null);

  // Add / Edit Class Modal
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [classNameInput, setClassNameInput] = useState('');
  const [classGradeInput, setClassGradeInput] = useState<'10' | '11' | '12'>('12');
  const [classYearInput, setClassYearInput] = useState('2025 - 2026');
  const [classCodeInput, setClassCodeInput] = useState('');
  const [classNotesInput, setClassNotesInput] = useState('');

  // Add Single Student Modal
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentCode, setNewStudentCode] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('123');

  // Bulk Import Modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');

  // Copy notification state
  const [copiedAccounts, setCopiedAccounts] = useState(false);

  // Profile Edit Mode
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Selected Class details
  const activeClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0] || null;
  }, [classes, selectedClassId]);

  // Students belonging to the selected class
  const classStudents = useMemo(() => {
    if (!selectedClassId) return students;
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Filtered Students list
  const filteredStudents = useMemo(() => {
    return classStudents.filter((st) => {
      const matchSearch =
        st.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        st.id.toLowerCase().includes(studentSearch.toLowerCase());
      const matchStatus =
        studentStatusFilter === 'all' || st.status === studentStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [classStudents, studentSearch, studentStatusFilter]);

  // Submissions for active class
  const classSubmissions = useMemo(() => {
    if (!selectedClassId) return submissions;
    return submissions.filter((s) => s.classId === selectedClassId || !s.classId);
  }, [submissions, selectedClassId]);

  // KPI Metrics
  const totalSubmissions = classSubmissions.length;
  const correctCount = classSubmissions.filter((s) => s.isCorrect).length;
  const incorrectCount = totalSubmissions - correctCount;
  const passRate = totalSubmissions > 0 ? Math.round((correctCount / totalSubmissions) * 100) : 0;
  const resolvedCount = classSubmissions.filter((s) => s.hasResolvedMistake && !s.isCorrect).length;
  const resolvedRate = incorrectCount > 0 ? Math.round((resolvedCount / incorrectCount) * 100) : 0;

  // Error Category Breakdown
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

  // Pedagogical Recommendation
  const pedagogicalRecommendation = useMemo(() => {
    if (!topError || topError.count === 0) {
      return 'Lớp học đang có phong độ làm bài rất tốt. Giáo viên có thể tăng cường các bài toán vận dụng cao và liên hệ mô hình thực tế GDPT 2018.';
    }

    if (topError.category === 'Chưa đặt điều kiện xác định') {
      return `Vùng trũng lớn nhất của lớp hiện là "${topError.category}" (chiếm ${topError.percentage}% tổng lỗi sai). Thầy/Cô nên dành 15 phút đầu giờ tổ chức chuyên đề "Kỹ năng rà soát tập xác định & phép biến đổi tương đương", đặc biệt nhấn mạnh điều kiện vế phải của phương trình vô tỉ $\\sqrt{A} = B$ và biểu thức logarit.`;
    }

    if (topError.category === 'Biến đổi đại số sai') {
      return `Có ${topError.count} bài học sinh gặp lỗi nhầm lẫn dấu trong biến đổi đại số & đạo hàm phân thức. Khuyến nghị tổ chức hoạt động truy vết lỗi sai chéo (peer-review) trên bảng để các em phát hiện quy tắc đổi dấu ngoặc âm.`;
    }

    return `Vùng trũng kiến thức trọng tâm là "${topError.category}". Cần củng cố bảng công thức chuẩn và giao thêm bài tập phân bậc nhận biết - thông hiểu trước khi sang vận dụng.`;
  }, [topError]);

  // Class Management Handlers
  const handleOpenCreateClass = () => {
    setEditingClass(null);
    setClassNameInput('Lớp 12A2');
    setClassGradeInput('12');
    setClassYearInput('2025 - 2026');
    setClassCodeInput('12A2-MAT');
    setClassNotesInput('');
    setShowClassModal(true);
  };

  const handleOpenEditClass = (cls: ClassRoom) => {
    setEditingClass(cls);
    setClassNameInput(cls.name);
    setClassGradeInput(cls.grade);
    setClassYearInput(cls.academicYear);
    setClassCodeInput(cls.classCode);
    setClassNotesInput(cls.notes || '');
    setShowClassModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNameInput.trim()) return;

    if (editingClass) {
      // Edit
      const updatedClasses = classes.map((c) =>
        c.id === editingClass.id
          ? {
              ...c,
              name: classNameInput.trim(),
              grade: classGradeInput,
              academicYear: classYearInput.trim(),
              classCode: classCodeInput.trim() || c.classCode,
              notes: classNotesInput.trim(),
            }
          : c
      );
      onUpdateClasses(updatedClasses);
    } else {
      // Create new
      const newClassId = `class-${Date.now().toString(36)}`;
      const newClass: ClassRoom = {
        id: newClassId,
        teacherId: teacher.id,
        name: classNameInput.trim(),
        grade: classGradeInput,
        academicYear: classYearInput.trim(),
        classCode: classCodeInput.trim() || `L-${Math.floor(1000 + Math.random() * 9000)}`,
        studentCount: 0,
        notes: classNotesInput.trim(),
        createdAt: new Date().toLocaleDateString('vi-VN'),
      };
      const updatedClasses = [...classes, newClass];
      onUpdateClasses(updatedClasses);
      setSelectedClassId(newClassId);
    }
    setShowClassModal(false);
  };

  const handleDeleteClass = (classId: string) => {
    if (confirm('Thầy/Cô có chắc chắn muốn xóa lớp này? Danh sách học sinh trong lớp cũng sẽ bị loại bỏ.')) {
      const remainingClasses = classes.filter((c) => c.id !== classId);
      const remainingStudents = students.filter((s) => s.classId !== classId);
      onUpdateClasses(remainingClasses);
      onUpdateStudents(remainingStudents);
      if (selectedClassId === classId) {
        setSelectedClassId(remainingClasses[0]?.id || '');
      }
    }
  };

  // Khởi tạo nhanh lớp mẫu nếu chưa có
  const handleInitSampleWorkspace = () => {
    const sample = createSampleDataForTeacher(teacher);
    onUpdateClasses(sample.classes);
    onUpdateStudents(sample.students);
    setSelectedClassId(sample.classes[0].id);
  };

  // Student Provisioning Handlers
  const handleOpenAddStudent = () => {
    if (!activeClass) {
      alert('Vui lòng tạo hoặc chọn một lớp học trước!');
      return;
    }
    const nextIdx = classStudents.length + 1;
    setNewStudentName('');
    setNewStudentCode(`HS${activeClass.grade}-${String(nextIdx).padStart(2, '0')}`);
    setNewStudentPassword('123');
    setShowAddStudentModal(true);
  };

  const handleSaveSingleStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !activeClass) return;

    const newStudent: StudentAccount = {
      id: newStudentCode.trim(),
      studentCode: newStudentCode.trim(),
      name: newStudentName.trim(),
      classId: activeClass.id,
      className: activeClass.name,
      teacherId: teacher.id,
      teacherName: teacher.name,
      password: newStudentPassword.trim() || '123',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newStudentName)}`,
      status: 'not_started',
      gapsCount: 0,
      detectedGaps: [],
      assignedTasks: [],
      testHistory: [],
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };

    const updated = [...students, newStudent];
    onUpdateStudents(updated);

    // Cập nhật studentCount trên lớp
    const updatedClasses = classes.map((c) =>
      c.id === activeClass.id ? { ...c, studentCount: c.studentCount + 1 } : c
    );
    onUpdateClasses(updatedClasses);

    setShowAddStudentModal(false);
  };

  // Nhập hàng loạt Bulk Import
  const handleProcessBulkImport = () => {
    if (!bulkInputText.trim() || !activeClass) return;

    const imported = parseBulkStudents(
      bulkInputText,
      activeClass.id,
      activeClass.name,
      teacher.id,
      teacher.name,
      activeClass.grade
    );

    if (imported.length === 0) {
      alert('Không nhận diện được học sinh nào. Vui lòng kiểm tra lại định dạng!');
      return;
    }

    const updated = [...students, ...imported];
    onUpdateStudents(updated);

    const updatedClasses = classes.map((c) =>
      c.id === activeClass.id ? { ...c, studentCount: c.studentCount + imported.length } : c
    );
    onUpdateClasses(updatedClasses);

    setBulkInputText('');
    setShowBulkModal(false);
    alert(`Đã nhập thành công ${imported.length} học sinh vào ${activeClass.name}!`);
  };

  // Xuất tài khoản học sinh ra CSV / Tải file
  const handleExportCsv = () => {
    if (classStudents.length === 0) {
      alert('Lớp chưa có học sinh nào để xuất danh sách!');
      return;
    }

    let csvContent = '\uFEFF'; // BOM UTF-8
    csvContent += 'STT,Mã Học Sinh,Họ và Tên,Lớp Học,Mật Khẩu Khởi Tạo,Trạng Thái,Điểm Số\n';

    classStudents.forEach((st, idx) => {
      csvContent += `${idx + 1},"${st.id}","${st.name}","${st.className || ''}","${st.password}","${
        st.status === 'diagnosed'
          ? 'Đã chẩn đoán'
          : st.status === 'needs_remedy'
          ? 'Cần bù đắp gấp'
          : 'Chưa làm bài'
      }","${st.latestScore ?? 'Chưa có'}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_sach_tai_khoan_${activeClass?.name || 'lop'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Sao chép bảng tài khoản vào Clipboard
  const handleCopyAccountsTable = () => {
    if (classStudents.length === 0) return;

    let text = `DANH SÁCH TÀI KHOẢN ĐĂNG NHẬP MATHDIAGNOSTIC AI - ${activeClass?.name || ''}\n`;
    text += `Website đăng nhập: https://covanhoctap.vercel.app/\n\n`;
    text += `STT | Mã học sinh | Họ và tên | Mật khẩu\n`;
    text += `-------------------------------------------\n`;

    classStudents.forEach((st, idx) => {
      text += `${idx + 1}. ${st.id} | ${st.name} | Mật khẩu: ${st.password}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedAccounts(true);
    setTimeout(() => setCopiedAccounts(false), 2000);
  };

  // Xóa học sinh
  const handleDeleteStudent = (studentId: string) => {
    if (confirm('Thầy/Cô có chắc chắn muốn xóa học sinh này khỏi lớp?')) {
      const updated = students.filter((s) => s.id !== studentId);
      onUpdateStudents(updated);
      if (activeClass) {
        const updatedClasses = classes.map((c) =>
          c.id === activeClass.id ? { ...c, studentCount: Math.max(0, c.studentCount - 1) } : c
        );
        onUpdateClasses(updatedClasses);
      }
    }
  };

  // Cập nhật học sinh từ Modal Profile
  const handleUpdateStudentFromProfile = (updatedStudent: StudentAccount) => {
    const updated = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    onUpdateStudents(updated);
    setSelectedStudentForProfile(updatedStudent);
  };

  return (
    <div className="space-y-6">
      
      {/* Clean Teacher Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Cổng Quản trị Lớp học
            </span>
            {teacher.email && teacher.email !== 'giaovien@gmail.com' && (
              <span className="text-xs text-slate-500 font-mono">
                {teacher.email}
              </span>
            )}
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            Quản lý Dạy học & Chẩn đoán Vùng trũng Kiến thức (GDPT 2018)
          </h1>
        </div>

        {classes.length === 0 && (
          <button
            onClick={handleInitSampleWorkspace}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all w-fit"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            Khởi tạo Lớp 12A1 mẫu (5 học sinh)
          </button>
        )}
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveMainTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
            activeMainTab === 'students'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Danh sách & Hồ sơ Học sinh</span>
          <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-mono">
            {classStudents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('classes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
            activeMainTab === 'classes'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FolderPlus className="w-4 h-4 text-emerald-400" />
          <span>Quản lý Lớp học ({classes.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
            activeMainTab === 'analytics'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Thống kê Vùng trũng & Bài nộp</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: DANH SÁCH & THEO DÕI VIỆC HỌC TỪNG HỌC SINH */}
      {/* ---------------------------------------------------- */}
      {activeMainTab === 'students' && (
        <div className="space-y-5">
          {/* Bar chọn lớp và công cụ */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700">Lớp đang chọn:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} (Khối {cls.grade} - {cls.studentCount} HS)
                  </option>
                ))}
              </select>

              <button
                onClick={handleOpenCreateClass}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer transition-all"
                title="Tạo thêm lớp mới"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Cụm nút Thêm, Nhập hàng loạt, Xuất tài khoản */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleOpenAddStudent}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Thêm 1 Học sinh
              </button>

              <button
                onClick={() => setShowBulkModal(true)}
                className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Nhập từ Excel/Word
              </button>

              <button
                onClick={handleCopyAccountsTable}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200"
                title="Sao chép danh sách tài khoản kèm mật khẩu để gửi cho học sinh"
              >
                {copiedAccounts ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Sao chép tài khoản
                  </>
                )}
              </button>

              <button
                onClick={handleExportCsv}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200"
                title="Tải file CSV danh sách học sinh"
              >
                <Download className="w-3.5 h-3.5" />
                Xuất CSV
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Tìm học sinh theo Họ tên hoặc Mã số (VD: HS12A1-01, Nguyễn Văn An)..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <select
              value={studentStatusFilter}
              onChange={(e) => setStudentStatusFilter(e.target.value as any)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="diagnosed">Đã hoàn thành chẩn đoán</option>
              <option value="needs_remedy">Cần bù đắp kiến thức gấp</option>
              <option value="not_started">Chưa làm bài</option>
            </select>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Mã số HS</th>
                    <th className="py-3 px-4">Họ và tên Học sinh</th>
                    <th className="py-3 px-4">Trạng thái Chẩn đoán</th>
                    <th className="py-3 px-4">Điểm mới nhất</th>
                    <th className="py-3 px-4">Vùng trũng phát hiện</th>
                    <th className="py-3 px-4">Mật khẩu cấp</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((st) => (
                      <tr
                        key={st.id}
                        onClick={() => setSelectedStudentForProfile(st)}
                        className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {st.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                              {st.avatar ? (
                                <img src={st.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                st.name.charAt(0)
                              )}
                            </div>
                            <span className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                              {st.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {st.status === 'diagnosed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã chẩn đoán
                            </span>
                          ) : st.status === 'needs_remedy' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertCircle className="w-3 h-3 text-rose-600" /> Cần bù đắp gấp
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              <Clock className="w-3 h-3 text-slate-400" /> Chưa làm bài
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {st.latestScore !== undefined ? (
                            <span className="font-black text-sm text-slate-900">
                              {st.latestScore}{' '}
                              <span className="text-[10px] text-slate-400 font-normal">/ 10</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">--</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {st.detectedGaps && st.detectedGaps.length > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[11px]">
                              {st.detectedGaps.length} vùng trũng
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Không có</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold">
                          {st.password}
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedStudentForProfile(st)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" /> Hồ sơ
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(st.id)}
                              className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer transition-all"
                              title="Xóa học sinh"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Chưa có học sinh nào trong danh sách. Hãy nhấn "Thêm 1 Học sinh" hoặc "Nhập từ Excel/Word" để bắt đầu!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: QUẢN LÝ LỚP HỌC (CLASS MANAGEMENT) */}
      {/* ---------------------------------------------------- */}
      {activeMainTab === 'classes' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Danh sách các Lớp học quản lý</h3>
              <p className="text-xs text-slate-500">
                Thầy/Cô có thể tạo nhiều lớp theo Khối 10, 11, 12 chuẩn GDPT 2018.
              </p>
            </div>
            <button
              onClick={handleOpenCreateClass}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Tạo Lớp học mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => {
              const studentsInThisClass = students.filter((s) => s.classId === cls.id);
              const diagnosedInThisClass = studentsInThisClass.filter((s) => s.status === 'diagnosed');
              const scores = studentsInThisClass
                .map((s) => s.latestScore)
                .filter((sc): sc is number => sc !== undefined);
              const avgScore =
                scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '--';

              return (
                <div
                  key={cls.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-emerald-300 transition-all shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Khối {cls.grade}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{cls.classCode}</span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 mt-1">{cls.name}</h4>
                      <p className="text-xs text-slate-500">Năm học: {cls.academicYear}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditClass(cls)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-50 cursor-pointer"
                        title="Chỉnh sửa lớp"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Xóa lớp"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* KPI mini */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Sĩ số</span>
                      <span className="text-sm font-black text-slate-800">{studentsInThisClass.length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Đã thi</span>
                      <span className="text-sm font-black text-emerald-600">{diagnosedInThisClass.length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Điểm TB</span>
                      <span className="text-sm font-black text-blue-600">{avgScore}</span>
                    </div>
                  </div>

                  {cls.notes && (
                    <p className="text-xs text-slate-600 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
                      {cls.notes}
                    </p>
                  )}

                  <button
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      setActiveMainTab('students');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Quản lý học sinh lớp này</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: THỐNG KÊ VÙNG TRŨNG & BÀI NỘP SƯ PHẠM */}
      {/* ---------------------------------------------------- */}
      {activeMainTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <BookMarked className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Tổng bài thẩm định</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-black text-slate-900">{totalSubmissions}</span>
                  <span className="text-xs text-slate-400">bài nộp</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Tỷ lệ chính xác lần 1</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-black text-emerald-700">{passRate}%</span>
                  <span className="text-xs text-emerald-600 font-medium">({correctCount} bài đúng)</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Khắc phục sau gợi ý</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-black text-amber-700">{resolvedRate}%</span>
                  <span className="text-xs text-amber-600 font-medium">({resolvedCount} đã hiểu)</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Vùng trũng lớn nhất</p>
                <div className="mt-0.5">
                  <span className="text-xs font-bold text-rose-700 line-clamp-1">
                    {topError ? topError.category : 'Không có'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {topError ? `${topError.percentage}% tổng lỗi` : 'Lớp làm bài tốt'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Pedagogical Insight Box */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-300" />
              <h3 className="font-bold text-sm tracking-wide uppercase text-emerald-300">
                Chỉ dẫn Sư phạm Điều chỉnh Giảng dạy (GDPT 2018)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-4xl">
              {pedagogicalRecommendation}
            </p>
          </div>

          {/* Error Breakdown Bars */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Bản đồ Vùng trũng & Danh mục Lỗi sai Thường gặp
            </h3>
            <div className="space-y-3">
              {errorStats.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{item.category}</span>
                    <span className="text-slate-500">
                      {item.count} bài ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0
                          ? 'bg-rose-500'
                          : idx === 1
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: TẠO / SỬA LỚP HỌC */}
      {/* ---------------------------------------------------- */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingClass ? 'Chỉnh sửa Lớp học' : 'Tạo Lớp học mới'}
              </h3>
              <button onClick={() => setShowClassModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên lớp học:</label>
                <input
                  type="text"
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  placeholder="VD: 12A1, 11B2, 10 Chuyên Toán..."
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Khối lớp GDPT 2018:</label>
                  <select
                    value={classGradeInput}
                    onChange={(e) => setClassGradeInput(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="10">Khối 10</option>
                    <option value="11">Khối 11</option>
                    <option value="12">Khối 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Năm học:</label>
                  <input
                    type="text"
                    value={classYearInput}
                    onChange={(e) => setClassYearInput(e.target.value)}
                    placeholder="2025 - 2026"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mã lớp (cho học sinh tra cứu):</label>
                <input
                  type="text"
                  value={classCodeInput}
                  onChange={(e) => setClassCodeInput(e.target.value)}
                  placeholder="VD: 12A1-2026"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú mục tiêu sư phạm:</label>
                <textarea
                  value={classNotesInput}
                  onChange={(e) => setClassNotesInput(e.target.value)}
                  placeholder="Ghi chú về định hướng ôn thi, trình độ lớp..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  {editingClass ? 'Cập nhật' : 'Tạo lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: THÊM 1 HỌC SINH */}
      {/* ---------------------------------------------------- */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Thêm Học sinh vào {activeClass?.name}
              </h3>
              <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSingleStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên học sinh:</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="VD: Nguyễn Văn Hoàng"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Mã số học sinh:</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeClass) {
                        setNewStudentCode(`HS${activeClass.grade}-${String(classStudents.length + 1).padStart(2, '0')}`);
                      }
                    }}
                    className="text-[10px] text-emerald-600 font-bold hover:underline cursor-pointer"
                  >
                    Tự sinh mã
                  </button>
                </div>
                <input
                  type="text"
                  value={newStudentCode}
                  onChange={(e) => setNewStudentCode(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Mật khẩu khởi tạo:</label>
                  <button
                    type="button"
                    onClick={() => setNewStudentPassword(generateRandomPassword(6))}
                    className="text-[10px] text-emerald-600 font-bold hover:underline cursor-pointer"
                  >
                    Sinh mật khẩu ngẫu nhiên
                  </button>
                </div>
                <input
                  type="text"
                  value={newStudentPassword}
                  onChange={(e) => setNewStudentPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-emerald-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Lưu học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: NHẬP HÀNG LOẠT (BULK IMPORT) */}
      {/* ---------------------------------------------------- */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Nhập danh sách học sinh từ Excel / Word vào {activeClass?.name}
              </h3>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
              <p className="font-bold">Định dạng hỗ trợ (mỗi học sinh 1 dòng):</p>
              <p className="font-mono text-[11px] text-emerald-800">
                Cách 1 (Chỉ cần tên): Nguyễn Văn An<br />
                Cách 2 (Mã | Tên | Mật khẩu): HS12-01 | Nguyễn Văn An | 123
              </p>
              <p className="text-[10px] text-emerald-700">
                *Hệ thống sẽ tự động sinh Mã học sinh và Mật khẩu nếu chưa được cung cấp.
              </p>
            </div>

            <textarea
              value={bulkInputText}
              onChange={(e) => setBulkInputText(e.target.value)}
              placeholder="Dán danh sách học sinh tại đây, ví dụ:&#10;Trần Thị Thảo&#10;Lê Minh Quân&#10;Phạm Khánh Linh"
              rows={8}
              className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono bg-slate-50"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleProcessBulkImport}
                disabled={!bulkInputText.trim()}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs disabled:opacity-50"
              >
                Tự động tạo tài khoản cho cả lớp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: HỒ SƠ HỌC SINH CHI TIẾT (STUDENT PROFILE) */}
      {/* ---------------------------------------------------- */}
      <StudentProfileModal
        student={selectedStudentForProfile}
        isOpen={!!selectedStudentForProfile}
        onClose={() => setSelectedStudentForProfile(null)}
        onUpdateStudent={handleUpdateStudentFromProfile}
      />

      {/* ---------------------------------------------------- */}
      {/* MODAL: PHIẾU CHẨN ĐOÁN A4 SƯ PHẠM */}
      {/* ---------------------------------------------------- */}
      {inspectingSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-xs font-bold">Phiếu Chẩn đoán Thích ứng Sư phạm A4</h3>
              <button onClick={() => setInspectingSubmission(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <A4DiagnosticSheet
                submission={inspectingSubmission}
                onUpdateNotes={(subId, notes) => onUpdateNotes(subId, notes)}
                onMarkResolved={(subId) => onMarkResolved(subId)}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeacherDashboard;
