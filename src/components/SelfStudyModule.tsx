import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  GraduationCap, 
  RotateCcw, 
  Send, 
  Layers, 
  FileText, 
  Printer, 
  AlertTriangle,
  Lightbulb,
  Check,
  TrendingUp,
  Award,
  History,
  Target,
  ArrowRight,
  ShieldCheck,
  Flame,
  BarChart3
} from 'lucide-react';
import { 
  HIGH_SCHOOL_CURRICULUM 
} from '../data/curriculumData.ts';
import { 
  GradeLevel, 
  ExerciseFormat, 
  LessonItem, 
  ChapterItem, 
  MultipleChoiceQuestion, 
  TrueFalseQuestion, 
  ShortAnswerQuestion 
} from '../types/curriculum.ts';
import { StudentAccount, TestHistoryItem } from '../types/index.ts';
import MathRenderer from './MathRenderer.tsx';
import { GoogleGenAI } from '@google/genai';

export interface AttemptHistoryItem {
  id: string;
  date: string;
  lessonId: string;
  lessonTitle: string;
  grade: GradeLevel;
  chapterTitle: string;
  format: ExerciseFormat;
  correctAnswers: number;
  totalQuestions: number;
  score: number;
}

interface SelfStudyModuleProps {
  apiKey?: string;
  selectedModel?: string;
  student?: StudentAccount;
  onUpdateStudent?: (student: StudentAccount) => void;
}

