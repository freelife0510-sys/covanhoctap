import React, { useEffect, useRef, useState } from 'react';
import { api, post, upload } from '../services/apiClient.ts';
import type { AIConnection, Session, Workspace } from '../features.ts';
import MathRenderer from './MathRenderer.tsx';
const DocumentEditor = React.lazy(() => import('./DocumentEditor.tsx'));
import StudentProgress from './StudentProgress.tsx';
import Practice from './Practice.tsx';

type Message = {
  id: string;
  role: string;
  content: string;
  data?: { detailedSolution?: string; verdict?: string; modelUsed?: string; reviewState?: string };
};

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
  const [intent, setIntent] = useState('ask_guidance');
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
    const timer = setInterval(load, 8000);
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
      const key = JSON.stringify([conversation, text, intent, file?.name, file?.size, file?.lastModified]);
      let draft = requestRef.current;
      if (!draft || draft.key !== key) {
        draft = { key, requestId: crypto.randomUUID(), attachmentIds: [] };
        requestRef.current = draft;
      }
      if (file && !draft.attachmentIds.length) {
        setStatus('Đang tải tệp lên kho riêng tư…');
        draft.attachmentIds = [await upload(file)];
      }
      setStatus('Đang chờ AI xử lý và lưu phản hồi…');
      await post('/ai/chat', {
        requestId: draft.requestId,
        conversationId: conversation,
        message: text,
        attachmentIds: draft.attachmentIds,
        intent,
      });
      setMessages(await api(`/messages?conversationId=${conversation}`));
      setText('');
      setFile(null);
      requestRef.current = null;
      setConversations(await api('/conversations'));
      setStatus('Đã lưu phản hồi trên máy chủ.');
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
                  <MathRenderer content={m.content} />
                  {m.role === 'assistant' && (
                    <p className="text-xs text-slate-500">
                      {m.data?.modelUsed} · Kết luận: {m.data?.verdict} · Chưa được giáo viên xác minh
                    </p>
                  )}
                </article>
              ))}
            </div>
            <form onSubmit={send} className="space-y-3">
              <label>
                Mục đích
                <select value={intent} onChange={e => setIntent(e.target.value)} disabled={busy}>
                  <option value="ask_guidance">Hỏi hướng dẫn (không chấm điểm)</option>
                  <option value="submit_solution">Nộp lời giải để đánh giá</option>
                  <option value="request_exercises">Yêu cầu bài luyện tập</option>
                </select>
              </label>
              <label>
                Câu hỏi / lời giải
                <textarea value={text} onChange={e => setText(e.target.value)} maxLength={20000} rows={5} disabled={busy} />
              </label>
              <label>
                Ảnh hoặc PDF (tối đa 10 MB)
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
                {busy ? 'Đang xử lý…' : 'Gửi'}
              </button>
              <p role="status">{status}</p>
            </form>
          </section>
          <section className="panel">
            <h2>Phản hồi chi tiết</h2>
            {documentText ? (
              <>
                <MathRenderer content={documentText} />
                <p className="text-sm mt-4">Kết quả AI sơ bộ, có thể sai. Liên hệ giáo viên để thẩm định.</p>
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
