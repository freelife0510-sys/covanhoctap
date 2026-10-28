import { createHash } from 'node:crypto';
import type { ShortAnswerQuestion, TrueFalseStatement } from '../src/types/curriculum.ts';

export const TRUE_FALSE_RUBRIC_VERSION = 'gdpt2018-thpt2025-v1';

export function numericValue(raw: string): number | null {
  let text = raw.normalize('NFKC').trim().replace(/−/g, '-').replace(/\s/g, '').replace(/\{,\}/g, ',').replace(/,/g, '.');
  let scale = 1;
  if (text.endsWith('%')) {
    scale = 0.01;
    text = text.slice(0, -1);
  }
  // One decimal separator, optional rational denominator. No exponent/eval/thousands ambiguity.
  const match = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:\/([+-]?(?:\d+(?:\.\d*)?|\.\d+)))?$/.exec(text);
  if (!match) return null;
  const denom = match[2] ? Number(match[2]) : 1;
  if (denom === 0) return null;
  const value = (Number(match[1]) / denom) * scale;
  return Number.isFinite(value) ? value : null;
}

export function gradeShortAnswer(
  answer: string,
  question: Pick<ShortAnswerQuestion, 'correctValue' | 'acceptableAnswers' | 'unit'> & { tolerance?: number }
): boolean | null {
  let normalized = answer.normalize('NFKC').trim();
  if (!normalized) return null;
  if (question.unit && normalized.toLocaleLowerCase('vi').endsWith(question.unit.toLocaleLowerCase('vi'))) {
    normalized = normalized.slice(0, -question.unit.length).trim();
  }
  const accepted = [String(question.correctValue), ...(question.acceptableAnswers ?? [])];
  if (accepted.some(v => v.normalize('NFKC').trim().toLocaleLowerCase('vi') === normalized.toLocaleLowerCase('vi'))) {
    return true;
  }
  const actual = numericValue(normalized);
  const expected = numericValue(String(question.correctValue));
  const tol = question.tolerance ?? 1e-9;
  if (actual !== null) {
    if (expected !== null && Math.abs(actual - expected) <= tol) return true;
    for (const candidate of question.acceptableAnswers ?? []) {
      const candidateNum = numericValue(candidate);
      if (candidateNum !== null && Math.abs(actual - candidateNum) <= Math.max(tol, 1e-4)) return true;
    }
    return false;
  }
  return expected !== null ? null : false;
}

export interface TrueFalseGradeResult {
  answeredCount: number;
  correctStatements: number;
  totalStatements: number;
  allCorrect: boolean | null;
  statementResults: Array<{ subId: string; answered: boolean | null; isCorrect: boolean; match: boolean | null; explanation: string }>;
  practicePoints: number; // 0..1 linear by statement
  examPoints: number; // 0 | 0.1 | 0.25 | 0.5 | 1.0 per GDPT 2018 THPT 2025 rubric
  rubricVersion: string;
}

const EXAM_2025_POINTS: Record<number, number> = {
  0: 0,
  1: 0.1,
  2: 0.25,
  3: 0.5,
  4: 1.0,
};

export function gradeTrueFalseQuestion(
  answer: Record<string, boolean> | undefined | null,
  statements: readonly Pick<TrueFalseStatement, 'subId' | 'isCorrect' | 'explanation'>[]
): TrueFalseGradeResult {
  const statementResults = statements.map(s => {
    const val = answer && typeof answer === 'object' && typeof answer[s.subId] === 'boolean' ? answer[s.subId] : null;
    const match = val === null ? null : val === s.isCorrect;
    return {
      subId: s.subId,
      answered: val,
      isCorrect: s.isCorrect,
      match,
      explanation: s.explanation,
    };
  });
  const answeredCount = statementResults.filter(r => r.answered !== null).length;
  const correctStatements = statementResults.filter(r => r.match === true).length;
  const totalStatements = statements.length || 4;
  const allCorrect = answeredCount === 0 ? null : correctStatements === totalStatements && answeredCount === totalStatements;
  const practicePoints = totalStatements > 0 ? Number((correctStatements / totalStatements).toFixed(4)) : 0;
  const examPoints =
    answeredCount === 0
      ? 0
      : totalStatements === 4
        ? (EXAM_2025_POINTS[correctStatements] ?? 0)
        : practicePoints;

  return {
    answeredCount,
    correctStatements,
    totalStatements,
    allCorrect,
    statementResults,
    practicePoints,
    examPoints,
    rubricVersion: TRUE_FALSE_RUBRIC_VERSION,
  };
}

export function stableShuffle<T>(items: readonly T[], seed: string): T[] {
  return items
    .map((item, index) => ({ item, key: createHash('sha256').update(`${seed}:${index}`).digest('hex') }))
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(r => r.item);
}
