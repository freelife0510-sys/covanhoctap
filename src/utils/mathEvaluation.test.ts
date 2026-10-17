import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeMathSubmissionLocal } from './mathEvaluation.ts';

test('detects radical equation missing condition and extraneous root', () => {
  const result = analyzeMathSubmissionLocal(
    'Giải phương trình: $\\sqrt{x-2} = x-4$',
    'Bình phương 2 vế: x - 2 = (x - 4)^2 => x^2 - 9x + 18 = 0 => x = 6 hoặc x = 3. Vậy tập nghiệm S = {3, 6}'
  );

  assert.equal(result.isCorrect, false);
  assert.equal(result.errorCategory, 'Chưa đặt điều kiện xác định');
  assert.equal(result.diagnosticResult.followUpProblems.length, 2);
  assert.ok(result.diagnosticResult.socraticQuestions && result.diagnosticResult.socraticQuestions.length >= 2);
});

test('detects rational derivative sign mistake', () => {
  const result = analyzeMathSubmissionLocal(
    'Cho hàm số y = (2x - 1)/(x + 1). Tìm đạo hàm.',
    'Áp dụng công thức đạo hàm: y\' = 1/(x+1)^2'
  );

  assert.equal(result.isCorrect, false);
  assert.equal(result.errorCategory, 'Biến đổi đại số sai');
  assert.ok(result.diagnosticResult.formulasNeeded && result.diagnosticResult.formulasNeeded.length > 0);
});

test('validates fully correct submission and awards advanced follow-up problems', () => {
  const result = analyzeMathSubmissionLocal(
    'Giải phương trình: $\\sqrt{x-2} = x-4$',
    'Điều kiện: x - 4 >= 0 <=> x >= 4. Bình phương 2 vế ta có x - 2 = x^2 - 8x + 16 <=> x^2 - 9x + 18 = 0 <=> x = 6 (nhận) hoặc x = 3 (loại). Kết luận: Tập nghiệm S = {6}. Lời giải chính xác thỏa mãn điều kiện.'
  );

  assert.equal(result.isCorrect, true);
  assert.ok(result.diagnosticResult.praiseComment);
  assert.equal(result.diagnosticResult.followUpProblems[0].difficulty, 'Nâng cao');
});
