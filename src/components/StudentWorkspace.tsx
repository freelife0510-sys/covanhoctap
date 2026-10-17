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
  GraduationCap
} from 'lucide-react';
import { MathSubmission, PredefinedExample, Student } from '../types/index.ts';
import { PREDEFINED_EXAMPLES } from '../data/mockData.ts';
import { evaluateMathSubmission } from '../services/geminiService.ts';
import A4DiagnosticSheet from './A4DiagnosticSheet.tsx';
import MathRenderer from './MathRenderer.tsx';

interface StudentWorkspaceProps {
  apiKey?: string;
  student: Student;
  onUpdateStudent: (student: Student) => void;
  onNewSubmission: (submission: MathSubmission) => void;
  submissions: MathSubmission[];
  onUpdateNotes: (submissionId: string, notes: string[]) => void;
  onMarkResolved: (submissionId: string) => void;
}

const DIAGNOSTIC_STEPS = [
  'Đang số hóa văn bản & công thức toán học...',
  'Kiểm tra tập xác định và điều kiện ràng buộc...',
  'Truy vết từng bước biến đổi đại số & giải tích...',
  'Phát hiện lỗi sai tiềm ẩn & lập câu hỏi Socratic...',
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

  // The active submission being viewed in the A4 sheet
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

    // Animate diagnostic steps
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev < DIAGNOSTIC_STEPS.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await evaluateMathSubmission(problemText, solutionText, imageBase64 || undefined, apiKey);

      const now = new Date();
      const formattedTime = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Use student's custom name if entered, otherwise leave blank or display default
      const finalStudentName = student.name.trim();

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
      {/* Student Welcome & Profile Config Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-5 md:p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-medium text-emerald-100 mb-2 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Không gian Sư phạm Học sinh — Tự đánh giá năng lực Toán GDPT 2018
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              {student.name ? `Chào mừng em, ${student.name}!` : 'Không gian Đánh giá & Chẩn đoán Bài tập'}
            </h1>
            <p className="text-xs md:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
              Nhập đề bài và bài làm dưới đây để nhận phiếu chẩn đoán A4 theo phương pháp Socratic.
              {!student.name && ' Dữ liệu họ tên đang để trống, hệ thống sẽ tự động đồng bộ khi đăng nhập hoặc em có thể nhập trực tiếp bên cạnh.'}
            </p>
          </div>

          {/* Student Profile Input Field (Empty by default, auto-fills or user enters) */}
          <div className="shrink-0 bg-white/10 p-3.5 rounded-xl backdrop-blur-xs border border-white/15 w-full lg:w-80 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-200">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Thông tin Học sinh
              </span>
              <span className="text-[10px] text-white/70">
                {student.name ? 'Đã có dữ liệu' : 'Chờ dữ liệu'}
              </span>
            </div>

            <div className="space-y-1.5">
              <input
                type="text"
                value={student.name}
                onChange={(e) => onUpdateStudent({ ...student, name: e.target.value })}
                placeholder="Nhập họ và tên học sinh (để trống nếu chưa có)..."
                className="w-full text-xs px-3 py-1.5 rounded-lg bg-black/20 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />

              <div className="flex gap-2">
                <input
                  type="text"
                  value={student.school || ''}
                  onChange={(e) => onUpdateStudent({ ...student, school: e.target.value })}
                  placeholder="Trường THPT (để trống nếu chưa có)..."
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-black/20 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
                <select
                  value={student.classId}
                  onChange={(e) => onUpdateStudent({ ...student, classId: e.target.value })}
                  className="text-xs px-2 py-1.5 rounded-lg bg-slate-800 text-white border border-white/20 focus:outline-none cursor-pointer"
                >
                  <option value="class-12a1">Lớp 12A1</option>
                  <option value="class-12a2">Lớp 12A2</option>
                  <option value="class-11toan">Lớp 11</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

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

            <div className="grid grid-cols-1 gap-2">
              {PREDEFINED_EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleSelectExample(ex)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                    problemText === ex.problemText
                      ? 'bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-400'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{ex.title}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        ex.isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ex.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{ex.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Problem & Solution Input Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            {/* Problem Statement Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="problem-input" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  Đề bài Toán (Hỗ trợ công thức LaTeX $...$)
                </label>
                <button
                  type="button"
                  onClick={() => setShowFormulaPreview(!showFormulaPreview)}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  {showFormulaPreview ? 'Ẩn xem trước' : 'Xem công thức'}
                </button>
              </div>

              <textarea
                id="problem-input"
                rows={3}
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder="Nhập đề bài toán (Ví dụ: Giải phương trình \sqrt{x - 2} = x - 4)..."
                className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-slate-50/50 text-slate-800 resize-y"
              />

              {showFormulaPreview && (
                <div className="mt-2 p-3 bg-slate-100/80 rounded-xl border border-slate-200 text-xs">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Hiển thị công thức:</div>
                  <MathRenderer content={problemText} />
                </div>
              )}
            </div>

            {/* Solution Input */}
            <div>
              <label htmlFor="solution-input" className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                Lời giải của học sinh (Gõ phím hoặc Tải ảnh chụp)
              </label>

              <textarea
                id="solution-input"
                rows={6}
                value={solutionText}
                onChange={(e) => setSolutionText(e.target.value)}
                placeholder="Trình bày các bước giải toán của em tại đây..."
                className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-slate-50/50 text-slate-800 resize-y"
              />
            </div>

            {/* Handwritten photo upload */}
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-indigo-600" />
                  Đính kèm ảnh bài làm viết tay (Multimodal Vision)
                </span>
                {imagePreview && (
                  <button
                    onClick={handleClearImage}
                    className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" /> Xóa ảnh
                  </button>
                )}
              </div>

              {!imagePreview ? (
                <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-3 flex flex-col items-center justify-center gap-1 text-center bg-slate-50/60 hover:bg-emerald-50/30 transition-colors cursor-pointer group">
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  <span className="text-xs font-medium text-slate-700 group-hover:text-emerald-700">
                    Tải lên ảnh chụp vở ghi hoặc nháp bài
                  </span>
                  <span className="text-[10px] text-slate-400">Hỗ trợ JPG, PNG, WEBP</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 p-2">
                  <img
                    src={imagePreview}
                    alt="Preview bài làm"
                    className="max-h-40 w-auto mx-auto rounded-lg object-contain"
                  />
                  <div className="text-center mt-1 text-[11px] text-emerald-700 font-medium">
                    ✓ Đã nhận dạng ảnh viết tay thành công
                  </div>
                </div>
              )}
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmitEvaluation}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-700/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang thẩm định sư phạm...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Gửi bài thẩm định AI (Socratic Check)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Student Submissions History List (Their own work!) */}
          {submissions.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Bài làm của em ({submissions.length})
                </h3>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {submissions.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubmission(sub)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      activeSubmission?.id === sub.id
                        ? 'bg-emerald-50 border-emerald-400'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex-1 truncate mr-2">
                      <div className="font-semibold text-slate-800 truncate">
                        {sub.problemText.replace(/\$+/g, '').slice(0, 38)}...
                      </div>
                      <div className="text-[10px] text-slate-400">{sub.timestamp}</div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {sub.isCorrect ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Đúng
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Cần sửa
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pedagogical Diagnostic Output Sheet (lg:col-span-7) */}
        <div className="lg:col-span-7">
          {isSubmitting ? (
            /* Loading State with animated pedagogical checkpoints */
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[500px] text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Hệ thống Sư phạm Socratic đang chẩn đoán
              </h3>
              <p className="text-xs text-slate-500 max-w-md mb-6">
                Chuyên gia AI đang phân tích bài giải của em theo chuẩn GDPT 2018 để phát hiện vùng trũng kiến thức và soạn gợi ý tự sửa.
              </p>

              {/* Step indicator */}
              <div className="w-full max-w-sm space-y-2.5 text-left">
                {DIAGNOSTIC_STEPS.map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 p-2 rounded-lg text-xs transition-all ${
                      idx === stepIndex
                        ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-300'
                        : idx < stepIndex
                        ? 'text-slate-400 font-medium'
                        : 'text-slate-300'
                    }`}
                  >
                    {idx < stepIndex ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : idx === stepIndex ? (
                      <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400 shrink-0">
                        {idx + 1}
                      </span>
                    )}
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : activeSubmission ? (
            /* Display A4 Diagnostic Sheet */
            <A4DiagnosticSheet
              submission={activeSubmission}
              onUpdateNotes={onUpdateNotes}
              onMarkResolved={onMarkResolved}
            />
          ) : (
            /* Empty Prompt Placeholder inviting student to submit */
            <div className="bg-white rounded-2xl p-10 border-2 border-dashed border-slate-300 shadow-2xs flex flex-col items-center justify-center min-h-[540px] text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-700">
                Chưa có phiếu chẩn đoán nào được mở
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">
                Hãy chọn một trong 3 bài mẫu ở khung bên trái hoặc nhập đề bài toán của em rồi bấm <strong>"Gửi bài thẩm định AI"</strong> để xem phiếu A4 sư phạm.
              </p>
              <button
                onClick={handleSubmitEvaluation}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Thẩm định bài mẫu 1 ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentWorkspace;
