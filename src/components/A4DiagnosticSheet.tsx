import React, { useState } from 'react';
import { 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  HelpCircle, 
  Target, 
  Award, 
  Sparkles, 
  Send, 
  FileText, 
  Check, 
  Share2 
} from 'lucide-react';
import { MathSubmission } from '../types/index.ts';
import MathRenderer from './MathRenderer.tsx';

interface A4DiagnosticSheetProps {
  submission: MathSubmission;
  onUpdateNotes?: (submissionId: string, notes: string[]) => void;
  onMarkResolved?: (submissionId: string) => void;
}

export const A4DiagnosticSheet: React.FC<A4DiagnosticSheetProps> = ({
  submission,
  onUpdateNotes,
  onMarkResolved,
}) => {
  const { isCorrect, errorCategory, diagnosticResult } = submission;
  
  // Local state for Socratic question answers
  const initialAnswers = submission.studentNotes || ['', '', ''];
  const [answers, setAnswers] = useState<string[]>(initialAnswers);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResolved, setIsResolved] = useState(submission.hasResolvedMistake || false);

  const handleAnswerChange = (index: number, val: string) => {
    const next = [...answers];
    next[index] = val;
    setAnswers(next);
  };

  const handleSaveSelfCorrection = () => {
    if (onUpdateNotes) {
      onUpdateNotes(submission.id, answers);
    }
    if (onMarkResolved) {
      onMarkResolved(submission.id);
    }
    setIsResolved(true);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print w-full max-w-[210mm] mb-4 flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Tờ phiếu A4 Sư phạm (210 × 297 mm)
          </span>
          {isResolved && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Check className="w-3.5 h-3.5 text-blue-600" />
              Đã khắc phục lỗi sau gợi ý Socratic
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            aria-label="In phiếu đánh giá"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            In phiếu A4 (Print)
          </button>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('Đã sao chép liên kết phiếu chẩn đoán!');
            }}
            aria-label="Chia sẻ kết quả"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            Chia sẻ
          </button>
        </div>
      </div>

      {/* A4 Sheet Container */}
      <div className="a4-page-container a4-sheet-shadow bg-white text-slate-800 w-full max-w-[210mm] min-h-[297mm] p-8 md:p-12 rounded-lg border border-slate-200 relative transition-all duration-300">
        
        {/* Pedagogical Watermark background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.025] flex items-center justify-center">
          <span className="text-8xl font-black text-slate-900 rotate-[-35deg] select-none tracking-widest uppercase">
            MathDiagnostic AI
          </span>
        </div>

        {/* 1. Pedagogical Header */}
        <header className="border-b-2 border-slate-800 pb-4 mb-6 relative">
          <div className="flex justify-between items-start text-xs text-slate-600 leading-tight mb-3">
            <div className="text-left font-serif">
              <p className="font-bold text-slate-900 uppercase tracking-wide">SỞ GIÁO DỤC VÀ ĐÀO TẠO</p>
              <p className="font-semibold text-slate-700">
                {submission.studentName ? 'TRƯỜNG THPT PHỔ THÔNG' : 'TRƯỜNG THPT: ...........................................................'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Tổ Toán - Tin học THPT</p>
            </div>
            <div className="text-right font-serif">
              <p className="font-bold text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="italic text-slate-700">Độc lập - Tự do - Hạnh phúc</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Mã phiếu: #{submission.id.toUpperCase()}</p>
            </div>
          </div>

          <div className="text-center my-3">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 uppercase font-serif">
              PHIẾU CHẨN ĐOÁN NĂNG LỰC TOÁN HỌC & TRUY VẾT TƯ DUY
            </h1>
            <p className="text-xs text-slate-600 mt-1 italic">
              (Thực hiện theo khung đánh giá định kỳ - Chương trình Giáo dục Phổ thông 2018)
            </p>
          </div>

          {/* Student Meta Table */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-md border border-slate-200 text-xs mt-3">
            <div>
              <span className="text-slate-500 block">Học sinh:</span>
              <span className="font-semibold text-slate-900">
                {submission.studentName ? submission.studentName : '(Chưa điền họ tên)'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Lớp / Khối:</span>
              <span className="font-semibold text-slate-900">
                {submission.classId === 'class-12a1' ? 'Lớp 12A1' : submission.classId ? submission.classId : 'Khối 12'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Thời gian nộp:</span>
              <span className="font-medium text-slate-800">{submission.timestamp}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Phương thức:</span>
              <span className="font-medium text-emerald-700">Socratic AI Diagnostic</span>
            </div>
          </div>
        </header>

        {/* 2. Original Problem and Student Submission Box */}
        <section className="mb-6 bg-slate-50/70 p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            Đề bài và Lời giải của học sinh
          </div>

          <div className="bg-white p-3 rounded border border-slate-200 text-sm mb-3">
            <div className="text-xs font-semibold text-slate-500 mb-1">Đề bài:</div>
            <MathRenderer content={submission.problemText} />
          </div>

          {submission.solutionText && (
            <div className="bg-white p-3 rounded border border-slate-200 text-sm">
              <div className="text-xs font-semibold text-slate-500 mb-1">Bài làm của em:</div>
              <MathRenderer content={submission.solutionText} className="font-mono text-xs text-slate-800 whitespace-pre-wrap" />
            </div>
          )}

          {submission.solutionImageUrl && (
            <div className="mt-2 p-2 bg-white rounded border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 mb-1">Ảnh bài làm viết tay:</div>
              <img
                src={submission.solutionImageUrl}
                alt="Bài làm viết tay của học sinh"
                className="max-h-56 object-contain rounded border border-slate-200 mx-auto"
              />
            </div>
          )}
        </section>

        {/* 3. Evaluation Status Badge */}
        <section className="mb-6">
          {isCorrect ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-400 flex items-start gap-3 shadow-xs">
              <div className="p-2 rounded-full bg-emerald-500 text-white shadow-xs shrink-0 mt-0.5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-emerald-900 tracking-wide uppercase">
                    ĐÃ LÀM ĐÚNG — TIẾP TỤC BỨC PHÁ!
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-200 text-emerald-900">
                    Chuẩn xác 100%
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  {diagnosticResult.praiseComment || 'Lời giải của em hoàn toàn chính xác, lập luận mạch lạc và chặt chẽ!'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-400 flex items-start gap-3 shadow-xs">
              <div className="p-2 rounded-full bg-amber-500 text-white shadow-xs shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-amber-950 tracking-wide uppercase">
                    CẦN HOÀN THIỆN — HƯỚNG DẪN TỰ SỬA (SOCRATIC)
                  </h2>
                  {errorCategory && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      Vùng trũng: {errorCategory}
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  Hệ thống không đưa ra đáp số sẵn. Hãy làm theo hướng dẫn gợi mở Socratic dưới đây để tự phát hiện điểm chưa chính xác trong bài giải của mình.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* 4. Pedagogical Deep Content */}
        {!isCorrect ? (
          <div className="space-y-6">
            {/* Block 1: Theory Summary & Core Formulas */}
            <section className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80">
              <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-amber-700" />
                Ôn tập Lý thuyết & Công thức trọng tâm
              </div>

              {diagnosticResult.theorySummary && (
                <div className="text-xs text-slate-800 mb-3 bg-white/80 p-3 rounded-lg border border-amber-100">
                  <MathRenderer content={diagnosticResult.theorySummary} />
                </div>
              )}

              {diagnosticResult.formulasNeeded && diagnosticResult.formulasNeeded.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-amber-800 block">
                    Công thức toán học cốt lõi cần nhớ:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {diagnosticResult.formulasNeeded.map((formula, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-2.5 rounded-md border border-amber-200 text-xs font-mono flex items-center justify-center text-center shadow-2xs"
                      >
                        <MathRenderer content={formula} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Block 2: Socratic Guiding Questions */}
            {diagnosticResult.socraticQuestions && diagnosticResult.socraticQuestions.length > 0 && (
              <section className="bg-teal-50/50 p-4 rounded-xl border border-teal-200/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-teal-900 font-bold text-xs uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4 text-teal-700" />
                    Gợi ý Socratic — Câu hỏi định hướng tư duy
                  </div>
                  <span className="text-[11px] text-teal-700 italic">
                    (Em hãy tự đọc câu hỏi và suy nghĩ)
                  </span>
                </div>

                <div className="space-y-3">
                  {diagnosticResult.socraticQuestions.map((q, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-teal-100 shadow-2xs">
                      <div className="text-xs font-medium text-slate-900 mb-1.5 flex items-start gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <MathRenderer content={q} />
                        </div>
                      </div>

                      {/* Interactive Student Self-Reflection Input */}
                      <div className="mt-2 pt-2 border-t border-slate-100 no-print">
                        <label htmlFor={`soc-q-${idx}`} className="block text-[11px] text-slate-500 mb-1">
                          ✍️ Câu trả lời tự suy ngẫm của em:
                        </label>
                        <input
                          id={`soc-q-${idx}`}
                          type="text"
                          value={answers[idx] || ''}
                          onChange={(e) => handleAnswerChange(idx, e.target.value)}
                          placeholder="Ví dụ: Em nhận thấy x = 3 làm vế phải âm, không thỏa mãn..."
                          className="w-full text-xs p-2 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50/50 text-slate-800"
                        />
                      </div>
                    </div>
                  ))}

                  {/* Save button for interactive practice */}
                  <div className="flex items-center justify-end gap-2 pt-1 no-print">
                    {savedSuccess && (
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Đã lưu câu trả lời tự sửa!
                      </span>
                    )}
                    <button
                      onClick={handleSaveSelfCorrection}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      Lưu bài tự sửa & Báo cáo đã khắc phục
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Block 3: 2 Follow-Up Equivalent Problems */}
            {diagnosticResult.followUpProblems && diagnosticResult.followUpProblems.length > 0 && (
              <section className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                  <Target className="w-4 h-4 text-indigo-600" />
                  2 Bài tập tương đồng củng cố kiến thức
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Sau khi đã tự tìm ra lỗi ở trên, hãy tự giải 2 bài toán sau để kiểm chứng mức độ làm chủ kiến thức:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {diagnosticResult.followUpProblems.map((prob) => (
                    <div
                      key={prob.id}
                      className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-indigo-900">{prob.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {prob.difficulty}
                          </span>
                        </div>
                        <div className="text-xs text-slate-800 my-2">
                          <MathRenderer content={prob.content} />
                        </div>
                      </div>
                      {prob.initialHint && (
                        <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded">
                          💡 <span className="font-medium text-slate-600">Gợi ý bước 1:</span> {prob.initialHint}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* For Correct Submissions: Advanced Challenge Section */
          <div className="space-y-6">
            <section className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 mb-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                Đánh giá phương pháp & Phẩm chất Toán học
              </div>
              <p className="text-xs text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-emerald-100">
                {diagnosticResult.praiseComment ||
                  'Em đã thể hiện tư duy suy luận rất chặt chẽ. Việc cẩn trọng kiểm tra điều kiện ngay từ bước đầu là phẩm chất tối quan trọng của học sinh chuyên Toán. Hãy tiếp tục duy trì phong độ này trong các kỳ thi sắp tới.'}
              </p>
            </section>

            {diagnosticResult.followUpProblems && diagnosticResult.followUpProblems.length > 0 && (
              <section className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4 text-amber-600" />
                  2 Bài tập thử thách nâng cao (Vận dụng cao & Liên hệ thực tiễn)
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Dành riêng cho học sinh đã nắm vững dạng toán cơ bản để bứt phá điểm 9 - 10:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {diagnosticResult.followUpProblems.map((prob) => (
                    <div
                      key={prob.id}
                      className="bg-white p-3.5 rounded-lg border border-amber-200/80 shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-slate-900">{prob.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            {prob.difficulty}
                          </span>
                        </div>
                        <div className="text-xs text-slate-800 my-2">
                          <MathRenderer content={prob.content} />
                        </div>
                      </div>
                      {prob.initialHint && (
                        <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-amber-800/90 italic bg-amber-50/50 p-1.5 rounded">
                          🎯 <span className="font-semibold">Định hướng giải:</span> {prob.initialHint}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* 5. Pedagogical Signature Footer */}
        <footer className="mt-10 pt-4 border-t-2 border-slate-300 text-xs text-slate-600">
          <div className="flex justify-between items-end">
            <div>
              <div className="font-mono text-[10px] text-slate-400">
                DIGITAL SIGNATURE HASH: MD-GDPT2018-{submission.id.toUpperCase()}-VERIFIED
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                MathDiagnostic Socratic Verification Engine &copy; 2026 Bộ GD&ĐT
              </p>
            </div>

            <div className="text-center font-serif">
              <p className="text-[11px] italic text-slate-500 mb-1">Hà Nội, ngày 16 tháng 10 năm 2026</p>
              <p className="font-bold text-slate-900 text-xs">BAN CHUYÊN MÔN TOÁN HỌC</p>
              <div className="h-12 flex items-center justify-center">
                <span className="font-cursive text-emerald-700 font-bold text-base rotate-[-6deg] inline-block border-b border-emerald-600">
                  MathDiagnostic AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400">(Ký điện tử & Đóng dấu số)</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default A4DiagnosticSheet;
