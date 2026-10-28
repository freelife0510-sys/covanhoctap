import test from 'node:test';
import assert from 'node:assert/strict';
import { numericValue, gradeShortAnswer, gradeTrueFalseQuestion, stableShuffle } from '../../server/grading.ts';
import { validateAI, validateAIExercise, classifyProviderError, isAIConfigured } from '../../server/ai.ts';
import { googleOAuthOptions } from '../../server/oauth.ts';
import { buildSafeCsv, chatRequestSchema, csvEscapeCell, studentCreateSchema } from '../../shared/contracts.ts';
import { applyDocumentNodePatch, ensureNodeIds, validateDocument } from '../../shared/document.ts';
import { computeClassAnalytics } from '../../server/analytics.ts';
import { prepareLegacyImport } from '../../server/legacy.ts';
import { computeAdaptiveRecommendations } from '../../server/study.ts';
import { inspectFile } from '../../server/files.ts';
import { PDFDocument } from 'pdf-lib';

const reply = {
  chatReply: 'Em hãy kiểm tra điều kiện xác định.',
  verdict: 'inconclusive',
  errorCategory: null,
  errorEvidence: [],
  keyInsight: '',
  theorySummary: '',
  formulasNeeded: [],
  socraticQuestions: [],
  pedagogicalAdvice: '',
  followUpProblems: [],
};

test('numeric parser accepts equivalent fractions, comma decimals and zero; rejects code/ambiguous input', () => {
  for (const v of ['2', '2.0', '2,0', '4/2', '２']) assert.equal(numericValue(v), 2);
  for (const v of ['1/0', 'NaN', '1,000,000', 'alert(1)', '2m', '0x10', '1e309']) assert.equal(numericValue(v), null);
  assert.equal(gradeShortAnswer('0', { correctValue: 0, acceptableAnswers: [] }), true);
  assert.equal(gradeShortAnswer('2 m', { correctValue: 2, acceptableAnswers: [], unit: 'm' }), true);
  assert.equal(gradeShortAnswer('2 kg', { correctValue: 2, acceptableAnswers: [], unit: 'm' }), null);
  assert.equal(gradeShortAnswer('0.333', { correctValue: 1 / 3, acceptableAnswers: [], tolerance: 0.001 }), true);
  assert.equal(gradeShortAnswer('-7/9', { correctValue: -0.78, acceptableAnswers: ['-7/9', '-0.78', '-0,78'] }), true);
});

test('True/False grading implements both GDPT 2018 THPT 2025 rubric (0.1/0.25/0.5/1.0) and per-statement practice', () => {
  const stmts = [
    { subId: 'a' as const, isCorrect: true, explanation: 'a đúng' },
    { subId: 'b' as const, isCorrect: false, explanation: 'b sai' },
    { subId: 'c' as const, isCorrect: true, explanation: 'c đúng' },
    { subId: 'd' as const, isCorrect: false, explanation: 'd sai' },
  ];
  const g0 = gradeTrueFalseQuestion({ a: false, b: true, c: false, d: true }, stmts);
  assert.equal(g0.correctStatements, 0);
  assert.equal(g0.examPoints, 0);
  assert.equal(g0.allCorrect, false);

  const g1 = gradeTrueFalseQuestion({ a: true, b: true, c: false, d: true }, stmts);
  assert.equal(g1.correctStatements, 1);
  assert.equal(g1.examPoints, 0.1);
  assert.equal(g1.practicePoints, 0.25);

  const g2 = gradeTrueFalseQuestion({ a: true, b: false, c: false, d: true }, stmts);
  assert.equal(g2.correctStatements, 2);
  assert.equal(g2.examPoints, 0.25);
  assert.equal(g2.practicePoints, 0.5);

  const g3 = gradeTrueFalseQuestion({ a: true, b: false, c: true, d: true }, stmts);
  assert.equal(g3.correctStatements, 3);
  assert.equal(g3.examPoints, 0.5);
  assert.equal(g3.practicePoints, 0.75);

  const g4 = gradeTrueFalseQuestion({ a: true, b: false, c: true, d: false }, stmts);
  assert.equal(g4.correctStatements, 4);
  assert.equal(g4.examPoints, 1.0);
  assert.equal(g4.allCorrect, true);
});

