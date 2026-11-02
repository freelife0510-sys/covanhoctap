import React, { useEffect, useRef, useState } from 'react';
import { api, fileToInline, post } from '../services/apiClient.ts';
import type { AIConnection, Session, Workspace } from '../features.ts';
import MathRenderer from './MathRenderer.tsx';
import AdvisorResult, { type AdvisorData, VERDICT_LABELS } from './AdvisorResult.tsx';
const DocumentEditor = React.lazy(() => import('./DocumentEditor.tsx'));
import StudentProgress from './StudentProgress.tsx';
import Practice from './Practice.tsx';

type Message = {
  id: string;
  role: string;
  content: string;
  data?: AdvisorData & { lessonId?: string; intent?: string; fileCount?: number };
};

/** Student-facing modes; each maps to a server intent. */
const MODES = [
  { key: 'check', intent: 'submit_solution', label: 'Kiểm tra bài giải', hint: 'Dán đề + bài làm của em (hoặc chụp ảnh bài làm). AI kiểm tra từng bước, chỉ ra lỗi sai và cách sửa.' },
  { key: 'explain', intent: 'ask_guidance', label: 'Giải thích chỗ chưa hiểu', hint: 'Ghi rõ bước/khái niệm em chưa hiểu. AI giải thích dễ hiểu kèm lí thuyết liên quan.' },
  { key: 'ask', intent: 'ask_guidance', label: 'Đặt câu hỏi / tư vấn lí thuyết', hint: 'Hỏi về lí thuyết, công thức, phương pháp giải một dạng bài.' },
  { key: 'practice', intent: 'request_exercises', label: 'Xin bài luyện tập tương tự', hint: 'Nêu dạng bài em muốn luyện thêm; AI đưa bài tương tự kèm gợi ý.' },
] as const;

type LessonOption = { id: string; title: string; grade: string | number; chapter: string };