export const SelfStudyModule: React.FC<SelfStudyModuleProps> = ({
  apiKey = '',
  selectedModel = 'gemini-3.8-flash',
  student,
  onUpdateStudent,
}) => {
  // Navigation State
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('12');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('12-c1');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('12-c1-b2'); // Mặc định mở bài Tối ưu hóa GTLN/GTNN

  // Tab State: 'theory' | 'exercises'
  const [activeTab, setActiveTab] = useState<'theory' | 'exercises'>('theory');

  // Exercise Format: 'multiple_choice' | 'true_false' | 'short_answer'
  const [exerciseFormat, setExerciseFormat] = useState<ExerciseFormat>('multiple_choice');

  // Dropdown / Modal selector state
  const [showLessonSelectorModal, setShowLessonSelectorModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showAttemptNotice, setShowAttemptNotice] = useState(false);

  // Exercise Answers & Evaluation State
  const [mcAnswers, setMcAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [tfAnswers, setTfAnswers] = useState<Record<string, Record<'a' | 'b' | 'c' | 'd', boolean | null>>>({});
  const [saAnswers, setSaAnswers] = useState<Record<string, string>>({});
  const [evaluatedQuestions, setEvaluatedQuestions] = useState<Record<string, boolean>>({});

  // P1: Gợi ý theo bước (Step-by-step hint)
  const [hintsRevealed, setHintsRevealed] = useState<Record<string, number>>({});

  // P1: Lưu từng lượt làm (Attempt history)
  const [attemptHistory, setAttemptHistory] = useState<AttemptHistoryItem[]>(() => {
    try {
      const storageKey = `math_self_study_attempts_${student?.id || 'default'}`;
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dynamic AI generated questions state
  const [aiGeneratedExercises, setAiGeneratedExercises] = useState<{
    multipleChoice: MultipleChoiceQuestion[];
    trueFalse: TrueFalseQuestion[];
    shortAnswer: ShortAnswerQuestion[];
  }>({ multipleChoice: [], trueFalse: [], shortAnswer: [] });
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Sync attempt history if student changes
  useEffect(() => {
    try {
      const storageKey = `math_self_study_attempts_${student?.id || 'default'}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setAttemptHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Lỗi đọc lịch sử làm bài:', e);
    }
  }, [student?.id]);

  // Lấy dữ liệu khối, chương, bài hiện tại
  const currentGradeData = HIGH_SCHOOL_CURRICULUM.find((g) => g.grade === selectedGrade) || HIGH_SCHOOL_CURRICULUM[0];
  const currentChapter = currentGradeData.chapters.find((c) => c.id === selectedChapterId) || currentGradeData.chapters[0];
  const currentLesson = currentChapter?.lessons.find((l) => l.id === selectedLessonId) || currentChapter?.lessons[0];

  // Xử lý chuyển bài học
  const handleSelectLesson = (grade: GradeLevel, chapterId: string, lessonId: string) => {
    setSelectedGrade(grade);
    setSelectedChapterId(chapterId);
    setSelectedLessonId(lessonId);
    setShowLessonSelectorModal(false);
    // Reset answers
    setMcAnswers({});
    setTfAnswers({});
    setSaAnswers({});
    setEvaluatedQuestions({});
    setHintsRevealed({});
    setAiGeneratedExercises({ multipleChoice: [], trueFalse: [], shortAnswer: [] });
  };

  // Trắc nghiệm khách quan: Chọn phương án
  const handleSelectMc = (qId: string, key: 'A' | 'B' | 'C' | 'D') => {
    setMcAnswers((prev) => ({ ...prev, [qId]: key }));
  };

  // Đúng / Sai: Chọn phương án cho từng ý
  const handleSelectTf = (qId: string, subId: 'a' | 'b' | 'c' | 'd', val: boolean) => {
    setTfAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || { a: null, b: null, c: null, d: null }),
        [subId]: val,
      },
    }));
  };

  // Trả lời ngắn: Nhập đáp số
  const handleInputSa = (qId: string, val: string) => {
    setSaAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  // Kiểm tra đáp án
  const handleCheckQuestion = (qId: string) => {
    setEvaluatedQuestions((prev) => ({ ...prev, [qId]: true }));
  };

  // Làm lại câu hỏi
  const handleResetQuestion = (qId: string) => {
    setEvaluatedQuestions((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  };

  // P1: Mở gợi ý từng bước (Step-by-step hint)
  const handleRevealHint = (qId: string) => {
    setHintsRevealed((prev) => {
      const current = prev[qId] || 0;
      return { ...prev, [qId]: current < 3 ? current + 1 : 1 };
    });
  };

  // P1: Trợ giúp sinh gợi ý sư phạm chuẩn theo từng bước
  const getQuestionHints = (q: any, format: ExerciseFormat) => {
    if (format === 'short_answer' && q.modelingSteps && q.modelingSteps.length >= 3) {
      return {
        step1: `${q.modelingSteps[0].stepName}: ${q.modelingSteps[0].description}`,
        step2: `${q.modelingSteps[1].stepName}: ${q.modelingSteps[1].description}`,
        step3: `${q.modelingSteps[2].stepName}: ${q.modelingSteps[2].description}`,
      };
    }
    if (format === 'short_answer') {
      return {
        step1: 'Bước 1 (Chọn ẩn số & Đặt điều kiện): Gọi ẩn số đại diện cho đại lượng thay đổi (ví dụ: số lần tăng giá $x \\in \\mathbb{N}$ hoặc kích thước $x > 0$).',
        step2: 'Bước 2 (Thiết lập hàm mục tiêu): Biểu diễn các đại lượng còn lại theo $x$ và viết công thức hàm mục tiêu $R(x)$ hoặc $f(x)$ trên miền xác định.',
        step3: 'Bước 3 (Khảo sát cực trị & Kết luận): Tính đạo hàm cấp một $f\'(x)$, giải $f\'(x) = 0$, lập bảng biến thiên để xác định giá trị tối ưu và trả lời đúng đơn vị.',
      };
    }
    if (format === 'multiple_choice') {
      return {
        step1: 'Bước 1 (Nhận diện bài toán): Xác định chuyên đề kiến thức, điều kiện xác định của biểu thức và công thức toán học trọng tâm.',
        step2: 'Bước 2 (Loại trừ nhanh): Quan sát các dấu hiệu đặc biệt (tập xác định, dấu hệ số $a$, tiệm cận, điểm đi qua) để loại trừ bớt các phương án vô lý.',
        step3: 'Bước 3 (Biến đổi mấu chốt): Áp dụng công thức biến đổi tương đương hoặc tính toán định lượng để đối chiếu chính xác phương án đúng.',
      };
    }
    // True / False
    return {
      step1: 'Bước 1 (Phân tích giả thiết chung): Đọc kỹ ngữ cảnh bài toán, vẽ hình minh họa hoặc tóm tắt các đại lượng cho trước.',
      step2: 'Bước 2 (Thẩm định độc lập): Xét từng mệnh đề a), b), c), d) một cách độc lập, viết công thức tương ứng cho từng mệnh đề.',
      step3: 'Bước 3 (Đối chiếu điều kiện biên): Chú ý các điều kiện chặt chẽ (mẫu số $\\ne 0$, biểu thức căn bậc hai $\\ge 0$, dấu bằng xảy ra) để khẳng định ĐÚNG hay SAI.',
    };
  };

  // P1: Lưu lượt làm bài (Record Attempt History & Sync Data)
  const handleSaveAttempt = () => {
    if (!currentLesson) return;

    let total = 0;
    let correct = 0;
    const gaps: string[] = [];

    if (exerciseFormat === 'multiple_choice') {
      currentMcQuestions.forEach((q) => {
        if (evaluatedQuestions[q.id]) {
          total++;
          if (mcAnswers[q.id] === q.correctAnswer) {
            correct++;
          } else {
            gaps.push(`${currentLesson.title} (Trắc nghiệm Câu ${q.id})`);
          }
        }
      });
    } else if (exerciseFormat === 'true_false') {
      currentTfQuestions.forEach((q) => {
        if (evaluatedQuestions[q.id]) {
          total++;
          const userAns = tfAnswers[q.id] || { a: null, b: null, c: null, d: null };
          const allCorrect = q.statements.every((st) => userAns[st.subId] === st.isCorrect);
          if (allCorrect) {
            correct++;
          } else {
            gaps.push(`${currentLesson.title} (Đúng/Sai)`);
          }
        }
      });
    } else if (exerciseFormat === 'short_answer') {
      currentSaQuestions.forEach((q) => {
        if (evaluatedQuestions[q.id]) {
          total++;
          const userVal = (saAnswers[q.id] || '').trim().toLowerCase().replace(/,/g, '.');
          const isCorrect = q.acceptableAnswers.some(
            (ans) => ans.trim().toLowerCase().replace(/,/g, '.') === userVal || String(q.correctValue) === userVal
          );
          if (isCorrect) {
            correct++;
          } else {
            gaps.push(`${currentLesson.title} (Mô hình hóa thực tế)`);
          }
        }
      });
    }

    if (total === 0) {
      alert('Vui lòng làm bài và bấm "Kiểm tra kết quả" ít nhất 1 câu trước khi lưu lượt làm!');
      return;
    }

    const calculatedScore = Number(((correct / total) * 10).toFixed(1));
    const nowStr = new Date().toLocaleString('vi-VN');

    const newAttempt: AttemptHistoryItem = {
      id: `attempt-${Date.now()}`,
      date: nowStr,
      lessonId: currentLesson.id,
      lessonTitle: currentLesson.title,
      grade: selectedGrade,
      chapterTitle: currentChapter.title,
      format: exerciseFormat,
      correctAnswers: correct,
      totalQuestions: total,
      score: calculatedScore,
    };

    const nextHistory = [newAttempt, ...attemptHistory];
    setAttemptHistory(nextHistory);
    try {
      localStorage.setItem(
        `math_self_study_attempts_${student?.id || 'default'}`,
        JSON.stringify(nextHistory)
      );
    } catch (e) {
      console.warn('Lỗi lưu lịch sử:', e);
    }

    // Đồng bộ với tài khoản học sinh & giáo viên
    if (student && onUpdateStudent) {
      const newTestHistoryItem: TestHistoryItem = {
        id: newAttempt.id,
        date: nowStr,
        score: calculatedScore,
        durationMinutes: 10,
        correctAnswers: correct,
        totalQuestions: total,
        gapsDetected: gaps,
      };

      const existingHistory = student.testHistory || [];
      const updatedDetectedGaps = Array.from(new Set([...(student.detectedGaps || []), ...gaps]));

      onUpdateStudent({
        ...student,
        latestScore: calculatedScore,
        testHistory: [newTestHistoryItem, ...existingHistory],
        detectedGaps: updatedDetectedGaps,
        gapsCount: updatedDetectedGaps.length,
        status: calculatedScore >= 7.0 ? 'improving' : 'needs_remedy',
      });
    }

    setShowAttemptNotice(true);
    setTimeout(() => setShowAttemptNotice(false), 4500);
  };

  // P1: Kiểm tra lại sau sửa (Re-test failed questions)
  const handleRetestWrongQuestions = () => {
    const nextEvaluated = { ...evaluatedQuestions };
    let resetCount = 0;

    if (exerciseFormat === 'multiple_choice') {
      currentMcQuestions.forEach((q) => {
        if (evaluatedQuestions[q.id] && mcAnswers[q.id] !== q.correctAnswer) {
          delete nextEvaluated[q.id];
          setMcAnswers((prev) => {
            const copy = { ...prev };
            delete copy[q.id];
            return copy;
          });
          resetCount++;
        }
      });
    } else if (exerciseFormat === 'true_false') {
      currentTfQuestions.forEach((q) => {
        const userAns = tfAnswers[q.id] || { a: null, b: null, c: null, d: null };
        const allCorrect = q.statements.every((st) => userAns[st.subId] === st.isCorrect);
        if (evaluatedQuestions[q.id] && !allCorrect) {
          delete nextEvaluated[q.id];
          setTfAnswers((prev) => {
            const copy = { ...prev };
            delete copy[q.id];
            return copy;
          });
          resetCount++;
        }
      });
    } else if (exerciseFormat === 'short_answer') {
      currentSaQuestions.forEach((q) => {
        const userVal = (saAnswers[q.id] || '').trim().toLowerCase().replace(/,/g, '.');
        const isCorrect = q.acceptableAnswers.some(
          (ans) => ans.trim().toLowerCase().replace(/,/g, '.') === userVal || String(q.correctValue) === userVal
        );
        if (evaluatedQuestions[q.id] && !isCorrect) {
          delete nextEvaluated[q.id];
          setSaAnswers((prev) => {
            const copy = { ...prev };
            delete copy[q.id];
            return copy;
          });
          resetCount++;
        }
      });
    }

    setEvaluatedQuestions(nextEvaluated);
    if (resetCount > 0) {
      alert(`Đã đặt lại ${resetCount} câu chưa chính xác. Em hãy bấm "Gợi ý từng bước" để xem hướng tháo gỡ và làm lại nhé!`);
    } else {
      alert('Tất cả các câu em đã làm đều đạt kết quả đúng! Không có câu sai cần kiểm tra lại.');
    }
  };

  // AI Sinh Bài Tập Tự Động (Gemini 3.8 Flash)
  const handleGenerateAiExercise = async () => {
    if (!currentLesson) return;
    setIsGeneratingAi(true);

    const prompt = `Bạn là Chuyên gia Khảo thí và Cố vấn Sư phạm Toán THPT GDPT 2018.
Hãy tạo 1 câu hỏi bài tập mới chuẩn chương trình GDPT 2018 cho bài học: "${currentLesson.title}" thuộc ${currentChapter.title}.
Dạng bài tập yêu cầu: ${
      exerciseFormat === 'multiple_choice'
        ? 'Trắc nghiệm khách quan 4 lựa chọn (Mức độ: Thông hiểu hoặc Vận dụng)'
        : exerciseFormat === 'true_false'
        ? 'Câu hỏi Đúng / Sai gồm 1 ngữ cảnh và 4 ý a, b, c, d (Mức độ: Biết, Hiểu, Vận dụng - Chuẩn đề thi tốt nghiệp THPT từ 2025)'
        : 'Trả lời ngắn - Bài toán thực tế mô hình hóa (Mức độ: Vận dụng)'
    }.

Trả về ĐÚNG định dạng JSON theo schema:
{
  "type": "${exerciseFormat}",
  "question": {
    "id": "ai-${Date.now()}",
    "title": "Tên bài toán",
    "problemText": "Nội dung câu hỏi đầy đủ có công thức LaTeX $...$",
    "options": [{"key": "A", "content": "..."}, {"key": "B", "content": "..."}, {"key": "C", "content": "..."}, {"key": "D", "content": "..."}],
    "correctAnswer": "A",
    "statements": [{"subId": "a", "content": "...", "isCorrect": true, "explanation": "..."}, ...],
    "correctValue": 10,
    "unit": "triệu đồng",
    "explanation": "Lời giải chi tiết từng bước"
  }
}`;

    try {
      const envKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) || '';
      const effectiveKey = (apiKey || envKey || '').trim();

      if (effectiveKey) {
        const ai = new GoogleGenAI({ apiKey: effectiveKey });
        const res = await ai.models.generateContent({
          model: selectedModel || 'gemini-3.8-flash',
          contents: [prompt],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const parsed = JSON.parse(res.text || '{}');
        const qData = parsed.question;

        if (exerciseFormat === 'multiple_choice' && qData.options) {
          const newQ: MultipleChoiceQuestion = {
            id: `ai-mc-${Date.now()}`,
            question: qData.problemText || qData.question || '',
            options: qData.options,
            correctAnswer: qData.correctAnswer || 'A',
            cognitiveLevel: 'Thông hiểu',
            explanation: qData.explanation || 'Lời giải chi tiết từ Cố vấn AI.',
          };
          setAiGeneratedExercises((prev) => ({
            ...prev,
            multipleChoice: [newQ, ...prev.multipleChoice],
          }));
        } else if (exerciseFormat === 'true_false' && qData.statements) {
          const newQ: TrueFalseQuestion = {
            id: `ai-tf-${Date.now()}`,
            context: qData.problemText || qData.question || '',
            statements: qData.statements,
            cognitiveLevel: 'Vận dụng',
            overallExplanation: qData.explanation,
          };
          setAiGeneratedExercises((prev) => ({
            ...prev,
            trueFalse: [newQ, ...prev.trueFalse],
          }));
        } else if (exerciseFormat === 'short_answer') {
          const newQ: ShortAnswerQuestion = {
            id: `ai-sa-${Date.now()}`,
            problem: qData.problemText || qData.question || '',
            correctValue: qData.correctValue || 10,
            acceptableAnswers: [String(qData.correctValue)],
            unit: qData.unit || '',
            cognitiveLevel: 'Vận dụng',
            isRealWorldModeling: true,
            modelingSteps: [],
            explanation: qData.explanation || '',
          };
          setAiGeneratedExercises((prev) => ({
            ...prev,
            shortAnswer: [newQ, ...prev.shortAnswer],
          }));
        }
      } else {
        alert('Vui lòng nhập API Key để kích hoạt AI sinh bài tập tự động!');
      }
    } catch (e) {
      console.warn('Lỗi AI sinh bài tập:', e);
      alert('Không thể tạo câu hỏi mới từ AI lúc này. Vui lòng thử lại!');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Tổng hợp danh sách câu hỏi (gốc + AI sinh thêm)
  const currentMcQuestions = [
    ...(aiGeneratedExercises.multipleChoice || []),
    ...(currentLesson?.exercises?.multipleChoice || []),
  ];
  const currentTfQuestions = [
    ...(aiGeneratedExercises.trueFalse || []),
    ...(currentLesson?.exercises?.trueFalse || []),
  ];
  const currentSaQuestions = [
    ...(aiGeneratedExercises.shortAnswer || []),
    ...(currentLesson?.exercises?.shortAnswer || []),
  ];

  // Đếm câu sai hiện tại để hiện nút "Luyện lại câu sai"
  const hasWrongAnswers = (() => {
    if (exerciseFormat === 'multiple_choice') {
      return currentMcQuestions.some((q) => evaluatedQuestions[q.id] && mcAnswers[q.id] !== q.correctAnswer);
    }
    if (exerciseFormat === 'true_false') {
      return currentTfQuestions.some((q) => {
        if (!evaluatedQuestions[q.id]) return false;
        const userAns = tfAnswers[q.id] || { a: null, b: null, c: null, d: null };
        return !q.statements.every((st) => userAns[st.subId] === st.isCorrect);
      });
    }
    if (exerciseFormat === 'short_answer') {
      return currentSaQuestions.some((q) => {
        if (!evaluatedQuestions[q.id]) return false;
        const userVal = (saAnswers[q.id] || '').trim().toLowerCase().replace(/,/g, '.');
        return !q.acceptableAnswers.some(
          (ans) => ans.trim().toLowerCase().replace(/,/g, '.') === userVal || String(q.correctValue) === userVal
        );
      });
    }
    return false;
  })();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* 1. THANH CHỌN BÀI HỌC (BẤM VÀO HIỂN THỊ TỪNG KHỐI, CHƯƠNG, BÀI)          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
              Lớp {selectedGrade}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
              SGK Kết Nối Tri Thức Với Cuộc Sống
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600 truncate max-w-xs sm:max-w-md">
              {currentChapter?.title}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{currentLesson?.title}</span>
          </h2>
        </div>

        {/* Nút bấm điều hướng & Hồ sơ */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowSkillModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
            title="Xem hồ sơ kỹ năng và lịch sử lượt làm bài"
          >
            <BarChart3 className="w-4 h-4 text-amber-600" />
            <span>Hồ Sơ Kỹ Năng & Lịch Sử ({attemptHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLessonSelectorModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Chọn Bài Học Khác</span>
            <ChevronDown className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Thông báo đã ghi nhận lượt làm */}
      {showAttemptNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white shadow-lg flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-200" />
            <span>Đã lưu thành công lượt làm bài vào Hồ Sơ Kỹ Năng và đồng bộ với Thầy/Cô!</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSkillModal(true)}
            className="px-3 py-1 bg-white text-emerald-900 rounded-xl text-xs font-black shadow-xs hover:bg-emerald-50 cursor-pointer"
          >
            Xem ngay
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB ĐIỀU HƯỚNG NỘI DUNG: LÍ THUYẾT VS. BÀI TẬP TỰ LUYỆN                 */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('theory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'theory'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Ôn Tập Lí Thuyết Chi Tiết</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exercises')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'exercises'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Luyện Tập Bài Tập GDPT 2018</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-slate-600" />
          <span>In A4 tài liệu</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. NỘI DUNG TAB 1: LÍ THUYẾT CHI TIẾT                                     */}
      {/* ========================================================================= */}
      {activeTab === 'theory' && currentLesson && (
        <div className="space-y-6">
          {/* Tổng quan bài học */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 text-emerald-950 space-y-2">
            <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Mục Tiêu & Trọng Tâm Kiến Thức:
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
              {currentLesson.theory.overview}
            </p>
          </div>

          {/* Các mục lý thuyết chi tiết */}
          <div className="space-y-4">
            {currentLesson.theory.sections.map((section, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3"
              >
                <h4 className="text-sm sm:text-base font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
                  {section.title}
                </h4>

                <div className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-sans">
                  <MathRenderer content={section.content} />
                </div>

                {section.formulas && section.formulas.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Công thức trọng tâm:
                    </span>
                    <div className="space-y-1.5">
                      {section.formulas.map((f, fIdx) => (
                        <div
                          key={fIdx}
                          className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-emerald-900"
                        >
                          <MathRenderer content={f} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section.examples && section.examples.length > 0 && (
                  <div className="pt-2 space-y-3">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      Ví dụ minh họa chuẩn SGK:
                    </span>
                    <div className="grid grid-cols-1 gap-3">
                      {section.examples.map((ex, eIdx) => (
                        <div
                          key={eIdx}
                          className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2 text-xs sm:text-[13px]"
                        >
                          <div className="font-bold text-amber-950">
                            <MathRenderer content={ex.problem} />
                          </div>
                          <div className="text-slate-800 leading-relaxed border-t border-amber-200/60 pt-2">
                            <span className="font-semibold text-slate-900">Lời giải chi tiết:</span>
                            <div className="mt-1">
                              <MathRenderer content={ex.solution} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Nút chuyển sang làm bài tập */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('exercises')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              <span>Đã hiểu lí thuyết, bắt đầu luyện bài tập</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. NỘI DUNG TAB 2: BÀI TẬP TỰ LUYỆN (3 DẠNG THỨC GDPT 2018)              */}
      {/* ========================================================================= */}
      {activeTab === 'exercises' && (
        <div className="space-y-6">
          
          {/* Sub-bar: Chọn 1 trong 3 Dạng Thức Bài Tập + Các Hành Động P1 */}
          <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setExerciseFormat('multiple_choice')}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  exerciseFormat === 'multiple_choice'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>Trắc nghiệm khách quan</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                  {currentMcQuestions.length} câu
                </span>
              </button>

              <button
                type="button"
                onClick={() => setExerciseFormat('true_false')}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  exerciseFormat === 'true_false'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>Câu hỏi Đúng / Sai</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                  {currentTfQuestions.length} câu
                </span>
              </button>

              <button
                type="button"
                onClick={() => setExerciseFormat('short_answer')}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  exerciseFormat === 'short_answer'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>Trả lời ngắn (Toán thực tế)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 font-black">
                  Mô hình hóa
                </span>
              </button>
            </div>

            {/* Cụm công cụ hành động P1: Lưu lượt làm, Luyện lại câu sai, AI sinh bài */}
            <div className="flex flex-wrap items-center gap-2">
              {hasWrongAnswers && (
                <button
                  type="button"
                  onClick={handleRetestWrongQuestions}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs transition-all cursor-pointer shadow-xs"
                  title="Đặt lại các câu sai để kiểm tra lại sự tiến bộ sau khi xem lời giải"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                  <span>Kiểm tra lại câu sai</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveAttempt}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                title="Ghi nhận lượt làm và cập nhật điểm vào hồ sơ kỹ năng của em"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-200" />
                <span>Lưu lượt làm & Cập nhật điểm</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateAiExercise}
                disabled={isGeneratingAi}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="Gọi Cố vấn AI tạo câu hỏi mới cùng dạng"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-200 animate-spin" />
                <span>{isGeneratingAi ? 'AI đang tạo...' : 'AI sinh thêm bài'}</span>
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* DẠNG 1: TRẮC NGHIỆM KHÁCH QUAN (4 CHỌN 1)                      */}
          {/* ------------------------------------------------------------- */}
          {exerciseFormat === 'multiple_choice' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Dạng thức I: Trắc nghiệm 4 lựa chọn (Chọn 1 phương án đúng duy nhất).</span>
                <span className="font-bold text-slate-700">Tổng: {currentMcQuestions.length} câu</span>
              </div>

              {currentMcQuestions.map((q, idx) => {
                const userChoice = mcAnswers[q.id];
                const isEvaluated = evaluatedQuestions[q.id];
                const isCorrect = userChoice === q.correctAnswer;
                const hintLevel = hintsRevealed[q.id] || 0;
                const hints = getQuestionHints(q, 'multiple_choice');

                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">Câu {idx + 1}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                          {q.cognitiveLevel}
                        </span>
                      </div>

                      {isEvaluated && (
                        <span
                          className={`text-xs font-bold flex items-center gap-1 ${
                            isCorrect ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" /> Chính xác (+1.0đ)
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" /> Chưa đúng
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Đề bài */}
                    <div className="text-xs sm:text-[13px] text-slate-900 leading-relaxed font-sans">
                      <MathRenderer content={q.question} />
                    </div>

                    {/* 4 Lựa chọn A, B, C, D */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {q.options.map((opt) => {
                        const isSelected = userChoice === opt.key;
                        let optionStyle = 'border-slate-200 hover:border-emerald-300 bg-white text-slate-800';

                        if (isEvaluated) {
                          if (opt.key === q.correctAnswer) {
                            optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                          } else if (isSelected && !isCorrect) {
                            optionStyle = 'border-rose-400 bg-rose-50 text-rose-950 line-through';
                          }
                        } else if (isSelected) {
                          optionStyle = 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/30';
                        }

                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => !isEvaluated && handleSelectMc(q.id, opt.key)}
                            disabled={isEvaluated}
                            className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${optionStyle}`}
                          >
                            <span
                              className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                                isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {opt.key}
                            </span>
                            <div className="text-xs sm:text-[13px] flex-1 pt-0.5">
                              <MathRenderer content={opt.content} />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Hộp gợi ý từng bước (P1) */}
                    {hintLevel > 0 && (
                      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1.5 animate-in fade-in duration-150">
                        <div className="font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-amber-900">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                            Gợi ý sư phạm từng bước (Đã mở {hintLevel}/3 bước):
                          </span>
                          {hintLevel < 3 && (
                            <button
                              type="button"
                              onClick={() => handleRevealHint(q.id)}
                              className="text-[11px] text-amber-800 underline font-bold cursor-pointer"
                            >
                              Mở tiếp bước sau &rarr;
                            </button>
                          )}
                        </div>
                        <div className="space-y-1.5 pt-1">
                          {hintLevel >= 1 && (
                            <div className="pl-2 border-l-2 border-amber-500 text-slate-800">
                              <MathRenderer content={hints.step1} />
                            </div>
                          )}
                          {hintLevel >= 2 && (
                            <div className="pl-2 border-l-2 border-amber-500 text-slate-800">
                              <MathRenderer content={hints.step2} />
                            </div>
                          )}
                          {hintLevel >= 3 && (
                            <div className="pl-2 border-l-2 border-amber-500 text-slate-800">
                              <MathRenderer content={hints.step3} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Nút nộp bài, Gợi ý từng bước & Xem lời giải */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {!isEvaluated ? (
                          <button
                            type="button"
                            onClick={() => handleCheckQuestion(q.id)}
                            disabled={!userChoice}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                          >
                            Kiểm tra kết quả
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleResetQuestion(q.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Làm lại câu này
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRevealHint(q.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold cursor-pointer"
                          title="Mở gợi ý hướng dẫn từng bước"
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                          <span>{hintLevel === 0 ? '💡 Gợi ý từng bước' : `Gợi ý (Bước ${hintLevel}/3)`}</span>
                        </button>
                      </div>
                    </div>

                    {/* Lời giải chi tiết */}
                    {isEvaluated && (
                      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1.5 animate-in fade-in duration-150">
                        <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 text-emerald-600" />
                          Hướng dẫn giải sư phạm chi tiết:
                        </span>
                        <div className="text-slate-800 leading-relaxed pl-1 font-sans">
                          <MathRenderer content={q.explanation} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* DẠNG 2: CÂU HỎI ĐÚNG / SAI (4 Ý a, b, c, d)                    */}
          {/* ------------------------------------------------------------- */}
          {exerciseFormat === 'true_false' && (
            <div className="space-y-4">
              <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-2xl text-xs text-teal-900 flex items-center justify-between">
                <span>
                  <strong>Dạng thức II: Câu hỏi Đúng / Sai</strong> (Gồm 1 ngữ cảnh toán học và 4 mệnh đề a, b, c, d).
                </span>
                <span className="font-bold text-teal-950">Tổng: {currentTfQuestions.length} bài toán</span>
              </div>

              {currentTfQuestions.map((q, idx) => {
                const userStatements = tfAnswers[q.id] || { a: null, b: null, c: null, d: null };
                const isEvaluated = evaluatedQuestions[q.id];
                const hintLevel = hintsRevealed[q.id] || 0;
                const hints = getQuestionHints(q, 'true_false');

                // Tính điểm chuẩn Bộ GD&ĐT: 1 ý đúng: 0.1đ; 2 ý: 0.25đ; 3 ý: 0.5đ; 4 ý: 1.0đ
                const correctCount = q.statements.filter(
                  (st) => userStatements[st.subId] === st.isCorrect
                ).length;
                let awardedPoints = 0;
                if (correctCount === 1) awardedPoints = 0.1;
                else if (correctCount === 2) awardedPoints = 0.25;
                else if (correctCount === 3) awardedPoints = 0.5;
                else if (correctCount === 4) awardedPoints = 1.0;

                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-teal-600 text-white text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">Câu {idx + 1} (Đúng / Sai)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          {q.cognitiveLevel}
                        </span>
                      </div>

                      {isEvaluated && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700">
                            Đúng {correctCount}/4 ý
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            +{awardedPoints}đ
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Ngữ cảnh bài toán */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-[13px] text-slate-900 leading-relaxed font-sans">
                      <MathRenderer content={q.context} />
                    </div>

                    {/* 4 Mệnh đề a, b, c, d */}
                    <div className="space-y-2.5">
                      {q.statements.map((st) => {
                        const userVal = userStatements[st.subId];
                        const isStatementCorrect = userVal === st.isCorrect;

                        return (
                          <div
                            key={st.subId}
                            className={`p-3 sm:p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                              isEvaluated
                                ? isStatementCorrect
                                  ? 'bg-emerald-50/70 border-emerald-300'
                                  : 'bg-rose-50/70 border-rose-300'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 flex-1">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {st.subId})
                              </span>
                              <div className="text-xs sm:text-[13px] text-slate-900 font-sans">
                                <MathRenderer content={st.content} />
                              </div>
                            </div>

                            {/* Cặp nút ĐÚNG / SAI */}
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => !isEvaluated && handleSelectTf(q.id, st.subId, true)}
                                disabled={isEvaluated}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  userVal === true
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                ĐÚNG
                              </button>

                              <button
                                type="button"
                                onClick={() => !isEvaluated && handleSelectTf(q.id, st.subId, false)}
                                disabled={isEvaluated}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  userVal === false
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                SAI
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Hộp gợi ý từng bước (P1) */}
                    {hintLevel > 0 && (
                      <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200 text-xs text-teal-950 space-y-1.5 animate-in fade-in duration-150">
                        <div className="font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-teal-900">
                            <Lightbulb className="w-4 h-4 text-teal-600" />
                            Gợi ý từng bước (Đã mở {hintLevel}/3 bước):
                          </span>
                          {hintLevel < 3 && (
                            <button
                              type="button"
                              onClick={() => handleRevealHint(q.id)}
                              className="text-[11px] text-teal-800 underline font-bold cursor-pointer"
                            >
                              Mở tiếp bước sau &rarr;
                            </button>
                          )}
                        </div>
                        <div className="space-y-1.5 pt-1">
                          {hintLevel >= 1 && (
                            <div className="pl-2 border-l-2 border-teal-500 text-slate-800">
                              <MathRenderer content={hints.step1} />
                            </div>
                          )}
                          {hintLevel >= 2 && (
                            <div className="pl-2 border-l-2 border-teal-500 text-slate-800">
                              <MathRenderer content={hints.step2} />
                            </div>
                          )}
                          {hintLevel >= 3 && (
                            <div className="pl-2 border-l-2 border-teal-500 text-slate-800">
                              <MathRenderer content={hints.step3} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Nút kiểm tra & Gợi ý */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {!isEvaluated ? (
                          <button
                            type="button"
                            onClick={() => handleCheckQuestion(q.id)}
                            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer"
                          >
                            Kiểm tra kết quả 4 mệnh đề
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleResetQuestion(q.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Làm lại câu này
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRevealHint(q.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 text-xs font-semibold cursor-pointer"
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-teal-600" />
                          <span>{hintLevel === 0 ? '💡 Gợi ý từng bước' : `Gợi ý (Bước ${hintLevel}/3)`}</span>
                        </button>
                      </div>
                    </div>

                    {/* Lời giải thích từng ý */}
                    {isEvaluated && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <span className="font-bold text-slate-900 block">
                          Giải thích chi tiết 4 mệnh đề:
                        </span>
                        {q.statements.map((st) => (
                          <div key={st.subId} className="pl-2 border-l-2 border-teal-500 space-y-0.5">
                            <span className="font-bold text-slate-800">
                              Mệnh đề {st.subId}): Đáp án chuẩn là{' '}
                              <span className={st.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                                {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                              </span>
                            </span>
                            <div className="text-slate-600 font-sans">
                              <MathRenderer content={st.explanation} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* DẠNG 3: TRẢ LỜI NGẮN (BÀI TOÁN THỰC TẾ & MÔ HÌNH HÓA)         */}
          {/* ------------------------------------------------------------- */}
          {exerciseFormat === 'short_answer' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center justify-between">
                <span>
                  <strong>Dạng thức III: Trả lời ngắn</strong> (Chủ yếu bài toán thực tế - mô hình hóa tối ưu hóa, kinh tế, vật lý).
                </span>
                <span className="font-bold text-amber-950">Tổng: {currentSaQuestions.length} câu</span>
              </div>

              {currentSaQuestions.map((q, idx) => {
                const userVal = saAnswers[q.id] || '';
                const isEvaluated = evaluatedQuestions[q.id];
                const cleanUserVal = userVal.trim().toLowerCase().replace(/,/g, '.');
                const isCorrect = q.acceptableAnswers.some(
                  (ans) => ans.trim().toLowerCase().replace(/,/g, '.') === cleanUserVal || String(q.correctValue) === cleanUserVal
                );
                const hintLevel = hintsRevealed[q.id] || 0;
                const hints = getQuestionHints(q, 'short_answer');

                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-600 text-white text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">Câu {idx + 1} (Toán Thực Tế)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900">
                          Mô hình hóa
                        </span>
                      </div>

                      {isEvaluated && (
                        <span
                          className={`text-xs font-bold flex items-center gap-1 ${
                            isCorrect ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" /> Chính xác
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" /> Chưa chính xác
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Đề bài */}
                    <div className="text-xs sm:text-[13px] text-slate-900 leading-relaxed font-sans">
                      <MathRenderer content={q.problem} />
                    </div>

                    {/* Hộp gợi ý từng bước (P1) */}
                    {hintLevel > 0 && (
                      <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 space-y-1.5 animate-in fade-in duration-150">
                        <div className="font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-amber-900">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                            Gợi ý mô hình hóa từng bước (Đã mở {hintLevel}/3 bước):
                          </span>
                          {hintLevel < 3 && (
                            <button
                              type="button"
                              onClick={() => handleRevealHint(q.id)}
                              className="text-[11px] text-amber-800 underline font-bold cursor-pointer"
                            >
                              Mở tiếp bước sau &rarr;
                            </button>
                          )}
                        </div>
                        <div className="space-y-1.5 pt-1">
                          {hintLevel >= 1 && (
                            <div className="pl-2 border-l-2 border-amber-500 text-slate-800">
                              <MathRenderer content={hints.step1} />
                            </div>
                          )}
                          {hintLevel >= 2 && (
                            <div className="pl-2 border-l-2 border-amber-500 text-slate-800">
                              <MathRenderer content={hints.step2} />
                            </div>
                          )}
                          {hintLevel >= 3 && (
                            <div className="pl-2 border-l-2 border-amber-500 text-slate-800">
                              <MathRenderer content={hints.step3} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Ô nhập đáp án số */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-700 shrink-0">
                        Nhập đáp số của em:
                      </span>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="text"
                          value={userVal}
                          onChange={(e) => handleInputSa(q.id, e.target.value)}
                          disabled={isEvaluated}
                          placeholder="Nhập số..."
                          className="w-36 px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        />
                        {q.unit && (
                          <span className="text-xs font-bold text-slate-500">{q.unit}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!isEvaluated ? (
                          <button
                            type="button"
                            onClick={() => handleCheckQuestion(q.id)}
                            disabled={!userVal.trim()}
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all disabled:opacity-40 cursor-pointer shrink-0"
                          >
                            Chấm điểm
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleResetQuestion(q.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer shrink-0"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Làm lại
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRevealHint(q.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/80 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-semibold cursor-pointer shrink-0"
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
                          <span>{hintLevel === 0 ? '💡 Gợi ý từng bước' : `Gợi ý (${hintLevel}/3)`}</span>
                        </button>
                      </div>
                    </div>

                    {/* Lời giải & Các bước mô hình hóa toán học */}
                    {isEvaluated && (
                      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-950 flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                            Đáp số chuẩn: <span className="text-emerald-700 font-mono text-sm">{q.correctValue} {q.unit}</span>
                          </span>
                        </div>

                        {q.modelingSteps && q.modelingSteps.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-bold text-slate-700 uppercase">
                              Quy trình mô hình hóa toán học 4 bước:
                            </span>
                            {q.modelingSteps.map((step, sIdx) => (
                              <div key={sIdx} className="pl-2 border-l-2 border-amber-500">
                                <span className="font-bold text-slate-800">{step.stepName}:</span>{' '}
                                <span className="text-slate-700">{step.description}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-1 text-slate-800 leading-relaxed border-t border-amber-200/80 font-sans">
                          <MathRenderer content={q.explanation} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL HỒ SƠ KỸ NĂNG & LỊCH SỬ LƯỢT LÀM (P1)                             */}
      {/* ========================================================================= */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-amber-50 text-amber-700">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Hồ Sơ Kỹ Năng & Lịch Sử Tự Học (Chuẩn GDPT 2018)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Học sinh: {student?.name || 'Em học sinh'} • Điểm hiện tại: {student?.latestScore ?? 8.0}/10
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSkillModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Nhiệm vụ tiếp theo */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Nhiệm vụ tiếp theo dành cho em:</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {attemptHistory.length === 0
                  ? 'Hoàn thành ít nhất 1 bài tập trắc nghiệm hoặc bài toán thực tế mô hình hóa để hệ thống phân tích năng lực toán học của em.'
                  : attemptHistory[0].score >= 8.0
                  ? 'Năng lực vận dụng rất tốt! Tiếp tục thử sức với dạng "Trả lời ngắn (Toán thực tế)" ở các bài học tiếp theo để chinh phục điểm 9 - 10.'
                  : 'Cần củng cố thêm các bước suy luận: Bấm "Gợi ý từng bước" trước khi nộp bài và làm lại các câu chưa chính xác.'}
              </p>
            </div>

            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[11px] text-slate-500 block">Lượt làm bài</span>
                <span className="text-lg font-black text-slate-900">{attemptHistory.length}</span>
              </div>
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                <span className="text-[11px] text-emerald-700 block">Điểm trung bình</span>
                <span className="text-lg font-black text-emerald-900">
                  {attemptHistory.length > 0
                    ? (attemptHistory.reduce((acc, cur) => acc + cur.score, 0) / attemptHistory.length).toFixed(1)
                    : student?.latestScore ?? 8.0}
                  /10
                </span>
              </div>
              <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-center">
                <span className="text-[11px] text-purple-700 block">Vùng cần ôn</span>
                <span className="text-lg font-black text-purple-900">{student?.gapsCount ?? 0}</span>
              </div>
            </div>

            {/* Danh sách từng lượt làm đã lưu */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-600" />
                Chi tiết từng lượt làm bài đã lưu:
              </span>

              {attemptHistory.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                  Chưa có lượt làm bài nào được lưu. Em hãy làm bài tập và bấm <strong>"Lưu lượt làm & Cập nhật điểm"</strong> nhé!
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {attemptHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900">{item.lessonTitle}</div>
                        <div className="text-[11px] text-slate-500">
                          Khối {item.grade} • {item.format === 'multiple_choice' ? 'Trắc nghiệm' : item.format === 'true_false' ? 'Đúng/Sai' : 'Trả lời ngắn'} • {item.date}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-black text-sm ${item.score >= 8 ? 'text-emerald-600' : item.score >= 5 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {item.score}/10 đ
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Đúng {item.correctAnswers}/{item.totalQuestions} câu
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL CHỌN KHỐI - CHƯƠNG - BÀI HỌC (HIỂN THỊ TRỰC QUAN TỪNG CẤP)        */}
      {/* ========================================================================= */}
      {showLessonSelectorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-700">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Chọn Bài Học Môn Toán THPT (GDPT 2018)
                  </h3>
                  <p className="text-[11px] text-emerald-800 font-semibold">
                    Duy nhất Bộ sách: Kết Nối Tri Thức Với Cuộc Sống • Khối 10, 11, 12
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLessonSelectorModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Bước 1: Chọn Khối */}
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                1. Chọn Khối Lớp:
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {HIGH_SCHOOL_CURRICULUM.map((g) => {
                  const isSelected = selectedGrade === g.grade;
                  return (
                    <button
                      key={g.grade}
                      type="button"
                      onClick={() => {
                        setSelectedGrade(g.grade);
                        setSelectedChapterId(g.chapters[0]?.id || '');
                        setSelectedLessonId(g.chapters[0]?.lessons[0]?.id || '');
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <span className="text-sm font-black block">{g.name}</span>
                      <span className="text-[10px] opacity-75">{g.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bước 2 & 3: Danh sách Chương và Bài */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                2. Chọn Chương & Bài Học:
              </span>

              <div className="space-y-3">
                {currentGradeData.chapters.map((ch) => (
                  <div key={ch.id} className="rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 p-3 text-xs font-bold text-slate-900 border-b border-slate-200">
                      {ch.title}
                    </div>

                    <div className="divide-y divide-slate-100 p-1">
                      {ch.lessons.map((les) => {
                        const isCurrent = selectedLessonId === les.id;
                        return (
                          <button
                            key={les.id}
                            type="button"
                            onClick={() => handleSelectLesson(selectedGrade, ch.id, les.id)}
                            className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                              isCurrent
                                ? 'bg-emerald-600 text-white font-bold'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <span className="truncate pr-2">{les.title}</span>
                            <ChevronRight className="w-4 h-4 shrink-0 opacity-60" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SelfStudyModule;
