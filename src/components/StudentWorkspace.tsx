import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  FileText, 
  Eye, 
  Lightbulb, 
  HelpCircle,
  Camera,
  X,
  User,
  GraduationCap,
  Target,
  Clock,
  AlertTriangle,
  Award,
  CheckCircle2,
  Calendar,
  BookOpen,
  Edit3
} from 'lucide-react';
import { MathSubmission, PredefinedExample, StudentAccount } from '../types/index.ts';
import { PREDEFINED_EXAMPLES } from '../data/mockData.ts';
import { evaluateMathSubmission } from '../services/geminiService.ts';
import A4DiagnosticSheet from './A4DiagnosticSheet.tsx';
import MathRenderer from './MathRenderer.tsx';

interface StudentWorkspaceProps {
  apiKey?: string;
  student: StudentAccount;
  onUpdateStudent: (student: StudentAccount) => void;
  onNewSubmission: (submission: MathSubmission) => void;
  submissions: MathSubmission[];
  onUpdateNotes: (submissionId: string, notes: string[]) => void;
  onMarkResolved: (submissionId: string) => void;
}

const DIAGNOSTIC_STEPS = [
  'Đang số hóa văn bản & công thức toán học...',
  'Kiểm tra tập xác định và điều kiện ràng buộc...',
  'Truy vết từng bước biến đổi đại số & giải tích...',
  'Phát hiện vùng trũng & lập câu hỏi Socratic...',
  'Biên soạn tờ phiếu A4 chuẩn sư phạm...',
];

