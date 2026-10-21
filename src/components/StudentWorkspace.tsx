import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  FileSpreadsheet, 
  X, 
  User, 
  Bot, 
  Lightbulb, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight,
  Download,
  Printer,
  HelpCircle
} from 'lucide-react';
import { MathSubmission, StudentAccount } from '../types/index.ts';
import { processStudentChatInteraction, ChatAssistantResponse } from '../services/geminiService.ts';
import { parseUploadedFile, ParsedFileResult } from '../utils/fileParser.ts';
import { A4DocumentExportData } from '../utils/wordExport.ts';
import A4DocumentViewer from './A4DocumentViewer.tsx';
import MathRenderer from './MathRenderer.tsx';
import SelfStudyModule from './SelfStudyModule.tsx';

interface ChatMessage {
  id: string;
  sender: 'student' | 'assistant';
  text: string;
  timestamp: string;
  attachedFile?: ParsedFileResult;
  a4Data?: A4DocumentExportData;
}

interface StudentWorkspaceProps {
  apiKey?: string;
  selectedModel?: string;
  student: StudentAccount;
  onUpdateStudent: (student: StudentAccount) => void;
  onNewSubmission: (submission: MathSubmission) => void;
  submissions: MathSubmission[];
  onUpdateNotes: (submissionId: string, notes: string[]) => void;
  onMarkResolved: (submissionId: string) => void;
}

const QUICK_PROMPTS = [
  '🔍 Thẩm định bài giải này giúp em',
  '❓ Em chưa biết cách làm dạng này, hãy hướng dẫn em',
  '🎯 Ra bài tập rèn luyện tương đương có lời giải',
  '📐 Bù đắp công thức và lý thuyết then chốt',
];

