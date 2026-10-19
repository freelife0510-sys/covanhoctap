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
  teacherId: string;
  name: string; // e.g. "Lớp 12A1", "Lớp 10B2"
  grade: '10' | '11' | '12';
  academicYear: string; // e.g. "2025 - 2026"
  classCode: string; // e.g. "12A1-2026"
  studentCount: number;
  notes?: string;
  createdAt?: string;
}

export type CognitiveLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng';

export interface KnowledgeTopicGap {
  topic: string;
  grade: '10' | '11' | '12';
  cognitiveLevel: CognitiveLevel;
  errorFrequency: number;
  description: string;
  remedyAction: string;
}

export interface AssignedTask {
  id: string;
  title: string;
  topic: string;
  deadline?: string;
  completed: boolean;
  assignedAt: string;
  notes?: string;
}

export interface TestHistoryItem {
  id: string;
  date: string;
  score: number; // Thang điểm 10
  durationMinutes: number;
  correctAnswers: number;
  totalQuestions: number;
  gapsDetected: string[];
  details?: {
    questionId: number;
    problem: string;
    studentAnswer: string;
    isCorrect: boolean;
    note?: string;
  }[];
}

export interface StudentAccount {
  id: string; // Mã học sinh: ví dụ "HS12A1-01"
  studentCode: string;
  name: string;
  classId: string;
  className?: string;
  teacherId: string;
  teacherName?: string;
  password: string;
  avatar?: string;
  school?: string;
  status: 'diagnosed' | 'not_started' | 'needs_remedy';
  latestScore?: number; // Điểm gần nhất (thang 10)
  gapsCount: number;
  detectedGaps?: string[];
  notesFromTeacher?: string;
  assignedTasks?: AssignedTask[];
  testHistory?: TestHistoryItem[];
  createdAt?: string;
}

// Backward compatibility alias for Student
export type Student = StudentAccount;

export interface Teacher {
  id: string; // email hoặc UUID
  email: string;
  name: string;
  school: string;
  avatar?: string;
  classList: ClassRoom[];
  createdAt?: string;
}

export interface AuthSession {
  role: Role;
  teacherUser: Teacher | null;
  studentUser: StudentAccount | null;
  isAuthenticated: boolean;
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
