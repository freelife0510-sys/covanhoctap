import { DiagnosticResult, ErrorCategory } from '../types/index.ts';
import { analyzeMathSubmissionLocal } from '../utils/mathEvaluation.ts';
import { GoogleGenAI } from '@google/genai';

export interface EvaluationResponse {
  isCorrect: boolean;
  errorCategory?: ErrorCategory;
  diagnosticResult: DiagnosticResult;
  usedAI: boolean;
  modelName?: string;
}

const SYSTEM_INSTRUCTION = `Bạn là Chuyên gia Đánh giá Sư phạm Toán THPT theo phương pháp Socratic chuẩn chương trình GDPT 2018 của Bộ Giáo dục & Đào tạo Việt Nam.
Nhiệm vụ:
1. Kiểm tra bài làm toán của học sinh (đề bài và bài làm dạng văn bản hoặc ảnh chụp viết tay).
2. NẾU SAI:
   - KHÔNG đưa ra lời giải hoàn chỉnh ngay.
   - Tóm tắt ngắn gọn lý thuyết và công thức toán học trọng tâm bắt buộc phải áp dụng.
   - Đặt 2-3 câu hỏi gợi mở Socratic để học sinh tự rà soát lại bước sai của mình.
   - Tự động tạo ĐÚNG 2 bài tập MỨC ĐỘ TƯƠNG ĐỒNG để củng cố kiến thức sau khi sửa.
   - Phân loại lỗi sai vào ĐÚNG 1 trong các nhóm lỗi:
     * "Chưa đặt điều kiện xác định"
     * "Biến đổi đại số sai"
     * "Nhầm lẫn định lý/công thức"
     * "Thiếu nghiệm ngoại lai"
     * "Lập luận hình học sai"
     * "Khác"
3. NẾU ĐÚNG:
   - Nhận xét biểu dương tư duy logic, tính chính xác và sáng tạo.
   - Tự động tạo ĐÚNG 2 bài tập MỨC ĐỘ NÂNG CAO DẦN (Vận dụng cao, liên hệ thực tiễn) để học sinh tiếp tục rèn luyện phát triển tư duy.

Bạn PHẢI trả về ĐÚNG định dạng JSON theo schema:
{
  "isCorrect": boolean,
  "errorCategory": "Chưa đặt điều kiện xác định" | "Biến đổi đại số sai" | "Nhầm lẫn định lý/công thức" | "Thiếu nghiệm ngoại lai" | "Lập luận hình học sai" | "Khác",
  "diagnosticResult": {
    "theorySummary": "string tóm tắt định lý cốt lõi, công thức viết dạng LaTeX $...$",
    "formulasNeeded": ["mảng công thức LaTeX $...$"],
    "socraticQuestions": ["?1: câu hỏi gợi mở 1", "?2: câu hỏi gợi mở 2", "?3: câu hỏi gợi mở 3"],
    "praiseComment": "string nhận xét khen ngợi nếu đúng",
    "keyInsight": "string giải thích lỗi sai trọng tâm",
    "pedagogicalAdviceForTeacher": "string lời khuyên sư phạm cho giáo viên",
    "followUpProblems": [
      {
        "id": 1,
        "title": "Tiêu đề bài tập 1",
        "content": "Nội dung bài toán viết dạng LaTeX $...$",
        "difficulty": "Tương đương" hoặc "Nâng cao",
        "initialHint": "Gợi ý bước 1"
      },
      {
        "id": 2,
        "title": "Tiêu đề bài tập 2",
        "content": "Nội dung bài toán viết dạng LaTeX $...$",
        "difficulty": "Tương đương" hoặc "Nâng cao",
        "initialHint": "Gợi ý bước 1"
      }
    ]
  }
}`;

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

  // If no API key is provided and no image, use the smart local pedagogical analyzer
  if (!apiKey && !imageBase64) {
    // Artificial small delay for pedagogical realism
    await new Promise((resolve) => setTimeout(resolve, 800));
    const localResult = analyzeMathSubmissionLocal(problemText, solutionText || '');
    return {
      ...localResult,
      usedAI: false,
      modelName: 'MathDiagnostic Heuristic Engine (GDPT 2018)',
    };
  }

  // If we have an API key, call Gemini using the official @google/genai SDK
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      // Construct prompt content
      const contents: Array<Record<string, unknown> | string> = [];

      let userTextPrompt = `ĐỀ BÀI TOÁN:\n${problemText}\n\n`;
      if (solutionText) {
        userTextPrompt += `BÀI LÀM CỦA HỌC SINH (Dạng văn bản):\n${solutionText}\n\n`;
      }
      if (imageBase64) {
        userTextPrompt += `(Có đính kèm ảnh bài làm viết tay của học sinh bên dưới).\n\n`;
      }
      userTextPrompt += `Hãy thẩm định sư phạm và trả về JSON chuẩn theo yêu cầu.`;

      contents.push(userTextPrompt);

      if (imageBase64) {
        // Strip data prefix if present
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

      // Validate structure
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

  // Fallback if API was unavailable or had error
  const localResult = analyzeMathSubmissionLocal(problemText, solutionText || '');
  return {
    ...localResult,
    usedAI: false,
    modelName: 'MathDiagnostic Socratic Engine (Local Fallback)',
  };
}
