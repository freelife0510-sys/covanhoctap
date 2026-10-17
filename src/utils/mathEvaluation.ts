export type ErrorCategory =
  | 'Chưa đặt điều kiện xác định'
  | 'Biến đổi đại số sai'
  | 'Nhầm lẫn định lý/công thức'
  | 'Thiếu nghiệm ngoại lai'
  | 'Lập luận hình học sai'
  | 'Khác';

export interface FollowUpProblem {
  id: number;
  title: string;
  content: string;
  difficulty: 'Tương đương' | 'Nâng cao';
  initialHint?: string;
}

export interface DiagnosticResult {
  theorySummary?: string;
  formulasNeeded?: string[];
  socraticQuestions?: string[];
  praiseComment?: string;
  followUpProblems: FollowUpProblem[];
  keyInsight?: string;
  pedagogicalAdviceForTeacher?: string;
}

/**
 * Heuristic analyzer and pedagogical rule checker for Vietnamese High School Mathematics (GDPT 2018)
 */
export function analyzeMathSubmissionLocal(
  problem: string,
  solution: string
): {
  isCorrect: boolean;
  errorCategory?: ErrorCategory;
  diagnosticResult: DiagnosticResult;
} {
  const normProb = problem.toLowerCase();
  const normSol = solution.toLowerCase();

  // Pattern 1: Radical equation missing condition x >= a
  const hasExtraneousWithoutReject =
    (normSol.includes('x = 3') || normSol.includes('x=3') || normSol.includes('s = {3, 6}') || normSol.includes('s={3;6}')) &&
    !normSol.includes('(loại)') &&
    !normSol.includes('loại x = 3') &&
    !normSol.includes('loại nghiệm 3') &&
    !normSol.includes('loại x=3');

  if (
    (normProb.includes('sqrt') || normProb.includes('căn') || normProb.includes('√')) &&
    hasExtraneousWithoutReject
  ) {
    return {
      isCorrect: false,
      errorCategory: 'Chưa đặt điều kiện xác định',
      diagnosticResult: {
        theorySummary: 'Phương trình dạng $\\sqrt{A} = B$ tương đương với hệ: $\\begin{cases} B \\ge 0 \\\\ A = B^2 \\end{cases}$. Bình phương hai vế chỉ là phép biến đổi tương đương khi cả hai vế cùng không âm.',
        formulasNeeded: [
          '$\\sqrt{A(x)} = B(x) \\iff \\begin{cases} B(x) \\ge 0 \\\\ A(x) = [B(x)]^2 \\end{cases}$',
          '$\\sqrt{A(x)}$ xác định khi và chỉ khi $A(x) \\ge 0$',
        ],
        socraticQuestions: [
          '?1: Hãy quan sát vế phải của phương trình khi $x = 3$. Giá trị của $x - 4$ bằng bao nhiêu? Vế trái $\\sqrt{x-2}$ có thể nhận giá trị âm không?',
          '?2: Bước bình phương hai vế của em là phép suy ra $(\\Rightarrow)$ hay tương đương $(\\Leftrightarrow)$? Em đã kiểm tra điều kiện vế phải chưa?',
          '?3: Sau khi giải ra hai nghiệm $x_1 = 6$ và $x_2 = 3$, em cần thực hiện thao tác gì trước khi kết luận tập nghiệm $S$?',
        ],
        keyInsight: 'Học sinh bỏ qua điều kiện vế phải $x-4 \\ge 0 \\Leftrightarrow x \\ge 4$, dẫn đến nhận nghiệm ngoại lai $x = 3$ làm cho vế phải âm trong khi vế trái mang dấu căn bậc hai.',
        pedagogicalAdviceForTeacher: '80% học sinh khi mới học giải phương trình vô tỉ có thói quen bình phương tự do. Cần củng cố cho cả lớp phân biệt phép biến đổi hệ quả $(\\Rightarrow)$ và phép biến đổi tương đương $(\\Leftrightarrow)$.',
        followUpProblems: [
          {
            id: 101,
            title: 'Bài tập củng cố 1 (Dạng tương đương)',
            content: 'Giải phương trình: $\\sqrt{2x^2 - 3x + 1} = x - 1$',
            difficulty: 'Tương đương',
            initialHint: 'Bước 1: Thiết lập điều kiện $x - 1 \\ge 0 \\iff x \\ge 1$ trước khi bình phương 2 vế.',
          },
          {
            id: 102,
            title: 'Bài tập củng cố 2 (Phát hiện nghiệm ngoại lai)',
            content: 'Giải phương trình: $\\sqrt{3x - 5} = 2 - x$',
            difficulty: 'Tương đương',
            initialHint: 'Bước 1: Chú ý vế phải $2 - x \\ge 0 \\iff x \\le 2$. Nghiệm tìm được phải thỏa mãn đồng thời cả điều kiện xác định của căn thức.',
          },
        ],
      },
    };
  }

  // Pattern 2: Rational derivative sign mistake (ad - bc)
  if (
    (normProb.includes('(2x - 1)/(x + 1)') || normProb.includes('2x-1') || normProb.includes('y =')) &&
    (normSol.includes('1/(x+1)^2') || normSol.includes('1 / (x+1)^2') || normSol.includes('y\' = 1/'))
  ) {
    return {
      isCorrect: false,
      errorCategory: 'Biến đổi đại số sai',
      diagnosticResult: {
        theorySummary: 'Đạo hàm của hàm số phân thức hữu tỉ bậc nhất trên bậc nhất $y = \\frac{ax + b}{cx + d}$ (với $c \\ne 0, ad - bc \\ne 0$) được tính theo quy tắc nhân chéo: $y\' = \\frac{ad - bc}{(cx + d)^2}$. Chú ý dấu của các hệ số $b$ và $c$.',
        formulasNeeded: [
          '$\\left(\\frac{ax + b}{cx + d}\\right)\' = \\frac{a \\cdot d - b \\cdot c}{(cx + d)^2}$',
          'Với $y = \\frac{2x - 1}{x + 1}$: $a = 2, b = -1, c = 1, d = 1 \\implies ad - bc = 2 \\cdot 1 - (-1) \\cdot 1 = 3$',
        ],
        socraticQuestions: [
          '?1: Trong biểu thức $ad - bc$, em hãy xác định chính xác giá trị có kèm dấu của hệ số $b$ trong phân thức $\\frac{2x-1}{x+1}$?',
          '?2: Khi tính $2 \\cdot 1 - (-1) \\cdot 1$, phép trừ của một số âm $[- (-1)]$ sẽ cho kết quả là cộng hay trừ?',
          '?3: Tử số của đạo hàm bằng $+3$ hay $+1$? Dấu của tử số ảnh hưởng thế nào đến tính đồng biến/nghịch biến của hàm số trên các khoảng xác định?',
        ],
        keyInsight: 'Học sinh nhầm dấu khi tính $ad - bc$: lấy $2(1) - 1(1) = 1$ thay vì $2(1) - (-1)(1) = 3$.',
        pedagogicalAdviceForTeacher: 'Lỗi sai dấu đại số cơ bản trong quy tắc nhân chéo định thức cấp hai $\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}$. Cần cho học sinh viết tường minh các ngoặc âm khi tính toán.',
        followUpProblems: [
          {
            id: 201,
            title: 'Bài tập củng cố 1 (Rèn luyện dấu đạo hàm phân thức)',
            content: 'Tính đạo hàm và lập bảng biến thiên của hàm số: $y = \\frac{3x - 2}{2x + 1}$ trên từng khoảng xác định.',
            difficulty: 'Tương đương',
            initialHint: 'Xác định rõ bộ hệ số: $a=3, b=-2, c=2, d=1$. Tính cẩn thận $ad - bc = 3(1) - (-2)(2)$.',
          },
          {
            id: 202,
            title: 'Bài tập củng cố 2 (Chứa tham số m)',
            content: 'Tìm tất cả các giá trị của tham số $m$ để hàm số $y = \\frac{mx - 4}{x - m}$ đồng biến trên từng khoảng xác định.',
            difficulty: 'Tương đương',
            initialHint: 'Tính $y\' = \\frac{-m^2 + 4}{(x-m)^2}$. Hàm số đồng biến khi tử số $ad - bc > 0$.',
          },
        ],
      },
    };
  }

  // Pattern 3: Missing condition in log equation
  if (normProb.includes('log') && (normSol.includes('loại') === false && !normSol.includes('điều kiện'))) {
    return {
      isCorrect: false,
      errorCategory: 'Chưa đặt điều kiện xác định',
      diagnosticResult: {
        theorySummary: 'Phương trình logarit $\\log_a [f(x)] = b$ chỉ có nghĩa khi cơ số $0 < a \\ne 1$ và biểu thức dưới dấu logarit $f(x) > 0$. Với phương trình có nhiều logarit cùng cơ số, cần tìm tập xác định chung $D$.',
        formulasNeeded: [
          '$\\log_a [f(x)] \\text{ có nghĩa } \\iff \\begin{cases} 0 < a \\ne 1 \\\\ f(x) > 0 \\end{cases}$',
          '$\\log_a u + \\log_a v = \\log_a (uv) \\text{ khi } u > 0, v > 0$',
        ],
        socraticQuestions: [
          '?1: Biểu thức dưới dấu logarit $\\log_2 (x-1)$ đòi hỏi điều kiện gì đối với $x$?',
          '?2: Khi em biến đổi tổng các logarit thành logarit của một tích, miền xác định của phương trình ban đầu có được bảo toàn không?',
          '?3: Nghiệm tìm được có thỏa mãn làm cho tất cả các biểu thức logarit ban đầu đều dương không?',
        ],
        keyInsight: 'Bỏ qua điều kiện $x > 1$ trước khi gộp các biểu thức logarit.',
        pedagogicalAdviceForTeacher: 'Học sinh thường quên đặt điều kiện cho từng biểu thức logarit riêng biệt trước khi áp dụng công thức biến đổi nhân/chia.',
        followUpProblems: [
          {
            id: 301,
            title: 'Bài tập củng cố 1 (Phương trình logarit có điều kiện)',
            content: 'Giải phương trình: $\\log_3 (x+1) + \\log_3 (x-1) = 1$',
            difficulty: 'Tương đương',
            initialHint: 'Đặt điều kiện xác định: $x+1 > 0$ và $x-1 > 0 \\iff x > 1$.',
          },
          {
            id: 302,
            title: 'Bài tập củng cố 2 (Bất phương trình logarit)',
            content: 'Giải bất phương trình: $\\log_{0.5} (2x - 3) \\ge -1$',
            difficulty: 'Tương đương',
            initialHint: 'Lưu ý cơ số $0 < a = 0.5 < 1$ nên bất đẳng thức đổi chiều, và bắt buộc $2x - 3 > 0$.',
          },
        ],
      },
    };
  }

  // Pattern 4: Fully Correct
  const isDemonstratedCorrect =
    normSol.includes('chính xác') ||
    normSol.includes('thỏa mãn điều kiện') ||
    normSol.includes('tập nghiệm s = {6}') ||
    normSol.includes('s = {6}') ||
    (normSol.includes('s = {2}') && normProb.includes('log_2')) ||
    (normSol.includes('đk:') && normSol.includes('kết luận'));

  if (isDemonstratedCorrect || normSol.length > 300) {
    return {
      isCorrect: true,
      diagnosticResult: {
        praiseComment: 'Bài giải rất chuẩn mực và chặt chẽ! Em đã thiết lập đầy đủ điều kiện xác định ngay từ bước đầu tiên, biến đổi đại số chính xác và kiểm tra loại bỏ nghiệm ngoại lai một cách khoa học. Cách trình bày mạch lạc, tuân thủ xuất sắc quy chuẩn chấm thi THPT Quốc gia.',
        theorySummary: 'Phương pháp áp dụng: Phép biến đổi tương đương trong đại số và giải tích. Lập luận chặt chẽ hai chiều bảo toàn tập nghiệm của phương trình.',
        formulasNeeded: [
          'Hệ thức độc lập và điều kiện biên: $\\begin{cases} B(x) \\ge 0 \\\\ A(x) = [B(x)]^2 \\end{cases}$',
          'Quy tắc kết luận tập nghiệm theo chuẩn GDPT 2018.',
        ],
        followUpProblems: [
          {
            id: 401,
            title: 'Bài toán thử thách 1 (Vận dụng cao - Chứa tham số)',
            content: 'Tìm tất cả các giá trị thực của tham số $m$ để phương trình $\\sqrt{2x^2 + mx - 3} = x + 1$ có đúng 2 nghiệm thực phân biệt.',
            difficulty: 'Nâng cao',
            initialHint: 'Chuyển về hệ $\\begin{cases} x \\ge -1 \\\\ x^2 + (m-2)x - 4 = 0 \\end{cases}$. Xét vị trí tương đối giữa các nghiệm và mốc $-1$.',
          },
          {
            id: 402,
            title: 'Bài toán thử thách 2 (Mô hình thực tiễn tối ưu hóa)',
            content: 'Một đường ống dẫn dầu nối từ trạm $A$ trên bờ biển đến giàn khoan $B$ ngoài khơi. Khoảng cách ngắn nhất từ $B$ đến bờ biển là $3\\text{ km}$, khoảng cách từ hình chiếu của $B$ đến trạm $A$ là $8\\text{ km}$. Chi phí đặt ống ngầm dưới biển đắt gấp đôi chi phí đặt trên đất liền. Hãy xác định vị trí tiếp bờ để tổng chi phí nhỏ nhất.',
            difficulty: 'Nâng cao',
            initialHint: 'Đặt biến $x$ là khoảng cách tiếp bờ ($0 \\le x \\le 8$). Thiết lập hàm tổng chi phí $C(x)$ và tìm giá trị nhỏ nhất qua đạo hàm $C\'(x) = 0$.',
          },
        ],
      },
    };
  }

  // Default fallback if student wrote a partial/general attempt
  return {
    isCorrect: false,
    errorCategory: 'Nhầm lẫn định lý/công thức',
    diagnosticResult: {
      theorySummary: 'Trong giải toán THPT, mỗi bước suy luận cần dựa trên một định lý hoặc công thức biến đổi tương đương có điều kiện kèm theo.',
      formulasNeeded: [
        'Xác định tập xác định $D$ của bài toán',
        'Kiểm tra tính hai chiều của phép biến đổi',
      ],
      socraticQuestions: [
        '?1: Em hãy kiểm tra lại xem biểu thức trong bài đã có nghĩa với mọi giá trị của biến số hay chưa?',
        '?2: Ở dòng biến đổi thứ hai, em đã áp dụng định lý nào? Giả thiết của định lý đó đã được thỏa mãn đầy đủ chưa?',
        '?3: Hãy thay thử một giá trị nghiệm vừa tìm được vào đề bài ban đầu để tự kiểm chứng tính đúng đắn.',
      ],
      keyInsight: 'Học sinh thiếu bước đối chiếu điều kiện hoặc biến đổi chưa đảm bảo tính tương đương.',
      pedagogicalAdviceForTeacher: 'Cần lưu ý học sinh rèn thói quen thử lại nghiệm và ghi nhớ các điều kiện đi kèm của từng công thức biến đổi.',
      followUpProblems: [
        {
          id: 501,
          title: 'Bài tập tương đương 1',
          content: 'Giải phương trình: $\\sqrt{x + 3} = 2x - 1$',
          difficulty: 'Tương đương',
          initialHint: 'Đặt điều kiện $2x - 1 \\ge 0 \\iff x \\ge \\frac{1}{2}$ trước khi bình phương hai vế.',
        },
        {
          id: 502,
          title: 'Bài tập tương đương 2',
          content: 'Giải bất phương trình: $\\frac{x - 3}{x + 2} \\le 0$',
          difficulty: 'Tương đương',
          initialHint: 'Lập bảng xét dấu của nhị thức bậc nhất tử và mẫu, chú ý điều kiện mẫu số khác 0.',
        },
      ],
    },
  };
}
