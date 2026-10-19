import { ClassRoom, MathSubmission, PredefinedExample, Teacher, Student } from '../types/index.ts';

export const MOCK_CLASSES: ClassRoom[] = [
  { id: 'class-12a1', teacherId: 'teacher-default', name: 'Lớp 12A1', grade: '12', academicYear: '2025 - 2026', classCode: '12A1-MAT', studentCount: 38 },
  { id: 'class-12a2', teacherId: 'teacher-default', name: 'Lớp 12A2', grade: '12', academicYear: '2025 - 2026', classCode: '12A2-MAT', studentCount: 36 },
  { id: 'class-11toan', teacherId: 'teacher-default', name: 'Lớp 11 (Toán)', grade: '11', academicYear: '2025 - 2026', classCode: '11TOAN', studentCount: 35 },
];

// Khởi tạo mặc định của Giáo viên
export const DEFAULT_TEACHER: Teacher = {
  id: 'teacher-default',
  email: 'giaovien@gmail.com',
  name: 'Giáo viên Bộ môn Toán',
  school: 'THPT Chuẩn GDPT 2018',
  classList: MOCK_CLASSES,
};

// Khởi tạo mặc định của Học sinh
export const DEFAULT_STUDENT: Student = {
  id: 'HS12A1-01',
  studentCode: 'HS12A1-01',
  name: 'Nguyễn Văn An',
  classId: 'class-12a1',
  className: 'Lớp 12A1',
  teacherId: 'teacher-default',
  teacherName: 'Giáo viên Bộ môn Toán',
  password: '123',
  school: 'THPT Chuyên Chuẩn GDPT 2018',
  status: 'needs_remedy',
  latestScore: 5.5,
  gapsCount: 2,
  detectedGaps: ['Chưa đặt điều kiện xác định căn thức'],
};

export const PREDEFINED_EXAMPLES: PredefinedExample[] = [
  {
    id: 'demo-1',
    title: 'Demo 1: Bỏ quên điều kiện & Nghiệm ngoại lai',
    description: 'Phương trình vô tỉ căn thức - Học sinh bình phương tự do không đặt điều kiện vế phải',
    badge: 'Sai điều kiện căn thức',
    grade: '12',
    topic: 'Phương trình & Bất phương trình vô tỉ',
    problemText: 'Giải phương trình vô tỉ trên tập số thực $\\mathbb{R}$:\n$$\\sqrt{x - 2} = x - 4$$',
    solutionText: `Bình phương 2 vế ta được:
x - 2 = (x - 4)^2
<=> x - 2 = x^2 - 8x + 16
<=> x^2 - 9x + 18 = 0
<=> (x - 6)(x - 3) = 0
<=> x = 6 hoặc x = 3.

Vậy phương trình có tập nghiệm S = {3; 6}.`,
    expectedCategory: 'Chưa đặt điều kiện xác định',
    isCorrect: false,
  },
  {
    id: 'demo-2',
    title: 'Demo 2: Nhầm dấu đạo hàm phân thức hữu tỉ',
    description: 'Khảo sát hàm số - Sai sót khi nhân chéo định thức ad - bc với hệ số âm',
    badge: 'Sai dấu đạo hàm',
    grade: '12',
    topic: 'Ứng dụng đạo hàm để khảo sát hàm số',
    problemText: 'Cho hàm số $y = \\frac{2x - 1}{x + 1}$. Xét tính đơn điệu của hàm số trên các khoảng xác định.',
    solutionText: `Tập xác định: D = R \\ {-1}.
Áp dụng công thức đạo hàm phân thức bậc nhất trên bậc nhất:
y' = [2*1 - 1*1] / (x + 1)^2 = 1 / (x + 1)^2.
Vì 1 > 0 và (x + 1)^2 > 0 với mọi x khác -1, nên y' > 0 với mọi x thuộc D.
Kết luận: Hàm số đồng biến trên toàn bộ tập xác định R.`,
    expectedCategory: 'Biến đổi đại số sai',
    isCorrect: false,
  },
  {
    id: 'demo-3',
    title: 'Demo 3: Bài làm chuẩn mực & Lập luận mẫu mực',
    description: 'Phương trình vô tỉ có đối chiếu điều kiện đầy đủ, loại nghiệm ngoại lai chính xác',
    badge: 'Đạt chuẩn 100%',
    grade: '12',
    topic: 'Phương trình vô tỉ nâng cao',
    problemText: 'Giải phương trình vô tỉ trên tập số thực $\\mathbb{R}$:\n$$\\sqrt{2x^2 - 5x + 2} = x - 1$$',
    solutionText: `ĐK vế phải không âm:
x - 1 >= 0 <=> x >= 1.

Với điều kiện trên, bình phương hai vế phương trình ta được:
2x^2 - 5x + 2 = (x - 1)^2
<=> 2x^2 - 5x + 2 = x^2 - 2x + 1
<=> x^2 - 3x + 1 = 0.

Xét biệt thức Delta = (-3)^2 - 4(1)(1) = 5 > 0.
Phương trình có hai nghiệm:
x1 = (3 + sqrt(5))/2 ≈ 2.62 (thỏa mãn điều kiện x >= 1).
x2 = (3 - sqrt(5))/2 ≈ 0.38 (loại do không thỏa mãn x >= 1).

Kết luận: Phương trình có nghiệm duy nhất x = (3 + sqrt(5))/2. Lời giải chính xác thỏa mãn điều kiện.`,
    isCorrect: true,
  },
];

