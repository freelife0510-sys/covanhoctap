import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Target, 
  FileSpreadsheet,
  Award
} from 'lucide-react';
import { A4DocumentExportData, exportA4ToWordDocument } from '../utils/wordExport.ts';
import MathRenderer from './MathRenderer.tsx';

interface A4DocumentViewerProps {
  data: A4DocumentExportData | null;
  onPrint?: () => void;
}

export const A4DocumentViewer: React.FC<A4DocumentViewerProps> = ({
  data,
  onPrint,
}) => {
  const [copiedMd, setCopiedMd] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);

  if (!data) {
    return (
      <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
          <FileText className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="text-base font-bold text-slate-800">
            Trình soạn thảo & Phiếu Học tập A4 Sư phạm
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Nhập câu hỏi, bài tập hoặc tải ảnh bài làm lên khung chat bên trái. Cố vấn AI sẽ lập tức chẩn đoán, ra bài tập tự động và xuất bản phiếu A4 chuẩn mực tại đây để em đọc và tải file Word MathType!
          </p>
        </div>
      </div>
    );
  }

  // Tải file Word (.doc/.docx)
  const handleExportWord = () => {
    setIsExportingWord(true);
    try {
      exportA4ToWordDocument(data);
    } catch (e) {
      console.error('Lỗi xuất Word:', e);
      alert('Không thể tạo file Word. Vui lòng thử lại!');
    } finally {
      setTimeout(() => setIsExportingWord(false), 800);
    }
  };

  // Sao chép dạng Markdown
  const handleCopyMarkdown = () => {
    let md = `# ${data.title}\n\n`;
    md += `* **Học sinh:** ${data.studentName || 'Học sinh'} (Mã: ${data.studentId || 'HS'})\n`;
    md += `* **Lớp:** ${data.className || 'Toán THPT'}\n`;
    md += `* **Giáo viên:** ${data.teacherName || 'Bộ môn Toán'}\n\n`;
    md += `## I. ĐỀ BÀI TOÁN\n${data.problemText}\n\n`;
    if (data.solutionText) {
      md += `## BÀI GIẢI CỦA HỌC SINH\n${data.solutionText}\n\n`;
    }
    if (data.detailedSolution) {
      md += `## HƯỚNG DẪN GIẢI CHI TIẾT & BẢNG BIẾN THIÊN CHUẨN MỰC\n${data.detailedSolution}\n\n`;
    }
    if (data.errorCategory) {
      md += `> ⚠️ **Vùng trũng kiến thức phát hiện:** ${data.errorCategory}\n\n`;
    }
    if (data.keyInsight) {
      md += `* **Điểm then chốt cần khắc phục:** ${data.keyInsight}\n\n`;
    }
    if (data.theorySummary) {
      md += `## III. LÝ THUYẾT & CÔNG THỨC THEN CHỐT\n${data.theorySummary}\n\n`;
    }
    if (data.formulasNeeded && data.formulasNeeded.length > 0) {
      md += `### Bảng công thức cần nhớ:\n`;
      data.formulasNeeded.forEach((f) => {
        md += `- $${f}$\n`;
      });
      md += `\n`;
    }
    if (data.followUpProblems && data.followUpProblems.length > 0) {
      md += `## IV. BÀI TẬP RÈN LUYỆN TỰ ĐỘNG PHÂN HÓA (GDPT 2018)\n`;
      data.followUpProblems.forEach((p, idx) => {
        md += `### Bài ${idx + 1} (${p.difficulty}): ${p.title}\n${p.content}\n`;
        if (p.initialHint) md += `*Gợi ý:* ${p.initialHint}\n\n`;
      });
    }

    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleTriggerPrint = () => {
    if (onPrint) onPrint();
    else window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 no-print">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block leading-tight">
              Tờ Phiếu Học Tập A4 Sư Phạm
            </span>
            <span className="text-[10px] text-slate-400">
              Chuẩn GDPT 2018 • KaTeX & MathType Ready
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Tải về file Word (.docx / .doc) */}
          <button
            type="button"
            onClick={handleExportWord}
            disabled={isExportingWord}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Tải về file Microsoft Word (.doc/.docx) chứa công thức toán MathType"
          >
            <Download className="w-3.5 h-3.5 text-blue-200" />
            <span>{isExportingWord ? 'Đang tạo Word...' : 'Tải File Word (.docx) MathType'}</span>
          </button>

          {/* In tờ A4 */}
          <button
            type="button"
            onClick={handleTriggerPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
            title="In trang A4 chuẩn (window.print)"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">In tờ A4</span>
          </button>

          {/* Sao chép Markdown */}
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-all border border-slate-200 cursor-pointer"
            title="Sao chép nội dung định dạng Markdown"
          >
            {copiedMd ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Đã chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Markdown</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* A4 Document Paper Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 font-serif text-slate-900 leading-relaxed text-xs sm:text-[13px] print:p-0 print:border-none print:shadow-none space-y-6">
        
        {/* Header Quốc hiệu / Tiêu ngữ & Đơn vị */}
        <div className="border-b-2 border-slate-900 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
          <div className="space-y-0.5">
            <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500">
              BỘ GIÁO DỤC VÀ ĐÀO TẠO
            </p>
            <p className="text-xs font-sans font-black tracking-tight text-emerald-800">
              MATHDIAGNOSTIC AI — GDPT 2018
            </p>
            <p className="text-[10px] font-sans text-slate-400">
              Cố vấn Chẩn đoán Thích ứng Vùng trũng Toán THPT
            </p>
          </div>

          <div className="text-left sm:text-right space-y-0.5">
            <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-800">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="text-[10px] font-sans italic text-slate-600">
              Độc lập – Tự do – Hạnh phúc
            </p>
            <p className="text-[9px] font-sans text-slate-400">
              Ngày lập: {data.timestamp || new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        {/* Tiêu đề chính */}
        <div className="text-center space-y-1">
          <h2 className="text-base sm:text-xl font-bold font-serif uppercase tracking-tight text-slate-900">
            PHIẾU HỌC TẬP & CHẨN ĐOÁN SƯ PHẠM
          </h2>
          <p className="text-xs font-sans font-semibold text-emerald-700">
            Chuyên đề Năng lực Tư duy & Bù đắp Vùng trũng Toán học GDPT 2018
          </p>
        </div>

        {/* Khung Thông tin Học sinh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50/80 rounded-2xl border border-slate-200 text-xs font-sans">
          <div>
            <span className="text-slate-500">Họ và tên:</span>{' '}
            <strong className="text-slate-900">{data.studentName || 'Học sinh'}</strong>
            <span className="mx-2 text-slate-300">•</span>
            <span className="text-slate-500">Mã định danh:</span>{' '}
            <strong className="font-mono text-emerald-800">{data.studentId || 'HS-MAT'}</strong>
          </div>
          <div>
            <span className="text-slate-500">Lớp:</span>{' '}
            <strong className="text-slate-900">{data.className || 'Toán THPT'}</strong>
            <span className="mx-2 text-slate-300">•</span>
            <span className="text-slate-500">Giáo viên:</span>{' '}
            <strong className="text-slate-800">{data.teacherName || 'Bộ môn Toán'}</strong>
          </div>
        </div>

        {/* PHẦN I. ĐỀ BÀI TOÁN */}
        <div className="space-y-2">
          <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-emerald-600 pb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            I. ĐỀ BÀI TOÁN
          </h3>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-900 font-sans text-xs sm:text-sm">
            <MathRenderer content={data.problemText} />
          </div>
        </div>

        {/* PHẦN II. BÀI LÀM CỦA HỌC SINH (NẾU CÓ) */}
        {data.solutionText && (
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-emerald-600 pb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              BÀI LÀM / BÀI GIẢI CỦA HỌC SINH
            </h3>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 font-mono text-xs whitespace-pre-wrap">
              <MathRenderer content={data.solutionText} />
            </div>
          </div>
        )}

        {/* HƯỚNG DẪN GIẢI CHI TIẾT & BẢNG BIẾN THIÊN CHUẨN MỰC (TOÀN BỘ CÂU TRẢ LỜI ĐẶT TẠI ĐÂY) */}
        {data.detailedSolution && (
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-emerald-950 border-b-2 border-emerald-600 pb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                II. HƯỚNG DẪN GIẢI CHI TIẾT & BẢNG BIẾN THIÊN CHUẨN MỰC
              </span>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                Sư phạm GDPT 2018
              </span>
            </h3>
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/90 text-slate-900 font-sans text-xs sm:text-[13px] leading-relaxed shadow-2xs">
              <MathRenderer content={data.detailedSolution} />
            </div>
          </div>
        )}

        {/* PHẦN III. CHẨN ĐOÁN SƯ PHẠM & PHƯƠNG PHÁP TƯ DUY */}
        <div className="space-y-3">
          <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-emerald-600 pb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            III. CHẨN ĐOÁN SƯ PHẠM & PHƯƠNG PHÁP TƯ DUY (SOCRATIC)
          </h3>

          {/* Vùng trũng badge */}
          {data.errorCategory && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 font-sans text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Vùng trũng kiến thức phát hiện:</strong> {data.errorCategory}
              </span>
            </div>
          )}

          {/* Điểm then chốt */}
          {data.keyInsight && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 font-sans text-xs leading-relaxed">
              <strong>Điểm mấu chốt cần khắc phục:</strong> <MathRenderer content={data.keyInsight} inline />
            </div>
          )}

          {/* Tóm tắt lý thuyết */}
          {data.theorySummary && (
            <div className="text-slate-800 font-sans text-xs leading-relaxed">
              <MathRenderer content={data.theorySummary} />
            </div>
          )}

          {/* Bảng công thức then chốt */}
          {data.formulasNeeded && data.formulasNeeded.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 font-sans">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                Bảng công thức cốt lõi bắt buộc nhớ:
              </span>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-800">
                {data.formulasNeeded.map((f, idx) => (
                  <li key={idx}>
                    <MathRenderer content={f} inline />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Câu hỏi gợi mở Socratic */}
          {data.socraticQuestions && data.socraticQuestions.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5 font-sans">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                Câu hỏi vấn đáp gợi mở tư duy (Socratic):
              </span>
              <ol className="list-decimal pl-5 space-y-1 text-xs text-blue-950">
                {data.socraticQuestions.map((q, idx) => (
                  <li key={idx}>
                    <MathRenderer content={q} inline />
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* PHẦN IV. BÀI TẬP RÈN LUYỆN TỰ ĐỘNG PHÂN HÓA */}
        {data.followUpProblems && data.followUpProblems.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-emerald-600 pb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              IV. BÀI TẬP RÈN LUYỆN TỰ ĐỘNG PHÂN HÓA (GDPT 2018)
            </h3>

            <div className="space-y-3 font-sans">
              {data.followUpProblems.map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-2 hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      Bài {idx + 1}: {p.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.difficulty === 'Nâng cao' || p.difficulty === 'Vận dụng'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.difficulty}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-800">
                    <MathRenderer content={p.content} />
                  </div>

                  {p.initialHint && (
                    <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                      <strong>Gợi ý tư duy:</strong> <MathRenderer content={p.initialHint} inline />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHẦN V. LỜI DẶN SƯ PHẠM */}
        {data.pedagogicalAdvice && (
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-emerald-600 pb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              V. LỜI DẶN SƯ PHẠM
            </h3>
            <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 font-sans text-xs text-indigo-950 italic">
              <MathRenderer content={data.pedagogicalAdvice} />
            </div>
          </div>
        )}

        {/* Chữ ký xác nhận */}
        <div className="pt-6 grid grid-cols-2 gap-4 text-center font-sans text-xs text-slate-700">
          <div>
            <p className="font-bold">HỌC SINH TỰ RÈN LUYỆN</p>
            <p className="text-[10px] text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
            <div className="h-12"></div>
            <p className="font-bold text-slate-900">{data.studentName || 'Học sinh'}</p>
          </div>
          <div>
            <p className="font-bold">CỐ VẤN SƯ PHẠM / GIÁO VIÊN</p>
            <p className="text-[10px] text-slate-400 italic">(Xác nhận tiến độ)</p>
            <div className="h-12"></div>
            <p className="font-bold text-slate-900">{data.teacherName || 'Bộ môn Toán'}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default A4DocumentViewer;