test('shuffled option identities remain stable for a given attempt', () => {
  const items = ['A', 'B', 'C', 'D'];
  assert.deepEqual(stableShuffle(items, 'attempt'), stableShuffle(items, 'attempt'));
  assert.deepEqual(new Set(stableShuffle(items, 'other')), new Set(items));
  assert.deepEqual(items, ['A', 'B', 'C', 'D']);
});

test('AI rejects string booleans, unsupported fields, unsupported verdicts and missing evidence', () => {
  assert.throws(() => validateAI({ ...reply, isCorrect: 'false' }, 'submit_solution'));
  assert.throws(() => validateAI({ ...reply, verdict: 'incorrect', errorCategory: 'Khác' }, 'submit_solution'));
  assert.throws(() => validateAI({ ...reply, verdict: true }, 'submit_solution'));
  assert.equal(validateAI({ ...reply, verdict: 'correct' }, 'ask_guidance').verdict, 'not_applicable');
  assert.equal(validateAI(reply, 'submit_solution').verdict, 'inconclusive');
});

test('AI exercise validator rejects duplicate MC options and accepts valid questions', () => {
  assert.throws(() =>
    validateAIExercise({
      format: 'multiple_choice',
      question: 'Nghiệm của x - 1 = 0 là:',
      options: [
        { key: 'A', content: '1' },
        { key: 'B', content: '1' },
        { key: 'C', content: '2' },
        { key: 'D', content: '3' },
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Nhận biết',
      explanation: 'x = 1',
    })
  );
  const valid = validateAIExercise({
    format: 'multiple_choice',
    question: 'Nghiệm của phương trình $x - 1 = 0$ là:',
    options: [
      { key: 'A', content: '$1$' },
      { key: 'B', content: '$2$' },
      { key: 'C', content: '$3$' },
      { key: 'D', content: '$4$' },
    ],
    correctAnswer: 'A',
    cognitiveLevel: 'Nhận biết',
    explanation: 'Chuyển vế $x = 1$.',
  });
  assert.equal(valid.format, 'multiple_choice');
});

test('provider error types do not convert credentials/quota to model fallback', () => {
  assert.equal(classifyProviderError({ status: 403 }).code, 'AI_CREDENTIAL_ERROR');
  assert.equal(classifyProviderError({ status: 429 }).code, 'AI_QUOTA');
  assert.equal(classifyProviderError({ status: 404 }).code, 'AI_MODEL_UNAVAILABLE');
  assert.equal(classifyProviderError({ name: 'AbortError' }).status, 504);
});

test('teacher Google login explicitly asks to choose an account', () => {
  assert.deepEqual(googleOAuthOptions('https://app.example'), {
    redirectTo: 'https://app.example/api/auth/google/callback',
    queryParams: { prompt: 'select_account' },
    skipBrowserRedirect: true,
  });
});

test('AI readiness requires server key, model and both configured usage budgets', () => {
  assert.equal(isAIConfigured({}), false);
  assert.equal(isAIConfigured({ GEMINI_API_KEY: 'server-key', GEMINI_PRIMARY_MODEL: 'verified-model' }), false);
  assert.equal(
    isAIConfigured({
      GEMINI_API_KEY: 'server-key',
      GEMINI_PRIMARY_MODEL: 'verified-model',
      AI_DAILY_REQUEST_LIMIT_PER_USER: '4',
      AI_GLOBAL_DAILY_TOKEN_LIMIT: '1000',
    }),
    true
  );
});

test('student inputs cannot assign role, score or owner', () => {
  assert.equal(studentCreateSchema.safeParse({ name: 'An', classId: crypto.randomUUID(), studentCode: 'HS-01', role: 'teacher' }).success, false);
  assert.equal(
    chatRequestSchema.safeParse({
      requestId: crypto.randomUUID(),
      conversationId: crypto.randomUUID(),
      message: 'test',
      attachmentIds: [],
      intent: 'ask_guidance',
      score: 10,
    }).success,
    false
  );
});

test('real PDF parser rejects corruption and page count overflow', async () => {
  await assert.rejects(() => inspectFile(Buffer.from('not-pdf'), 'application/pdf', 7));
  const pdf = await PDFDocument.create();
  for (let i = 0; i < 21; i++) pdf.addPage();
  const bytes = await pdf.save();
  await assert.rejects(() => inspectFile(bytes, 'application/pdf', bytes.length), /20 trang/);
});

test('document schema rejects script nodes and external image URLs, and node-level patch respects revision locking', () => {
  assert.equal(validateDocument({ type: 'doc', content: [{ type: 'script', text: 'alert(1)' }] }), false);
  assert.equal(validateDocument({ type: 'doc', content: [{ type: 'image', attrs: { src: 'https://evil.example/track' } }] }), false);
  assert.equal(validateDocument({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '<script>inert text</script>' }] }] }), true);

  const doc = ensureNodeIds({
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Đoạn 1 gốc' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Đoạn 2 giữ nguyên' }] },
    ],
  });
  const stale = applyDocumentNodePatch(doc, 2, 3, 'block-1', {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Đoạn 1 sửa' }],
  });
  assert.deepEqual(stale, { ok: false, reason: 'REVISION_CONFLICT' });

  const applied = applyDocumentNodePatch(doc, 3, 3, 'block-1', {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Đoạn 1 đã vá' }],
  });
  assert.equal(applied.ok, true);
  if (applied.ok) {
    assert.equal(applied.document.content[0].content[0].text, 'Đoạn 1 đã vá');
    assert.equal(applied.document.content[1].content[0].text, 'Đoạn 2 giữ nguyên');
  }
});

