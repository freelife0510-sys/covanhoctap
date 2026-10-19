import { DiagnosticResult, ErrorCategory } from '../types/index.ts';
import { analyzeMathSubmissionLocal } from '../utils/mathEvaluation.ts';
import { GoogleGenAI } from '@google/genai';
import { A4DocumentExportData } from '../utils/wordExport.ts';

export interface EvaluationResponse {
  isCorrect: boolean;
  errorCategory?: ErrorCategory;
  diagnosticResult: DiagnosticResult;
  usedAI: boolean;
  modelName?: string;
}

export interface ChatAssistantResponse {
  chatReply: string; // Markdown answer with LaTeX formulas
  a4Data: A4DocumentExportData;
  isCorrect?: boolean;
  errorCategory?: ErrorCategory;
  generatedProblems: {
    id: number;
    title: string;
    content: string;
    difficulty: string;
    initialHint?: string;
  }[];
}

const SYSTEM_INSTRUCTION = `Bạn là Cố vấn Sư phạm Toán THPT theo phương pháp Socratic chuẩn chương trình GDPT 2018 của Bộ Giáo dục & Đào tạo Việt Nam.
Nhiệm vụ của bạn:
1. Trả lời câu hỏi thắc mắc, phương pháp giải, hoặc thẩm định bài làm của học sinh (nhận qua văn bản, file Word .docx, file PDF hoặc ảnh chụp chữ viết tay).
2. NẾU HỌC SINH NỘP BÀI GIẢI ĐỂ THẨM ĐỊNH LỖI SAI:
   - KHÔNG đưa lời giải hoàn chỉnh ngay.
   - Nhận diện chính xác mắt xích sai sót và phân loại lỗi: "Chưa đặt điều kiện xác định", "Biến đổi đại số sai", "Nhầm lẫn định lý/công thức", "Thiếu nghiệm ngoại lai", "Lập luận hình học sai", "Khác".
   - Tóm tắt công thức và định lý bắt buộc áp dụng ($...$).
   - Đặt câu hỏi gợi mở Socratic để học sinh tự nhận ra lỗi sai.
   - Tự động ra 2-3 BÀI TẬP RÈN LUYỆN TƯƠNG ĐƯƠNG để học sinh luyện tập khắc sâu.
3. NẾU HỌC SINH HỎI DẠNG BÀI TOÁN CHƯA BIẾT CÁCH LÀM:
   - Trình bày sơ đồ tư duy & phương pháp giải bài bản từng bước (Step-by-step).
   - Liệt kê bảng công thức cốt lõi.
   - Đưa ra ví dụ minh họa và tự động ra 2-3 BÀI TẬP RÈN LUYỆN CÙNG DẠNG có đáp án gợi ý.
4. NẾU HỌC SINH LÀM ĐÚNG:
   - Biểu dương tư duy logic, tính chính xác và sáng tạo.
   - Tự động ra bài tập nâng cao (Vận dụng cao GDPT 2018).

Bạn PHẢI trả về ĐÚNG định dạng JSON theo schema:
{
  "chatReply": "Văn bản phản hồi học sinh bằng Markdown, có công thức LaTeX $...$, giọng văn sư phạm ấm áp, khích lệ",
  "isCorrect": boolean hoặc null,
  "errorCategory": "Chưa đặt điều kiện xác định" | "Biến đổi đại số sai" | "Nhầm lẫn định lý/công thức" | "Thiếu nghiệm ngoại lai" | "Lập luận hình học sai" | "Khác" | null,
  "keyInsight": "Điểm mấu chốt then chốt học sinh cần nắm",
  "theorySummary": "Tóm tắt lý thuyết và định lý bắt buộc nhớ dạng LaTeX $...$",
  "formulasNeeded": ["Công thức LaTeX 1", "Công thức LaTeX 2"],
  "socraticQuestions": ["Câu hỏi gợi mở 1", "Câu hỏi gợi mở 2"],
  "pedagogicalAdvice": "Lời dặn sư phạm dành cho học sinh",
  "followUpProblems": [
    {
      "id": 1,
      "title": "Tên bài tập",
      "content": "Nội dung bài tập với công thức LaTeX $...$",
      "difficulty": "Tương đương" hoặc "Vận dụng",
      "initialHint": "Gợi ý bước giải"
    },
    {
      "id": 2,
      "title": "Tên bài tập 2",
      "content": "Nội dung bài tập với công thức LaTeX $...$",
      "difficulty": "Tương đương" hoặc "Nâng cao",
      "initialHint": "Gợi ý bước giải"
    }
  ]
}`;

/**
 * Xử lý tương tác trò chuyện thông minh giữa Học sinh và Trợ lý Cố vấn AI Sư phạm
 */
