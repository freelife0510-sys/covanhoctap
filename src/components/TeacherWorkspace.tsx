import React, { useEffect, useState } from 'react';
import { api, post } from '../services/apiClient.ts';
import type { Session, Workspace, StudentRecord } from '../features.ts';
import MathRenderer from './MathRenderer.tsx';
import TeacherAttempts from './TeacherAttempts.tsx';
import ContentReview from './ContentReview.tsx';

const DocumentEditor = React.lazy(() => import('./DocumentEditor.tsx'));

const LEGACY_KEYS = ['math_ai_classes_v1', 'math_ai_student_accounts_v2', 'math_ai_submissions_v1', 'saved_math_documents'] as const;

interface BulkCreatedStudent {
  id: string;
  name: string;
  studentCode: string;
  temporaryPassword: string;
}

function parseBulkStudentLines(raw: string): Array<{ name: string; studentCode?: string }> {
  return raw
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      // Strip leading numbering like "1. ", "02) "
      const cleaned = line.replace(/^\d+\s*[.)]\s*/, '').trim();
      // Check if formatted as "CODE - Full Name", "CODE, Full Name", or "CODE \t Full Name"
      const match = cleaned.match(/^([A-Za-z0-9-]{3,24})\s*(?:[-|,;\t])\s*(.+)$/);
      if (match && /[A-Za-z]/.test(match[1])) {
        return { studentCode: match[1].trim().toUpperCase(), name: match[2].trim() };
      }
      return { name: cleaned };
    })
    .filter(item => item.name.length > 0);
}

