import React, { useEffect, useState } from 'react';
import { api, post } from '../services/apiClient.ts';
import MathRenderer from './MathRenderer.tsx';

interface Lesson {
  id: string;
  title: string;
  grade: string | number;
  chapter: string;
  theory: {
    overview: string;
    sections: { title: string; content: string; keyFormulas?: string[] }[];
  };
}

interface Attempt {
  id: string;
  format: string;
  scoringMode?: 'practice' | 'exam_2025';
  questions: {
    id: string;
    prompt: string;
    unit?: string;
    options?: { key: string; content: string }[];
    statements?: { subId: string; content: string }[];
  }[];
}

interface Result {
  correct: number;
  total: number;
  answered: number;
  score: number;
  scoringMode?: 'practice' | 'exam_2025';
  rubricVersion?: string;
  label: string;
  details: {
    questionId: string;
    correct: boolean | null;
    correctStatements?: number;
    totalStatements?: number;
    examPoints?: number;
    practicePoints?: number;
    statementResults?: Array<{ subId: string; answered: boolean | null; isCorrect: boolean; match: boolean | null; explanation: string }>;
    explanation: string;
  }[];
}

export default function Practice({ lessonId, assignmentId }: { lessonId?: string; assignmentId?: string }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selected, setSelected] = useState(lessonId || '');
  const [format, setFormat] = useState('multiple_choice');
  const [scoringMode, setScoringMode] = useState<'practice' | 'exam_2025'>('exam_2025');
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | Record<string, boolean>>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [aiDraftExercise, setAiDraftExercise] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Lesson[]>('/curriculum')
      .then(rows => {
        setLessons(rows);
        if (!selected) setSelected(rows[0]?.id || '');
      })
      .catch(e => setError(e.message));
  }, []);

  const start = async () => {
    setBusy(true);
    setError('');
    try {
      const created = await post<Attempt>('/attempts', {
        id: crypto.randomUUID(),
        lessonId: selected,
        format,
        ...(format === 'true_false' ? { scoringMode } : {}),
        ...(assignmentId ? { assignmentId } : {}),
      });
      setAttempt(created);
      setResult(null);
      setAnswers({});
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!attempt) return;
    setBusy(true);
    setError('');
    try {
      setResult(await post<Result>('/attempts/submit', { id: attempt.id, answers }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const generateAiPractice = async () => {
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      const res = await post<any>('/ai/exercises', {
        requestId: crypto.randomUUID(),
        lessonId: selected,
        format,
        difficulty: 'Thông hiểu',
      });
      setAiDraftExercise(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const lesson = lessons.find(l => l.id === selected);

  return (
    <div className="panel space-y-4">
      <h2>Tự học theo bài</h2>
      <p className="text-sm">
        Ngân hàng câu hỏi gốc đã được kiểm toán toán học GDPT 2018 (84 câu / 28 bài). Điểm do máy chủ tính theo đáp án lưu tại máy chủ.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <label>
          Bài học
          <select
            disabled={!!lessonId || busy}
            value={selected}
            onChange={e => {
              setSelected(e.target.value);
              setAttempt(null);
              setResult(null);
              setAiDraftExercise(null);
            }}
          >
            {lessons.map(l => (
              <option key={l.id} value={l.id}>
                Lớp {l.grade} · {l.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Dạng câu hỏi
          <select
            value={format}
            disabled={busy}
            onChange={e => {
              setFormat(e.target.value);
              setAttempt(null);
              setResult(null);
            }}
          >
            <option value="multiple_choice">Trắc nghiệm 4 lựa chọn</option>
            <option value="true_false">Đúng / Sai (4 mệnh đề a, b, c, d)</option>
            <option value="short_answer">Trả lời ngắn</option>
          </select>
        </label>
      </div>

      {format === 'true_false' && (
        <label className="block text-sm">
          Chế độ tính điểm Đúng/Sai
          <select value={scoringMode} disabled={busy} onChange={e => setScoringMode(e.target.value as 'practice' | 'exam_2025')}>
            <option value="exam_2025">Quy tắc thi THPT 2025 (1 ý: 0,1đ • 2 ý: 0,25đ • 3 ý: 0,5đ • 4 ý: 1,0đ)</option>
            <option value="practice">Chế độ luyện tập từng ý (tỉ lệ tuyến tính số mệnh đề đúng)</option>
          </select>
        </label>
      )}

      {lesson && (
        <details className="rounded border p-3 bg-slate-50">
          <summary className="font-semibold cursor-pointer">Lý thuyết & phương pháp trọng tâm</summary>
          <div className="mt-2 space-y-2">
            <MathRenderer content={lesson.theory.overview} />
            {lesson.theory.sections.map((s, i) => (
              <section key={i} className="border-t pt-2">
                <h3 className="font-semibold">{s.title}</h3>
                <MathRenderer content={s.content} />
                {s.keyFormulas?.map((f, j) => (
                  <MathRenderer key={j} content={`$${f}$`} />
                ))}
              </section>
            ))}
          </div>
        </details>
      )}

      <div className="flex flex-wrap gap-2">
        <button className="button" disabled={busy || !selected} onClick={() => void start()}>
          Bắt đầu lượt làm mới
        </button>
        <button type="button" disabled={busy || !selected} onClick={() => void generateAiPractice()}>
          Tạo thêm bài tập tương tự bằng AI (Tham khảo)
        </button>
      </div>

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      {aiDraftExercise?.question && (
        <aside className="rounded border border-amber-300 bg-amber-50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <strong className="text-amber-900">Bản nháp do AI đề xuất — Chưa được giáo viên thẩm định</strong>
            <span className="text-xs text-amber-800">{aiDraftExercise.notice}</span>
          </div>
          <MathRenderer
            content={aiDraftExercise.question.question || aiDraftExercise.question.context || aiDraftExercise.question.problem || ''}
          />
          {aiDraftExercise.question.options?.map((o: any) => (
            <div key={o.key} className="text-sm">
              <b>{o.key}.</b> <MathRenderer content={o.content} />
            </div>
          ))}
          {aiDraftExercise.question.statements?.map((s: any) => (
            <div key={s.subId} className="text-sm">
              <b>{s.subId})</b> <MathRenderer content={s.content} /> ({s.isCorrect ? 'Đúng' : 'Sai'})
            </div>
          ))}
          <details className="text-sm">
            <summary className="cursor-pointer font-medium">Xem đáp án & gợi ý giải của AI</summary>
            <MathRenderer content={aiDraftExercise.question.explanation || ''} />
          </details>
        </aside>
      )}

      {attempt?.questions.map(q => {
        const detail = result?.details.find(d => d.questionId === q.id);
        return (
          <section key={q.id} className="border-t pt-4 space-y-2">
            <MathRenderer content={q.prompt} />
            {q.options?.map((o, i) => (
              <label className="flex items-start gap-2 my-2" key={o.key}>
                <input
                  className="!w-auto"
                  disabled={!!result || busy}
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === o.key}
                  onChange={() => setAnswers({ ...answers, [q.id]: o.key })}
                />
                <span>{String.fromCharCode(65 + i)}.</span>
                <MathRenderer content={o.content} />
              </label>
            ))}
            {q.statements?.map(st => (
              <div key={st.subId} className="py-1">
                <MathRenderer content={`${st.subId}) ${st.content}`} />
                {[true, false].map(v => (
                  <label className="inline-flex gap-2 mr-3" key={String(v)}>
                    <input
                      className="!w-auto"
                      type="radio"
                      name={`${q.id}:${st.subId}`}
                      disabled={!!result || busy}
                      checked={typeof answers[q.id] === 'object' && (answers[q.id] as Record<string, boolean>)[st.subId] === v}
                      onChange={() =>
                        setAnswers({
                          ...answers,
                          [q.id]: {
                            ...(typeof answers[q.id] === 'object' ? (answers[q.id] as Record<string, boolean>) : {}),
                            [st.subId]: v,
                          },
                        })
                      }
                    />
                    {v ? 'Đúng' : 'Sai'}
                  </label>
                ))}
              </div>
            ))}
            {!q.options && !q.statements && (
              <label className="block">
                Đáp án {q.unit ? `(đơn vị: ${q.unit})` : ''}
                <input
                  disabled={!!result || busy}
                  value={String(answers[q.id] || '')}
                  onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                />
              </label>
            )}
            {detail && (
              <div className="rounded bg-slate-50 p-3 text-sm space-y-1">
                <p className="font-semibold">
                  {detail.correct === true
                    ? 'Đúng hoàn toàn'
                    : detail.correctStatements !== undefined
                      ? `Đúng ${detail.correctStatements}/${detail.totalStatements} mệnh đề (Điểm THPT 2025: ${detail.examPoints}/1,0đ)`
                      : detail.correct === false
                        ? 'Chưa đúng'
                        : 'Chưa kết luận / chưa trả lời'}
                </p>
                {detail.statementResults && (
                  <ul className="list-disc pl-5 space-y-1">
                    {detail.statementResults.map(sr => (
                      <li key={sr.subId}>
                        <b>Ý {sr.subId})</b> Đáp án chuẩn: <b>{sr.isCorrect ? 'Đúng' : 'Sai'}</b> —{' '}
                        {sr.match === true ? 'Em chọn Đúng' : sr.match === false ? 'Em chọn chưa đúng' : 'Chưa chọn'} ·{' '}
                        <MathRenderer content={sr.explanation} />
                      </li>
                    ))}
                  </ul>
                )}
                {!detail.statementResults && <MathRenderer content={detail.explanation || ''} />}
              </div>
            )}
          </section>
        );
      })}

      {attempt && !result && (
        <button className="button" disabled={busy} onClick={() => void submit()}>
          Nộp lượt làm
        </button>
      )}
      {result && (
        <p role="status" className="font-semibold">
          Đúng trọn vẹn {result.correct}/{result.total}, đã trả lời {result.answered}/{result.total}. Điểm quy đổi: {result.score}/10.{' '}
          {result.label}
        </p>
      )}
    </div>
  );
}
