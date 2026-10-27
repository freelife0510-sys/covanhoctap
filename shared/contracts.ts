import { z } from 'zod';
import { contentSchema } from './document.ts';
export const uuid = z.string().uuid();
export const verdictSchema = z.enum(['correct', 'incorrect', 'inconclusive', 'not_applicable']);
export const intentSchema = z.enum(['ask_guidance', 'submit_solution', 'request_exercises']);
export const errorCategorySchema = z.enum(['Chưa đặt điều kiện xác định', 'Biến đổi đại số sai', 'Nhầm lẫn định lý/công thức', 'Thiếu nghiệm ngoại lai', 'Lập luận hình học sai', 'Khác']);
export const aiResultSchema = z.object({
  chatReply: z.string().min(1).max(30000), detailedSolution: z.string().max(40000).optional(),
  verdict: verdictSchema, errorCategory: errorCategorySchema.nullable(),
  errorEvidence: z.array(z.object({ category: errorCategorySchema, excerpt: z.string().min(1), explanation: z.string().min(1) })).max(10),
  keyInsight: z.string(), theorySummary: z.string(), formulasNeeded: z.array(z.string()).max(20),
  socraticQuestions: z.array(z.string()).max(10), pedagogicalAdvice: z.string(),
  followUpProblems: z.array(z.object({ id: z.number().int(), title: z.string(), content: z.string(), difficulty: z.enum(['Tương đương', 'Nâng cao', 'Vận dụng']), initialHint: z.string().optional() })).max(4),
}).strict().superRefine((r, c) => {
  if (r.verdict === 'incorrect' && (!r.errorCategory || !r.errorEvidence.length)) c.addIssue({ code: 'custom', message: 'Incorrect verdict requires evidence' });
  if (r.verdict !== 'incorrect' && (r.errorCategory || r.errorEvidence.length)) c.addIssue({ code: 'custom', message: 'Evidence only for incorrect submissions' });
});
export const chatRequestSchema = z.object({ requestId: uuid, conversationId: uuid, message: z.string().max(20000), attachmentIds: z.array(uuid).max(4), intent: intentSchema }).strict();
export const classSchema = z.object({ id: uuid, name: z.string().trim().min(1).max(100), grade: z.enum(['10','11','12']), academicYear: z.string().max(30), classCode: z.string().max(40), notes: z.string().max(2000).optional() }).strict();
export const studentCreateSchema = z.object({ studentCode: z.string().trim().min(3).max(40).regex(/^[A-Za-z0-9-]+$/), name: z.string().trim().min(1).max(100), classId: uuid }).strict();
export const loginSchema = z.object({ identifier: z.string().trim().min(1).max(40), password: z.string().min(1).max(128) }).strict();
export const documentSchema = z.object({ id: uuid, revision: z.number().int().nonnegative(), title: z.string().min(1).max(200), content: contentSchema }).strict();
