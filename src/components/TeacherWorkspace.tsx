import React, { useEffect, useState } from 'react';
import { api, post } from '../services/apiClient.ts';
import type { Session, Workspace, StudentRecord } from '../features.ts';
import MathRenderer from './MathRenderer.tsx';
import TeacherAttempts from './TeacherAttempts.tsx';
import ContentReview from './ContentReview.tsx';

const DocumentEditor = React.lazy(() => import('./DocumentEditor.tsx'));

const LEGACY_KEYS = ['math_ai_classes_v1', 'math_ai_student_accounts_v2', 'math_ai_submissions_v1', 'saved_math_documents'] as const;

export default function TeacherWorkspace({ session }: { session: Session }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [credential, setCredential] = useState<{ studentCode: string; temporaryPassword: string } | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [lessons, setLessons] = useState<{ id: string; title: string; grade: string }[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [analyticsClassId, setAnalyticsClassId] = useState<string>('');
  const [legacyPreview, setLegacyPreview] = useState<any | null>(null);
  const [legacyCommitResult, setLegacyCommitResult] = useState<any | null>(null);
  const [legacyPayloadText, setLegacyPayloadText] = useState<string>('');

  useEffect(() => {
    api<{ id: string; title: string; grade: string }[]>('/curriculum')
      .then(setLessons)
      .catch(e => setError(e.message));
  }, []);

  const [tab, setTab] = useState('classes');
  const load = async () => setWorkspace(await api<Workspace>('/workspace'));

  useEffect(() => {
    let alive = true;
    const refresh = () =>
      api<Workspace>('/workspace')
        .then(w => {
          if (alive) setWorkspace(w);
        })
        .catch(e => {
          if (alive) setError(e.message);
        });
    void refresh();
    const timer = setInterval(refresh, 8000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (tab !== 'analytics') return;
    const q = analyticsClassId ? `?classId=${encodeURIComponent(analyticsClassId)}` : '';
    api<any>(`/analytics/class${q}`)
      .then(setAnalytics)
      .catch(() => {});
  }, [tab, analyticsClassId, workspace]);

  const run = async (fn: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await fn();
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const addClass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const form = e.currentTarget;
    void run(async () => {
      await post('/classes', {
        id: crypto.randomUUID(),
        name: f.get('name'),
        grade: f.get('grade'),
        academicYear: f.get('year'),
        classCode: f.get('code'),
      });
      form.reset();
    });
  };

  const addStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    void run(async () =>
      setCredential(await post('/students', { name: f.get('name'), studentCode: f.get('code'), classId: f.get('classId') }))
    );
  };

  const assign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    void run(() =>
      post('/assignments', {
        id: crypto.randomUUID(),
        title: f.get('title'),
        classId: f.get('classId'),
        lessonId: f.get('lessonId'),
        deadline: f.get('deadline') ? new Date(String(f.get('deadline'))).toISOString() : null,
      })
    );
  };

  const backup = () => {
    const blob = new Blob([JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), workspace }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'covanhoctap-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const scanLocalStorageLegacy = () => {
    const collected: Record<string, unknown> = {};
    for (const k of LEGACY_KEYS) {
      const raw = window.localStorage.getItem(k);
      if (raw) {
        try {
          collected[k] = JSON.parse(raw);
        } catch {
          // ignore malformed item
        }
      }
    }
    setLegacyPayloadText(JSON.stringify(collected, null, 2));
  };

  const previewLegacy = async () => {
    setBusy(true);
    setError('');
    try {
      const parsed = JSON.parse(legacyPayloadText || '{}');
      const res = await post('/import/legacy', { mode: 'preview', payload: parsed });
      setLegacyPreview(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const commitLegacy = async () => {
    setBusy(true);
    setError('');
    try {
      const parsed = JSON.parse(legacyPayloadText || '{}');
      const res = await post('/import/legacy', { mode: 'commit', payload: parsed });
      setLegacyCommitResult(res);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const rollbackLegacy = async (batchId: string) => {
    setBusy(true);
    setError('');
    try {
      const res = await post('/import/legacy/rollback', { batchId });
      setLegacyCommitResult(res);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const eligible =
    workspace?.submissions.filter(
      s =>
        !(s.data as any).legacy_unverified &&
        s.data.evaluation.reviewState === 'verified' &&
        ['correct', 'incorrect'].includes(s.data.evaluation.verdict)
    ) || [];
  const correct = eligible.filter(s => s.data.evaluation.verdict === 'correct').length;
  const options = workspace?.classes.map(c => (
    <option key={c.id} value={c.id}>
      {c.data.name}
    </option>
  ));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Quản lý lớp · {session.profile.name}</h1>
      <nav className="flex flex-wrap gap-3">
        {[
          ['classes', 'Lớp & học sinh'],
          ['assignments', 'Giao bài'],
          ['submissions', 'Bài nộp'],
          ['analytics', 'Phân tích & Sao lưu'],
          ['documents', 'Soạn tài liệu A4'],
          ['review', 'Thẩm định nội dung'],
        ].map(([value, label]) => (
          <button key={value} className={tab === value ? 'button' : 'secondary'} onClick={() => setTab(value)}>
            {label}
          </button>
        ))}
        <button onClick={backup} disabled={!workspace}>
          Xuất sao lưu
        </button>
        <a
          className="secondary inline-flex items-center px-3 py-1.5 rounded border text-sm"
          href={`/api/exports/students.csv${analyticsClassId ? `?classId=${encodeURIComponent(analyticsClassId)}` : ''}`}
          download="danh-sach-hoc-sinh.csv"
        >
          Xuất CSV học sinh
        </a>
      </nav>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {!workspace ? (
        <p>Đang tải dữ liệu lớp…</p>
      ) : (
        <>
          <p className="text-sm text-slate-600">
            {workspace.classes.length} lớp · {workspace.students.length} học sinh · {workspace.submissions.length} bài nộp. Dữ liệu cập nhật mỗi 8
            giây.
          </p>
          <section className="panel">
            <h2>Thống kê đã thẩm định</h2>
            {eligible.length ? (
              <p>
                {correct}/{eligible.length} bài đúng ({Math.round((correct / eligible.length) * 100)}%). Mẫu số chỉ gồm bài đã được giáo viên xác minh
                có kết luận đúng/sai.
              </p>
            ) : (
              <p>Chưa đủ dữ liệu đã thẩm định. Không tính câu hỏi hướng dẫn hoặc kết quả chưa kết luận.</p>
            )}
          </section>
          {credential && (
            <section className="panel border-amber-400">
              <h2>Mật khẩu cấp mới · chỉ hiển thị lần này</h2>
              <p>Mã: {credential.studentCode}</p>
              <output className="font-mono break-all">{credential.temporaryPassword}</output>
              <p>Giao riêng cho học sinh. Hệ thống yêu cầu đổi khi đăng nhập.</p>
              <button onClick={() => setCredential(null)}>Đã giao · đóng</button>
            </section>
          )}
          {editingStudent && (
            <form
              className="panel space-y-3"
              onSubmit={e => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void run(async () => {
                  await post('/students/update', { studentId: editingStudent.user_id, classId: f.get('classId'), name: f.get('name') });
                  setEditingStudent(null);
                });
              }}
            >
              <h2>Sửa / chuyển lớp học sinh</h2>
              <label>
                Họ tên
                <input name="name" required defaultValue={editingStudent.data.name} />
              </label>
              <label>
                Lớp
                <select name="classId" defaultValue={editingStudent.class_id}>
                  {options}
                </select>
              </label>
              <button disabled={busy} className="button">
                Lưu thay đổi
              </button>{' '}
              <button type="button" onClick={() => setEditingStudent(null)}>
                Hủy
              </button>
            </form>
          )}
          {tab === 'classes' && (
            <div className="grid md:grid-cols-2 gap-5">
              <section className="panel">
                <h2>Tạo lớp</h2>
                <form onSubmit={addClass} className="space-y-3">
                  <label>
                    Tên lớp
                    <input required name="name" maxLength={100} />
                  </label>
                  <label>
                    Khối
                    <select name="grade">
                      <option>10</option>
                      <option>11</option>
                      <option>12</option>
                    </select>
                  </label>
                  <label>
                    Năm học
                    <input required name="year" defaultValue="2026–2027" />
                  </label>
                  <label>
                    Mã lớp
                    <input required name="code" />
                  </label>
                  <button className="button" disabled={busy}>
                    Lưu lớp
                  </button>
                </form>
                <ul className="mt-4 space-y-3">
                  {workspace.classes.map(c => (
                    <li key={c.id} className="flex justify-between gap-2">
                      {c.data.name}
                      <button
                        disabled={busy}
                        onClick={() => {
                          const name = prompt('Tên lớp mới', c.data.name);
                          if (name) void run(() => post('/classes', { id: c.id, ...c.data, name }));
                        }}
                      >
                        Đổi tên
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => {
                          if (confirm('Lưu trữ lớp? Bài nộp vẫn được giữ.')) void run(() => api(`/classes/${c.id}`, { method: 'DELETE' }));
                        }}
                      >
                        Lưu trữ
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="panel">
                <h2>Cấp tài khoản học sinh</h2>
                <form className="space-y-3" onSubmit={addStudent}>
                  <label>
                    Họ tên
                    <input required name="name" />
                  </label>
                  <label>
                    Mã học sinh (duy nhất)
                    <input required name="code" minLength={3} pattern="[A-Za-z0-9-]+" />
                  </label>
                  <label>
                    Lớp
                    <select required name="classId">
                      <option value="">Chọn lớp</option>
                      {options}
                    </select>
                  </label>
                  <button disabled={busy || !workspace.classes.length} className="button">
                    Tạo tài khoản
                  </button>
                </form>
                <ul className="mt-4 space-y-3">
                  {workspace.students.map(s => (
                    <li key={s.user_id}>
                      {s.student_code} · {s.data.name}{' '}
                      <button disabled={busy} onClick={() => setEditingStudent(s)}>
                        Sửa / chuyển lớp
                      </button>{' '}
                      <button
                        disabled={busy}
                        onClick={() =>
                          void run(async () => {
                            const r = await post<{ temporaryPassword: string }>('/students/reset-password', { studentId: s.user_id });
                            setCredential({ studentCode: s.student_code, temporaryPassword: r.temporaryPassword });
                          })
                        }
                      >
                        Đặt lại mật khẩu
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
          {tab === 'assignments' && (
            <section className="panel">
              <h2>Giao bài theo bài học</h2>
              <form onSubmit={assign} className="space-y-3">
                <label>
                  Tiêu đề
                  <input name="title" required />
                </label>
                <label>
                  Lớp
                  <select required name="classId">
                    {options}
                  </select>
                </label>
                <label>
                  Bài học
                  <select name="lessonId" required>
                    {lessons.map(l => (
                      <option key={l.id} value={l.id}>
                        Lớp {l.grade} · {l.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Hạn nộp
                  <input name="deadline" type="datetime-local" />
                </label>
                <button disabled={busy} className="button">
                  Giao bài
                </button>
              </form>
              <ul>
                {workspace.assignments.map(a => (
                  <li key={a.id}>
                    {a.title} · {a.lesson_id}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {tab === 'assignments' && <TeacherAttempts students={workspace.students} />}
          {tab === 'submissions' && (
            <section className="space-y-4">
              {workspace.submissions.length === 0 ? (
                <p>Chưa có bài nộp. Chưa đủ dữ liệu để nhận xét năng lực lớp.</p>
              ) : (
                workspace.submissions.map(s => {
                  const subData = s.data as any;
                  return (
                    <article className="panel space-y-2" key={s.id}>
                      <p>
                        {workspace.students.find(st => st.user_id === s.student_id)?.data.name || subData.legacyStudentName || 'Học sinh'} ·{' '}
                        {new Date(s.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                      </p>
                      <MathRenderer content={s.data.problemText} />
                      <p>
                        Kết luận AI sơ bộ: {s.data.evaluation.verdict} · {s.data.evaluation.reviewState}
                      </p>
                      {subData.workflowState === 'self_correction_submitted' && !subData.hasResolvedMistake && (
                        <div className="rounded border border-amber-300 bg-amber-50 p-2 text-sm">
                          <b>Học sinh đã gửi bản tự sửa (Chưa tính là Đã khắc phục):</b>
                          <p>{subData.selfCorrectionNote}</p>
                        </div>
                      )}
                      <MathRenderer content={s.data.evaluation.chatReply} />
                      <div className="flex flex-wrap gap-2">
                        <button
                          disabled={busy}
                          onClick={() => {
                            const verdict = prompt('Kết luận: correct / incorrect / inconclusive');
                            const reason = prompt('Căn cứ thẩm định (ít nhất 10 ký tự)');
                            if (verdict && reason) void run(() => post('/submissions/review', { submissionId: s.id, verdict, reason, resolved: false }));
                          }}
                        >
                          Thẩm định / sửa kết quả
                        </button>{' '}
                        <button
                          disabled={busy}
                          onClick={() => {
                            const reason = prompt('Căn cứ kiểm tra lại/xác nhận đã khắc phục (ít nhất 10 ký tự)');
                            if (reason) void run(() => post('/submissions/review', { submissionId: s.id, verdict: 'correct', reason, resolved: true }));
                          }}
                        >
                          Xác nhận đã khắc phục
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </section>
          )}
          {tab === 'analytics' && (
            <div className="space-y-5">
              <section className="panel space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2>Phân tích lớp học (Rule-based)</h2>
                  <label className="text-sm">
                    Lọc theo lớp
                    <select value={analyticsClassId} onChange={e => setAnalyticsClassId(e.target.value)}>
                      <option value="">Tất cả các lớp</option>
                      {options}
                    </select>
                  </label>
                </div>
                {analytics ? (
                  <div className="space-y-3 text-sm">
                    <p className="text-xs text-slate-600">{analytics.sourceLabel}</p>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="rounded border p-3">
                        <div className="font-semibold">Tỉ lệ bài nộp đúng (Đã xác thực)</div>
                        <div className="text-lg font-bold">
                          {analytics.denominators.verifiedAccuracy.numerator}/{analytics.denominators.verifiedAccuracy.denominator}
                          {analytics.denominators.verifiedAccuracy.ratePercent !== null
                            ? ` (${analytics.denominators.verifiedAccuracy.ratePercent}%)`
                            : ' (Chưa đủ dữ liệu)'}
                        </div>
                        <p className="text-xs text-slate-500">{analytics.denominators.verifiedAccuracy.label}</p>
                      </div>
                      <div className="rounded border p-3">
                        <div className="font-semibold">Tỉ lệ khắc phục lỗi</div>
                        <div className="text-lg font-bold">
                          {analytics.denominators.errorResolution.numerator}/{analytics.denominators.errorResolution.denominator}
                          {analytics.denominators.errorResolution.ratePercent !== null
                            ? ` (${analytics.denominators.errorResolution.ratePercent}%)`
                            : ' (Chưa có lỗi xác thực)'}
                        </div>
                        <p className="text-xs text-slate-500">{analytics.denominators.errorResolution.label}</p>
                      </div>
                      <div className="rounded border p-3">
                        <div className="font-semibold">Bản ghi loại trừ khỏi mẫu số</div>
                        <ul className="text-xs space-y-1 mt-1">
                          <li>AI chưa duyệt: {analytics.denominators.exclusions.unreviewedAiCount}</li>
                          <li>Hỏi gợi ý / Chưa kết luận: {analytics.denominators.exclusions.inconclusiveOrGuidanceExcludedCount}</li>
                          <li>Dữ liệu cũ chưa kiểm chứng: {analytics.denominators.exclusions.legacyUnverifiedExcludedCount}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">Đang tính toán thống kê lớp học…</p>
                )}
              </section>

              <section className="panel space-y-3">
                <h2>Di trú & Nhập dữ liệu trình duyệt cũ (An toàn, đối soát & hoàn tác)</h2>
                <p className="text-sm">
                  Quét <code>localStorage</code> hoặc dán JSON sao lưu cũ. Mật khẩu văn bản thuần cũ sẽ bị loại bỏ tự động; các bài nộp cũ chưa kiểm
                  chứng được gắn nhãn <code>legacy_unverified</code> để không làm sai lệch thống kê lớp.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={scanLocalStorageLegacy}>
                    Quét dữ liệu localStorage trên trình duyệt này
                  </button>
                  <button type="button" disabled={busy || !legacyPayloadText.trim()} onClick={() => void previewLegacy()}>
                    1. Xem trước & Đối soát (Preview)
                  </button>
                  <button type="button" className="button" disabled={busy || !legacyPreview} onClick={() => void commitLegacy()}>
                    2. Nhập dữ liệu an toàn (Idempotent Commit)
                  </button>
                </div>
                <textarea
                  rows={4}
                  className="w-full font-mono text-xs border rounded p-2"
                  placeholder='{"math_ai_classes_v1": [], "math_ai_submissions_v1": [], "saved_math_documents": []}'
                  value={legacyPayloadText}
                  onChange={e => setLegacyPayloadText(e.target.value)}
                />
                {legacyPreview && (
                  <div className="rounded border bg-slate-50 p-3 text-sm space-y-1">
                    <p className="font-semibold">Kết quả đối soát trước khi nhập (Checksum: {legacyPreview.checksum.slice(0, 12)}…)</p>
                    <p>
                      Lớp hợp lệ: {legacyPreview.summary.classesValid} (Từ chối: {legacyPreview.summary.classesRejected}) · Bài nộp cũ:{' '}
                      {legacyPreview.summary.submissionsValid} · Tài liệu: {legacyPreview.summary.documentsValid} · Tài khoản cũ bỏ qua vì mật khẩu
                      thuần: {legacyPreview.summary.studentAccountsSkippedForSecurity}
                    </p>
                    {legacyPreview.warnings?.map((w: string, i: number) => (
                      <p key={i} className="text-amber-800 text-xs">
                        {w}
                      </p>
                    ))}
                  </div>
                )}
                {legacyCommitResult && (
                  <div className="rounded border border-emerald-300 bg-emerald-50 p-3 text-sm space-y-2">
                    <p className="font-semibold">
                      Trạng thái lô nhập: {legacyCommitResult.status || legacyCommitResult.mode}{' '}
                      {legacyCommitResult.idempotent ? '(Đã nhập trước đó — không tạo bản ghi trùng)' : ''}
                    </p>
                    {legacyCommitResult.batchId && legacyCommitResult.status !== 'rolled_back' && (
                      <button type="button" disabled={busy} onClick={() => void rollbackLegacy(legacyCommitResult.batchId)}>
                        Hoàn tác lô nhập này (Rollback Batch {legacyCommitResult.batchId.slice(0, 8)})
                      </button>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}
        </>
      )}
      {tab === 'review' && <ContentReview />}
      {tab === 'documents' && <DocumentEditor key={session.profile.user_id} />}
    </div>
  );
}
