/**
 * MathDiagnostic AI - GDPT 2018 Curriculum & Self-Study Types
 * Cấu trúc chương trình môn Toán THPT (Lớp 10, 11, 12) chuẩn SGK Kết Nối Tri Thức / Cánh Diều
 * Định dạng câu hỏi theo đúng cấu trúc Đề thi Tốt nghiệp THPT từ năm 2025 của Bộ Giáo dục & Đào tạo.
 */

export type GradeLevel = '10' | '11' | '12';

export type ExerciseFormat = 'multiple_choice' | 'true_false' | 'short_answer';

export type CognitiveLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';

// 1. Dạng thức 1: Trắc nghiệm nhiều lựa chọn (4 chọn 1)
export interface MultipleChoiceQuestion {
  id: string;
  question: string; // Nội dung câu hỏi có kèm LaTeX $...$
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    content: string; // Nội dung phương án có LaTeX
  }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  cognitiveLevel: 'Nhận biết' | 'Thông hiểu';
  explanation: string; // Lời giải chi tiết sư phạm Socratic
  practicalContext?: string; // Bối cảnh thực tiễn nếu có
}

// 2. Dạng thức 2: Câu hỏi Đúng / Sai (Chuẩn format thi THPT từ năm 2025)
export interface TrueFalseStatement {
  subId: 'a' | 'b' | 'c' | 'd';
  content: string; // Mệnh đề phát biểu
  isCorrect: boolean; // Đúng hay Sai
  explanation: string; // Lời giải thích chi tiết tại sao đúng / sai
}

export interface TrueFalseQuestion {
  id: string;
  context: string; // Đề dẫn chung (cho hàm số, hình vẽ, hoặc tình huống thực tế)
  statements: TrueFalseStatement[];
  cognitiveLevel: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng';
  overallExplanation?: string;
}

// 3. Dạng thức 3: Trả lời ngắn (Chủ yếu toán thực tế - mô hình hóa)
export interface ShortAnswerQuestion {
  id: string;
  problem: string; // Đề bài toán thực tế / mô hình hóa
  correctValue: number | string; // Giá trị số chuẩn (hoặc chuỗi)
  acceptableAnswers: string[]; // Các dạng đáp án chấp nhận (vd: ["9", "9.0", "9 triệu"])
  unit?: string; // Đơn vị tính (vd: "triệu đồng", "nghìn đồng", "m", "phòng")
  cognitiveLevel: 'Vận dụng' | 'Vận dụng cao';
  isRealWorldModeling: boolean; // Đánh dấu bài toán thực tế mô hình hóa
  modelingSteps: {
    stepName: string;
    description: string;
    formula?: string;
  }[];
  explanation: string; // Hướng dẫn giải chi tiết
}

export interface LessonExercises {
  multipleChoice: MultipleChoiceQuestion[];
  trueFalse: TrueFalseQuestion[];
  shortAnswer: ShortAnswerQuestion[];
}

export interface LessonTheorySection {
  title: string;
  content: string; // Markdown chi tiết với LaTeX
  keyFormulas?: string[];
  importantNotes?: string[];
  practicalApplication?: string; // Ứng dụng thực tiễn trong đời sống
}

export interface LessonItem {
  id: string;
  title: string;
  order: number;
  description: string;
  theory: {
    overview: string;
    sections: LessonTheorySection[];
    summaryFormulas: string[];
    commonMistakes: string[]; // Vùng trũng học sinh hay sai
  };
  exercises: LessonExercises;
}

export interface ChapterItem {
  id: string;
  title: string;
  order: number;
  description: string;
  lessons: LessonItem[];
}

export interface GradeCurriculum {
  grade: GradeLevel;
  name: string;
  badge: string;
  description: string;
  chapters: ChapterItem[];
}
