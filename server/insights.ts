import { randomUUID } from 'node:crypto';
import type { StandaloneTenantData } from './standalone.ts';

/** Teaching tip shown to teachers for each error group. */
export const ERROR_TEACHING_TIPS: Record<string, string> = {
  'Chưa đặt điều kiện xác định': 'Yêu cầu học sinh luôn viết điều kiện xác định trước khi biến đổi; luyện các dạng chứa logarit, căn thức, phân thức.',
  'Biến đổi đại số sai': 'Cho học sinh biến đổi từng bước, mỗi bước kiểm tra lại bằng cách thay một giá trị cụ thể.',
  'Nhầm lẫn định lý/công thức': 'Hệ thống lại bảng công thức, đặt cạnh nhau các công thức dễ nhầm và cho ví dụ phân biệt.',
  'Thiếu nghiệm ngoại lai': 'Rèn thói quen đối chiếu điều kiện và thử lại nghiệm trước khi kết luận.',
  'Lập luận hình học sai': 'Yêu cầu vẽ hình chuẩn, nêu rõ căn cứ (định lí, tính chất) cho từng kết luận.',
  'Lỗi tính toán': 'Luyện tính toán cẩn thận, khuyến khích kiểm tra lại bằng máy tính cầm tay.',
  'Chưa hiểu bản chất khái niệm': 'Dạy lại khái niệm qua ví dụ – phản ví dụ và câu hỏi gợi mở trước khi giao bài tập.',
  'Lập luận chưa chặt chẽ': 'Yêu cầu trình bày đủ căn cứ, dùng đúng kí hiệu suy ra/tương đương.',
  Khác: 'Xem lại bài làm cụ thể của học sinh để xác định nguyên nhân.',
};

type Evaluation = { verdict?: string; errorCategory?: string | null; errorEvidence?: { category: string; explanation: string }[] };

/**
 * Automatically logs each error the AI found in a submitted solution, so weak
 * content is tracked without waiting for the teacher. Teacher review later
 * replaces these records with verified ones.
 */
export function recordAutoEvidence(
  tenant: StandaloneTenantData,
  input: { studentId: string; submissionId: string; lessonId?: string | null; evaluation: Evaluation }
) {
  if (input.evaluation.verdict !== 'incorrect') return;
  const byCategory = new Map<string, string>();
  for (const e of input.evaluation.errorEvidence || []) {
    if (!byCategory.has(e.category)) byCategory.set(e.category, e.explanation);
  }
  if (!byCategory.size && input.evaluation.errorCategory) byCategory.set(input.evaluation.errorCategory, 'AI phát hiện lỗi trong bài giải.');
  const now = new Date().toISOString();
  for (const [skill, reason] of byCategory) {
    tenant.evidence.push({
      id: randomUUID(),
      student_id: input.studentId,
      submission_id: input.submissionId,
      skill,
      state: 'needs_remedy',
      source: 'ai_auto',
      reason: reason.slice(0, 1000),
      reviewed_at: now,
      lesson_id: input.lessonId || null,
      verified: false,
    });
  }
}

type LessonInfo = { title: string; grade: string | number };

export interface StudentInsight {
  studentId: string;
  studentCode: string;
  name: string;
  classId: string;
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

const dayKey = (iso: string) => new Date(new Date(iso).getTime() + 7 * 3600_000).toISOString().slice(0, 10); // Asia/Ho_Chi_Minh
const avg = (values: number[]) => (values.length ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)) : null);

