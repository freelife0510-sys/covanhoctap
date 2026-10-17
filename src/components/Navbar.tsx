import React, { useState } from 'react';
import { 
  Role 
} from '../types/index.ts';
import { 
  GraduationCap, 
  UserCheck, 
  Key, 
  Check, 
  HelpCircle, 
  X, 
  ShieldCheck, 
  Sparkles,
  BookOpenCheck,
  Download,
  Terminal,
  FolderArchive
} from 'lucide-react';
import { downloadCompleteProjectZip } from '../utils/downloadZip.ts';

interface NavbarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  apiKey,
  onSaveApiKey,
}) => {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState(apiKey);
  const [showPedagogyModal, setShowPedagogyModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleDownloadZip = async () => {
    setIsGeneratingZip(true);
    const success = await downloadCompleteProjectZip();
    setIsGeneratingZip(false);
    if (success) {
      setShowDownloadModal(true);
    } else {
      alert('Không thể tạo file ZIP. Vui lòng thử lại!');
    }
  };

  const handleSaveKey = () => {
    onSaveApiKey(inputKey.trim());
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      setShowKeyModal(false);
    }, 1200);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-800 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/20">
              <span className="font-serif font-black text-lg">π</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base md:text-lg text-slate-900 tracking-tight">
                  MathDiagnostic<span className="text-emerald-600">.AI</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  GDPT 2018
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Hệ thống Đánh giá Thích ứng & Chẩn đoán Vùng trũng Kiến thức
              </p>
            </div>
          </div>

          {/* Central Role Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
            <button
              onClick={() => onRoleChange('student')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentRole === 'student'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Chế độ Học sinh</span>
            </button>

            <button
              onClick={() => onRoleChange('teacher')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentRole === 'teacher'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>Chế độ Giáo viên</span>
            </button>
          </div>

          {/* Right Action Icons: Key config, Pedagogy info & Download Code */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isGeneratingZip}
              title="Tải toàn bộ mã nguồn (.ZIP) về máy tính"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">
                {isGeneratingZip ? 'Đang nén ZIP...' : 'Tải Code (.ZIP)'}
              </span>
            </button>

            <button
              onClick={() => setShowPedagogyModal(true)}
              title="Tìm hiểu phương pháp Socratic"
              className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowKeyModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">
                {apiKey ? 'Gemini 2.5 Active' : 'Cấu hình AI'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Gemini API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Cấu hình Google Gemini AI</h3>
                  <p className="text-[11px] text-slate-500">Multimodal Vision & Phân tích Sư phạm</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Nhập <strong>Google Gemini API Key</strong> để sử dụng mô hình <code>gemini-2.5-flash</code> trực tiếp phân tích chữ viết tay và bài làm. Nếu để trống, hệ thống sẽ tự động dùng <strong>Bộ quy tắc Sư phạm THPT GDPT 2018 (Mock Fallback Engine)</strong> hoạt động mượt mà ngay lập tức.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Lưu an toàn trên trình duyệt
                </span>
                {savedMessage && (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Đã lưu thành công!
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={handleSaveKey}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Lưu cấu hình
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pedagogy Explanation Modal */}
      {showPedagogyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <BookOpenCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Triết lý Sư phạm Socratic GDPT 2018</h3>
                  <p className="text-[11px] text-emerald-600 font-medium">Đánh giá vì sự tiến bộ của người học</p>
                </div>
              </div>
              <button
                onClick={() => setShowPedagogyModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  1. Không cho đáp số sẵn khi học sinh giải sai
                </h4>
                <p className="text-slate-600 text-[11px]">
                  Thay vì hiện giải chi tiết khiến học sinh phụ thuộc, AI chỉ tóm tắt lý thuyết trọng tâm và đặt 2-3 câu hỏi gợi mở để người học tự lần ngược lại bước tính toán hoặc giả thiết bị bỏ quên.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  2. Tờ phiếu A4 sư phạm độc lập cho Học sinh
                </h4>
                <p className="text-slate-600 text-[11px]">
                  Bảo vệ tâm lý học đường: Học sinh chỉ xem tiến độ và phản hồi của riêng mình trên phiếu A4 chuẩn hóa, tuyệt đối không bị so sánh với thống kê lớp để tránh áp lực đồng trang lứa.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  3. Bản đồ nhiệt vùng trũng kiến thức cho Giáo viên
                </h4>
                <p className="text-slate-600 text-[11px]">
                  Giáo viên nắm bắt chính xác lớp học đang yếu ở mảng nào (điều kiện xác định, đạo hàm sai dấu, hay công thức hình học Oxyz) để điều chỉnh trọng tâm bài giảng trong tiết học tiếp theo.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowPedagogyModal(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Success & Setup Guide Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Đã tạo và tải file math-diagnostic-ai.zip!</h3>
                  <p className="text-[11px] text-emerald-600 font-medium">Bao gồm đầy đủ 21 tệp tin mã nguồn chuẩn TypeScript</p>
                </div>
              </div>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <p className="text-slate-600 text-xs">
                File <strong>math-diagnostic-ai.zip</strong> đã được nén trực tiếp trên trình duyệt của bạn với cấu trúc chuẩn. Sau khi tải về máy tính, bạn thực hiện 3 bước sau để chạy:
              </p>

              {/* Terminal commands box */}
              <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-xs space-y-2 border border-slate-800">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 pb-1 border-b border-slate-800">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  Terminal / Command Prompt tại thư mục giải nén:
                </div>
                <div className="text-emerald-400"># 1. Cài đặt các thư viện:</div>
                <div className="text-slate-200 pl-2">npm install</div>
                <div className="text-emerald-400 mt-2"># 2. Khởi chạy ứng dụng:</div>
                <div className="text-slate-200 pl-2">npm run dev</div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 text-[11px]">
                💡 <strong>Lưu ý:</strong> Ứng dụng đã tích hợp sẵn bộ kiểm thử toán học cục bộ (Local Fallback), bạn có thể chạy thử ngay mà không bắt buộc phải có API Key.
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowDownloadModal(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
              >
                Đã hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