test('CSV export neutralizes formula injection (=, +, -, @, tab)', () => {
  assert.equal(csvEscapeCell('=CMD("calc")'), `"'=CMD(""calc"")"`);
  assert.equal(csvEscapeCell('+SUM(A1:A2)'), `"'+SUM(A1:A2)"`);
  assert.equal(csvEscapeCell('-2+3'), `"'-2+3"`);
  assert.equal(csvEscapeCell('@IMPORTXML()'), `"'@IMPORTXML()"`);
  const csv = buildSafeCsv(['Mã', 'Tên'], [['HS-01', '=1+1']]);
  assert.ok(csv.includes(`"'=1+1"`));
});

test('class analytics excludes legacy_unverified, unreviewed AI, ask_guidance and inconclusive from accuracy denominators', () => {
  const analytics = computeClassAnalytics({
    students: [{ user_id: 'stu-1', student_code: 'HS-01', class_id: 'cls-1', data: { name: 'An' } }],
    submissions: [
      {
        id: 's1',
        student_id: 'stu-1',
        class_id: 'cls-1',
        created_at: new Date().toISOString(),
        data: { evaluation: { verdict: 'correct', reviewState: 'verified' }, hasResolvedMistake: false },
      },
      {
        id: 's2',
        student_id: 'stu-1',
        class_id: 'cls-1',
        created_at: new Date().toISOString(),
        data: { evaluation: { verdict: 'incorrect', reviewState: 'verified' }, hasResolvedMistake: false },
      },
      {
        id: 's3-unreviewed',
        student_id: 'stu-1',
        class_id: 'cls-1',
        created_at: new Date().toISOString(),
        data: { evaluation: { verdict: 'correct', reviewState: 'unreviewed' }, hasResolvedMistake: false },
      },
      {
        id: 's4-inconclusive',
        student_id: 'stu-1',
        class_id: 'cls-1',
        created_at: new Date().toISOString(),
        data: { evaluation: { verdict: 'inconclusive', reviewState: 'verified' }, hasResolvedMistake: false },
      },
      {
        id: 's5-legacy',
        student_id: null,
        class_id: 'cls-1',
        created_at: new Date().toISOString(),
        data: { legacy_unverified: true, evaluation: { verdict: 'correct', reviewState: 'legacy_unverified' }, hasResolvedMistake: false },
      },
    ],
    evidence: [
      { id: 'e1', student_id: 'stu-1', submission_id: 's2', skill: 'Chưa đặt điều kiện xác định', state: 'needs_remedy', reviewed_at: new Date().toISOString() },
      { id: 'e2', student_id: 'stu-1', submission_id: 's1', skill: 'Biến đổi đại số sai', state: 'resolved', reviewed_at: new Date().toISOString() },
    ],
    attempts: [],
  });
  assert.equal(analytics.denominators.verifiedAccuracy.numerator, 1);
  assert.equal(analytics.denominators.verifiedAccuracy.denominator, 2);
  assert.equal(analytics.denominators.verifiedAccuracy.ratePercent, 50);
  assert.equal(analytics.denominators.errorResolution.numerator, 1);
  assert.equal(analytics.denominators.errorResolution.denominator, 2);
  assert.equal(analytics.denominators.exclusions.legacyUnverifiedExcludedCount, 1);
  assert.equal(analytics.denominators.exclusions.unreviewedAiCount, 1);
  assert.equal(analytics.denominators.exclusions.inconclusiveOrGuidanceExcludedCount, 1);
});

