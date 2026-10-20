import React, { useState } from 'react';
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
  Award
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
import MathRenderer from './MathRenderer.tsx';
import { GoogleGenAI } from '@google/genai';

interface SelfStudyModuleProps {
  apiKey?: string;
  selectedModel?: string;
}

export const SelfStudyModule: React.FC<SelfStudyModuleProps> = ({
  apiKey = '',
  selectedModel = 'gemini-3.8-flash',
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

  // Exercise Answers & Evaluation State
  const [mcAnswers, setMcAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [tfAnswers, setTfAnswers] = useState<Record<string, Record<'a' | 'b' | 'c' | 'd', boolean | null>>>({});
  const [saAnswers, setSaAnswers] = useState<Record<string, string>>({});
  const [evaluatedQuestions, setEvaluatedQuestions] = useState<Record<string, boolean>>({});

  // Dynamic AI generated questions state
  const [aiGeneratedExercises, setAiGeneratedExercises] = useState<{
    multipleChoice: MultipleChoiceQuestion[];
    trueFalse: TrueFalseQuestion[];
    shortAnswer: ShortAnswerQuestion[];
  }>({ multipleChoice: [], trueFalse: [], shortAnswer: [] });
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* 1. THANH CHỌN BÀI HỌC (BẤM VÀO HIỂN THỊ TỪNG KHỐI, CHƯƠNG, BÀI)          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
              Lớp {selectedGrade}
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

        {/* Nút bấm mở ô chọn Khối / Chương / Bài */}
        <button
          type="button"
          onClick={() => setShowLessonSelectorModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all cursor-pointer shrink-0"
        >
          <Layers className="w-4 h-4" />
          <span>Chọn Bài Học Khác</span>
          <ChevronDown className="w-4 h-4 ml-0.5" />
        </button>
      </div>

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

                <div className="text-xs sm:text-[13px] text-slate-800 leading-relaxed">
                  <MathRenderer content={section.content} />
                </div>

                {/* Bảng công thức then chốt của mục */}
                {section.keyFormulas && section.keyFormulas.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                      Công thức then chốt:
                    </span>
                    <div className="space-y-1 pl-2">
                      {section.keyFormulas.map((kf, kfIdx) => (
                        <div key={kfIdx} className="text-xs font-mono text-emerald-900">
                          <MathRenderer content={`$${kf}$`} inline />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lưu ý quan trọng */}
                {section.importantNotes && section.importantNotes.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-amber-950 text-xs space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-amber-900">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Lưu ý sư phạm quan trọng:
                    </span>
                    <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-amber-900/90">
                      {section.importantNotes.map((note, nIdx) => (
                        <li key={nIdx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Vùng trũng kiến thức & Bẫy sai lầm thường gặp */}
          {currentLesson.theory.commonMistakes && currentLesson.theory.commonMistakes.length > 0 && (
            <div className="bg-rose-50/60 border border-rose-200 rounded-3xl p-5 space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Vùng Trũng Kiến Thức & Bẫy Sai Lầm Học Sinh Hay Mắc Phải:
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-rose-950 leading-relaxed">
                {currentLesson.theory.commonMistakes.map((mis, mIdx) => (
                  <li key={mIdx}>{mis}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. NỘI DUNG TAB 2: BÀI TẬP VỚI 3 LỰA CHỌN DẠNG THỨC                      */}
      {/* ========================================================================= */}
      {activeTab === 'exercises' && currentLesson && (
        <div className="space-y-6">
          
          {/* Thanh lựa chọn 3 Dạng thức Câu hỏi chuẩn 2025 */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Lựa chọn 1: Trắc nghiệm khách quan */}
              <button
                type="button"
                onClick={() => setExerciseFormat('multiple_choice')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  exerciseFormat === 'multiple_choice'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>Trắc nghiệm khách quan</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">Biết, Hiểu</span>
              </button>

              {/* Lựa chọn 2: Câu hỏi Đúng / Sai */}
              <button
                type="button"
                onClick={() => setExerciseFormat('true_false')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  exerciseFormat === 'true_false'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>Câu hỏi Đúng / Sai</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">Biết, Hiểu, Vận dụng</span>
              </button>

              {/* Lựa chọn 3: Trả lời ngắn (Thực tế mô hình hóa) */}
              <button
                type="button"
                onClick={() => setExerciseFormat('short_answer')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

            {/* Nút AI Sinh Thêm Bài Tập Mới */}
            <button
              type="button"
              onClick={handleGenerateAiExercise}
              disabled={isGeneratingAi}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Gọi Cố vấn AI tạo câu hỏi mới cùng dạng"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-200 animate-spin" />
              <span>{isGeneratingAi ? 'AI đang tạo bài mới...' : 'AI sinh thêm bài tập'}</span>
            </button>
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
                    <div className="text-xs sm:text-[13px] text-slate-900 leading-relaxed">
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

                    {/* Nút nộp bài & Xem lời giải */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
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
                      </div>
                    </div>

                    {/* Lời giải Socratic chi tiết */}
                    {isEvaluated && (
                      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1.5 animate-in fade-in duration-150">
                        <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 text-emerald-600" />
                          Hướng dẫn giải sư phạm chi tiết:
                        </span>
                        <div className="text-slate-800 leading-relaxed pl-1">
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
          {/* DẠNG 2: CÂU HỎI ĐÚNG / SAI (4 MỆNH ĐỀ A, B, C, D)               */}
          {/* ------------------------------------------------------------- */}
          {exerciseFormat === 'true_false' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Dạng thức II: Câu hỏi Đúng/Sai (Mỗi câu gồm 4 mệnh đề a, b, c, d độc lập).</span>
                <span className="font-bold text-slate-700">Tổng: {currentTfQuestions.length} câu</span>
              </div>

              {currentTfQuestions.map((q, idx) => {
                const userStatements = tfAnswers[q.id] || { a: null, b: null, c: null, d: null };
                const isEvaluated = evaluatedQuestions[q.id];

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
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                          {q.cognitiveLevel}
                        </span>
                      </div>
                    </div>

                    {/* Ngữ cảnh đề bài */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-[13px] text-slate-900 leading-relaxed font-sans">
                      <MathRenderer content={q.context} />
                    </div>

                    {/* 4 Mệnh đề a, b, c, d */}
                    <div className="space-y-2.5 pt-1">
                      {q.statements.map((st) => {
                        const val = userStatements[st.subId];
                        const isStatementEvaluated = isEvaluated && val !== null;
                        const isCorrectAnswer = val === st.isCorrect;

                        return (
                          <div
                            key={st.subId}
                            className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                              isStatementEvaluated
                                ? isCorrectAnswer
                                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                                  : 'bg-rose-50/70 border-rose-300 text-rose-950'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 flex-1">
                              <span className="font-bold text-xs uppercase text-slate-700 mt-0.5">
                                {st.subId})
                              </span>
                              <div className="text-xs sm:text-[13px] text-slate-800 flex-1">
                                <MathRenderer content={st.content} />
                              </div>
                            </div>

                            {/* Cặp nút Đúng / Sai */}
                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              <button
                                type="button"
                                onClick={() => !isEvaluated && handleSelectTf(q.id, st.subId, true)}
                                disabled={isEvaluated}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  val === true
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Đúng
                              </button>
                              <button
                                type="button"
                                onClick={() => !isEvaluated && handleSelectTf(q.id, st.subId, false)}
                                disabled={isEvaluated}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  val === false
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Sai
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Nút kiểm tra */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
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
                            <div className="text-slate-600">
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
                // So sánh mềm đáp án
                const cleanUserVal = userVal.trim().toLowerCase().replace(/,/g, '.');
                const isCorrect = q.acceptableAnswers.some(
                  (ans) => ans.trim().toLowerCase().replace(/,/g, '.') === cleanUserVal || String(q.correctValue) === cleanUserVal
                );

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

                        <div className="pt-1 text-slate-800 leading-relaxed border-t border-amber-200/80">
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
      {/* 5. MODAL CHỌN KHỐI - CHƯƠNG - BÀI HỌC (HIỂN THỊ TRỰC QUAN TỪNG CẤP)        */}
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
                  <p className="text-[11px] text-slate-500">
                    SGK Kết Nối Tri Thức & Cánh Diều • Khối 10, 11, 12
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
