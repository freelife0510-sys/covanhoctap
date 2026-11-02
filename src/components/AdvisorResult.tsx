import React from 'react';
import MathRenderer from './MathRenderer.tsx';

export interface AdvisorData {
  chatReply?: string;
  problemTranscript?: string;
  detailedSolution?: string;
  verdict?: string;
  errorCategory?: string | null;
  errorEvidence?: { category: string; excerpt: string; explanation: string }[];
  keyInsight?: string;
  theorySummary?: string;
  formulasNeeded?: string[];
  socraticQuestions?: string[];
  pedagogicalAdvice?: string;
  followUpProblems?: { id: number; title: string; content: string; difficulty: string; initialHint?: string }[];
  modelUsed?: string;
  reviewState?: string;
}

export const VERDICT_LABELS: Record<string, { text: string; className: string }> = {
  correct: { text: '✅ Bài làm đúng', className: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  incorrect: { text: '❌ Bài làm chưa chính xác', className: 'bg-rose-100 text-rose-900 border-rose-300' },
  inconclusive: { text: '⚠️ Chưa đủ căn cứ để kết luận', className: 'bg-amber-100 text-amber-900 border-amber-300' },
};

const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];

type Tone = 'slate' | 'rose' | 'emerald' | 'indigo' | 'amber';
const TONES: Record<Tone, string> = {
  slate: 'border-slate-200 bg-white',
  rose: 'border-rose-200 bg-rose-50/60',
  emerald: 'border-emerald-200 bg-emerald-50/60',
  indigo: 'border-indigo-200 bg-indigo-50/60',
  amber: 'border-amber-200 bg-amber-50/60',
};

function Block({ title, children, tone = 'slate' }: { title: string; children: React.ReactNode; tone?: Tone }) {
  return (
    <section className={`rounded-xl border p-3 space-y-2 ${TONES[tone]}`}>
      <h3 className="text-sm font-bold">{title}</h3>
      {children}
    </section>
  );
}

/** Full AI feedback: verdict, step errors with fixes, correct solution, theory, formulas and follow-up practice. */
export default function AdvisorResult({ data, showReply = true }: { data: AdvisorData; showReply?: boolean }) {
  const verdict = data.verdict ? VERDICT_LABELS[data.verdict] : undefined;
  return (
    <div className="space-y-3">
      {verdict && <p className={`inline-block rounded-full border px-3 py-1 text-sm font-bold ${verdict.className}`}>{verdict.text}</p>}
      {showReply && data.chatReply && <MathRenderer content={data.chatReply} />}
      {data.problemTranscript && (
        <details className="rounded-xl border p-3 text-sm">
          <summary className="cursor-pointer font-semibold">Nội dung AI đọc được từ ảnh/PDF bài làm</summary>
          <MathRenderer content={data.problemTranscript} />
        </details>
      )}
      {!!data.errorEvidence?.length && (
        <Block title="Các lỗi cần chú ý" tone="rose">
          <ol className="space-y-2">
            {data.errorEvidence.map((e, i) => (
              <li key={i} className="text-sm">
                <b>
                  {CIRCLED[i] || `${i + 1}.`} {e.category}
                </b>
                <div className="mt-1 rounded bg-white/70 px-2 py-1 border-l-4 border-rose-300">
                  <MathRenderer content={e.excerpt} />
                </div>
                <MathRenderer content={e.explanation} />
              </li>
            ))}
          </ol>
        </Block>
      )}
      {data.detailedSolution && (
        <Block title={data.verdict === 'incorrect' ? 'Lời giải đúng và giải thích' : 'Lời giải / giải thích chi tiết'} tone="emerald">
          <MathRenderer content={data.detailedSolution} />
        </Block>
      )}
      {data.keyInsight && (
        <Block title="Ý chính cần nắm" tone="indigo">
          <MathRenderer content={data.keyInsight} />
        </Block>
      )}
      {(data.theorySummary || !!data.formulasNeeded?.length) && (
        <Block title="Lí thuyết và công thức liên quan" tone="indigo">
          {data.theorySummary && <MathRenderer content={data.theorySummary} />}
          {!!data.formulasNeeded?.length && (
            <ul className="list-disc pl-5 text-sm space-y-1">
              {data.formulasNeeded.map((f, i) => (
                <li key={i}>
                  <MathRenderer content={f} />
                </li>
              ))}
            </ul>
          )}
        </Block>
      )}
      {!!data.socraticQuestions?.length && (
        <Block title="Câu hỏi gợi mở để em tự kiểm tra" tone="amber">
          <ul className="list-disc pl-5 text-sm space-y-1">
            {data.socraticQuestions.map((q, i) => (
              <li key={i}>
                <MathRenderer content={q} />
              </li>
            ))}
          </ul>
        </Block>
      )}
      {data.pedagogicalAdvice && (
        <Block title="Lời khuyên tự học">
          <MathRenderer content={data.pedagogicalAdvice} />
        </Block>
      )}
      {!!data.followUpProblems?.length && (
        <Block title="Bài tập tương tự để luyện thêm">
          <ol className="space-y-2 text-sm">
            {data.followUpProblems.map(p => (
              <li key={p.id} className="rounded border bg-slate-50 p-2">
                <b>
                  {p.title} <span className="text-xs font-normal text-slate-500">({p.difficulty})</span>
                </b>
                <MathRenderer content={p.content} />
                {p.initialHint && (
                  <details>
                    <summary className="cursor-pointer text-xs text-indigo-700">Xem gợi ý</summary>
                    <MathRenderer content={p.initialHint} />
                  </details>
                )}
              </li>
            ))}
          </ol>
        </Block>
      )}
      {data.modelUsed && <p className="text-xs text-slate-500">Phản hồi AI ({data.modelUsed}) · có thể sai, giáo viên sẽ thẩm định.</p>}
    </div>
  );
}
