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

export interface AIModelOption {
  id: string;
  name: string;
  description: string;
  badge?: string;
  recommended?: boolean;
}

export const AVAILABLE_AI_MODELS: AIModelOption[] = [
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro (Khuyên dùng)',
    description: 'Tư duy toán học chuyên sâu, phân tích sư phạm Socratic chuẩn GDPT 2018',
    badge: 'Chính xác nhất',
    recommended: true,
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash / 3.8 Flash',
    description: 'Phản hồi siêu tốc, phân tích đa phương thức, tạo đề bài toán tương đương tức thì',
    badge: 'Siêu tốc',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Suy luận đa bước logic, diễn giải sư phạm chặt chẽ',
    badge: 'Chuẩn mực',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Mô hình gọn nhẹ, ổn định và tiết kiệm tài nguyên',
    badge: 'Tiết kiệm',
  },
  {
    id: 'custom',
    name: 'Tùy chọn Model riêng (Custom Model)',
    description: 'Nhập bất kỳ model nào như gemini-3.1-pro-preview, gemini-3.8-flash...',
    badge: 'Mở rộng',
  },
];

export const DEFAULT_AI_MODEL = 'gemini-2.5-pro';

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
  modelUsed?: string;
}

const SYSTEM_INSTRUCTION = `Bạn là Cố vấn Sư phạm Toán THPT theo phương pháp Socratic chuẩn chương trình GDPT 2018 của Bộ Giáo dục & Đào tạo Việt Nam.
Nhiệm vụ của bạn là đồng hành, giải đáp và hướng dẫn học sinh THPT với tính sư phạm và độ chính xác toán học cao nhất.

QUY TẮC SƯ PHẠM ĐẶC BIỆT QUAN TRỌNG:
1. PHÂN BIỆT RÕ 2 TÌNH HUỐNG HỌC TẬP:
   A) TÌNH HUỐNG 1: HỌC SINH GÕ ĐỀ BÀI HOẶC HỎI CÁCH GIẢI BÀI TOÁN (chưa nộp lời giải)
      - Ví dụ: Bài toán ứng dụng đạo hàm tìm giá trị lớn nhất/nhỏ nhất (doanh thu chung cư, lợi nhuận, chi phí,...), bài toán khảo sát hàm số, hình học không gian, logarit,...
      - ĐÂY LÀ YÊU CẦU HỌC TẬP VÀ ĐỊNH HƯỚNG TƯ DUY, TUYỆT ĐỐI KHÔNG ĐƯỢC BÁO "LỖI SAI" HAY "NHẦM LẪN ĐỊNH LÝ"!
      - Đặt "isCorrect": true hoặc null, "errorCategory": null.
      - "keyInsight": Nêu rõ mô hình toán học và bản chất mấu chốt để giải quyết bài toán.
      - "theorySummary": Tóm tắt sơ đồ tư duy 4 bước và phương pháp giải chuẩn mực.
      - "formulasNeeded": Liệt kê đầy đủ các công thức LaTeX $...$ then chốt áp dụng trong bài toán.
      - "chatReply": Trình bày hướng dẫn tư duy từng bước (Step-by-step) mạch lạc, có lời giải chi tiết và đáp số cụ thể.
      - "followUpProblems": BẮT BUỘC RA 2 BÀI TẬP CÙNG DẠNG TOÁN VÀ CÙNG CHUYÊN ĐỀ (Ví dụ nếu đề bài là ứng dụng đạo hàm tối ưu hóa doanh thu thì 2 bài tập rèn luyện PHẢI là bài toán tối ưu hóa thực tiễn/kinh tế/cực trị; TUYỆT ĐỐI KHÔNG ĐƯỢC đưa bài toán phương trình vô tỉ hay dạng toán khác không liên quan!).

   B) TÌNH HUỐNG 2: HỌC SINH NỘP BÀI GIẢI ĐÃ LÀM (nhận qua văn bản hoặc ảnh chụp viết tay)
      - Thẩm định từng dòng suy luận để chỉ ra chính xác mắt xích bị lỗi.
      - Phân loại lỗi theo: "Chưa đặt điều kiện xác định", "Biến đổi đại số sai", "Nhầm lẫn định lý/công thức", "Thiếu nghiệm ngoại lai", "Lập luận hình học sai", "Khác".
      - Không cho lời giải ngay mà đặt câu hỏi gợi mở Socratic để học sinh tự nhận thức ra điểm sai.
      - Ra 2 bài tập tương đương cùng dạng để rèn luyện khắc sâu.

2. CÔNG THỨC TOÁN HỌC:
   - Sử dụng định dạng LaTeX chuẩn: $...$ cho công thức nội dòng, và $$...$$ cho công thức trên dòng riêng.

3. ĐỊNH DẠNG TRẢ VỀ (BẮT BUỘC ĐÚNG JSON THEO SCHEMA SAU):
{
  "chatReply": "Văn bản phản hồi học sinh bằng Markdown sư phạm, có công thức LaTeX $...$, giải thích rõ ràng, giọng văn truyền cảm hứng",
  "isCorrect": boolean hoặc null,
  "errorCategory": "Chưa đặt điều kiện xác định" | "Biến đổi đại số sai" | "Nhầm lẫn định lý/công thức" | "Thiếu nghiệm ngoại lai" | "Lập luận hình học sai" | "Khác" | null,
  "keyInsight": "Bản chất toán học và điểm mấu chốt then chốt",
  "theorySummary": "Tóm tắt phương pháp giải, định lý và sơ đồ tư duy dạng LaTeX $...$",
  "formulasNeeded": ["Công thức LaTeX 1", "Công thức LaTeX 2"],
  "socraticQuestions": ["Câu hỏi gợi mở 1", "Câu hỏi gợi mở 2"],
  "pedagogicalAdvice": "Lời dặn dò sư phạm dành cho học sinh",
  "followUpProblems": [
    {
      "id": 1,
      "title": "Tên bài tập cùng dạng 1",
      "content": "Nội dung bài toán cùng chuyên đề với công thức LaTeX $...$",
      "difficulty": "Tương đương",
      "initialHint": "Gợi ý các bước giải"
    },
    {
      "id": 2,
      "title": "Tên bài tập cùng dạng 2",
      "content": "Nội dung bài toán cùng chuyên đề với công thức LaTeX $...$",
      "difficulty": "Vận dụng",
      "initialHint": "Gợi ý các bước giải"
    }
  ]
}`;