export function computeStudentInsights(params: {
  students: { user_id: string; student_code: string; class_id: string; data?: any }[];
  submissions: { id: string; student_id: string | null; data: any; created_at: string }[];
  attempts: { owner_id: string; lesson_id: string; data: any; created_at: string }[];
  evidence: { student_id: string; skill: string; state: string; lesson_id?: string | null; reviewed_at?: string }[];
  lessons: Record<string, LessonInfo>;
  now?: number;
}): StudentInsight[] {
  const now = params.now ?? Date.now();
  return params.students.map(stu => {
    const subs = params.submissions.filter(s => s.student_id === stu.user_id);
    const graded = subs.filter(s => s.data?.evaluation?.verdict === 'correct' || s.data?.evaluation?.verdict === 'incorrect');
    const atts = params.attempts
      .filter(a => a.owner_id === stu.user_id && a.data?.submitted && a.data?.result)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    const scores = atts.map(a => Number(a.data.result.score ?? 0));
    const half = Math.floor(scores.length / 2);
    const ev = params.evidence.filter(e => e.student_id === stu.user_id);
    const open = ev.filter(e => e.state === 'needs_remedy');

    const activity = [...subs.map(s => s.created_at), ...atts.map(a => a.created_at)];
    const days = (windowDays: number) =>
      new Set(activity.filter(t => now - new Date(t).getTime() <= windowDays * 86_400_000).map(dayKey)).size;
    const lastActiveAt = activity.sort().at(-1) || null;

    const errorCounts = new Map<string, number>();
    for (const e of open) errorCounts.set(e.skill || 'Khác', (errorCounts.get(e.skill || 'Khác') || 0) + 1);

    const lessonStats = new Map<string, { errors: number; scores: number[] }>();
    const touch = (id: string) => {
      if (!lessonStats.has(id)) lessonStats.set(id, { errors: 0, scores: [] });
      return lessonStats.get(id)!;
    };
    for (const e of open) if (e.lesson_id) touch(e.lesson_id).errors++;
    for (const a of atts) touch(a.lesson_id).scores.push(Number(a.data.result.score ?? 0));
    const weakLessons = [...lessonStats.entries()]
      .map(([lessonId, s]) => {
        const recent = s.scores.slice(-3);
        const averageScore = avg(recent);
        const info = params.lessons[lessonId];
        const reasons: string[] = [];
        if (s.errors) reasons.push(`${s.errors} lỗi chưa khắc phục`);
        if (averageScore !== null && averageScore < 6.5) reasons.push(`điểm luyện tập gần đây ${averageScore}/10`);
        return { lessonId, title: info?.title || lessonId, grade: info?.grade ?? '', errors: s.errors, averageScore, reason: reasons.join(', ') };
      })
      .filter(l => l.reason)
      .sort((a, b) => b.errors - a.errors || (a.averageScore ?? 10) - (b.averageScore ?? 10))
      .slice(0, 5);

    return {
      studentId: stu.user_id,
      studentCode: stu.student_code,
      name: stu.data?.name || stu.student_code,
      classId: stu.class_id,
      submissionCount: subs.length,
      incorrectCount: graded.filter(s => s.data.evaluation.verdict === 'incorrect').length,
      attemptCount: atts.length,
      averageScore: avg(scores),
      firstHalfAverage: scores.length >= 2 ? avg(scores.slice(0, half)) : null,
      secondHalfAverage: scores.length >= 2 ? avg(scores.slice(half)) : null,
      activeDays7: days(7),
      activeDays28: days(28),
      sessionsPerWeek: Number((days(28) / 4).toFixed(1)),
      lastActiveAt,
      openErrors: open.length,
      resolvedErrors: ev.filter(e => e.state === 'resolved').length,
      topErrors: [...errorCounts.entries()].map(([skill, count]) => ({ skill, count })).sort((a, b) => b.count - a.count).slice(0, 3),
      weakLessons,
    };
  });
}

