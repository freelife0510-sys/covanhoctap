import katex from 'katex';
import { MathSubmission, StudentAccount } from '../types/index.ts';

export interface A4DocumentExportData {
  title: string;
  studentName?: string;
  studentId?: string;
  className?: string;
  teacherName?: string;
  timestamp?: string;
  problemText: string;
  solutionText?: string;
  detailedSolution?: string;
  isCorrect?: boolean;
  errorCategory?: string;
  keyInsight?: string;
  theorySummary?: string;
  formulasNeeded?: string[];
  socraticQuestions?: string[];
  followUpProblems?: {
    id: number;
    title: string;
    content: string;
    difficulty: string;
    initialHint?: string;
  }[];
  pedagogicalAdvice?: string;
}

/**
 * Chuyển đổi công thức LaTeX trong văn bản thành thẻ MathML chuẩn
 * để Microsoft Word / MathType tự động nhận diện thành công thức toán học có thể chỉnh sửa.
 */
export function convertTextFormulasToMathML(text: string): string {
  if (!text) return '';

  // 1. Chuyển đổi khối công thức độc lập $$...$$
  let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      const mathml = katex.renderToString(math.trim(), {
        output: 'mathml',
        throwOnError: false,
        displayMode: true,
      });
      return `<div style="text-align: center; margin: 12pt 0; font-family: 'Cambria Math', 'Times New Roman';">${mathml}</div>`;
    } catch {
      return `<div style="text-align: center; margin: 12pt 0; font-family: 'Cambria Math';">$$${math}$$</div>`;
    }
  });

  // 2. Chuyển đổi công thức nội dòng $...$
  result = result.replace(/\$([^$\n]+?)\$/g, (_, math) => {
    try {
      const mathml = katex.renderToString(math.trim(), {
        output: 'mathml',
        throwOnError: false,
        displayMode: false,
      });
      return `<span style="font-family: 'Cambria Math', 'Times New Roman';">${mathml}</span>`;
    } catch {
      return `<span style="font-family: 'Cambria Math';">$${math}$</span>`;
    }
  });

  // Chuyển đổi xuống dòng thành <br/>
  result = result.replace(/\n/g, '<br/>');

  return result;
}

/**
 * Xuất tài liệu học tập & chẩn đoán sang định dạng Microsoft Word (.doc/.docx)
 * chuẩn trang in A4, font Times New Roman, tương thích 100% MathType và Word Equations.
 */
