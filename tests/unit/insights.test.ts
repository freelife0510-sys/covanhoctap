import test from 'node:test';
import assert from 'node:assert/strict';
import { computeStudentInsights, recordAutoEvidence, summarizeClass } from '../../server/insights.ts';

const tenant = () => ({ evidence: [] as any[] }) as any;

test('AI-detected errors are logged automatically per category; correct work logs nothing', () => {
  const t = tenant();
  recordAutoEvidence(t, {
    studentId: 's1',
    submissionId: 'sub1',
    lessonId: '11-c6-b1',
    evaluation: {
      verdict: 'incorrect',
      errorCategory: 'Chưa đặt điều kiện xác định',
      errorEvidence: [
        { category: 'Chưa đặt điều kiện xác định', explanation: 'Thiếu x > 1' },
        { category: 'Thiếu nghiệm ngoại lai', explanation: 'Nhận x = -3' },
        { category: 'Chưa đặt điều kiện xác định', explanation: 'Trùng nhóm' },
      ],
    },
  });
  assert.equal(t.evidence.length, 2);
  assert.ok(t.evidence.every((e: any) => e.source === 'ai_auto' && e.state === 'needs_remedy' && e.lesson_id === '11-c6-b1'));
  recordAutoEvidence(t, { studentId: 's1', submissionId: 'sub2', evaluation: { verdict: 'correct' } });
  assert.equal(t.evidence.length, 2);
});

test('student insights find weak lessons, activity and score trend; class summary suggests review topics', () => {
  const now = Date.parse('2026-11-02T10:00:00Z');
  const day = (n: number) => new Date(now - n * 86_400_000).toISOString();
  const attempt = (score: number, at: string) => ({ owner_id: 's1', lesson_id: '11-c6-b1', created_at: at, data: { submitted: true, result: { score } } });
  const insights = computeStudentInsights({
    now,
    students: [
      { user_id: 's1', student_code: 'A-001', class_id: 'c', data: { name: 'An' } },
      { user_id: 's2', student_code: 'A-002', class_id: 'c', data: { name: 'Bình' } },
    ],
    submissions: [{ id: 'x', student_id: 's1', created_at: day(1), data: { evaluation: { verdict: 'incorrect' } } }],
    attempts: [attempt(3, day(20)), attempt(4, day(10)), attempt(6, day(2))],
    evidence: [{ student_id: 's1', skill: 'Lỗi tính toán', state: 'needs_remedy', lesson_id: '11-c6-b1' }],
    lessons: { '11-c6-b1': { title: 'Mũ và Lôgarit', grade: '11' } },
  });
  const an = insights[0];
  assert.equal(an.incorrectCount, 1);
  assert.equal(an.attemptCount, 3);
  assert.equal(an.activeDays7, 2);
  assert.equal(an.activeDays28, 4);
  assert.equal(an.firstHalfAverage, 3);
  assert.equal(an.secondHalfAverage, 5);
  assert.equal(an.weakLessons[0].title, 'Mũ và Lôgarit');
  assert.equal(insights[1].weakLessons.length, 0);

  const summary = summarizeClass(insights, [{ student_id: 's1', skill: 'Lỗi tính toán', state: 'needs_remedy' }], [day(1), day(2)], now);
  assert.equal(summary.weakLessons[0].students, 1);
  assert.equal(summary.activityByDay.length, 14);
  assert.ok(summary.reviewSuggestions.some(s => s.includes('Mũ và Lôgarit')));
  assert.ok(summary.reviewSuggestions.some(s => s.includes('Bình')));
});
