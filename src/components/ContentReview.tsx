import React, { useEffect, useState } from 'react';
import { api, post } from '../services/apiClient.ts';
import MathRenderer from './MathRenderer.tsx';

export default function ContentReview() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Record<string, { status: string; reason: string }>>({});
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<any>('/content/review')
      .then(data => {
        const rows = Array.isArray(data) ? data : data.lessons || [];
        setLessons(rows);
        setSelected(rows[0]?.id || '');
        if (data?.reviews && Array.isArray(data.reviews)) {
          const map: Record<string, { status: string; reason: string }> = {};
          for (const r of data.reviews) map[r.question_id] = { status: r.status, reason: r.reason };
          setReviews(map);
        }
      })
      .catch(e => setError(e.message));
  }, []);

  const review = async (id: string, nextStatus: 'reviewed' | 'withdrawn') => {
    const reason = prompt(
      nextStatus === 'reviewed'
        ? 'Ghi căn cứ thẩm định độc lập (ít nhất 10 ký tự). Chỉ duyệt sau khi đã kiểm tra đề, đáp án và lời giải.'
        : 'Lý do thu hồi câu hỏi (ít nhất 10 ký tự)'
    );
    if (!reason || reason.length < 10) return;
    setBusy(true);
    setError('');
    try {
      await post('/content/review', { questionId: id, reason, status: nextStatus });
      setReviews(prev => ({ ...prev, [id]: { status: nextStatus, reason } }));
      setStatus(`Đã lưu trạng thái ${nextStatus} cho ${id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const lesson = lessons.find(l => l.id === selected);

  return (
    <section className="panel space-y-4">
      <h2>Thẩm định ngân hàng bài tập</h2>
      <p className="text-sm">
        84 câu hỏi gốc (28 Trắc nghiệm, 28 Đúng/Sai với 112 mệnh đề, 28 Trả lời ngắn) đã được kiểm toán toán học trong{' '}
        <code>docs/CURRICULUM_REVIEW.md</code>. Giáo viên có thể xác nhận thẩm định bổ sung hoặc thu hồi bất kỳ câu hỏi nào.
      </p>
      <label>
        Bài học
        <select value={selected} onChange={e => setSelected(e.target.value)}>
          {lessons.map(l => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <p role="status">{status}</p>
      {lesson &&
        Object.entries(lesson.exercises).flatMap(([format, items]) =>
          (items as any[]).map(q => {
            const rev = reviews[q.id];
            return (
              <article className="border-t py-4 space-y-2" key={q.id}>
                <div className="flex items-center justify-between">
                  <h3>
                    {q.id} · {format}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100">
                    {rev?.status === 'withdrawn'
                      ? 'Đã thu hồi (Withdrawn)'
                      : rev?.status === 'reviewed'
                        ? 'Giáo viên đã duyệt (Reviewed)'
                        : 'Đã kiểm toán gốc (VERIFIED)'}
                  </span>
                </div>
                <MathRenderer content={q.question || q.context || q.problem} />
                {q.options?.map((o: any) => (
                  <MathRenderer key={o.key} content={`${o.key}: ${o.content}`} />
                ))}
                {q.statements?.map((s: any) => (
                  <div key={s.subId}>
                    <MathRenderer content={`${s.subId}) ${s.content}`} />
                    <p>{s.isCorrect ? 'Đúng' : 'Sai'}</p>
                    <MathRenderer content={s.explanation} />
                  </div>
                ))}
                <p>Đáp án hiện tại: {String(q.correctAnswer ?? q.correctValue ?? 'Theo từng ý ở trên')}</p>
                <MathRenderer content={q.explanation || q.overallExplanation || ''} />
                <div className="flex gap-2">
                  <button className="button" disabled={busy} onClick={() => void review(q.id, 'reviewed')}>
                    Xác nhận đã thẩm định
                  </button>
                  <button disabled={busy} onClick={() => void review(q.id, 'withdrawn')}>
                    Thu hồi
                  </button>
                </div>
              </article>
            );
          })
        )}
    </section>
  );
}