export async function processStudentChatInteraction(
  userMessage: string,
  attachedFileText?: string,
  imageBase64?: string,
  userApiKey?: string,
  studentInfo?: { name: string; id: string; className: string }
): Promise<ChatAssistantResponse> {
  const apiKey = userApiKey || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') || '';

  // Kết hợp nội dung tin nhắn và nội dung tệp đính kèm
  let fullPrompt = userMessage.trim();
  if (attachedFileText) {
    fullPrompt += `\n\n[NỘI DUNG TỆP ĐÍNH KÈM CỦA HỌC SINH]:\n${attachedFileText}`;
  }

  // Nếu có API Key của Gemini
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const contents: Array<Record<string, unknown> | string> = [];

      contents.push(fullPrompt);

      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        contents.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64,
          },
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = response.text || '';
      const parsed = JSON.parse(responseText);

      const generatedProblems = (parsed.followUpProblems || []).map((p: any, idx: number) => ({
        id: idx + 1,
        title: p.title || `Bài tập rèn luyện ${idx + 1}`,
        content: p.content || '',
        difficulty: p.difficulty || 'Tương đương',
        initialHint: p.initialHint || '',
      }));

      const a4Data: A4DocumentExportData = {
        title: 'Phiếu Học Tập & Chẩn Đoán Sư Phạm GDPT 2018',
        studentName: studentInfo?.name || 'Học sinh',
        studentId: studentInfo?.id || 'HS-MAT',
        className: studentInfo?.className || 'Toán THPT',
        teacherName: 'Cố vấn Sư phạm AI & Giáo viên Bộ môn',
        problemText: userMessage || attachedFileText || 'Câu hỏi bài tập Toán',
        solutionText: attachedFileText && attachedFileText !== userMessage ? attachedFileText : undefined,
        isCorrect: parsed.isCorrect ?? undefined,
        errorCategory: parsed.errorCategory || undefined,
        keyInsight: parsed.keyInsight || 'Nắm vững bản chất định lý và tập xác định.',
        theorySummary: parsed.theorySummary || 'Ôn tập quy tắc biến đổi tương đương và phương pháp giải chuẩn mực.',
        formulasNeeded: parsed.formulasNeeded || [],
        socraticQuestions: parsed.socraticQuestions || [],
        followUpProblems: generatedProblems,
        pedagogicalAdvice: parsed.pedagogicalAdvice || 'Kiên trì rèn luyện thói quen tự vấn đáp và kiểm tra nghiệm ngoại lai.',
      };

      return {
        chatReply: parsed.chatReply || 'Cố vấn AI đã phân tích câu hỏi và lập Phiếu học tập A4 bên cạnh cho em!',
        a4Data,
        isCorrect: parsed.isCorrect ?? undefined,
        errorCategory: parsed.errorCategory || undefined,
        generatedProblems,
      };
    } catch (err) {
      console.warn('Lỗi gọi Gemini API trong chatbox, chuyển sang Smart Socratic Engine:', err);
    }
  }

  // Fallback Engine cục bộ Sư phạm chuẩn GDPT 2018 (hoạt động mượt mà không cần mạng)
  await new Promise((resolve) => setTimeout(resolve, 600));

  const localEval = analyzeMathSubmissionLocal(
    fullPrompt,
    attachedFileText || ''
  );

  const defaultProblems = [
    {
      id: 1,
      title: 'Bài tập rèn luyện tương đương 1',
      content: 'Giải phương trình vô tỉ trên tập số thực $\\mathbb{R}$:\n$$\\sqrt{2x - 3} = x - 3$$',
      difficulty: 'Tương đương',
      initialHint: 'Đặt điều kiện vế phải $x - 3 \\ge 0 \\Leftrightarrow x \\ge 3$ trước khi bình phương hai vế.',
    },
    {
      id: 2,
      title: 'Bài tập vận dụng phân hóa 2',
      content: 'Tìm tất cả các giá trị thực của tham số $m$ để phương trình $\\sqrt{x + 1} = x + m$ có 2 nghiệm phân biệt.',
      difficulty: 'Vận dụng',
      initialHint: 'Cô lập tham số $m$ hoặc biến đổi về phương trình bậc hai với điều kiện $x \\ge -m$.',
    },
  ];

  const chatReply = localEval.isCorrect
    ? `### 🌟 Nhận xét Sư phạm:\n\nThầy/Cô và Cố vấn AI rất khen ngợi lời giải của em! Các bước lập luận biến đổi đại số rất chặt chẽ, chính xác và có đối chiếu điều kiện đầy đủ.\n\n👉 **Phiếu học tập A4 bên phải** đã tự động cập nhật bài làm chuẩn mực cùng **2 bài tập nâng cao** để em thử sức tiếp!`
    : `### 🧭 Chẩn đoán Sư phạm:\n\nQua kiểm tra bài làm của em, Cố vấn AI nhận thấy em đang gặp điểm nghẽn ở: **${localEval.errorCategory || 'Điều kiện xác định'}**.\n\n* **Điểm then chốt:** ${localEval.diagnosticResult.keyInsight || 'Cần đặt điều kiện vế phải không âm trước khi thực hiện phép biến đổi.'}\n* **Gợi ý Socratic:** ${localEval.diagnosticResult.socraticQuestions?.[0] || 'Vế trái luôn không âm, vậy vế phải cần điều kiện gì?'}\n\n👉 **Xem ngay Phiếu A4 chi tiết ở cột bên phải** để nắm bảng công thức và luyện tập **2 bài tập cùng dạng** thầy cô vừa tạo tự động cho em nhé!`;

  const a4Data: A4DocumentExportData = {
    title: 'Phiếu Học Tập & Chẩn Đoán Sư Phạm GDPT 2018',
    studentName: studentInfo?.name || 'Học sinh',
    studentId: studentInfo?.id || 'HS-MAT',
    className: studentInfo?.className || 'Toán THPT',
    teacherName: 'Cố vấn Sư phạm AI & Giáo viên Bộ môn',
    problemText: fullPrompt,
    solutionText: attachedFileText || undefined,
    isCorrect: localEval.isCorrect,
    errorCategory: localEval.errorCategory,
    keyInsight: localEval.diagnosticResult.keyInsight,
    theorySummary: localEval.diagnosticResult.theorySummary,
    formulasNeeded: localEval.diagnosticResult.formulasNeeded,
    socraticQuestions: localEval.diagnosticResult.socraticQuestions,
    followUpProblems: defaultProblems,
    pedagogicalAdvice: localEval.diagnosticResult.pedagogicalAdviceForTeacher || 'Học sinh nên giải lại bài toán trên giấy nháp và đối chiếu điều kiện chặt chẽ.',
  };

  return {
    chatReply,
    a4Data,
    isCorrect: localEval.isCorrect,
    errorCategory: localEval.errorCategory,
    generatedProblems: defaultProblems,
  };
}