export const StudentWorkspace: React.FC<StudentWorkspaceProps> = ({
  apiKey = '',
  student,
  onUpdateStudent,
  onNewSubmission,
  submissions,
  onUpdateNotes,
  onMarkResolved,
}) => {
  const [problemText, setProblemText] = useState(PREDEFINED_EXAMPLES[0].problemText);
  const [solutionText, setSolutionText] = useState(PREDEFINED_EXAMPLES[0].solutionText);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showFormulaPreview, setShowFormulaPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Active submission being viewed in the A4 sheet
  const [activeSubmission, setActiveSubmission] = useState<MathSubmission | null>(null);

  // Handle Quick Predefined Demos
  const handleSelectExample = (ex: PredefinedExample) => {
    setProblemText(ex.problemText);
    setSolutionText(ex.solutionText);
    setImageBase64(null);
    setImagePreview(null);
    setActiveSubmission(null);
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageBase64(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setImageBase64(null);
    setImagePreview(null);
  };

  // Toggle assigned task completed
  const handleToggleTask = (taskId: string) => {
    const updatedTasks = (student.assignedTasks || []).map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onUpdateStudent({ ...student, assignedTasks: updatedTasks });
  };

  // Submit for AI pedagogical evaluation
  const handleSubmitEvaluation = async () => {
    if (!problemText.trim()) {
      alert('Vui lòng nhập đề bài toán cần thẩm định!');
      return;
    }

    if (!solutionText.trim() && !imageBase64) {
      alert('Vui lòng nhập lời giải hoặc tải lên ảnh chụp bài làm viết tay!');
      return;
    }

    setIsSubmitting(true);
    setStepIndex(0);

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev < DIAGNOSTIC_STEPS.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await evaluateMathSubmission(problemText, solutionText, imageBase64 || undefined, apiKey);

      const now = new Date();
      const formattedTime = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const finalStudentName = student.name.trim() || 'Học sinh';

      const newSub: MathSubmission = {
        id: `sub-${Date.now().toString().slice(-6)}`,
        studentId: student.id || 'student-curr',
        studentName: finalStudentName,
        classId: student.classId || 'class-12a1',
        timestamp: formattedTime,
        problemText,
        solutionText: solutionText.trim() || undefined,
        solutionImageUrl: imagePreview || undefined,
        isCorrect: res.isCorrect,
        errorCategory: res.errorCategory,
        diagnosticResult: res.diagnosticResult,
        hasResolvedMistake: false,
      };

      onNewSubmission(newSub);
      setActiveSubmission(newSub);

      // CẬP NHẬT TỰ ĐỘNG VÀO HỒ SƠ HỌC SINH ĐỂ GIÁO VIÊN THEO DÕI NGAY
      const scoreThisTest = res.isCorrect ? 10 : 5.0;
      const detectedGaps = [...(student.detectedGaps || [])];
      if (!res.isCorrect && res.errorCategory && !detectedGaps.includes(res.errorCategory)) {
        detectedGaps.push(res.errorCategory);
      }

      const newHistoryItem = {
        id: `test-${Date.now().toString().slice(-5)}`,
        date: formattedTime,
        score: scoreThisTest,
        durationMinutes: 15,
        correctAnswers: res.isCorrect ? 1 : 0,
        totalQuestions: 1,
        gapsDetected: res.errorCategory ? [res.errorCategory] : [],
        details: [
          {
            questionId: 1,
            problem: problemText,
            studentAnswer: solutionText.slice(0, 100),
            isCorrect: res.isCorrect,
            note: res.errorCategory,
          },
        ],
      };

      const updatedStudent: StudentAccount = {
        ...student,
        status: res.isCorrect ? 'diagnosed' : 'needs_remedy',
        latestScore: scoreThisTest,
        gapsCount: detectedGaps.length,
        detectedGaps,
        testHistory: [newHistoryItem, ...(student.testHistory || [])],
      };

      onUpdateStudent(updatedStudent);
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi thẩm định bài làm. Vui lòng thử lại!');
    } finally {
      clearInterval(stepInterval);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Student Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-emerald-200 mb-2 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Cổng Học tập & Chẩn đoán Năng lực Thích ứng (GDPT 2018)
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Xin chào, {student.name || 'Em học sinh'}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
              Mã số: <span className="font-mono font-bold text-amber-300">{student.id}</span> • Lớp:{' '}
              <span className="font-bold text-white">{student.className || 'Toán THPT'}</span> • Giáo viên phụ trách:{' '}
              <span className="font-bold text-emerald-300">{student.teacherName || 'Bộ môn Toán'}</span>
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">Điểm gần nhất</span>
              <span className="text-xl font-black text-amber-300">
                {student.latestScore !== undefined ? `${student.latestScore}` : '--'}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">Vùng trũng</span>
              <span className="text-xl font-black text-rose-300">
                {student.detectedGaps?.length || student.gapsCount || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Lời dặn từ Thầy/Cô nếu có */}
        {student.notesFromTeacher && (
          <div className="mt-4 pt-4 border-t border-white/15 flex items-start gap-2.5 text-xs text-emerald-100">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-200">Lời dặn từ Thầy/Cô: </span>
              <span>{student.notesFromTeacher}</span>
            </div>
          </div>
        )}
      </div>

      {/* Nhiệm vụ ôn tập được Giáo viên giao */}
      {student.assignedTasks && student.assignedTasks.length > 0 && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              Nhiệm vụ ôn tập Giáo viên giao cho em ({student.assignedTasks.filter((t) => t.completed).length}/{student.assignedTasks.length})
            </h3>
            <span className="text-[11px] text-slate-400">Đánh dấu tích khi đã hoàn thành</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {student.assignedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  task.completed
                    ? 'bg-emerald-50/60 border-emerald-200 text-slate-500'
                    : 'bg-white border-slate-200 hover:border-emerald-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    task.completed
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {task.completed && <CheckCircle className="w-3.5 h-3.5" />}
                </div>
                <div className="text-xs">
                  <p className={`font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {task.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Chủ đề: <span className="font-semibold text-slate-700">{task.topic}</span> • Hạn:{' '}
                    <span className="text-amber-700 font-medium">{task.deadline || 'Không giới hạn'}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Input Form on left, Diagnostic Preview on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Controls (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick Demo Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Chọn nhanh bài toán thử nghiệm (Demo)
              </label>
              <span className="text-[11px] text-slate-400">3 bài mẫu</span>
            </div>

            <div className="space-y-2">
              {PREDEFINED_EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleSelectExample(ex)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all cursor-pointer group text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 group-hover:text-emerald-700">
                      {ex.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800">
                      {ex.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{ex.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Math Problem Input */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                1. Đề bài Toán (Hỗ trợ LaTeX)
              </label>
              <button
                onClick={() => setShowFormulaPreview(!showFormulaPreview)}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                {showFormulaPreview ? 'Ẩn xem trước' : 'Xem trước công thức'}
              </button>
            </div>

            <textarea
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="Nhập đề bài toán (sử dụng $...$ hoặc $$...$$ cho công thức LaTeX)..."
              rows={3}
              className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono bg-slate-50"
            />

            {showFormulaPreview && problemText.trim() && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Xem trước trực quan:
                </span>
                <MathRenderer content={problemText} />
              </div>
            )}
          </div>

          {/* Student Solution Input & Image Upload */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-teal-600" />
                2. Lời giải của em (hoặc Ảnh chụp viết tay)
              </label>
            </div>

            <textarea
              value={solutionText}
              onChange={(e) => setSolutionText(e.target.value)}
              placeholder="Nhập các bước biến đổi lời giải của em tại đây..."
              rows={5}
              className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono bg-slate-50"
            />

            {/* Image Upload Area */}
            <div className="pt-2">
              {imagePreview ? (
                <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900 group">
                  <img
                    src={imagePreview}
                    alt="Bài làm viết tay"
                    className="w-full h-36 object-contain"
                  />
                  <button
                    onClick={handleClearImage}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-3 flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition-colors hover:bg-slate-50">
                  <Camera className="w-5 h-5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">Tải lên ảnh chụp bài làm viết tay</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG tối đa 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitEvaluation}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{DIAGNOSTIC_STEPS[stepIndex]}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Thẩm định Sư phạm & Lập Phiếu Chẩn đoán A4</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Printable A4 Diagnostic Sheet or Placeholder (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          {activeSubmission ? (
            <A4DiagnosticSheet
              submission={activeSubmission}
              onUpdateNotes={(subId, notes) => onUpdateNotes(subId, notes)}
              onMarkResolved={(subId) => onMarkResolved(subId)}
            />
          ) : (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Phiếu Chẩn đoán Sư phạm A4 sẽ xuất hiện tại đây
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Sau khi bấm "Thẩm định Sư phạm", hệ thống sẽ chỉ rõ điểm nghẽn nhận thức, câu hỏi Socratic định hướng và bài tập tương đương không bị cắt trang khi in ấn.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentWorkspace;
