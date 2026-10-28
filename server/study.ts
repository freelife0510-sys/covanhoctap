import { createHash } from 'node:crypto';
import type { Identity } from './auth.ts';
import { checked, supabase } from './auth.ts';
import { HIGH_SCHOOL_CURRICULUM } from './curriculum.ts';
import { HttpError } from './http.ts';
import { gradeShortAnswer, gradeTrueFalseQuestion, stableShuffle, TRUE_FALSE_RUBRIC_VERSION } from './grading.ts';
import { z } from 'zod';
import { uuid } from '../shared/contracts.ts';

export const questionHash = (q: unknown) => createHash('sha256').update(JSON.stringify(q)).digest('hex');

export const lessons = HIGH_SCHOOL_CURRICULUM.flatMap(g =>
  g.chapters.flatMap(c =>
    c.lessons.map(l => ({
      ...l,
      grade: g.grade,
      chapterId: c.id,
      chapter: c.title,
    }))
  )
);

export function publicCurriculum() {
  return lessons.map(l => ({
    id: l.id,
    title: l.title,
    grade: l.grade,
    chapterId: l.chapterId,
    chapter: l.chapter,
    theory: l.theory,
    questionCounts: {
      multipleChoice: l.exercises.multipleChoice.length,
      trueFalse: l.exercises.trueFalse.length,
      shortAnswer: l.exercises.shortAnswer.length,
    },
  }));
}

export interface AdaptiveRecommendation {
  hasSufficientData: boolean;
  ruleLabel: string;
  summary: string;
  recommendedLessons: Array<{
    lessonId: string;
    title: string;
    grade: string | number;
    reason: string;
    priority: 'high' | 'medium';
  }>;
}

export function computeAdaptiveRecommendations(
  evidenceRows: Array<{ skill?: string; state?: string }>,
  attemptRows: Array<{ lesson_id?: string; data?: any }>
): AdaptiveRecommendation {
  const verifiedEvidence = (evidenceRows || []).filter(
    e => e && (e.state === 'needs_remedy' || e.state === 'resolved' || e.state === 'verified')
  );
  const submittedAttempts = (attemptRows || []).filter(a => a?.data?.submitted && a?.data?.result);

  if (verifiedEvidence.length === 0 && submittedAttempts.length === 0) {
    return {
      hasSufficientData: false,
      ruleLabel: 'Gợi ý theo quy tắc (Rule-based)',
      summary: 'Chưa đủ dữ liệu: Cần ít nhất 1 bài nộp đã thẩm định hoặc 1 lượt luyện tập hoàn thành để đề xuất lộ trình ôn tập.',
      recommendedLessons: [],
    };
  }

  const recommendations: AdaptiveRecommendation['recommendedLessons'] = [];
  const unresolvedSkills = verifiedEvidence.filter(e => e.state === 'needs_remedy').map(e => e.skill || 'Khác');

  const skillToLessonMap: Record<string, string[]> = {
    'Chưa đặt điều kiện xác định': ['10-c6-b1', '11-c6-b1', '12-c1-b3'],
    'Biến đổi đại số sai': ['10-c2-b1', '11-c1-b1', '12-c1-b1'],
    'Nhầm lẫn định lý/công thức': ['10-c3-b1', '11-c7-b1', '12-c4-b1'],
    'Thiếu nghiệm ngoại lai': ['10-c6-b1', '11-c1-b2'],
    'Lập luận hình học sai': ['10-c4-b1', '11-c8-b1', '12-c5-b1'],
  };

  for (const skill of Array.from(new Set(unresolvedSkills))) {
    const candidateIds = skillToLessonMap[skill] || ['12-c1-b1'];
    for (const lid of candidateIds) {
      const lesson = lessons.find(l => l.id === lid);
      if (lesson && !recommendations.some(r => r.lessonId === lesson.id)) {
        recommendations.push({
          lessonId: lesson.id,
          title: lesson.title,
          grade: lesson.grade,
          reason: `Cần khắc phục lỗi "${skill}" đã ghi nhận trong hồ sơ năng lực.`,
          priority: 'high',
        });
      }
    }
  }

  for (const att of submittedAttempts) {
    const score = Number(att.data?.result?.score ?? 10);
    if (score < 7 && att.lesson_id) {
      const lesson = lessons.find(l => l.id === att.lesson_id);
      if (lesson && !recommendations.some(r => r.lessonId === lesson.id)) {
        recommendations.push({
          lessonId: lesson.id,
          title: lesson.title,
          grade: lesson.grade,
          reason: `Điểm luyện tập gần nhất đạt ${score}/10 (< 7,0); nên củng cố lại lý thuyết và bài tập chuẩn.`,
          priority: 'medium',
        });
      }
    }
  }

  return {
    hasSufficientData: true,
    ruleLabel: 'Gợi ý theo quy tắc (Rule-based — dựa trên hồ sơ lỗi đã xác thực và kết quả luyện tập)',
    summary:
      recommendations.length > 0
        ? `Phát hiện ${recommendations.length} chủ đề ưu tiên cần ôn tập bổ sung.`
        : 'Các chỉ số hiện tại đạt ngưỡng yêu cầu; em có thể tiếp tục bài học tiếp theo trong chương trình.',
    recommendedLessons: recommendations.slice(0, 5),
  };
}

