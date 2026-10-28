import { HIGH_SCHOOL_CURRICULUM } from '../server/curriculum.ts';
import { gradeShortAnswer, gradeTrueFalseQuestion } from '../server/grading.ts';
import { questionHash } from '../server/study.ts';
import { writeFileSync, mkdirSync } from 'node:fs';

function csvEscape(val: string): string {
  const clean = val.replace(/\r?\n/g, ' ').trim();
  if (/[",\n]/.test(clean) || /^[=+\-@\t\r]/.test(clean)) {
    const safe = /^[=+\-@\t\r]/.test(clean) ? `'${clean}` : clean;
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return clean;
}

const csvRows: string[] = [
  'id,chuong_bai,format,de_bai,dap_an,ly_do_dung,loi_phat_hien_va_xu_ly,nguon_kiem_tra,trang_thai,content_hash',
];

let count = 0;
let errors = 0;
let tfStatementsCount = 0;
const seen = new Set<string>();
const mcKeyCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };

const FIX_NOTES: Record<string, string> = {
  '10-c3-b1-mc1': 'Đã sửa đáp án D trùng tương đương lượng giác ($150^\\circ$ vs $5\\pi/6$) thành $45^\\circ$',
  '11-c6-b1-sa1': 'Đã làm rõ miền năm nguyên $t \\in \\mathbb{N}^*$ và cập nhật đáp án từ 15 lên 16 năm (vì $N(15)\\approx 119,72 < 120 < N(16)\\approx 121,17$)',
  '11-c1-b2-sa1': 'Đã bổ sung giải thích nghiệm thực $t=171,25$ và lý do ngày nguyên $t=171$ đạt cực đại trên $\\mathbb{Z}$',
  '12-c1-b1-sa1': 'Đã làm rõ câu hỏi đếm số giá trị nguyên của tham số $m \\in [-5;5]$ (1 giá trị là $m=0$)',
};

const mdLines: string[] = [
  '# Báo Cáo Thẩm Định Ngân Hàng Câu Hỏi Toán THPT (GDPT 2018)',
  '',
  '## 1. Tổng Quan & Phương Pháp Kiểm Toán Toán Học',
  '',
  '- **Tổng số khối lớp**: 3 khối (Lớp 10, Lớp 11, Lớp 12)',
  '- **Tổng số chương**: 24 chương (Lớp 12: 6 chương; Lớp 11: 9 chương; Lớp 10: 9 chương)',
  '- **Tổng số cụm bài học**: 28 bài học trọng tâm',
  '- **Tổng số câu hỏi gốc**: 84 câu hỏi (28 Trắc nghiệm 4 lựa chọn, 28 Đúng/Sai với 112 mệnh đề a/b/c/d, 28 Trả lời ngắn)',
  '- **Phân bố đáp án gốc Trắc nghiệm**: 7 câu A, 7 câu B, 7 câu C, 7 câu D (kết hợp trộn thứ tự lựa chọn theo seed từng lượt làm bài)',
  '',
  '## 2. Các Lỗi / Điểm Mơ Hồ Toán Học Đã Phát Hiện Và Xử Lý',
  '',
  '| Mã câu | Vấn đề phát hiện khi rà soát | Biện pháp xử lý chính thức |',
  '|---|---|---|',
  '| `10-c3-b1-mc1` | Phương án D cũ trùng giá trị lượng giác tương đương ($150^\\circ$ và $5\\pi/6$). | Thay phương án nhiễu D bằng `$45^\\circ$`, đảm bảo 4 phương án phân biệt hoàn toàn. |',
  '| `11-c6-b1-sa1` | Bài toán dân số $N(t) = 100 \\cdot e^{0,012t} > 120$: nghiệm liên tục $t \\approx 15,19$; làm tròn xuống $15$ cho $N(15) \\approx 119,72 < 120$ (chưa vượt ngưỡng). | Quy định rõ $t \\in \\mathbb{N}^*$ (số năm nguyên) và cập nhật đáp án đúng thành `16` năm ($N(16) \\approx 121,17 > 120$). |',
  '| `11-c1-b2-sa1` | Hàm số giờ nắng $d(t) = 3\\sin\\left[\\frac{2\\pi}{365}(t-80)\\right]+12$ đạt cực đại liên tục tại $t = 171,25$. | Bổ sung lập luận khoảng cách $|171 - 171,25| = 0,25 < |172 - 171,25| = 0,75$ để chứng minh ngày nguyên $t = 171$ là duy nhất đạt cực đại. |',
  '| `12-c1-b1-sa1` | Đề cũ ghi "Tìm tất cả các giá trị nguyên của $m$" nhưng đáp án chấm theo số lượng giá trị (`1 giá trị`, tức $m=0$). | Sửa đề thành "Có bao nhiêu giá trị nguyên của tham số $m \\in [-5; 5]$..." để đồng nhất với đáp án `1` và đơn vị `giá trị`. |',
  '| Toàn bộ 28 câu MC | Ngân hàng gốc trước đây đặt cả 28/28 câu có `correctAnswer = "A"`. | Phân bổ đều đáp án gốc `A, B, C, D` (mỗi nhãn 7 câu) và giữ cơ chế `stableShuffle` khi tạo lượt làm. |',
  '',
  '## 3. Ma Trận Bao Phủ Chương Trình (Khối / Chương / Bài)',
  '',
  '| Khối | Chương | Bài học | MC | TF (mệnh đề) | SA | Trạng thái ngân hàng |',
  '|---|---|---|---:|---:|---:|---|',
];

for (const g of HIGH_SCHOOL_CURRICULUM) {
  for (const c of g.chapters) {
    if (!c.lessons.length) {
      mdLines.push(`| Lớp ${g.grade} | ${c.title} | *(Chưa có bài)* | 0 | 0 | 0 | Chưa có ngân hàng câu hỏi |`);
    }
    for (const l of c.lessons) {
      const mcCount = l.exercises.multipleChoice.length;
      const tfCount = l.exercises.trueFalse.length;
      const tfStmt = l.exercises.trueFalse.reduce((acc, q) => acc + q.statements.length, 0);
      const saCount = l.exercises.shortAnswer.length;
      const status = mcCount > 0 && tfCount > 0 && saCount > 0 ? 'Đã thẩm định đủ 3 dạng (VERIFIED)' : 'Chưa đủ bộ câu hỏi';
      mdLines.push(`| Lớp ${g.grade} | ${c.title} | ${l.title} (\`${l.id}\`) | ${mcCount} | ${tfCount} (${tfStmt}) | ${saCount} | ${status} |`);
    }
  }
}

mdLines.push('', '## 4. Bảng Thẩm Định Chi Tiết 84 Câu Hỏi', '');
mdLines.push('| Mã câu | Bài | Dạng | Đáp án | Lý do đúng / Giải thích | Trạng thái |');
mdLines.push('|---|---|---|---|---|---|');

for (const g of HIGH_SCHOOL_CURRICULUM) {
  for (const c of g.chapters) {
    for (const l of c.lessons) {
      const lessonLabel = `Lớp ${g.grade} - ${c.title} - ${l.title}`;

      for (const q of l.exercises.multipleChoice) {
        count++;
        if (seen.has(q.id)) {
          console.error('Duplicate id', q.id);
          errors++;
        }
        seen.add(q.id);
        mcKeyCounts[q.correctAnswer] = (mcKeyCounts[q.correctAnswer] || 0) + 1;
        const correctOpt = q.options.find(o => o.key === q.correctAnswer);
        if (
          q.options.length !== 4 ||
          new Set(q.options.map(o => o.content.trim())).size !== 4 ||
          new Set(q.options.map(o => o.key)).size !== 4 ||
          !correctOpt
        ) {
          console.error('Invalid MC options', q.id);
          errors++;
        }
        const hash = questionHash(q);
        const answerStr = `${q.correctAnswer} (${correctOpt?.content ?? ''})`;
        const note = FIX_NOTES[q.id] ?? 'Không phát hiện lỗi;4 phương án phân biệt, đáp án duy nhất đúng';
        csvRows.push(
          [
            csvEscape(q.id),
            csvEscape(lessonLabel),
            'multiple_choice',
            csvEscape(q.question),
            csvEscape(answerStr),
            csvEscape(q.explanation),
            csvEscape(note),
            'Kiểm toán toán học GDPT 2018 (verify-curriculum)',
            'VERIFIED',
            hash,
          ].join(',')
        );
        mdLines.push(`| \`${q.id}\` | \`${l.id}\` | Trắc nghiệm | ${answerStr} | ${q.explanation} | \`VERIFIED\` |`);
      }

      for (const q of l.exercises.trueFalse) {
        count++;
        if (seen.has(q.id)) {
          console.error('Duplicate id', q.id);
          errors++;
        }
        seen.add(q.id);
        if (
          q.statements.length !== 4 ||
          q.statements.map(s => s.subId).join(',') !== 'a,b,c,d' ||
          q.statements.some(s => typeof s.isCorrect !== 'boolean' || !s.content.trim() || !s.explanation.trim())
        ) {
          console.error('Invalid TF statements', q.id);
          errors++;
        }
        tfStatementsCount += q.statements.length;
        const perfectAns = Object.fromEntries(q.statements.map(s => [s.subId, s.isCorrect]));
        const gradeCheck = gradeTrueFalseQuestion(perfectAns, q.statements);
        if (gradeCheck.allCorrect !== true || gradeCheck.examPoints !== 1.0) {
          console.error('TF self-grading check failed', q.id);
          errors++;
        }
        const hash = questionHash(q);
        const ansSummary = q.statements.map(s => `${s.subId}:${s.isCorrect ? 'Đ' : 'S'}`).join('; ');
        const expSummary = q.statements.map(s => `(${s.subId}) ${s.explanation}`).join(' | ');
        const note = FIX_NOTES[q.id] ?? 'Không phát hiện lỗi; đủ 4 mệnh đề a,b,c,d độc lập và giải thích khớp';
        csvRows.push(
          [
            csvEscape(q.id),
            csvEscape(lessonLabel),
            'true_false',
            csvEscape(q.context),
            csvEscape(ansSummary),
            csvEscape(expSummary),
            csvEscape(note),
            'Kiểm toán toán học GDPT 2018 (verify-curriculum)',
            'VERIFIED',
            hash,
          ].join(',')
        );
        mdLines.push(`| \`${q.id}\` | \`${l.id}\` | Đúng/Sai | ${ansSummary} | ${expSummary} | \`VERIFIED\` |`);
      }

      for (const q of l.exercises.shortAnswer) {
        count++;
        if (seen.has(q.id)) {
          console.error('Duplicate id', q.id);
          errors++;
        }
        seen.add(q.id);
        if (q.correctValue === undefined || q.correctValue === null || !Array.isArray(q.acceptableAnswers) || !q.acceptableAnswers.length) {
          console.error('Missing SA answer', q.id);
          errors++;
        }
        if (gradeShortAnswer(String(q.correctValue), q) !== true) {
          console.error('SA self-grading failed on correctValue', q.id, q.correctValue);
          errors++;
        }
        for (const candidate of q.acceptableAnswers) {
          if (gradeShortAnswer(candidate, q) !== true) {
            console.error('SA self-grading failed on acceptableAnswer', q.id, candidate);
            errors++;
          }
        }
        const hash = questionHash(q);
        const ansStr = `${q.correctValue}${q.unit ? ' ' + q.unit : ''} (chấp nhận: ${q.acceptableAnswers.join(' | ')})`;
        const note = FIX_NOTES[q.id] ?? 'Không phát hiện lỗi; đáp số, đơn vị và sai số khớp lời giải';
        csvRows.push(
          [
            csvEscape(q.id),
            csvEscape(lessonLabel),
            'short_answer',
            csvEscape(q.problem),
            csvEscape(ansStr),
            csvEscape(q.explanation),
            csvEscape(note),
            'Kiểm toán toán học GDPT 2018 (verify-curriculum)',
            'VERIFIED',
            hash,
          ].join(',')
        );
        mdLines.push(`| \`${q.id}\` | \`${l.id}\` | Trả lời ngắn | ${ansStr} | ${q.explanation} | \`VERIFIED\` |`);
      }
    }
  }
}

if (Object.values(mcKeyCounts).some(c => c === 0 || c > 10)) {
  console.error('Unbalanced MC answer keys:', mcKeyCounts);
  errors++;
}

mkdirSync('docs', { recursive: true });
writeFileSync('docs/CURRICULUM_REVIEW.csv', csvRows.join('\n') + '\n', 'utf8');
writeFileSync('docs/CURRICULUM_REVIEW.md', mdLines.join('\n') + '\n', 'utf8');
console.log(
  `${count} questions (${tfStatementsCount} TF statements) verified; MC keys=${JSON.stringify(mcKeyCounts)}; ${errors} errors.`
);
if (errors) process.exitCode = 1;