test('legacy import strips plaintext student passwords, maps deterministic UUIDs, and marks legacy_unverified', () => {
  const teacherId = '10000000-0000-4000-8000-000000000001';
  const plan1 = prepareLegacyImport(teacherId, {
    math_ai_classes_v1: [{ id: 'old-cls-1', name: '12A1', grade: '12' }],
    math_ai_student_accounts_v2: [{ id: 'stu-old', password: 'plaintext-secret' }],
    math_ai_submissions_v1: [{ id: 'sub-old-1', classId: 'old-cls-1', problemText: 'Giải x^2 = 1', evaluation: { verdict: 'correct' } }],
    saved_math_documents: [{ id: 'doc-old-1', title: 'Đề ôn tập', content: 'Câu 1: Giải phương trình' }],
  });
  const plan2 = prepareLegacyImport(teacherId, {
    math_ai_classes_v1: [{ id: 'old-cls-1', name: '12A1', grade: '12' }],
    math_ai_student_accounts_v2: [{ id: 'stu-old', password: 'plaintext-secret' }],
    math_ai_submissions_v1: [{ id: 'sub-old-1', classId: 'old-cls-1', problemText: 'Giải x^2 = 1', evaluation: { verdict: 'correct' } }],
    saved_math_documents: [{ id: 'doc-old-1', title: 'Đề ôn tập', content: 'Câu 1: Giải phương trình' }],
  });
  assert.equal(plan1.checksum, plan2.checksum);
  assert.equal(plan1.classesToInsert[0].id, plan2.classesToInsert[0].id);
  assert.equal(plan1.summary.studentAccountsSkippedForSecurity, 1);
  assert.equal(plan1.submissionsToInsert[0].data.legacy_unverified, true);
  assert.equal(plan1.submissionsToInsert[0].data.evaluation.reviewState, 'legacy_unverified');
});

test('adaptive recommendations report insufficient data when empty and prioritize unresolved skills when present', () => {
  const empty = computeAdaptiveRecommendations([], []);
  assert.equal(empty.hasSufficientData, false);
  assert.match(empty.summary, /Chưa đủ dữ liệu/);

  const populated = computeAdaptiveRecommendations([{ skill: 'Chưa đặt điều kiện xác định', state: 'needs_remedy' }], []);
  assert.equal(populated.hasSufficientData, true);
  assert.ok(populated.recommendedLessons.length > 0);
});