export async function createAttempt(identity: Identity, value: unknown) {
  const input = z
    .object({
      id: uuid,
      lessonId: z.string(),
      format: z.enum(['multiple_choice', 'true_false', 'short_answer']),
      scoringMode: z.enum(['practice', 'exam_2025']).optional(),
      assignmentId: uuid.optional(),
    })
    .strict()
    .parse(value);

  const lesson = lessons.find(l => l.id === input.lessonId);
  if (!lesson) throw new HttpError(404, 'LESSON_NOT_FOUND', 'Không tìm thấy bài học.');
  const admin = supabase(undefined, true);
  const existing = checked(await admin.from('attempts').select('*').eq('id', input.id).maybeSingle());
  if (existing) {
    if (existing.owner_id !== identity.id) throw new HttpError(409, 'CONFLICT', 'Mã lượt làm đã được sử dụng.');
    return safeAttempt(existing);
  }

  const reviews = checked(await identity.db.from('question_reviews').select('question_id,content_hash,status'));
  const reviewMap = new Map((reviews || []).map((r: any) => [r.question_id, r]));

  const all =
    input.format === 'multiple_choice'
      ? lesson.exercises.multipleChoice
      : input.format === 'true_false'
        ? lesson.exercises.trueFalse
        : lesson.exercises.shortAnswer;

  // Baseline curriculum questions are mathematically verified by verify-curriculum.ts;
  // if a teacher explicitly withdrew a question in question_reviews, exclude it.
  const questions = all
    .filter(q => {
      const rev = reviewMap.get(q.id);
      if (rev && rev.status === 'withdrawn') return false;
      return true;
    })
    .map(q =>
      'options' in q
        ? { ...q, version: questionHash(q), options: stableShuffle(q.options, `${input.id}:${q.id}`) }
        : { ...q, version: questionHash(q) }
    );

  if (!questions.length) {
    throw new HttpError(422, 'CONTENT_REVIEW_REQUIRED', 'Các câu hỏi của dạng này đang tạm ẩn hoặc chờ giáo viên duyệt lại.');
  }

  if (input.assignmentId) {
    const assignment = checked(await identity.db.from('assignments').select('*').eq('id', input.assignmentId).maybeSingle());
    if (!assignment || assignment.lesson_id !== input.lessonId || (assignment.deadline && new Date(assignment.deadline) < new Date())) {
      throw new HttpError(403, 'ASSIGNMENT_UNAVAILABLE', 'Nhiệm vụ không hợp lệ hoặc đã hết hạn.');
    }
  }

  const scoringMode = input.scoringMode ?? (input.format === 'true_false' ? 'exam_2025' : 'practice');
  const row = {
    id: input.id,
    owner_id: identity.id,
    lesson_id: input.lessonId,
    format: input.format,
    data: {
      questions,
      assignmentId: input.assignmentId,
      scoringMode,
      answers: {},
      submitted: false,
      version: 2,
    },
  };
  checked(await admin.from('attempts').insert(row));
  return safeAttempt(row);
}