/**
 * Xử lý tương tác trò chuyện thông minh giữa Học sinh và Trợ lý Cố vấn AI Sư phạm
 * Hỗ trợ kết nối sâu đa model: Gemini 2.5 Pro, 2.0 Flash / 3.8 Flash, 1.5 Pro, 1.5 Flash kèm Fallback Chain tự động
 */
export async function processStudentChatInteraction(
  userMessage: string,
  attachedFileText?: string,
  imageBase64?: string,
  userApiKey?: string,
  studentInfo?: { name: string; id: string; className: string },
  selectedModel: string = DEFAULT_AI_MODEL
): Promise<ChatAssistantResponse> {
  const envKey =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '') ||
    '';
  const apiKey = (userApiKey || envKey || '').trim();

  // Kết hợp nội dung tin nhắn và nội dung tệp đính kèm
  let fullPrompt = userMessage.trim();
  if (attachedFileText) {
    fullPrompt += `\n\n[NỘI DUNG TỆP ĐÍNH KÈM CỦA HỌC SINH]:\n${attachedFileText}`;
  }

  // NẾU CÓ GEMINI API KEY: KẾT NỐI SÂU VỚI GOOGLE GEMINI AI
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

      // Chuỗi danh sách model ưu tiên thực thi (Fallback Chain)
      const targetModel = (selectedModel === 'custom' || !selectedModel) ? DEFAULT_AI_MODEL : selectedModel;
      const modelCandidates = Array.from(
        new Set([
          targetModel,
          'gemini-2.5-pro',
          'gemini-2.0-flash',
          'gemini-1.5-pro',
          'gemini-1.5-flash',
        ])
      ).filter(Boolean);

      let responseText = '';
      let usedModelName = targetModel;
      let lastError: any = null;

      for (const modelToTry of modelCandidates) {
        try {
          const response = await ai.models.generateContent({
            model: modelToTry,
            contents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });

          if (response && response.text) {
            responseText = response.text;
            usedModelName = modelToTry;
            break;
          }
        } catch (mErr) {
          console.warn(`[MathDiagnostic AI] Thử nghiệm model ${modelToTry} gặp sự cố, tự động chuyển model tiếp theo:`, mErr);
          lastError = mErr;
        }
      }

      if (responseText) {
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
          modelUsed: usedModelName,
        };
      } else if (lastError) {
        console.error('[MathDiagnostic AI] Toàn bộ chuỗi model đều trả về lỗi:', lastError);
      }
    } catch (err) {
      console.warn('Lỗi gọi Gemini API trong chatbox, chuyển sang Smart Socratic Engine:', err);
    }
  }

  // FALLBACK SƯ PHẠM CỤC BỘ CHUYÊN SÂU CHUẨN GDPT 2018
  await new Promise((resolve) => setTimeout(resolve, 500));

  const localEval = analyzeMathSubmissionLocal(
    fullPrompt,
    attachedFileText || ''
  );

  const defaultProblems = (localEval.diagnosticResult.followUpProblems || []).map((p, idx) => ({
    id: idx + 1,
    title: p.title,
    content: p.content,
    difficulty: p.difficulty,
    initialHint: p.initialHint,
  }));

  const chatReply = localEval.isCorrect
    ? `### 🌟 Hướng Dẫn Sư Phạm & Phương Pháp Giải GDPT 2018:\n\nThầy/Cô và Cố vấn AI đã phân tích chi tiết đề bài toán của em!\n\n* **Điểm then chốt:** ${localEval.diagnosticResult.keyInsight}\n* **Phương pháp giải:** Xem chi tiết bảng công thức và hướng dẫn từng bước trên **Tờ Phiếu A4 bên phải**.\n\n👉 **Bài tập rèn luyện cùng dạng:** Cố vấn AI đã sinh ra **${defaultProblems.length} bài tập cùng dạng mô hình hóa thực tiễn** ở cột bên phải để em củng cố năng lực!`
    : `### 🧭 Chẩn đoán Sư phạm:\n\nQua kiểm tra câu hỏi của em, Cố vấn AI nhận thấy điểm cần lưu ý ở: **${localEval.errorCategory || 'Quy chuẩn biến đổi'}**.\n\n* **Điểm then chốt:** ${localEval.diagnosticResult.keyInsight}\n* **Gợi ý Socratic:** ${localEval.diagnosticResult.socraticQuestions?.[0] || 'Em hãy đọc kỹ giả thiết bài toán và chọn ẩn số thích hợp.'}\n\n👉 **Xem ngay Phiếu A4 chi tiết ở cột bên phải** để nắm bảng công thức và luyện tập các bài tập cùng dạng nhé!`;

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
  userApiKey?: string,
  selectedModel: string = DEFAULT_AI_MODEL
): Promise<EvaluationResponse> {
  const envKey =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '') ||
    '';
  const apiKey = (userApiKey || envKey || '').trim();

  if (!apiKey && !imageBase64) {
    await new Promise((resolve) => setTimeout(resolve, 500));
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

      const targetModel = (selectedModel === 'custom' || !selectedModel) ? DEFAULT_AI_MODEL : selectedModel;
      const modelCandidates = Array.from(
        new Set([
          targetModel,
          'gemini-2.5-pro',
          'gemini-2.0-flash',
          'gemini-1.5-pro',
          'gemini-1.5-flash',
        ])
      ).filter(Boolean);

      let responseText = '';
      let usedModelName = targetModel;

      for (const modelToTry of modelCandidates) {
        try {
          const response = await ai.models.generateContent({
            model: modelToTry,
            contents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });

          if (response && response.text) {
            responseText = response.text;
            usedModelName = modelToTry;
            break;
          }
        } catch (mErr) {
          console.warn(`[evaluateMathSubmission] Model ${modelToTry} gặp sự cố, thử tiếp...`, mErr);
        }
      }

      if (responseText) {
        const parsed = JSON.parse(responseText);

        return {
          isCorrect: parsed.isCorrect ?? true,
          errorCategory: parsed.errorCategory || undefined,
          diagnosticResult: {
            theorySummary: parsed.theorySummary || '',
            formulasNeeded: parsed.formulasNeeded || [],
            socraticQuestions: parsed.socraticQuestions || [],
            keyInsight: parsed.keyInsight || '',
            pedagogicalAdviceForTeacher: parsed.pedagogicalAdvice || '',
            followUpProblems: (parsed.followUpProblems || []).slice(0, 2),
          },
          usedAI: true,
          modelName: usedModelName,
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
    modelName: 'MathDiagnostic Socratic Engine (Local Fallback GDPT 2018)',
  };
}
