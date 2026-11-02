import React, { useState } from 'react';
import { post } from '../services/apiClient.ts';
import MathRenderer from './MathRenderer.tsx';

interface StudentInsight {
  studentId: string;
  studentCode: string;
  name: string;
  submissionCount: number;
  incorrectCount: number;
  attemptCount: number;
  averageScore: number | null;
  firstHalfAverage: number | null;
  secondHalfAverage: number | null;
  activeDays7: number;
  activeDays28: number;
  sessionsPerWeek: number;
  lastActiveAt: string | null;
  openErrors: number;
  resolvedErrors: number;
  topErrors: { skill: string; count: number }[];
  weakLessons: { lessonId: string; title: string; grade: string | number; errors: number; averageScore: number | null; reason: string }[];
}

interface Advice {
  summary: string;
  focusTopics: { topic: string; reason: string }[];
  teachingMethods: string[];
  suggestedExercises: { title: string; content: string; difficulty: string }[];
  modelUsed: string;
  createdAt: string;
}

/** Horizontal bar list; values are shown next to each bar so the chart reads without hovering. */
function Bars({ rows, color = 'bg-rose-500' }: { rows: { label: string; value: number; note?: string }[]; color?: string }) {
  const max = Math.max(1, ...rows.map(r => r.value));
  return (
    <ul className="space-y-2">
      {rows.map(r => (
        <li key={r.label} className="text-sm">
          <div className="flex justify-between gap-2">
            <span className="truncate">{r.label}</span>
            <b className="shrink-0">
              {r.value}
              {r.note && <span className="ml-1 text-xs font-normal text-slate-500">{r.note}</span>}
            </b>
          </div>
          <div className="h-2.5 rounded bg-slate-100">
            <div className={`h-2.5 rounded ${color}`} style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

const trendText = (s: StudentInsight) => {
  if (s.firstHalfAverage === null || s.secondHalfAverage === null) return '—';
  const diff = s.secondHalfAverage - s.firstHalfAverage;
  const arrow = diff > 0.2 ? '↗' : diff < -0.2 ? '↘' : '→';
  return `${s.firstHalfAverage} ${arrow} ${s.secondHalfAverage}`;
};

export default function TeacherReports({ analytics, savedAdvice }: { analytics: any; savedAdvice: Record<string, Advice | undefined> }) {
  const [selected, setSelected] = useState<string>('');
  const [advice, setAdvice] = useState<Record<string, Advice>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const students: StudentInsight[] = analytics?.students || [];
  const summary = analytics?.classSummary;
  const current = students.find(s => s.studentId === selected);
  const currentAdvice = (selected && (advice[selected] || savedAdvice[selected])) || null;

  const requestAdvice = async (studentId: string) => {
    setBusy(true);
    setError('');
    try {
      const result = await post<Advice>('/ai/teacher-advice', { studentId });
      setAdvice(prev => ({ ...prev, [studentId]: result }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!analytics) return <p className="text-sm">Đang tính toán báo cáo lớp học…</p>;
  const maxActivity = Math.max(1, ...(summary?.activityByDay || []).map((d: { count: number }) => d.count));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="rounded-xl border bg-white p-3">
          <div className="text-xs text-slate-500">Học sinh hoạt động 7 ngày qua</div>
          <b className="text-xl">
            {summary?.activeStudents7 ?? 0}/{students.length}
          </b>
        </div>
        <div className="rounded-xl border bg-white p-3">
          <div className="text-xs text-slate-500">Số buổi tự học TB/tuần (4 tuần)</div>
          <b className="text-xl">{summary?.averageSessionsPerWeek ?? 0}</b>
        </div>
        <div className="rounded-xl border bg-white p-3">
          <div className="text-xs text-slate-500">Lượt luyện tập · điểm TB</div>
          <b className="text-xl">
            {analytics.practiceAttempts.submittedCount} · {analytics.practiceAttempts.averageScore ?? '—'}
          </b>
        </div>
        <div className="rounded-xl border bg-white p-3">
          <div className="text-xs text-slate-500">Lỗi đang cần khắc phục</div>
          <b className="text-xl">{students.reduce((a, s) => a + s.openErrors, 0)}</b>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="panel space-y-3">
          <h3 className="font-bold">Thống kê lỗi thường gặp của lớp</h3>
          {analytics.errorDistribution.length ? (
            <Bars
              rows={analytics.errorDistribution.map((e: any) => ({
                label: e.skill,
                value: e.total,
                note: `(${e.percentageOfVerifiedErrors}% · ${e.aiAuto} AI tự ghi nhận · ${e.unresolved} chưa sửa)`,
              }))}
            />
          ) : (
            <p className="text-sm text-slate-600">Chưa có lỗi nào được ghi nhận. Lỗi sẽ tự động xuất hiện khi học sinh nhờ AI kiểm tra bài giải.</p>
          )}
        </section>
        <section className="panel space-y-3">
          <h3 className="font-bold">Tần suất học tập 14 ngày gần đây</h3>
          <div className="flex items-end gap-1 h-32" role="img" aria-label="Số lượt học mỗi ngày trong 14 ngày gần đây">
            {(summary?.activityByDay || []).map((d: { date: string; count: number }) => (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full" title={`${d.date}: ${d.count} lượt`}>
                <span className="text-[10px] text-slate-600">{d.count || ''}</span>
                <div className="w-full rounded-t bg-emerald-500" style={{ height: `${(d.count / maxActivity) * 100}%`, minHeight: d.count ? 4 : 1 }} />
                <span className="text-[10px] text-slate-500">{d.date.slice(8, 10)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">Mỗi cột = số lượt nộp bài cho AI + lượt luyện tập trong ngày.</p>
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="panel space-y-3">
          <h3 className="font-bold">Chuyên đề lớp còn yếu</h3>
          {summary?.weakLessons?.length ? (
            <Bars
              color="bg-amber-500"
              rows={summary.weakLessons.map((l: any) => ({
                label: `Lớp ${l.grade} · ${l.title}`,
                value: l.students,
                note: `HS${l.errors ? ` · ${l.errors} lỗi` : ''}`,
              }))}
            />
          ) : (
            <p className="text-sm text-slate-600">Chưa đủ dữ liệu để xác định chuyên đề yếu.</p>
          )}
        </section>
        <section className="panel space-y-2">
          <h3 className="font-bold">Gợi ý nội dung cần ôn tập, củng cố</h3>
          {summary?.reviewSuggestions?.length ? (
            <ul className="list-disc pl-5 text-sm space-y-1.5">
              {summary.reviewSuggestions.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600">Chưa có gợi ý — cần thêm dữ liệu học tập của học sinh.</p>
          )}
          <p className="text-xs text-slate-500">Gợi ý theo quy tắc, dựa trên lỗi đã ghi nhận và điểm luyện tập thực tế.</p>
        </section>
      </div>

      <section className="panel space-y-3">
        <h3 className="font-bold">Theo dõi từng học sinh</h3>
        {students.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b">
                  <th className="py-2 pr-2">Học sinh</th>
                  <th className="pr-2">Bài AI kiểm tra (sai)</th>
                  <th className="pr-2">Luyện tập · điểm TB</th>
                  <th className="pr-2">Tiến độ điểm</th>
                  <th className="pr-2">Ngày học (7/28)</th>
                  <th className="pr-2">Lỗi chưa sửa</th>
                  <th className="pr-2">Chuyên đề còn yếu</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.studentId} className={`border-b align-top ${selected === s.studentId ? 'bg-emerald-50' : ''}`}>
                    <td className="py-2 pr-2">
                      <b>{s.name}</b>
                      <div className="text-xs font-mono text-slate-500">{s.studentCode}</div>
                    </td>
                    <td className="pr-2">
                      {s.submissionCount} ({s.incorrectCount})
                    </td>
                    <td className="pr-2">
                      {s.attemptCount} · {s.averageScore ?? '—'}
                    </td>
                    <td className="pr-2">{trendText(s)}</td>
                    <td className="pr-2">
                      {s.activeDays7}/{s.activeDays28}
                    </td>
                    <td className="pr-2">
                      {s.openErrors}
                      {s.topErrors.length > 0 && <div className="text-xs text-slate-500">{s.topErrors.map(e => `${e.skill} (${e.count})`).join(', ')}</div>}
                    </td>
                    <td className="pr-2 text-xs">{s.weakLessons.length ? s.weakLessons.map(l => l.title).join('; ') : '—'}</td>
                    <td>
                      <button type="button" className={selected === s.studentId ? 'button' : 'secondary'} onClick={() => setSelected(s.studentId)}>
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm">Chưa có học sinh trong lớp được chọn.</p>
        )}
      </section>

      {current && (
        <section className="panel space-y-3 border-emerald-300">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold">
              Hồ sơ cá nhân: {current.name} ({current.studentCode})
            </h3>
            <button type="button" className="button" disabled={busy} onClick={() => void requestAdvice(current.studentId)}>
              {busy ? 'AI đang phân tích…' : '✨ Gợi ý cá thể hóa dạy học (AI)'}
            </button>
          </div>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <p className="text-sm">
            Lần học gần nhất: {current.lastActiveAt ? new Date(current.lastActiveAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'chưa có'} ·
            Khoảng {current.sessionsPerWeek} buổi/tuần · Đã khắc phục {current.resolvedErrors} lỗi.
          </p>
          <div>
            <h4 className="text-sm font-semibold">Chuyên đề còn yếu</h4>
            {current.weakLessons.length ? (
              <ul className="list-disc pl-5 text-sm">
                {current.weakLessons.map(l => (
                  <li key={l.lessonId}>
                    Lớp {l.grade} · {l.title} — {l.reason}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">Chưa phát hiện chuyên đề yếu.</p>
            )}
          </div>
          {currentAdvice && (
            <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3 space-y-2 text-sm">
              <p className="text-xs text-slate-500">
                Gợi ý AI ({currentAdvice.modelUsed}) · {new Date(currentAdvice.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} · giáo
                viên cân nhắc trước khi áp dụng
              </p>
              <MathRenderer content={currentAdvice.summary} />
              {currentAdvice.focusTopics.length > 0 && (
                <>
                  <h4 className="font-semibold">Nội dung cần tập trung</h4>
                  <ul className="list-disc pl-5">
                    {currentAdvice.focusTopics.map((t, i) => (
                      <li key={i}>
                        <b>{t.topic}</b>: {t.reason}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {currentAdvice.teachingMethods.length > 0 && (
                <>
                  <h4 className="font-semibold">Phương pháp hỗ trợ</h4>
                  <ul className="list-disc pl-5">
                    {currentAdvice.teachingMethods.map((m, i) => (
                      <li key={i}>
                        <MathRenderer content={m} />
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {currentAdvice.suggestedExercises.length > 0 && (
                <>
                  <h4 className="font-semibold">Bài tập phù hợp</h4>
                  <ol className="list-decimal pl-5 space-y-1">
                    {currentAdvice.suggestedExercises.map((e, i) => (
                      <li key={i}>
                        <b>{e.title}</b> <span className="text-xs text-slate-500">({e.difficulty})</span>
                        <MathRenderer content={e.content} />
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
