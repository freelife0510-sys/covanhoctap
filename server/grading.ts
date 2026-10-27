import { createHash } from 'node:crypto';
import type { ShortAnswerQuestion } from '../src/types/curriculum.ts';
export function numericValue(raw: string): number | null {
  const text=raw.normalize('NFKC').trim().replace(/−/g,'-').replace(/\s/g,'').replace(/\{,\}/g,',').replace(/,/g,'.');
  // One decimal separator, optional rational denominator. No exponent/eval/thousands ambiguity.
  const match=/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:\/([+-]?(?:\d+(?:\.\d*)?|\.\d+)))?$/.exec(text);
  if(!match) return null;
  const value=Number(match[1])/(match[2] ? Number(match[2]) : 1);
  return Number.isFinite(value) ? value : null;
}
export function gradeShortAnswer(answer: string, question: Pick<ShortAnswerQuestion,'correctValue'|'acceptableAnswers'|'unit'> & {tolerance?:number}): boolean | null {
  let normalized=answer.normalize('NFKC').trim();
  if(question.unit && normalized.toLocaleLowerCase('vi').endsWith(question.unit.toLocaleLowerCase('vi'))) normalized=normalized.slice(0,-question.unit.length).trim();
  const actual=numericValue(normalized); const expected=numericValue(String(question.correctValue));
  if(actual!==null && expected!==null) return Math.abs(actual-expected)<=(question.tolerance ?? 1e-9);
  const accepted=[String(question.correctValue),...question.acceptableAnswers];
  if(accepted.some(v=>v.normalize('NFKC').trim().toLowerCase()===normalized.toLowerCase())) return true;
  return actual===null && expected!==null ? null : false;
}
export function stableShuffle<T>(items: readonly T[], seed: string): T[] {
  return items.map((item,index)=>({item,key:createHash('sha256').update(`${seed}:${index}`).digest('hex')})).sort((a,b)=>a.key.localeCompare(b.key)).map(r=>r.item);
}
