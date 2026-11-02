import React, { useEffect, useState } from 'react';
import { api, post } from '../services/apiClient.ts';

export default function StudentProgress() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any | null>(null);
  const [noteBySub, setNoteBySub] = useState<Record<string, string>>({});
  const [submittedNotes, setSubmittedNotes] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [lessonNames, setLessonNames] = useState<Record<string, string>>({});
  const lessonTitle = (id?: string | null) => (id ? lessonNames[id] || id : '');

  const load = () => {
    Promise.all([
      api<any[]>('/attempts'),
      api<any[]>('/evidence'),
      api<any[]>('/feedback'),
      api<any>('/recommendations').catch(() => null),
    ])
      .then(([a, e, f, rec]) => {
        setAttempts(a);
        setEvidence(e);
        setFeedback(f);
        setRecommendations(rec);
      })
      .catch(e => setError(e.message));
  };

  useEffect(() => {
    load();
    api<{ id: string; title: string; grade: string }[]>('/curriculum')
      .then(rows => setLessonNames(Object.fromEntries(rows.map(r => [r.id, `Lớp ${r.grade} · ${r.title}`]))))
      .catch(() => null);
  }, []);

  const submitSelfCorrection = async (submissionId: string) => {
    const note = (noteBySub[submissionId] || '').trim();
    if (note.length < 3) {
      setError('Vui lòng nhập nội dung tự sửa ít nhất 3 ký tự.');
      return;
    }
    setBusy(true);
    setError('');
    setStatus('');
    try {
      await post('/submissions/self-correction', { submissionId, note });
      setSubmittedNotes(prev => ({ ...prev, [submissionId]: note }));
      setStatus('Đã gửi bản tự sửa. Lưu ý: Trạng thái "Đã khắc phục" chỉ được cập nhật sau khi em làm lại bài đạt hoặc được giáo viên xác nhận.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel space-y-4">
      <h2>Hồ sơ tiến bộ</h2>
      {(() => {
        const done = attempts.filter(a => a.submitted && a.result);
        const days = new Set(done.filter(a => Date.now() - new Date(a.createdAt).getTime() <= 28 * 86_400_000).map(a => String(a.createdAt).slice(0, 10))).size;
        const open = evidence.filter(e => e.state === 'needs_remedy').length;
        const fixed = evidence.filter(e => e.state === 'resolved').length;
        const scores = done.map(a => Number(a.result.score)).reverse();
        const half = Math.floor(scores.length / 2);
        const mean = (xs: number[]) => (xs.length ? (xs.reduce((x, y) => x + y, 0) / xs.length).toFixed(1) : '—');
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="rounded border p-2"><div className="text-xs text-slate-500">Lượt luyện tập đã nộp</div><b className="text-lg">{done.length}</b></div>
            <div className="rounded border p-2"><div className="text-xs text-slate-500">Số ngày tự học (4 tuần)</div><b className="text-lg">{days}</b> <span className="text-xs">≈ {(days / 4).toFixed(1)} buổi/tuần</span></div>
            <div className="rounded border p-2"><div className="text-xs text-slate-500">Lỗi cần sửa / đã sửa</div><b className="text-lg">{open}</b> / <b className="text-lg text-emerald-700">{fixed}</b></div>
            <div className="rounded border p-2"><div className="text-xs text-slate-500">Điểm TB: trước → gần đây</div><b className="text-lg">{scores.length >= 2 ? `${mean(scores.slice(0, half))} → ${mean(scores.slice(half))}` : mean(scores)}</b></div>
          </div>
        );
      })()}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {status && <p role="status">{status}</p>}

      {recommendations && (
        <div className="rounded border p-3 bg-slate-50 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Lộ trình ôn tập thích ứng</h3>
            <span className="text-xs font-medium text-slate-600">{recommendations.ruleLabel}</span>
          </div>
          <p className="text-sm">{recommendations.summary}</p>
          {recommendations.recommendedLessons?.length > 0 && (
            <ul className="list-disc pl-5 text-sm space-y-1">
              {recommendations.recommendedLessons.map((rec: any) => (
                <li key={rec.lessonId}>
                  <b>
                    Lớp {rec.grade} · {rec.title}
                  </b>{' '}
                  — {rec.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <h3>Lỗi đã ghi nhận trong bài làm (vết lỗi)</h3>
      {evidence.length ? (
        evidence.map(e => (
          <article key={e.id} className="border-t pt-3 space-y-2">
            <div>
              <b>{e.skill}</b>{' '}
              <span className="text-xs rounded-full border px-2 py-0.5 mr-1">
                {e.source === 'ai_auto' ? 'AI tự ghi nhận · chờ giáo viên thẩm định' : 'Giáo viên đã thẩm định'}
              </span>
              {lessonTitle(e.lesson_id) && <span className="text-xs text-slate-600">Chủ đề: {lessonTitle(e.lesson_id)} · </span>}
              {e.state === 'resolved' ? (
                <span className="text-emerald-700 font-semibold">Đã được giáo viên xác nhận khắc phục</span>
              ) : submittedNotes[e.submission_id] ? (
                <span className="text-amber-700 font-semibold">Đã gửi bản tự sửa — Chờ kiểm tra lại / giáo viên xác nhận</span>
              ) : (
                <span className="text-rose-700 font-semibold">Cần củng cố (Chưa khắc phục)</span>
              )}
            </div>
            <p className="text-sm">{e.reason}</p>
            <p className="text-xs text-slate-500">
              {new Date(e.reviewed_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
            </p>
            {e.state === 'needs_remedy' && e.submission_id && (
              <div className="rounded bg-slate-50 p-2 space-y-2">
                <label className="text-xs font-medium block">
                  Ghi chú tự sửa lỗi (không tự động đổi trạng thái thành Đã khắc phục)
                  <input
                    disabled={busy}
                    placeholder="Trình bày lại bước biến đổi / điều kiện xác định em đã sửa..."
                    value={noteBySub[e.submission_id] || ''}
                    onChange={ev => setNoteBySub({ ...noteBySub, [e.submission_id]: ev.target.value })}
                  />
                </label>
                <button type="button" disabled={busy} onClick={() => void submitSelfCorrection(e.submission_id)}>
                  Gửi bản tự sửa
                </button>
              </div>
            )}
          </article>
        ))
      ) : (
        <p>Chưa có lỗi nào được ghi nhận. Khi em nhờ AI kiểm tra bài giải, các lỗi sai sẽ được lưu ở đây để em tự sửa và giáo viên theo dõi.</p>
      )}

      <h3>Phản hồi của giáo viên</h3>
      {feedback.length ? (
        feedback.map(f => (
          <article key={f.attempt_id} className="border-t pt-2">
            <p>{f.message}</p>
          </article>
        ))
      ) : (
        <p>Chưa có phản hồi.</p>
      )}

      <h3>Lịch sử luyện tập</h3>
      {attempts.filter(a => a.submitted).length ? (
        attempts
          .filter(a => a.submitted)
          .map(a => (
            <article key={a.id} className="border-t pt-2">
              <p>
                {lessonTitle(a.lessonId)} · {new Date(a.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
              </p>
              <p>
                Đúng {a.result.correct}/{a.result.total} · đã trả lời {a.result.answered}/{a.result.total} · {a.result.score}/10
              </p>
            </article>
          ))
      ) : (
        <p>Chưa có lượt luyện tập đã nộp.</p>
      )}
    </section>
  );
}
