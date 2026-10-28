import { z } from 'zod';
import { contentSchema } from './document.ts';

export const uuid = z.string().uuid();
export const verdictSchema = z.enum(['correct', 'incorrect', 'inconclusive', 'not_applicable']);
export const intentSchema = z.enum(['ask_guidance', 'submit_solution', 'request_exercises']);
export const errorCategorySchema = z.enum([
  'Chưa đặt điều kiện xác định',
  'Biến đổi đại số sai',
  'Nhầm lẫn định lý/công thức',
  'Thiếu nghiệm ngoại lai',
  'Lập luận hình học sai',
  'Khác',
]);

export const aiResultSchema = z
  .object({
    chatReply: z.string().min(1).max(30000),
    detailedSolution: z.string().max(40000).optional(),
    verdict: verdictSchema,
    errorCategory: errorCategorySchema.nullable(),
    errorEvidence: z
      .array(z.object({ category: errorCategorySchema, excerpt: z.string().min(1), explanation: z.string().min(1) }))
      .max(10),
    keyInsight: z.string(),
    theorySummary: z.string(),
    formulasNeeded: z.array(z.string()).max(20),
    socraticQuestions: z.array(z.string()).max(10),
    pedagogicalAdvice: z.string(),
    followUpProblems: z
      .array(
        z.object({
          id: z.number().int(),
          title: z.string(),
          content: z.string(),
          difficulty: z.enum(['Tương đương', 'Nâng cao', 'Vận dụng']),
          initialHint: z.string().optional(),
        })
      )
      .max(4),
  })
  .strict()
  .superRefine((r, c) => {
    if (r.verdict === 'incorrect' && (!r.errorCategory || !r.errorEvidence.length)) {
      c.addIssue({ code: 'custom', message: 'Incorrect verdict requires evidence' });
    }
    if (r.verdict !== 'incorrect' && (r.errorCategory || r.errorEvidence.length)) {
      c.addIssue({ code: 'custom', message: 'Evidence only for incorrect submissions' });
    }
  });

export const chatRequestSchema = z
  .object({
    requestId: uuid,
    conversationId: uuid,
    message: z.string().max(20000),
    attachmentIds: z.array(uuid).max(4),
    intent: intentSchema,
  })
  .strict();

export const classSchema = z
  .object({
    id: uuid,
    name: z.string().trim().min(1).max(100),
    grade: z.enum(['10', '11', '12']),
    academicYear: z.string().max(30),
    classCode: z.string().max(40),
    notes: z.string().max(2000).optional(),
  })
  .strict();

export const studentCreateSchema = z
  .object({
    studentCode: z.string().trim().min(3).max(40).regex(/^[A-Za-z0-9-]+$/),
    name: z.string().trim().min(1).max(100),
    classId: uuid,
  })
  .strict();

export const loginSchema = z
  .object({
    identifier: z.string().trim().min(1).max(40),
    password: z.string().min(1).max(128),
  })
  .strict();

export const documentSchema = z
  .object({
    id: uuid,
    revision: z.number().int().nonnegative(),
    title: z.string().min(1).max(200),
    content: contentSchema,
  })
  .strict();

export const selfCorrectionSchema = z
  .object({
    note: z.string().trim().min(3).max(4000),
  })
  .strict();

export const aiExerciseRequestSchema = z
  .object({
    requestId: uuid,
    lessonId: z.string().trim().min(1).max(60),
    format: z.enum(['multiple_choice', 'true_false', 'short_answer']),
    difficulty: z.enum(['Nhận biết', 'Thông hiểu', 'Vận dụng']).default('Thông hiểu'),
  })
  .strict();

export const aiGeneratedMcSchema = z
  .object({
    format: z.literal('multiple_choice'),
    question: z.string().trim().min(5).max(4000),
    options: z
      .array(z.object({ key: z.enum(['A', 'B', 'C', 'D']), content: z.string().trim().min(1).max(1000) }).strict())
      .length(4),
    correctAnswer: z.enum(['A', 'B', 'C', 'D']),
    cognitiveLevel: z.enum(['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao']),
    explanation: z.string().trim().min(5).max(4000),
  })
  .strict()
  .superRefine((q, ctx) => {
    const keys = new Set(q.options.map(o => o.key));
    const contents = new Set(q.options.map(o => o.content.trim().toLowerCase()));
    if (keys.size !== 4 || contents.size !== 4) {
      ctx.addIssue({ code: 'custom', message: 'Multiple choice options must have 4 distinct keys and contents' });
    }
  });

export const aiGeneratedTfSchema = z
  .object({
    format: z.literal('true_false'),
    context: z.string().trim().min(5).max(4000),
    cognitiveLevel: z.enum(['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao']),
    statements: z
      .array(
        z
          .object({
            subId: z.enum(['a', 'b', 'c', 'd']),
            content: z.string().trim().min(2).max(1500),
            isCorrect: z.boolean(),
            explanation: z.string().trim().min(2).max(2000),
          })
          .strict()
      )
      .length(4),
  })
  .strict()
  .superRefine((q, ctx) => {
    if (q.statements.map(s => s.subId).join(',') !== 'a,b,c,d') {
      ctx.addIssue({ code: 'custom', message: 'True/False statements must be ordered a,b,c,d' });
    }
  });

export const aiGeneratedSaSchema = z
  .object({
    format: z.literal('short_answer'),
    problem: z.string().trim().min(5).max(4000),
    correctValue: z.number().finite(),
    acceptableAnswers: z.array(z.string().trim().min(1).max(100)).min(1).max(10),
    unit: z.string().max(40).default(''),
    tolerance: z.number().nonnegative().max(100).optional(),
    cognitiveLevel: z.enum(['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao']),
    explanation: z.string().trim().min(5).max(4000),
  })
  .strict();

export const aiGeneratedQuestionSchema = z.discriminatedUnion('format', [
  aiGeneratedMcSchema,
  aiGeneratedTfSchema,
  aiGeneratedSaSchema,
]);

export const aiDocumentPatchRequestSchema = z
  .object({
    requestId: uuid,
    documentId: uuid,
    revision: z.number().int().nonnegative(),
    targetNodeId: z.string().trim().min(1).max(100),
    instruction: z.string().trim().min(3).max(2000),
    currentText: z.string().trim().min(1).max(10000),
  })
  .strict();

export const legacyImportRequestSchema = z
  .object({
    mode: z.enum(['preview', 'commit']),
    payload: z.record(z.string(), z.unknown()),
  })
  .strict();

/**
 * Escapes CSV cell values and prevents spreadsheet formula injection (CWE-1236)
 * by prefixing leading `=`, `+`, `-`, `@`, `\t`, `\r` with a single quote `'`.
 */
export function csvEscapeCell(raw: unknown): string {
  const str = String(raw ?? '').replace(/\r?\n/g, ' ');
  const neutralized = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  if (/[",\n;]/.test(neutralized) || neutralized !== str) {
    return `"${neutralized.replace(/"/g, '""')}"`;
  }
  return neutralized;
}

export function buildSafeCsv(headers: string[], rows: Array<Array<unknown>>): string {
  const headerLine = headers.map(csvEscapeCell).join(',');
  const bodyLines = rows.map(r => r.map(csvEscapeCell).join(','));
  return [headerLine, ...bodyLines].join('\n') + '\n';
}