// Danh sách bài nộp mẫu phục vụ phân tích vùng trũng trên Teacher Dashboard
// Sử dụng mã định danh chuẩn học sinh (HS-01, HS-02...) không gán tên cá nhân cứng
export const INITIAL_SUBMISSIONS: MathSubmission[] = [
  {
    id: 'sub-001',
    studentId: 'st-01',
    studentName: 'Học sinh #101',
    classId: 'class-12a1',
    timestamp: '16/10/2026 08:15',
    problemText: 'Giải phương trình: $\\sqrt{x - 2} = x - 4$',
    solutionText: 'x - 2 = (x - 4)^2 => x = 6, x = 3. Kết luận S = {3; 6}',
    isCorrect: false,
    errorCategory: 'Chưa đặt điều kiện xác định',
    hasResolvedMistake: false,
    diagnosticResult: {
      theorySummary: 'Phương trình $\\sqrt{A} = B$ đòi hỏi $B \\ge 0$ trước khi bình phương hai vế.',
      formulasNeeded: ['$\\sqrt{A} = B \\iff B \\ge 0 \\land A = B^2$'],
      socraticQuestions: [
        '?1: Thay $x=3$ vào phương trình, giá trị vế phải $x-4$ bằng bao nhiêu? Vế trái có thể âm không?',
        '?2: Thao tác bình phương có bảo toàn tính tương đương không nếu chưa có $B \\ge 0$?',
      ],
      keyInsight: 'Học sinh thiếu bước đặt điều kiện $x \\ge 4$ dẫn tới nhận nghiệm ngoại lai $x=3$.',
      pedagogicalAdviceForTeacher: 'Học sinh thường có thói quen bình phương tự do không rà soát miền giá trị vế phải.',
      followUpProblems: [
        {
          id: 1,
          title: 'Bài củng cố 1',
          content: 'Giải phương trình: $\\sqrt{2x - 1} = x - 2$',
          difficulty: 'Tương đương',
          initialHint: 'Đặt điều kiện $x - 2 \\ge 0$.',
        },
        {
          id: 2,
          title: 'Bài củng cố 2',
          content: 'Giải phương trình: $\\sqrt{x^2 - 3x + 2} = 2x - 3$',
          difficulty: 'Tương đương',
          initialHint: 'Điều kiện $2x - 3 \\ge 0 \\iff x \\ge 1.5$.',
        },
      ],
    },
  },
  {
    id: 'sub-002',
    studentId: 'st-02',
    studentName: 'Học sinh #102',
    classId: 'class-12a1',
    timestamp: '16/10/2026 08:30',
    problemText: 'Tìm đạo hàm hàm số $y = \\frac{2x - 1}{x + 1}$',
    solutionText: 'y\' = (2 - 1)/(x + 1)^2 = 1/(x + 1)^2',
    isCorrect: false,
    errorCategory: 'Biến đổi đại số sai',
    hasResolvedMistake: true,
    diagnosticResult: {
      theorySummary: 'Quy tắc đạo hàm nhanh: $y\' = \\frac{ad - bc}{(cx + d)^2}$. Với $b = -1$ thì $-bc = -((-1) \\cdot 1) = +1$.',
      formulasNeeded: ['$(ad - bc) = 2(1) - (-1)(1) = 3$'],
      socraticQuestions: [
        '?1: Dấu của hệ số $b$ trong $2x - 1$ là gì?',
        '?2: Khi lấy trừ đi số âm, quy tắc đổi dấu là gì?',
      ],
      keyInsight: 'Sai dấu khi tính định thức cấp 2 với hệ số âm.',
      pedagogicalAdviceForTeacher: 'Củng cố quy tắc dấu trừ ngoặc tròn cho phân thức.',
      followUpProblems: [
        { id: 1, title: 'Bài củng cố 1', content: 'Tìm đạo hàm $y = \\frac{3x - 4}{x + 2}$', difficulty: 'Tương đương' },
        { id: 2, title: 'Bài củng cố 2', content: 'Tìm đạo hàm $y = \\frac{-x + 3}{2x - 1}$', difficulty: 'Tương đương' },
      ],
    },
  },
  {
    id: 'sub-003',
    studentId: 'st-03',
    studentName: 'Học sinh #103',
    classId: 'class-12a1',
    timestamp: '16/10/2026 09:10',
    problemText: 'Giải phương trình: $\\log_2 (x - 1) + \\log_2 (x + 1) = 3$',
    solutionText: 'log2((x - 1)(x + 1)) = 3 => x^2 - 1 = 8 => x^2 = 9 => x = 3 hoặc x = -3.',
    isCorrect: false,
    errorCategory: 'Chưa đặt điều kiện xác định',
    hasResolvedMistake: true,
    diagnosticResult: {
      theorySummary: 'Điều kiện xác định của $\\log_2 (x-1)$ là $x > 1$. Nghiệm $x = -3$ làm biểu thức không xác định.',
      formulasNeeded: ['$\\log_a f(x) \\text{ xác định } \\iff f(x) > 0$'],
      socraticQuestions: [
        '?1: Hãy thay $x = -3$ vào biểu thức $\\log_2(x-1)$ ban đầu xem có xác định không?',
        '?2: Miền xác định chung của phương trình là gì?',
      ],
      keyInsight: 'Quên đặt điều kiện xác định cho từng biểu thức logarit riêng biệt.',
      followUpProblems: [
        { id: 1, title: 'Bài củng cố 1', content: 'Giải: $\\log_3 (x + 2) + \\log_3 (x - 2) = 1$', difficulty: 'Tương đương' },
        { id: 2, title: 'Bài củng cố 2', content: 'Giải: $\\log_2 (2x - 3) = 2$', difficulty: 'Tương đương' },
      ],
    },
  },
  {
    id: 'sub-004',
    studentId: 'st-04',
    studentName: 'Học sinh #104',
    classId: 'class-12a1',
    timestamp: '16/10/2026 09:40',
    problemText: 'Trong không gian $Oxyz$, tính khoảng cách từ điểm $M(1, 2, -1)$ đến mặt phẳng $(P): 2x - y + 2z - 3 = 0$',
    solutionText: 'd(M, P) = |2(1) - 2 + 2(-1) - 3| / (2^2 + (-1)^2 + 2^2) = |-5| / 9 = 5/9',
    isCorrect: false,
    errorCategory: 'Nhầm lẫn định lý/công thức',
    hasResolvedMistake: false,
    diagnosticResult: {
      theorySummary: 'Mẫu số công thức khoảng cách từ điểm đến mặt phẳng là độ dài vectơ pháp tuyến: $\\sqrt{a^2 + b^2 + c^2}$, không phải là $(a^2 + b^2 + c^2)$ không có căn.',
      formulasNeeded: ['$d(M, P) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}$'],
      socraticQuestions: [
        '?1: Mẫu số của công thức khoảng cách trong không gian Oxyz có dấu căn bậc hai không?',
        '?2: Độ dài vectơ pháp tuyến $\\vec{n} = (2, -1, 2)$ bằng bao nhiêu?',
      ],
      keyInsight: 'Quên căn bậc hai ở mẫu số của công thức khoảng cách Oxyz.',
      pedagogicalAdviceForTeacher: 'Học sinh hay nhầm lẫn giữa bình phương độ dài và độ dài véc-tơ pháp tuyến.',
      followUpProblems: [
        { id: 1, title: 'Bài củng cố 1', content: 'Tính khoảng cách từ $A(2, 0, -3)$ đến $(P): x + 2y - 2z + 1 = 0$', difficulty: 'Tương đương' },
        { id: 2, title: 'Bài củng cố 2', content: 'Tìm bán kính mặt cầu tâm $I(1, 1, 1)$ tiếp xúc với $(P): 3x + 4y - 12 = 0$', difficulty: 'Tương đương' },
      ],
    },
  },
  {
    id: 'sub-005',
    studentId: 'st-05',
    studentName: 'Học sinh #105',
    classId: 'class-12a1',
    timestamp: '16/10/2026 10:05',
    problemText: 'Tính tích phân: $I = \\int_0^1 (2x + 1) e^x dx$',
    solutionText: 'Đặt u = 2x + 1 => du = 2dx; dv = e^x dx => v = e^x. I = (2x + 1)e^x|_0^1 - 2\\int_0^1 e^x dx = 3e - 1 - 2(e - 1) = e + 1. Lời giải chính xác thỏa mãn điều kiện.',
    isCorrect: true,
    hasResolvedMistake: true,
    diagnosticResult: {
      praiseComment: 'Lời giải tích phân từng phần xuất sắc! Học sinh đặt u và dv rất chuẩn mực theo quy tắc "nhất lốc, nhì đa, tam lượng, tứ mũ", áp dụng công thức Leibniz chính xác và tính toán không có sai số.',
      followUpProblems: [
        { id: 1, title: 'Thử thách nâng cao 1', content: 'Tính tích phân $J = \\int_0^{\\pi/2} x \\cos^2 x dx$', difficulty: 'Nâng cao' },
        { id: 2, title: 'Thử thách nâng cao 2', content: 'Cho hàm số $f(x)$ liên tục thỏa mãn $f(x) + f(2-x) = x^2$. Tính $\\int_0^2 f(x) dx$.', difficulty: 'Nâng cao' },
      ],
    },
  },
  {
    id: 'sub-006',
    studentId: 'st-06',
    studentName: 'Học sinh #106',
    classId: 'class-12a1',
    timestamp: '16/10/2026 10:25',
    problemText: 'Cho hình chóp $S.ABCD$ có đáy là hình vuông cạnh $a$, $SA \\perp (ABCD)$. Chứng minh $BD \\perp (SAC)$.',
    solutionText: 'Vì SA vuông góc (ABCD) nên SA vuông góc BD. Lại có ABCD là hình chữ nhật nên BD vuông góc AC. Do đó BD vuông góc (SAC).',
    isCorrect: false,
    errorCategory: 'Lập luận hình học sai',
    hasResolvedMistake: false,
    diagnosticResult: {
      theorySummary: 'Đáy $ABCD$ là hình vuông thì hai đường chéo mới vuông góc ($AC \\perp BD$). Nếu là hình chữ nhật thì hai đường chéo bằng nhau nhưng KHÔNG vuông góc.',
      formulasNeeded: ['$ABCD \\text{ là hình vuông } \\implies AC \\perp BD$', '$\\begin{cases} BD \\perp AC \\\\ BD \\perp SA \\end{cases} \\implies BD \\perp (SAC)$'],
      socraticQuestions: [
        '?1: Trong đề bài, tứ giác $ABCD$ là hình vuông hay hình chữ nhật?',
        '?2: Hai đường chéo của hình chữ nhật có vuông góc với nhau không?',
      ],
      keyInsight: 'Nhầm lẫn tính chất hình học giữa hình vuông và hình chữ nhật khi lập luận vuông góc.',
      followUpProblems: [
        { id: 1, title: 'Bài củng cố 1', content: 'Cho hình chóp $S.ABC$ có $SA \\perp (ABC)$, đáy $ABC$ vuông tại $B$. Chứng minh $BC \\perp (SAB)$.', difficulty: 'Tương đương' },
        { id: 2, title: 'Bài củng cố 2', content: 'Cho tứ diện $OABC$ có $OA, OB, OC$ đôi một vuông góc. Kẻ $OH \\perp (ABC)$. Chứng minh $H$ là trực tâm tam giác $ABC$.', difficulty: 'Tương đương' },
      ],
    },
  },
  {
    id: 'sub-007',
    studentId: 'st-07',
    studentName: 'Học sinh #107',
    classId: 'class-12a1',
    timestamp: '16/10/2026 10:50',
    problemText: 'Giải phương trình: $\\sqrt{x + 1} = x - 1$',
    solutionText: 'Bình phương: x + 1 = x^2 - 2x + 1 => x^2 - 3x = 0 => x = 0 hoặc x = 3. Vậy nghiệm là 0 và 3.',
    isCorrect: false,
    errorCategory: 'Thiếu nghiệm ngoại lai',
    hasResolvedMistake: true,
    diagnosticResult: {
      theorySummary: 'Phương trình dạng $\\sqrt{A} = B$ có $x = 0$ làm vế phải $0 - 1 = -1 < 0$ trong khi vế trái $\\sqrt{1} = 1 > 0$, do đó $x=0$ là nghiệm ngoại lai bắt buộc phải loại.',
      formulasNeeded: ['$\\sqrt{A} = B \\implies B \\ge 0$'],
      socraticQuestions: [
        '?1: Thay $x = 0$ vào phương trình ban đầu ta được $1 = -1$, đẳng thức này đúng hay sai?',
        '?2: Bước bình phương 2 vế của em đã dẫn đến việc thu nạp thêm nghiệm ngoại lai nào?',
      ],
      followUpProblems: [
        { id: 1, title: 'Bài củng cố 1', content: 'Giải phương trình: $\\sqrt{3x + 1} = x - 1$', difficulty: 'Tương đương' },
        { id: 2, title: 'Bài củng cố 2', content: 'Giải phương trình: $\\sqrt{2x + 3} = x$', difficulty: 'Tương đương' },
      ],
    },
  },
  {
    id: 'sub-008',
    studentId: 'st-08',
    studentName: 'Học sinh #108',
    classId: 'class-12a2',
    timestamp: '16/10/2026 11:15',
    problemText: 'Tìm cực trị hàm số $y = x^3 - 3x^2 + 2$',
    solutionText: 'y\' = 3x^2 - 6x = 0 <=> x = 0 hoặc x = 2. y\'\' = 6x - 6. y\'\'(0) = -6 < 0 => cực đại tại x=0, y=2. y\'\'(2) = 6 > 0 => cực tiểu tại x=2, y=-2. Lời giải chính xác thỏa mãn điều kiện.',
    isCorrect: true,
    hasResolvedMistake: true,
    diagnosticResult: {
      praiseComment: 'Phương pháp dùng đạo hàm cấp 2 để nhận diện điểm cực trị rất ngắn gọn, lập luận chặt chẽ và kết luận chính xác tọa độ điểm cực trị.',
      followUpProblems: [
        { id: 1, title: 'Thử thách nâng cao 1', content: 'Tìm tất cả các giá trị của $m$ để hàm số $y = x^4 - 2mx^2 + m - 1$ có 3 điểm cực trị tạo thành tam giác đều.', difficulty: 'Nâng cao' },
        { id: 2, title: 'Thử thách nâng cao 2', content: 'Tìm giá trị lớn nhất, nhỏ nhất của $f(x) = |x^3 - 3x + m|$ trên đoạn $[0; 2]$.', difficulty: 'Nâng cao' },
      ],
    },
  },
];