/**
 * Evaluates a student math submission using Google Gemini or intelligent fallback.
 */
export async function evaluateMathSubmission(
  problemText: string,
  solutionText?: string,
  imageBase64?: string,
  userApiKey?: string
): Promise<EvaluationResponse> {
  const apiKey = userApiKey || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') || '';

  if (!apiKey && !imageBase64) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const localResult = analyzeMathSubmissionLocal(problemText, solutionText || '');
    return {
      ...localResult,
      usedAI: false,
      modelName: 'MathDiagnostic Heuristic Engine (GDPT 2018)',
    };
  }

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const contents: Array<Record<string, unknown> | string> = [];

      let userTextPrompt = `ĐỀ BÀI TOÁN:\n${problemText}\n\n`;
      if (solutionText) {
        userTextPrompt += `BÀI LÀM CỦA HỌC SINH:\n${solutionText}\n\n`;
      }
      if (imageBase64) {
        userTextPrompt += `(Có đính kèm ảnh bài làm viết tay bên dưới).\n\n`;
      }
      userTextPrompt += `Hãy thẩm định sư phạm và trả về JSON chuẩn theo yêu cầu.`;

      contents.push(userTextPrompt);

      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        contents.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64,
          },
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '';
      const parsed = JSON.parse(responseText);

      if (typeof parsed.isCorrect === 'boolean' && parsed.diagnosticResult) {
        return {
          isCorrect: parsed.isCorrect,
          errorCategory: parsed.errorCategory || 'Khác',
          diagnosticResult: {
            theorySummary: parsed.diagnosticResult.theorySummary || '',
            formulasNeeded: parsed.diagnosticResult.formulasNeeded || [],
            socraticQuestions: parsed.diagnosticResult.socraticQuestions || [],
            praiseComment: parsed.diagnosticResult.praiseComment || '',
            keyInsight: parsed.diagnosticResult.keyInsight || '',
            pedagogicalAdviceForTeacher: parsed.diagnosticResult.pedagogicalAdviceForTeacher || '',
            followUpProblems: (parsed.diagnosticResult.followUpProblems || []).slice(0, 2),
          },
          usedAI: true,
          modelName: 'Gemini 2.5 Flash',
        };
      }
    } catch (err) {
      console.warn('Gemini API call encountered an issue, falling back to local pedagogical engine:', err);
    }
  }

  const localResult = analyzeMathSubmissionLocal(problemText, solutionText || '');
  return {
    ...localResult,
    usedAI: false,
    modelName: 'MathDiagnostic Socratic Engine (Local Fallback)',
  };
}