/** Class-level weak topics, daily activity and review suggestions built from per-student insights. */
export function summarizeClass(insights: StudentInsight[], evidence: { student_id: string; skill: string; state: string }[], activity: string[], now = Date.now()) {
  const ids = new Set(insights.map(i => i.studentId));
  const lessonMap = new Map<string, { lessonId: string; title: string; grade: string | number; students: number; errors: number }>();
  for (const stu of insights) {
    for (const l of stu.weakLessons) {
      const row = lessonMap.get(l.lessonId) || { lessonId: l.lessonId, title: l.title, grade: l.grade, students: 0, errors: 0 };
      row.students++;
      row.errors += l.errors;
      lessonMap.set(l.lessonId, row);
    }
  }
  const weakLessons = [...lessonMap.values()].sort((a, b) => b.students - a.students || b.errors - a.errors).slice(0, 8);

  const categoryCounts = new Map<string, number>();
  for (const e of evidence) {
    if (!ids.has(e.student_id) || e.state !== 'needs_remedy') continue;
    categoryCounts.set(e.skill || 'Khác', (categoryCounts.get(e.skill || 'Khác') || 0) + 1);
  }
  const topCategories = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  const activityByDay: { date: string; count: number }[] = [];
  const counts = new Map<string, number>();
  for (const t of activity) counts.set(dayKey(t), (counts.get(dayKey(t)) || 0) + 1);
  for (let i = 13; i >= 0; i--) {
    const date = dayKey(new Date(now - i * 86_400_000).toISOString());
    activityByDay.push({ date, count: counts.get(date) || 0 });
  }

  const suggestions: string[] = [];
  for (const l of weakLessons.slice(0, 3)) {
    suggestions.push(`Ôn tập lại "${l.title}" (Lớp ${l.grade}): ${l.students} học sinh còn yếu${l.errors ? `, ${l.errors} lỗi chưa khắc phục` : ''}.`);
  }
  for (const [skill, count] of topCategories) {
    suggestions.push(`Nhóm lỗi "${skill}" (${count} lượt): ${ERROR_TEACHING_TIPS[skill] || ERROR_TEACHING_TIPS.Khác}`);
  }
  const inactive = insights.filter(i => i.activeDays7 === 0);
  if (inactive.length) {
    suggestions.push(`${inactive.length} học sinh chưa học trên hệ thống trong 7 ngày qua: ${inactive.slice(0, 6).map(i => i.name).join(', ')}${inactive.length > 6 ? '…' : ''}. Nên nhắc nhở hoặc giao nhiệm vụ.`);
  }

  return {
    weakLessons,
    activityByDay,
    reviewSuggestions: suggestions,
    activeStudents7: insights.filter(i => i.activeDays7 > 0).length,
    averageSessionsPerWeek: insights.length ? Number((insights.reduce((a, i) => a + i.sessionsPerWeek, 0) / insights.length).toFixed(1)) : 0,
  };
}

/** Plain-text summary of one student used as the AI teaching-advice prompt. */
export function describeStudentForAdvice(insight: StudentInsight, recentErrors: { skill: string; reason: string }[]): string {
  return [
    `Học sinh: ${insight.name} (${insight.studentCode})`,
    `Bài nộp cho AI kiểm tra: ${insight.submissionCount}, trong đó sai: ${insight.incorrectCount}`,
    `Lượt luyện tập: ${insight.attemptCount}, điểm trung bình: ${insight.averageScore ?? 'chưa có'}`,
    insight.firstHalfAverage !== null ? `Xu hướng điểm: ${insight.firstHalfAverage} → ${insight.secondHalfAverage}` : '',
    `Số ngày học 4 tuần gần đây: ${insight.activeDays28}`,
    `Lỗi chưa khắc phục: ${insight.openErrors}; đã khắc phục: ${insight.resolvedErrors}`,
    insight.topErrors.length ? `Nhóm lỗi hay gặp: ${insight.topErrors.map(e => `${e.skill} (${e.count})`).join('; ')}` : '',
    insight.weakLessons.length ? `Chủ đề còn yếu: ${insight.weakLessons.map(l => `${l.title} – ${l.reason}`).join('; ')}` : '',
    recentErrors.length ? `Mô tả lỗi gần đây:\n${recentErrors.map(e => `- [${e.skill}] ${e.reason}`).join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
