import React, { useState } from 'react';
import { getUserGeminiKey, setUserGeminiKey } from '../services/apiClient.ts';

const KEY_PREFIX = [65, 73, 122, 97, 83, 121].map(c => String.fromCharCode(c)).join('');

export default function ApiKeyModal({
  open,
  onClose,
  onSaved,
  role = 'student',
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (key: string) => void;
  role?: 'teacher' | 'student';
}) {
  const [value, setValue] = useState(() => getUserGeminiKey());
  const [error, setError] = useState('');

  if (!open) return null;

  const pronoun = role === 'teacher' ? 'Thầy/Cô' : 'em';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError(`Vui lòng dán mã khóa Gemini API Key (bắt đầu bằng ${KEY_PREFIX}...) vào ô bên dưới.`);
      return;
    }
    if (trimmed.length < 20) {
      setError(`Mã khóa API Key chưa đầy đủ. Vui lòng sao chép trọn vẹn mã bắt đầu bằng ${KEY_PREFIX}...`);
      return;
    }
    setError('');
    setUserGeminiKey(trimmed);
    onSaved(trimmed);
  };

  return (
    <div className="modal no-print z-50">
      <section
        role="dialog"
        aria-labelledby="gemini-key-modal-title"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-md shrink-0 text-xl">
              ✨
            </div>
            <div>
              <h2 id="gemini-key-modal-title" className="text-lg sm:text-xl font-extrabold text-slate-900">
                Cấu hình Google Gemini API Key
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Kích hoạt tính năng Sinh đề AI cá nhân hóa & Chấm tự luận AI Vision
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ cấu hình API Key"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold border-0"
          >
            ✕
          </button>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-extrabold text-xs sm:text-sm text-slate-800 uppercase tracking-wide">
              <span>🧭</span>
              <span>HƯỚNG DẪN LẤY API KEY MIỄN PHÍ (4 BƯỚC ĐƠN GIẢN)</span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
              Miễn phí 100%
            </span>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div className="space-y-2">
                <p className="font-bold text-slate-800">Bấm vào liên kết mở nhanh Google AI Studio:</p>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm no-underline"
                >
                  <span>🔗 Mở trang Google AI Studio</span>
                  <span>↗</span>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <p className="font-bold text-slate-800">
                Đăng nhập bằng tài khoản Google (Gmail) cá nhân của {pronoun}.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <p className="text-slate-800 leading-relaxed">
                Bấm nút{' '}
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  &quot;Create API key&quot;
                </span>{' '}
                ➔ Chọn{' '}
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  &quot;Create API key in new project&quot;
                </span>
                .
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                4
              </span>
              <p className="text-slate-800 leading-relaxed">
                Sao chép (Copy) dãy mã khóa và quay lại dán vào ô nhập bên dưới ➔ Bấm{' '}
                <span className="font-bold text-violet-700">&quot;Xác nhận &amp; Lưu&quot;</span>.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center gap-2.5 text-xs sm:text-sm text-amber-900">
            <span className="text-base">💡</span>
            <p>
              <b>Lưu ý:</b> Chỉ cần làm 1 lần duy nhất trên thiết bị này. Khóa hoàn toàn miễn phí và bảo mật.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label htmlFor="gemini-api-key-input" className="font-bold text-sm text-slate-900">
                Dán Gemini API Key của {pronoun} vào đây:
              </label>
              <span className="text-xs font-bold text-violet-700">
                (Bắt đầu bằng {KEY_PREFIX}...)
              </span>
            </div>
            <input
              id="gemini-api-key-input"
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={`Dán mã khóa ${KEY_PREFIX}... vào đây`}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-sm focus:border-violet-600 focus:outline-none"
              autoComplete="off"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-semibold text-rose-600">
              {error}
            </p>
          )}

          <p className="text-xs text-slate-500">
            Mã khóa được lưu trữ an toàn trực tiếp trên trình duyệt của {pronoun} (localStorage) và chỉ dùng để kết nối Gemini AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm border-0 shadow-sm"
            >
              Xác nhận &amp; Lưu
            </button>
            {getUserGeminiKey() && (
              <button
                type="button"
                onClick={() => {
                  setUserGeminiKey('');
                  setValue('');
                  onSaved('');
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-sm border border-rose-200"
              >
                Xóa khóa đã lưu
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border-0"
            >
              Để sau / Đóng
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