export default function TeacherWorkspace({ session }: { session: Session }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [credential, setCredential] = useState<{ studentCode: string; temporaryPassword: string } | null>(null);
  const [studentCreateMode, setStudentCreateMode] = useState<'bulk' | 'single'>('bulk');
  const [bulkClassId, setBulkClassId] = useState<string>('');
  const [bulkText, setBulkText] = useState<string>('');
  const [bulkResult, setBulkResult] = useState<{
    created: BulkCreatedStudent[];
    skipped: Array<{ name: string; studentCode?: string; reason: string }>;
  } | null>(null);
  const [copyNotice, setCopyNotice] = useState<string>('');
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
    const form = e.currentTarget;
    void run(async () => {
      setCredential(await post('/students', { name: f.get('name'), studentCode: f.get('code'), classId: f.get('classId') }));
      form.reset();
    });
  };

  const parsedBulkStudents = parseBulkStudentLines(bulkText);

  const addStudentsBulk = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const targetClassId = bulkClassId || workspace?.classes[0]?.id || '';
    if (!targetClassId) {
      setError('Vui lòng tạo và chọn lớp trước khi tạo học sinh.');
      return;
    }
    if (parsedBulkStudents.length === 0) {
      setError('Vui lòng nhập ít nhất 1 dòng họ tên học sinh.');
      return;
    }
    void run(async () => {
      const res = await post<{
        created: BulkCreatedStudent[];
        skipped: Array<{ name: string; studentCode?: string; reason: string }>;
      }>('/students-bulk', {
        classId: targetClassId,
        students: parsedBulkStudents.slice(0, 100),
      });
      setBulkResult(res);
      if (res.created.length > 0) {
        setBulkText('');
      }
    });
  };

  const copyBulkCredentials = () => {
    if (!bulkResult?.created.length) return;
    const lines = [
      'STT\tHọ và tên\tMã học sinh\tMật khẩu đăng nhập',
      ...bulkResult.created.map((s, idx) => `${idx + 1}\t${s.name}\t${s.studentCode}\t${s.temporaryPassword}`),
    ].join('\n');
    navigator.clipboard
      ?.writeText(lines)
      .then(() => {
        setCopyNotice('Đã sao chép danh sách tài khoản vào bộ nhớ tạm!');
        setTimeout(() => setCopyNotice(''), 4000);
      })
      .catch(() => {});
  };

  const downloadBulkCredentialsCsv = () => {
    if (!bulkResult?.created.length) return;
    const escapeCell = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const csvContent =
      '\uFEFF' +
      [
        ['STT', 'Họ và tên', 'Mã học sinh', 'Mật khẩu đăng nhập'].map(escapeCell).join(','),
        ...bulkResult.created.map((s, idx) => [String(idx + 1), s.name, s.studentCode, s.temporaryPassword].map(escapeCell).join(',')),
      ].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tai-khoan-hoc-sinh-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
              <p>Mã học sinh: <b>{credential.studentCode}</b></p>
              <output className="font-mono break-all font-bold text-emerald-700">{credential.temporaryPassword}</output>
              <p>Giao mã học sinh và mật khẩu này cho học sinh để đăng nhập.</p>
              <button onClick={() => setCredential(null)}>Đã giao · đóng</button>
            </section>
          )}
          {bulkResult && (
            <section className="panel border-emerald-400 bg-emerald-50/40 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-emerald-900">
                    Đã tạo thành công {bulkResult.created.length} tài khoản học sinh
                  </h2>
                  <p className="text-xs text-slate-600">
                    Hãy sao chép hoặc tải bảng mật khẩu dưới đây để gửi cho học sinh đăng nhập.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="button" onClick={copyBulkCredentials}>
                    📋 Sao chép danh sách
                  </button>
                  <button type="button" onClick={downloadBulkCredentialsCsv}>
                    📥 Tải file CSV mật khẩu
                  </button>
                  <button type="button" onClick={() => setBulkResult(null)}>
                    Đóng
                  </button>
                </div>
              </div>
              {copyNotice && <p className="text-xs font-bold text-emerald-700">{copyNotice}</p>}
              {bulkResult.created.length > 0 && (
                <div className="overflow-x-auto rounded-xl border bg-white">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-xs uppercase text-slate-700">
                      <tr>
                        <th className="px-3 py-2">STT</th>
                        <th className="px-3 py-2">Họ và tên</th>
                        <th className="px-3 py-2">Mã học sinh (Tài khoản)</th>
                        <th className="px-3 py-2">Mật khẩu đăng nhập</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {bulkResult.created.map((stu, idx) => (
                        <tr key={stu.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-mono text-xs">{idx + 1}</td>
                          <td className="px-3 py-2 font-semibold">{stu.name}</td>
                          <td className="px-3 py-2 font-mono font-bold text-emerald-800">{stu.studentCode}</td>
                          <td className="px-3 py-2 font-mono font-bold text-indigo-700">{stu.temporaryPassword}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {bulkResult.skipped.length > 0 && (
                <div className="rounded border border-amber-300 bg-amber-50 p-2.5 text-xs space-y-1">
                  <b>Bỏ qua {bulkResult.skipped.length} dòng:</b>
                  {bulkResult.skipped.map((sk, idx) => (
                    <p key={idx}>
                      • {sk.name || '(Trống)'} {sk.studentCode ? `(${sk.studentCode})` : ''}: {sk.reason}
                    </p>
                  ))}
                </div>
              )}
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
                    <input required name="name" maxLength={100} placeholder="Ví dụ: 12A1" />
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
                    <input required name="code" placeholder="Ví dụ: 12A1" />
                  </label>
                  <button className="button" disabled={busy}>
                    Lưu lớp
                  </button>
                </form>
                <ul className="mt-4 space-y-3">
                  {workspace.classes.map(c => (
                    <li key={c.id} className="flex justify-between gap-2 items-center">
                      <span className="font-semibold">{c.data.name}</span>
                      <div className="flex gap-2">
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
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="panel space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2>Cấp tài khoản học sinh</h2>
                  <div className="flex gap-1.5 text-xs">
                    <button
                      type="button"
                      className={studentCreateMode === 'bulk' ? 'button' : 'secondary'}
                      onClick={() => setStudentCreateMode('bulk')}
                    >
                      📋 Tạo hàng loạt
                    </button>
                    <button
                      type="button"
                      className={studentCreateMode === 'single' ? 'button' : 'secondary'}
                      onClick={() => setStudentCreateMode('single')}
                    >
                      👤 Tạo từng học sinh
                    </button>
                  </div>
                </div>

                {studentCreateMode === 'bulk' ? (
                  <form className="space-y-3" onSubmit={addStudentsBulk}>
                    <label>
                      Chọn lớp học
                      <select
                        required
                        value={bulkClassId || workspace.classes[0]?.id || ''}
                        onChange={e => setBulkClassId(e.target.value)}
                      >
                        <option value="">Chọn lớp</option>
                        {options}
                      </select>
                    </label>
                    <label>
                      Danh sách học sinh (Mỗi dòng 1 học sinh · tối đa 100 em/lần)
                      <textarea
                        rows={6}
                        required
                        value={bulkText}
                        onChange={e => setBulkText(e.target.value)}
                        placeholder={`Dán danh sách họ tên học sinh từ Excel/Word vào đây (mỗi học sinh 1 dòng):\nNguyễn Văn An\nTrần Thị Bình\nLê Hoàng Cường\n\n(Hệ thống tự động sinh Mã học sinh & Mật khẩu, hoặc nhập: HS001 - Nguyễn Văn An)`}
                      />
                    </label>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                      <span>Đã nhận diện: <b>{parsedBulkStudents.length}</b> học sinh</span>
                      {!workspace.classes.length && (
                        <span className="text-amber-700 font-semibold">⚠️ Vui lòng tạo lớp ở cột bên trái trước.</span>
                      )}
                    </div>
                    <button disabled={busy || !workspace.classes.length || parsedBulkStudents.length === 0} className="button w-full">
                      {busy ? 'Đang tạo danh sách…' : `Tạo ngay ${parsedBulkStudents.length || ''} tài khoản học sinh`}
                    </button>
                  </form>
                ) : (
                  <form className="space-y-3" onSubmit={addStudent}>
                    <label>
                      Họ tên
                      <input required name="name" placeholder="Ví dụ: Nguyễn Văn An" />
                    </label>
                    <label>
                      Mã học sinh (duy nhất)
                      <input required name="code" minLength={3} pattern="[A-Za-z0-9-]+" placeholder="Ví dụ: HS001" />
                    </label>
                    <label>
                      Lớp
                      <select required name="classId" defaultValue={workspace.classes[0]?.id || ''}>
                        <option value="">Chọn lớp</option>
                        {options}
                      </select>
                    </label>
                    <button disabled={busy || !workspace.classes.length} className="button">
                      Tạo tài khoản
                    </button>
                  </form>
                )}

                <div className="border-t pt-3 mt-3">
                  <h3 className="text-sm font-bold mb-2">Danh sách học sinh đã tạo ({workspace.students.length})</h3>
                  <ul className="space-y-2 max-h-72 overflow-y-auto">
                    {workspace.students.map(s => (
                      <li key={s.user_id} className="flex flex-wrap items-center justify-between gap-2 text-sm border-b pb-1.5">
                        <span>
                          <b className="font-mono text-emerald-800">{s.student_code}</b> · {s.data.name}
                        </span>
                        <div className="flex gap-1.5 text-xs">
                          <button disabled={busy} onClick={() => setEditingStudent(s)}>
                            Sửa / chuyển lớp
                          </button>
                          <button
                            disabled={busy}
                            onClick={() =>
                              void run(async () => {
                                const r = await post<{ temporaryPassword: string }>('/students/reset-password', { studentId: s.user_id });
                                setCredential({ studentCode: s.student_code, temporaryPassword: r.temporaryPassword });
                              })
                            }
                          >
                            Cấp lại mật khẩu
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
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
