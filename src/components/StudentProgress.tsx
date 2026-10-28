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

      <h3>Bằng chứng được giáo viên xác minh</h3>
      {evidence.length ? (
        evidence.map(e => (
          <article key={e.id} className="border-t pt-3 space-y-2">
            <div>
              <b>{e.skill}</b> ·{' '}
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
        <p>Chưa có bằng chứng đã thẩm định. Việc hỏi bài không được dùng để suy ra vùng trũng kiến thức.</p>
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
                {a.lessonId} · {new Date(a.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
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
