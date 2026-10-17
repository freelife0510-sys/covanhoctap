/**
 * MathDiagnostic AI - Type Definitions
 * Hệ thống Đánh giá Thích ứng và Chẩn đoán Vùng trũng Kiến thức Toán THPT
 * Chuẩn Chương trình GDPT 2018
 */

export type Role = 'student' | 'teacher';

export type ErrorCategory =
  | 'Chưa đặt điều kiện xác định'
  | 'Biến đổi đại số sai'
  | 'Nhầm lẫn định lý/công thức'
  | 'Thiếu nghiệm ngoại lai'
  | 'Lập luận hình học sai'
  | 'Khác';

export interface ClassRoom {
  id: string;
  name: string;
  grade: '10' | '11' | '12';
  studentCount: number;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  avatar?: string;
  school?: string;
}

export interface Teacher {
  id: string;
  name: string;
  school: string;
  classList: ClassRoom[];
  avatar?: string;
}

export interface FollowUpProblem {
  id: number;
  title: string;
  content: string;
  difficulty: 'Tương đương' | 'Nâng cao';
  initialHint?: string;
}

export interface DiagnosticResult {
  theorySummary?: string;
  formulasNeeded?: string[];
  socraticQuestions?: string[];
  praiseComment?: string;
  followUpProblems: FollowUpProblem[];
  keyInsight?: string;
  pedagogicalAdviceForTeacher?: string;
}

export interface MathSubmission {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  timestamp: string; // ISO date string or formatted DD/MM/YYYY HH:mm
  problemText: string;
  solutionText?: string;
  solutionImageUrl?: string;
  isCorrect: boolean;
  errorCategory?: ErrorCategory;
  diagnosticResult: DiagnosticResult;
  // Interactive student progress tracking
  studentNotes?: string[];
  hasResolvedMistake?: boolean;
}

export interface PredefinedExample {
  id: string;
  title: string;
  description: string;
  badge: string;
  grade: '10' | '11' | '12';
  topic: string;
  problemText: string;
  solutionText: string;
  expectedCategory?: ErrorCategory;
  isCorrect: boolean;
}