function safeAttempt(row: { id: string; format: string; data: Record<string, any> }) {
  return {
    id: row.id,
    format: row.format,
    scoringMode: row.data.scoringMode ?? 'practice',
    submitted: row.data.submitted,
    result: row.data.result,
    questions: row.data.questions.map((q: any) => ({
      id: q.id,
      prompt: q.question || q.context || q.problem,
      unit: q.unit,
      options: q.options,
      statements: q.statements?.map((s: any) => ({ subId: s.subId, content: s.content })),
    })),
  };
}

export async function submitAttempt(identity: Identity, value: unknown) {
  const input = z
    .object({
      id: uuid,
      answers: z.record(z.string(), z.union([z.string().max(200), z.record(z.string(), z.boolean())])),
    })
    .strict()
    .parse(value);

  const admin = supabase(undefined, true);
  const row = checked(await admin.from('attempts').select('*').eq('id', input.id).eq('owner_id', identity.id).maybeSingle());
  if (!row) throw new HttpError(404, 'ATTEMPT_NOT_FOUND', 'Không tìm thấy lượt làm.');
  if (row.data.submitted) return row.data.result;

  const scoringMode: 'practice' | 'exam_2025' = row.data.scoringMode ?? 'practice';
  let totalPointsEarned = 0;

  const details = row.data.questions.map((q: any) => {
    const answer = input.answers[q.id];
    let correct: boolean | null = null;
    let tfBreakdown: ReturnType<typeof gradeTrueFalseQuestion> | undefined;

    if (row.format === 'multiple_choice') {
      correct = typeof answer === 'string' ? answer === q.correctAnswer : null;
      if (correct === true) totalPointsEarned += 1;
    } else if (row.format === 'true_false') {
      tfBreakdown = gradeTrueFalseQuestion(answer && typeof answer === 'object' ? answer : null, q.statements || []);
      correct = tfBreakdown.allCorrect;
      totalPointsEarned += scoringMode === 'exam_2025' ? tfBreakdown.examPoints : tfBreakdown.practicePoints;
    } else {
      correct = typeof answer === 'string' ? gradeShortAnswer(answer, q) : null;
      if (correct === true) totalPointsEarned += 1;
    }

    return {
      questionId: q.id,
      correct,
      ...(tfBreakdown
        ? {
            correctStatements: tfBreakdown.correctStatements,
            totalStatements: tfBreakdown.totalStatements,
            statementResults: tfBreakdown.statementResults,
            examPoints: tfBreakdown.examPoints,
            practicePoints: tfBreakdown.practicePoints,
            rubricVersion: tfBreakdown.rubricVersion,
          }
        : {}),
      explanation:
        q.explanation ||
        q.overallExplanation ||
        q.statements?.map((s: any) => `(${s.subId}) ${s.isCorrect ? 'Đúng' : 'Sai'}: ${s.explanation}`).join('\n'),
    };
  });

  const completed = details.filter((d: any) => d.correct !== null || (d.totalStatements && d.statementResults?.some((s: any) => s.answered !== null))).length;
  const correct = details.filter((d: any) => d.correct === true).length;
  const totalQuestions = Math.max(1, details.length);
  const rawScore = Number(((totalPointsEarned / totalQuestions) * 10).toFixed(2));
  const label =
    row.format === 'true_false' && scoringMode === 'exam_2025'
      ? `Điểm quy đổi Đúng/Sai theo quy tắc THPT 2025 (${TRUE_FALSE_RUBRIC_VERSION}: 1 ý = 0,1đ; 2 ý = 0,25đ; 3 ý = 0,5đ; 4 ý = 1,0đ); phục vụ luyện tập`
      : 'Điểm luyện tập trên toàn bộ câu trong lượt làm; không phải điểm thi chính thức';

  const result = {
    details,
    correct,
    total: details.length,
    answered: completed,
    scoringMode,
    rubricVersion: row.format === 'true_false' ? TRUE_FALSE_RUBRIC_VERSION : undefined,
    score: rawScore,
    label,
    durationSeconds: Math.max(0, Math.round((Date.now() - new Date(row.created_at).getTime()) / 1000)),
  };

  const saved = checked(await admin.rpc('submit_attempt', { p_id: input.id, p_owner: identity.id, p_answers: input.answers, p_result: result }));
  return saved;
}