export default function LearnerWorkspace({
  session,
  initialAi = null,
  onOpenApiKeyModal,
  apiKeyVersion = 0,
}: {
  session: Session;
  initialAi?: AIConnection | null;
  onOpenApiKeyModal?: () => void;
  apiKeyVersion?: number;
}) {
  const [tab, setTab] = useState('advisor');
  const [conversation, setConversation] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [mode, setMode] = useState<(typeof MODES)[number]['key']>('check');
  const [lessonId, setLessonId] = useState('');
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [ai, setAi] = useState<AIConnection | null>(initialAi);
  const [aiChecking, setAiChecking] = useState(false);

  const checkAi = (force = false) => {
    setAiChecking(true);
    return api<AIConnection>(`/ai/status${force ? '?force=1' : ''}`)
      .then(setAi)
      .catch(e =>
        setAi({
          available: false,
          ready: false,
          model: null,
          code: 'CHECK_FAILED',
          message: (e as Error).message,
          checkedAt: new Date().toISOString(),
        })
      )
      .finally(() => setAiChecking(false));
  };

  const [conversations, setConversations] = useState<{ id: string; created_at: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const requestRef = useRef<{ key: string; requestId: string; attachmentIds: string[] } | null>(null);

  useEffect(() => {
    let alive = true;
    if (!initialAi) void checkAi();
    api<LessonOption[]>('/curriculum')
      .then(rows => {
        if (alive) setLessons(rows);
      })
      .catch(() => null);
    api<{ id: string; created_at: string }[]>('/conversations')
      .then(rows => {
        if (alive) {
          setConversations(rows);
          setConversation(rows[0]?.id || crypto.randomUUID());
        }
      })
      .catch(e => {
        if (alive) setError(e.message);
      });
    const load = () =>
      api<Workspace>('/workspace')
        .then(w => {
          if (alive) setWorkspace(w);
        })
        .catch(e => {
          if (alive) setError(e.message);
        });
    void load();
    const timer = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (apiKeyVersion > 0) {
      void checkAi(true);
    }
  }, [apiKeyVersion]);

  useEffect(() => {
    if (!conversation) return;
    let alive = true;
    api<Message[]>(`/messages?conversationId=${conversation}`)
      .then(rows => {
        if (alive) setMessages(rows);
      })
      .catch(e => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [conversation]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlight.current || (!text.trim() && !file) || !conversation) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      const selected = MODES.find(m => m.key === mode) || MODES[0];
      const key = JSON.stringify([conversation, text, mode, lessonId, file?.name, file?.size, file?.lastModified]);
      let draft = requestRef.current;
      if (!draft || draft.key !== key) {
        draft = { key, requestId: crypto.randomUUID(), attachmentIds: [] };
        requestRef.current = draft;
      }
      const inlineFiles = file ? [await fileToInline(file)] : [];
      const message = mode === 'explain' && text.trim() ? `Em chưa hiểu, hãy giải thích giúp em: ${text}` : text;
      setStatus(selected.intent === 'submit_solution' ? 'AI đang kiểm tra từng bước bài giải…' : 'Đang chờ AI trả lời…');
      await post('/ai/chat', {
        requestId: draft.requestId,
        conversationId: conversation,
        message,
        attachmentIds: [],
        intent: selected.intent,
        lessonId: lessonId || undefined,
        inlineFiles,
      });
      setMessages(await api(`/messages?conversationId=${conversation}`));
      setText('');
      setFile(null);
      requestRef.current = null;
      setConversations(await api('/conversations'));
      setStatus(
        selected.intent === 'submit_solution'
          ? 'Đã kiểm tra xong. Lỗi (nếu có) đã được lưu vào Hồ sơ tiến bộ để giáo viên theo dõi.'
          : 'Đã lưu phản hồi.'
      );
    } catch (e) {
      setError((e as Error).message);
      setStatus('Chưa hoàn thành. Nội dung đang nhập được giữ lại.');
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const latest = messages.filter(m => m.role === 'assistant').at(-1);
  const documentText = latest?.data?.detailedSolution || latest?.content || '';
  const currentMode = MODES.find(m => m.key === mode) || MODES[0];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Xin chào, {session.profile.name}</h1>
      <p>Mã học sinh: {session.student?.student_code}</p>
      <div
        className={ai?.ready ? 'panel border-emerald-300 bg-emerald-50' : ai === null || aiChecking ? 'panel' : 'error'}
        role="status"
        aria-live="polite"
      >
        <p>
          {aiChecking || ai === null
            ? '⏳ Đang kết nối Cố vấn AI…'
            : ai.ready
              ? `✅ ${ai.message}${ai.model ? ` (model: ${ai.model})` : ''}`
              : `⚠️ Cố vấn AI chưa sẵn sàng (AI chưa được kết nối): ${ai.message || 'Chưa cấu hình API Key.'}`}
        </p>
        {!aiChecking && ai && !ai.ready && (
          <div className="flex flex-wrap gap-2 mt-2">
            {onOpenApiKeyModal && (
              <button type="button" className="button" onClick={onOpenApiKeyModal}>
                🔑 Cấu hình Gemini API Key
              </button>
            )}
            <button type="button" onClick={() => void checkAi(true)}>
              Kết nối lại AI
            </button>
          </div>
        )}
      </div>
      <nav className="flex flex-wrap gap-2">
        {[
          ['advisor', 'Cố vấn AI'],
          ['practice', 'Tự học'],
          ['assignments', 'Nhiệm vụ'],
          ['documents', 'Soạn tài liệu A4'],
          ['progress', 'Hồ sơ tiến bộ'],
        ].map(([key, label]) => (
          <button className={tab === key ? 'button' : 'secondary'} key={key} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </nav>
      {error && (
        <div className="error" role="alert">
          <p>{error}</p>
          <button
            disabled={busy}
            onClick={() => {
              requestRef.current = null;
              setError('');
              setStatus('Sẵn sàng gửi yêu cầu mới.');
            }}
          >
            Chuẩn bị gửi lại yêu cầu
          </button>
        </div>
      )}
      {tab === 'advisor' && (
        <div className="grid lg:grid-cols-2 gap-5">
          <section className="panel space-y-4">
            <div className="flex gap-2 flex-wrap">
              <label className="flex-1">
                Hội thoại
                <select value={conversation} disabled={busy} onChange={e => setConversation(e.target.value)}>
                  {!conversations.some(c => c.id === conversation) && <option value={conversation}>Hội thoại mới</option>}
                  {conversations.map(c => (
                    <option key={c.id} value={c.id}>
                      {new Date(c.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                    </option>
                  ))}
                </select>
              </label>
              <button
                disabled={busy}
                onClick={() => {
                  setConversation(crypto.randomUUID());
                  setMessages([]);
                }}
              >
                Hội thoại mới
              </button>
            </div>
            <div className="space-y-4 max-h-[55vh] overflow-auto" aria-live="polite">
              {messages.length === 0 && (
                <p>Nhập câu hỏi hoặc nộp lời giải. Chọn rõ mục đích để câu hỏi hướng dẫn không bị tính thành bài chấm.</p>
              )}
              {messages.map(m => (
                <article key={m.id} className={m.role === 'user' ? 'bg-emerald-50 p-3 rounded' : 'bg-slate-50 p-3 rounded'}>
                  <b>{m.role === 'user' ? 'Bạn' : 'Cố vấn AI'}</b>
                  {m.role === 'assistant' && m.data?.verdict && VERDICT_LABELS[m.data.verdict] && (
                    <p className={`my-1 inline-block rounded-full border px-2 py-0.5 text-xs font-bold ${VERDICT_LABELS[m.data.verdict].className}`}>
                      {VERDICT_LABELS[m.data.verdict].text}
                    </p>
                  )}
                  <MathRenderer content={m.content} />
                  {m.role === 'assistant' && !!m.data?.errorEvidence?.length && (
                    <p className="text-xs text-rose-700">Phát hiện {m.data.errorEvidence.length} lỗi — xem chi tiết ở khung “Phản hồi chi tiết”.</p>
                  )}
                </article>
              ))}
            </div>
            <form onSubmit={send} className="space-y-3">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Chế độ cố vấn">
                {MODES.map(m => (
                  <button
                    type="button"
                    key={m.key}
                    disabled={busy}
                    className={mode === m.key ? 'button' : 'secondary'}
                    aria-pressed={mode === m.key}
                    onClick={() => setMode(m.key)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-600">{currentMode.hint}</p>
              <label>
                Chủ đề / chuyên đề (để hệ thống ghi nhận nội dung còn yếu)
                <select value={lessonId} onChange={e => setLessonId(e.target.value)} disabled={busy}>
                  <option value="">— Chưa chọn chủ đề —</option>
                  {lessons.map(l => (
                    <option key={l.id} value={l.id}>
                      Lớp {l.grade} · {l.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {mode === 'check' ? 'Đề bài và bài làm của em' : 'Câu hỏi của em'}
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  maxLength={20000}
                  rows={6}
                  disabled={busy}
                  placeholder={
                    mode === 'check'
                      ? 'Ví dụ: Giải phương trình $\\log_2(x+1)+\\log_2(x-1)=3$. Bài làm của em: ...'
                      : 'Nhập câu hỏi, có thể dùng $...$ cho công thức'
                  }
                />
              </label>
              <label>
                Ảnh chụp bài làm hoặc PDF (ảnh được nén tự động, PDF tối đa 3 MB)
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  disabled={busy}
                  onChange={e => {
                    const f = e.target.files?.[0] || null;
                    if (f && f.size > 10485760) {
                      setError('Tệp vượt 10 MB.');
                      e.target.value = '';
                      return;
                    }
                    setFile(f);
                  }}
                />
              </label>
              {file && (
                <p>
                  {file.name}{' '}
                  <button type="button" disabled={busy} onClick={() => setFile(null)}>
                    Bỏ tệp
                  </button>
                </p>
              )}
              <button className="button" disabled={busy || (!text.trim() && !file)}>
                {busy ? 'Đang xử lý…' : currentMode.key === 'check' ? 'Nhờ AI kiểm tra bài' : 'Gửi cho Cố vấn AI'}
              </button>
              <p role="status">{status}</p>
            </form>
          </section>
          <section className="panel">
            <h2>Phản hồi chi tiết</h2>
            {latest ? (
              <>
                <AdvisorResult data={{ ...latest.data, chatReply: latest.content }} showReply={false} />
                <p className="text-sm mt-4">Kết quả AI sơ bộ, có thể sai. Giáo viên sẽ thẩm định trong mục Bài nộp.</p>
                <button onClick={() => setTab('documents')}>Mở trình soạn tài liệu</button>
              </>
            ) : (
              <p>Chưa có phản hồi. Không có phiếu mẫu được tính thành bài làm của bạn.</p>
            )}
          </section>
        </div>
      )}
      {tab === 'practice' && <Practice />}
      {tab === 'assignments' && (
        <section className="panel">
          <h2>Nhiệm vụ được giao</h2>
          {!workspace?.assignments.length ? (
            <p>Chưa có nhiệm vụ được giao.</p>
          ) : (
            workspace.assignments.map(a => (
              <article className="my-4" key={a.id}>
                <h3>{a.title}</h3>
                <p>
                  {a.lesson_id} · {a.deadline ? new Date(a.deadline).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'Không có hạn nộp'}
                </p>
                <Practice lessonId={a.lesson_id} assignmentId={a.id} />
              </article>
            ))
          )}
        </section>
      )}
      {tab === 'progress' && <StudentProgress />}
      {tab === 'documents' && <DocumentEditor initialText={documentText} />}
    </div>
  );
}