export function exportA4ToWordDocument(data: A4DocumentExportData): void {
  const now = new Date();
  const dateStr =
    data.timestamp ||
    `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const convertedProblem = convertTextFormulasToMathML(data.problemText);
  const convertedSolution = data.solutionText ? convertTextFormulasToMathML(data.solutionText) : '';
  const convertedDetailedSolution = data.detailedSolution ? convertTextFormulasToMathML(data.detailedSolution) : '';
  const convertedKeyInsight = data.keyInsight ? convertTextFormulasToMathML(data.keyInsight) : '';
  const convertedTheory = data.theorySummary ? convertTextFormulasToMathML(data.theorySummary) : '';
  const convertedAdvice = data.pedagogicalAdvice ? convertTextFormulasToMathML(data.pedagogicalAdvice) : '';

  // Danh sách công thức then chốt
  let formulasHtml = '';
  if (data.formulasNeeded && data.formulasNeeded.length > 0) {
    formulasHtml = `
      <div style="background-color: #f0fdf4; border: 1pt solid #86efac; padding: 10pt; margin: 8pt 0; border-radius: 6pt;">
        <p style="font-weight: bold; color: #166534; margin: 0 0 6pt 0;">CÔNG THỨC & ĐỊNH LÝ CỐT LÕI CẦN NHỚ:</p>
        <ul style="margin: 0; padding-left: 18pt;">
          ${data.formulasNeeded
            .map((f) => `<li style="margin-bottom: 4pt;">${convertTextFormulasToMathML(f)}</li>`)
            .join('')}
        </ul>
      </div>
    `;
  }

  // Câu hỏi gợi mở Socratic
  let socraticHtml = '';
  if (data.socraticQuestions && data.socraticQuestions.length > 0) {
    socraticHtml = `
      <div style="background-color: #eff6ff; border: 1pt solid #93c5fd; padding: 10pt; margin: 8pt 0; border-radius: 6pt;">
        <p style="font-weight: bold; color: #1e40af; margin: 0 0 6pt 0;">CÂU HỎI VẤN ĐÁP TRUY HỒI TƯ DUY (SOCRATIC):</p>
        <ol style="margin: 0; padding-left: 18pt;">
          ${data.socraticQuestions
            .map((q) => `<li style="margin-bottom: 4pt;">${convertTextFormulasToMathML(q)}</li>`)
            .join('')}
        </ol>
      </div>
    `;
  }

  // Hệ thống bài tập rèn luyện tương đương & nâng cao
  let followUpHtml = '';
  if (data.followUpProblems && data.followUpProblems.length > 0) {
    followUpHtml = `
      <h3 style="color: #0f172a; font-size: 13pt; margin-top: 16pt; margin-bottom: 6pt; border-bottom: 1.5pt solid #059669; padding-bottom: 3pt;">
        IV. BÀI TẬP RÈN LUYỆN TỰ ĐỘNG PHÂN HÓA (GDPT 2018)
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 8pt;">
        ${data.followUpProblems
          .map(
            (p, idx) => `
            <tr>
              <td style="border: 1pt solid #cbd5e1; padding: 8pt; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <p style="font-weight: bold; color: #047857; margin: 0 0 4pt 0;">
                  Bài ${idx + 1} (${p.difficulty}): ${p.title}
                </p>
                <div style="margin: 4pt 0; font-size: 11pt;">
                  ${convertTextFormulasToMathML(p.content)}
                </div>
                ${
                  p.initialHint
                    ? `<p style="font-size: 10pt; color: #64748b; font-style: italic; margin: 4pt 0 0 0;">
                        💡 Gợi ý tư duy: ${convertTextFormulasToMathML(p.initialHint)}
                      </p>`
                    : ''
                }
              </td>
            </tr>
          `
          )
          .join('')}
      </table>
    `;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${data.title}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page Section1 {
          size: 595.3pt 841.9pt; /* Chuẩn trang A4 */
          margin: 42.5pt 42.5pt 42.5pt 42.5pt;
          mso-header-margin: 35.4pt;
          mso-footer-margin: 35.4pt;
          mso-paper-source: 0;
        }
        div.Section1 { page: Section1; }
        body {
          font-family: 'Times New Roman', 'Cambria Math', serif;
          font-size: 12pt;
          line-height: 1.35;
          color: #0f172a;
          margin: 0;
          padding: 0;
        }
        h1, h2, h3, h4 {
          font-family: 'Times New Roman', serif;
          font-weight: bold;
        }
        p {
          margin-top: 3pt;
          margin-bottom: 5pt;
        }
        table {
          font-size: 11.5pt;
        }
        .header-table td {
          vertical-align: top;
        }
        .highlight-box {
          background-color: #f8fafc;
          border-left: 3.5pt solid #059669;
          padding: 8pt 10pt;
          margin: 8pt 0;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        
        <!-- Header Quốc hiệu / Tiêu ngữ & Đơn vị -->
        <table class="header-table" style="width: 100%; border-bottom: 2pt solid #0f172a; padding-bottom: 6pt; margin-bottom: 12pt;">
          <tr>
            <td style="width: 50%; text-align: left;">
              <p style="font-weight: bold; font-size: 10pt; margin: 0; text-transform: uppercase; color: #334155;">
                BỘ GIÁO DỤC VÀ ĐÀO TẠO
              </p>
              <p style="font-weight: bold; font-size: 10.5pt; margin: 2pt 0 0 0; color: #047857;">
                MATHDIAGNOSTIC AI — GDPT 2018
              </p>
              <p style="font-size: 9.5pt; color: #64748b; margin: 1pt 0 0 0;">
                Hệ thống Chẩn đoán Thích ứng Vùng trũng Toán THPT
              </p>
            </td>
            <td style="width: 50%; text-align: right;">
              <p style="font-weight: bold; font-size: 10pt; margin: 0; text-transform: uppercase;">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </p>
              <p style="font-size: 9.5pt; font-style: italic; margin: 2pt 0 0 0;">
                Độc lập – Tự do – Hạnh phúc
              </p>
              <p style="font-size: 9pt; color: #64748b; margin: 2pt 0 0 0;">
                Ngày lập: ${dateStr}
              </p>
            </td>
          </tr>
        </table>

        <!-- Tiêu đề chính -->
        <div style="text-align: center; margin-bottom: 14pt;">
          <h2 style="font-size: 16pt; color: #0f172a; margin: 0 0 4pt 0; text-transform: uppercase;">
            PHIẾU HỌC TẬP & CHẨN ĐOÁN SƯ PHẠM
          </h2>
          <p style="font-size: 11pt; color: #047857; font-weight: bold; margin: 0;">
            Chuyên đề Năng lực Tư duy & Bù đắp Vùng trũng Toán học
          </p>
        </div>

        <!-- Khung Thông tin Học sinh -->
        <table style="width: 100%; border: 1pt solid #cbd5e1; background-color: #f8fafc; margin-bottom: 12pt; border-collapse: collapse;">
          <tr>
            <td style="padding: 6pt 10pt; width: 50%; border-right: 1pt solid #cbd5e1;">
              <strong>Học sinh:</strong> ${data.studentName || 'Học sinh'}
              <br/>
              <strong>Mã định danh:</strong> <span style="font-family: 'Consolas', monospace;">${data.studentId || 'HS-MAT'}</span>
            </td>
            <td style="padding: 6pt 10pt; width: 50%;">
              <strong>Lớp:</strong> ${data.className || 'Toán THPT Chuẩn 2018'}
              <br/>
              <strong>Giáo viên phụ trách:</strong> ${data.teacherName || 'Bộ môn Toán THPT'}
            </td>
          </tr>
        </table>

        <!-- PHẦN I. ĐỀ BÀI TOÁN -->
        <h3 style="color: #0f172a; font-size: 13pt; margin-top: 10pt; margin-bottom: 4pt; border-bottom: 1.5pt solid #059669; padding-bottom: 2pt;">
          I. ĐỀ BÀI TOÁN
        </h3>
        <div class="highlight-box">
          ${convertedProblem}
        </div>

        ${
          convertedSolution
            ? `
            <h3 style="color: #0f172a; font-size: 13pt; margin-top: 12pt; margin-bottom: 4pt; border-bottom: 1.5pt solid #059669; padding-bottom: 2pt;">
              II. BÀI GIẢI CỦA HỌC SINH
            </h3>
            <div style="background-color: #fafafa; border: 1pt solid #e2e8f0; padding: 8pt 10pt; margin: 6pt 0;">
              ${convertedSolution}
            </div>
          `
            : ''
        }

        ${
          convertedDetailedSolution
            ? `
            <h3 style="color: #0f172a; font-size: 13pt; margin-top: 12pt; margin-bottom: 4pt; border-bottom: 1.5pt solid #059669; padding-bottom: 2pt;">
              HƯỚNG DẪN GIẢI CHI TIẾT & BẢNG BIẾN THIÊN CHUẨN MỰC
            </h3>
            <div style="background-color: #f0fdf4; border: 1pt solid #86efac; padding: 10pt 12pt; margin: 6pt 0; border-radius: 6pt;">
              ${convertedDetailedSolution}
            </div>
          `
            : ''
        }

        <!-- PHẦN III. PHÂN TÍCH CHẨN ĐOÁN & PHƯƠNG PHÁP GIẢI -->
        <h3 style="color: #0f172a; font-size: 13pt; margin-top: 12pt; margin-bottom: 4pt; border-bottom: 1.5pt solid #059669; padding-bottom: 2pt;">
          III. CHẨN ĐOÁN SƯ PHẠM & PHƯƠNG PHÁP TƯ DUY
        </h3>
        
        ${
          data.errorCategory
            ? `
            <div style="background-color: #fff1f2; border-left: 3pt solid #e11d48; padding: 6pt 10pt; margin: 6pt 0;">
              <p style="margin: 0; color: #9f1239; font-weight: bold;">
                ⚠️ VÙNG TRŨNG PHÁT HIỆN: ${data.errorCategory}
              </p>
            </div>
          `
            : ''
        }

        ${
          convertedKeyInsight
            ? `
            <p style="font-size: 11.5pt; margin: 6pt 0;">
              <strong>Điểm then chốt cần khắc phục:</strong> ${convertedKeyInsight}
            </p>
          `
            : ''
        }

        ${convertedTheory ? `<p style="margin: 6pt 0;">${convertedTheory}</p>` : ''}
        ${formulasHtml}
        ${socraticHtml}

        <!-- PHẦN IV. BÀI TẬP RÈN LUYỆN TỰ ĐỘNG -->
        ${followUpHtml}

        <!-- PHẦN V. LỜI DẶN SƯ PHẠM -->
        ${
          convertedAdvice
            ? `
            <h3 style="color: #0f172a; font-size: 13pt; margin-top: 14pt; margin-bottom: 4pt; border-bottom: 1.5pt solid #059669; padding-bottom: 2pt;">
              V. LỜI DẶN SƯ PHẠM TỪ CỐ VẤN GIÁO DỤC
            </h3>
            <div style="background-color: #f8fafc; border: 1pt dashed #94a3b8; padding: 8pt 10pt; margin: 6pt 0; font-style: italic;">
              ${convertedAdvice}
            </div>
          `
            : ''
        }

        <!-- Chữ ký / Xác nhận -->
        <table style="width: 100%; margin-top: 24pt; border-collapse: collapse;">
          <tr>
            <td style="width: 50%; text-align: center;">
              <p style="font-weight: bold; margin: 0;">HỌC SINH TỰ RÈN LUYỆN</p>
              <p style="font-size: 10pt; font-style: italic; color: #64748b; margin: 2pt 0 0 0;">(Ký và ghi rõ họ tên)</p>
              <div style="height: 45pt;"></div>
              <p style="font-weight: bold; margin: 0;">${data.studentName || 'Học sinh'}</p>
            </td>
            <td style="width: 50%; text-align: center;">
              <p style="font-weight: bold; margin: 0;">CỐ VẤN SƯ PHẠM / GIÁO VIÊN</p>
              <p style="font-size: 10pt; font-style: italic; color: #64748b; margin: 2pt 0 0 0;">(Xác nhận tiến độ)</p>
              <div style="height: 45pt;"></div>
              <p style="font-weight: bold; margin: 0;">${data.teacherName || 'Bộ môn Toán'}</p>
            </td>
          </tr>
        </table>

      </div>
    </body>
    </html>
  `;

  // Tạo blob với MIME type của Microsoft Word
  const blob = new Blob([htmlContent], {
    type: 'application/msword;charset=utf-8;',
  });

  const studentClean = (data.studentName || 'HocSinh').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `MathDiagnostic_PhieuA4_${studentClean}_${Date.now().toString().slice(-4)}.doc`;

  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