export const StudentWorkspace: React.FC<StudentWorkspaceProps> = ({
  apiKey = '',
  selectedModel = 'gemini-3.8-flash',
  student,
  onUpdateStudent,
  onNewSubmission,
}) => {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Xin chào **${student.name || 'Nguyễn Duy An'}**! Thầy/Cô và Cố vấn AI sẵn sàng đồng hành cùng em trong môn Toán THPT.\n\nEm có thể:\n1. **Gõ câu hỏi** hoặc dạng bài toán chưa biết cách làm.\n2. **Tải lên bài tập đã giải** (ảnh chữ viết tay, file Word \`.docx\`, file PDF) để cố vấn AI hỗ trợ bạn.`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<ParsedFileResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('Đang phân tích...');

  // Workspace feature mode: 'advisor' (Cố vấn AI + A4) hoặc 'self_study' (Tự học theo SGK)
  const [studentWorkspaceTab, setStudentWorkspaceTab] = useState<'advisor' | 'self_study'>('advisor');

  // Active A4 document data to render in the right column
  const [activeA4Data, setActiveA4Data] = useState<A4DocumentExportData | null>(() => {
    // Khởi tạo một mẫu A4 ban đầu
    return {
      title: 'Phiếu Học Tập & Chẩn Đoán Sư Phạm GDPT 2018',
      studentName: student.name || 'Nguyễn Duy An',
      studentId: student.id || 'HS12A1-01',
      className: student.className || 'Lớp 12A1 (Toán THPT)',
      teacherName: student.teacherName || 'Bộ môn Toán THPT',
      timestamp: new Date().toLocaleDateString('vi-VN'),
      problemText: 'Giải phương trình vô tỉ trên tập số thực $\\mathbb{R}$:\n$$\\sqrt{x - 2} = x - 4$$',
      solutionText: 'x - 2 = (x - 4)^2 <=> x^2 - 9x + 18 = 0 <=> x = 6 hoặc x = 3. Kết luận S = {3; 6}.',
      isCorrect: false,
      errorCategory: 'Chưa đặt điều kiện xác định',
      keyInsight: 'Cần đặt điều kiện vế phải $x - 4 \\ge 0 \\Leftrightarrow x \\ge 4$ trước khi bình phương hai vế để loại bỏ nghiệm ngoại lai $x = 3$.',
      theorySummary: 'Phương pháp giải phương trình vô tỉ dạng $\\sqrt{A} = B$:\n$$\\sqrt{A} = B \\Leftrightarrow \\begin{cases} B \\ge 0 \\\\ A = B^2 \\end{cases}$$',
      formulasNeeded: [
        '\\sqrt{A} = B \\Leftrightarrow B \\ge 0 \\text{ và } A = B^2',
        '(a - b)^2 = a^2 - 2ab + b^2',
      ],
      socraticQuestions: [
        'Vế trái $\\sqrt{x - 2}$ luôn không âm, vậy vế phải $x - 4$ cần mang dấu gì?',
        'Nếu thay nghiệm $x = 3$ vào phương trình ban đầu, ta nhận được $\\sqrt{1} = -1$, đẳng thức này có đúng không?',
      ],
      followUpProblems: [
        {
          id: 1,
          title: 'Bài tập tương đương 1',
          content: 'Giải phương trình vô tỉ: $\\sqrt{2x - 3} = x - 3$',
          difficulty: 'Tương đương',
          initialHint: 'Đặt điều kiện vế phải $x - 3 \\ge 0 \\Leftrightarrow x \\ge 3$',
        },
        {
          id: 2,
          title: 'Bài tập vận dụng 2',
          content: 'Tìm tất cả các giá trị thực của tham số $m$ để phương trình $\\sqrt{2x^2 - 5x + 2} = x - m$ có nghiệm.',
          difficulty: 'Vận dụng',
          initialHint: 'Biến đổi tương đương với điều kiện $x \\ge m$ rồi khảo sát hàm số.',
        },
      ],
      pedagogicalAdvice: 'Học sinh chú ý tạo phản xạ xét tập xác định và điều kiện vế phải trước khi thực hiện mọi phép biến đổi đại số.',
    };
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length > 0 && prev[0].id === 'welcome-msg') {
        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          text: `Xin chào **${student.name || 'Nguyễn Duy An'}**! Thầy/Cô và Cố vấn AI sẵn sàng đồng hành cùng em trong môn Toán THPT.\n\nEm có thể:\n1. **Gõ câu hỏi** hoặc dạng bài toán chưa biết cách làm.\n2. **Tải lên bài tập đã giải** (ảnh chữ viết tay, file Word \`.docx\`, file PDF) để cố vấn AI hỗ trợ bạn.`,
        };
        return updated;
      }
      return prev;
    });
  }, [student.name]);

  // Xử lý đính kèm tệp
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseUploadedFile(file);
      setAttachedFile(parsed);
    } catch (err) {
      console.error('Lỗi tải tệp:', err);
      alert('Không thể đọc file đã chọn. Vui lòng thử lại!');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Gửi tin nhắn và nhận phản hồi AI
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();

    if (!messageContent && !attachedFile) {
      return;
    }

    const currentAttached = attachedFile;
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // 1. Thêm tin nhắn của Học sinh
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'student',
      text: messageContent || (currentAttached ? `Đã đính kèm tệp: ${currentAttached.fileName}` : ''),
      timestamp: nowTime,
      attachedFile: currentAttached || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setAttachedFile(null);
    setIsProcessing(true);
    setProcessingStatus('Đang đọc câu hỏi & số hóa công thức toán...');

    try {
      setTimeout(() => {
        setProcessingStatus('Đang truy vết bước giải & chẩn đoán sư phạm...');
      }, 700);

      setTimeout(() => {
        setProcessingStatus('Đang tự động lập bài tập rèn luyện & xuất bản phiếu A4...');
      }, 1400);

      const aiResponse = await processStudentChatInteraction(
        messageContent,
        currentAttached?.text,
        currentAttached?.imageBase64,
        apiKey,
        {
          name: student.name || 'Học sinh',
          id: student.id || 'HS-MAT',
          className: student.className || 'Toán THPT',
        },
        selectedModel
      );

      // Cập nhật A4 Document ở cột bên phải
      setActiveA4Data(aiResponse.a4Data);

      // Thêm phản hồi của Cố vấn AI vào khung chat
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: aiResponse.chatReply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        a4Data: aiResponse.a4Data,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Đồng bộ bài nộp và vùng trũng kiến thức về hồ sơ học sinh
      const newSub: MathSubmission = {
        id: `sub-${Date.now().toString().slice(-6)}`,
        studentId: student.id || 'student-curr',
        studentName: student.name || 'Học sinh',
        classId: student.classId || 'class-12a1',
        timestamp: `${new Date().toLocaleDateString('vi-VN')} ${nowTime}`,
        problemText: messageContent || currentAttached?.fileName || 'Bài tập Toán',
        solutionText: currentAttached?.text || undefined,
        solutionImageUrl: currentAttached?.imageBase64 || undefined,
        isCorrect: aiResponse.isCorrect ?? false,
        errorCategory: aiResponse.errorCategory,
        diagnosticResult: {
          theorySummary: aiResponse.a4Data.theorySummary,
          formulasNeeded: aiResponse.a4Data.formulasNeeded,
          socraticQuestions: aiResponse.a4Data.socraticQuestions,
          followUpProblems: (aiResponse.generatedProblems || []).map((p) => ({
            id: p.id,
            title: p.title,
            content: p.content,
            difficulty: p.difficulty === 'Nâng cao' ? 'Nâng cao' : 'Tương đương',
            initialHint: p.initialHint,
          })),
          keyInsight: aiResponse.a4Data.keyInsight,
          pedagogicalAdviceForTeacher: aiResponse.a4Data.pedagogicalAdvice,
        },
        hasResolvedMistake: false,
      };

      onNewSubmission(newSub);

      // Cập nhật lỗ hổng sư phạm khi CÓ BẰNG CHỨNG rõ ràng từ bài giải của học sinh
      const detectedGaps = [...(student.detectedGaps || [])];
      const hasRealStudentWork = Boolean(currentAttached?.text || userText.length > 40);

      if (hasRealStudentWork && aiResponse.errorCategory && !aiResponse.isCorrect && !detectedGaps.includes(aiResponse.errorCategory)) {
        detectedGaps.push(aiResponse.errorCategory);
      }

      // Giữ nguyên điểm số hiện tại của học sinh, KHÔNG tự gán 10 hay 5.5 khi chỉ hỏi bài hoặc chưa qua bài kiểm tra chuẩn hóa
      onUpdateStudent({
        ...student,
        status: detectedGaps.length === 0 ? 'diagnosed' : 'needs_remedy',
        gapsCount: detectedGaps.length,
        detectedGaps,
      });
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Có lỗi xảy ra khi xử lý câu hỏi. Vui lòng thử lại hoặc gõ trực tiếp đề bài toán.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Student Header Bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-semibold text-emerald-200 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Hệ thống Cố vấn Đánh giá Thích ứng Toán THPT (GDPT 2018)
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white">
            Xin chào, {student.name || 'Em học sinh'}!
          </h1>
          <p className="text-xs text-emerald-100/90 mt-0.5">
            Mã định danh: <span className="font-mono font-bold text-amber-300">{student.id}</span> • Lớp:{' '}
            <span className="font-bold text-white">{student.className || 'Toán THPT'}</span> • Giáo viên phụ trách:{' '}
            <span className="font-bold text-emerald-300">{student.teacherName || 'Bộ môn Toán'}</span>
          </p>
        </div>

        {/* Quick Metrics */}
        <div className="flex items-center gap-2">
          <div className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Điểm gần nhất</span>
            <span className="text-base font-black text-amber-300">
              {student.latestScore !== undefined ? `${student.latestScore}` : '--'}
            </span>
          </div>

          <div className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Vùng trũng</span>
            <span className="text-base font-black text-rose-300">
              {student.detectedGaps?.length || student.gapsCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Feature Switcher Tabs */}
      <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setStudentWorkspaceTab('advisor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            studentWorkspaceTab === 'advisor'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Cố Vấn AI & Chẩn Đoán Bài Tập (Tờ Phiếu A4)</span>
        </button>

        <button
          type="button"
          onClick={() => setStudentWorkspaceTab('self_study')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            studentWorkspaceTab === 'self_study'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Tự Học Theo SGK (Khối 10 - 11 - 12)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-900">
            Mới
          </span>
        </button>
      </div>

      {/* VIEW 1: TỰ HỌC THEO SGK (LÍ THUYẾT & 3 DẠNG BÀI TẬP) */}
      {studentWorkspaceTab === 'self_study' ? (
        <SelfStudyModule
          apiKey={apiKey}
          selectedModel={selectedModel}
          student={student}
          onUpdateStudent={onUpdateStudent}
        />
      ) : (
        /* VIEW 2: CỐ VẤN AI & TRÌNH SOẠN THẢO A4 */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ==================================================== */}
          {/* CỘT TRÁI: KHUNG CHATBOX TƯƠNG TÁC ĐA PHƯƠNG THỨC */}
          {/* ==================================================== */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[760px] overflow-hidden">
          
          {/* Chatbox Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                  Cố vấn Sư phạm Toán AI
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-semibold">{selectedModel || 'Gemini 3.8 Flash'}</span>
                  <span>• GDPT 2018 Multimodal Vision</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'new-msg',
                    sender: 'assistant',
                    text: 'Cuộc trò chuyện đã được làm mới. Em hãy gửi đề bài hoặc tài liệu bài tập cần cố vấn nhé!',
                    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
              }}
              title="Làm mới cuộc trò chuyện"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-slate-50 border-b border-slate-200 p-2.5 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(prompt);
                }}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-[11px] font-semibold text-slate-700 hover:text-emerald-800 shrink-0 transition-all cursor-pointer shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                    msg.sender === 'student'
                      ? 'bg-emerald-700 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-none'
                  }`}
                >
                  {/* File đính kèm nếu có */}
                  {msg.attachedFile && (
                    <div
                      className={`mb-2.5 p-2 rounded-xl flex items-center gap-2 text-xs ${
                        msg.sender === 'student' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {msg.attachedFile.fileType === 'image' ? (
                        <ImageIcon className="w-4 h-4 text-emerald-300 shrink-0" />
                      ) : msg.attachedFile.fileType === 'word' ? (
                        <FileSpreadsheet className="w-4 h-4 text-blue-400 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div className="truncate flex-1">
                        <span className="font-bold block truncate">{msg.attachedFile.fileName}</span>
                        <span className="text-[10px] opacity-75">{msg.attachedFile.fileSizeFormatted}</span>
                      </div>
                    </div>
                  )}

                  {/* Thumbnail nếu là ảnh viết tay */}
                  {msg.attachedFile?.imageBase64 && (
                    <div className="mb-2.5 rounded-xl overflow-hidden border border-white/20 bg-black/20">
                      <img
                        src={msg.attachedFile.imageBase64}
                        alt="Đính kèm"
                        className="max-h-40 w-full object-contain"
                      />
                    </div>
                  )}

                  {/* Text nội dung với Math KaTeX */}
                  <div className={msg.sender === 'student' ? 'text-white' : 'text-slate-800'}>
                    <MathRenderer content={msg.text} />
                  </div>

                  {/* Nút xem chi tiết lời giải & bảng biến thiên trên tờ phiếu A4 */}
                  {msg.a4Data && msg.sender === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveA4Data(msg.a4Data!);
                        const a4El = document.getElementById('a4-viewer-panel');
                        if (a4El) a4El.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Xem Lời giải & Bảng biến thiên (Phiếu A4)</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
                  )}

                  <span
                    className={`text-[9px] block text-right mt-1.5 ${
                      msg.sender === 'student' ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'student' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Indicator khi đang phân tích */}
            {isProcessing && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3.5 shadow-2xs space-y-2 max-w-[80%]">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>{processingStatus}</span>
                  </div>
                  <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full animate-pulse w-3/4"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Attached File Preview Bar (Trước khi gửi) */}
          {attachedFile && (
            <div className="p-2.5 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2 truncate">
                {attachedFile.fileType === 'image' ? (
                  <ImageIcon className="w-4 h-4 text-emerald-700 shrink-0" />
                ) : attachedFile.fileType === 'word' ? (
                  <FileSpreadsheet className="w-4 h-4 text-blue-700 shrink-0" />
                ) : (
                  <FileText className="w-4 h-4 text-rose-700 shrink-0" />
                )}
                <span className="font-bold truncate">{attachedFile.fileName}</span>
                <span className="text-[10px] text-emerald-700 font-mono">({attachedFile.fileSizeFormatted})</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input Box Footer */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-2">
            <div className="flex items-end gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              
              {/* Nút đính kèm File (Ảnh, Word docx, PDF) */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Tải lên ảnh chụp chữ viết tay, file Word (.docx), file PDF bài tập"
                className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer shrink-0"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.docx,.doc,.pdf,.txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Textarea nhập câu hỏi & công thức */}
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Nhập đề bài, câu hỏi toán học (hỗ trợ $...$) hoặc tải file lên..."
                rows={2}
                className="flex-1 bg-transparent text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none min-h-[38px] max-h-28"
              />

              {/* Nút gửi */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={(!inputText.trim() && !attachedFile) || isProcessing}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Định dạng: Gõ text, LaTeX $...$, Ảnh viết tay, Word .docx, PDF</span>
              <span>Nhấn Enter để gửi</span>
            </div>
          </div>

        </div>

        {/* ==================================================== */}
        {/* CỘT PHẢI: TRÌNH SOẠN THẢO & PHIẾU HỌC TẬP A4 CHUẨN MỰC */}
        {/* ==================================================== */}
        <div id="a4-viewer-panel" className="lg:col-span-7">
          <A4DocumentViewer
            data={activeA4Data}
            onPrint={() => window.print()}
          />
        </div>

      </div>
      )}
    </div>
  );
};

export default StudentWorkspace;
