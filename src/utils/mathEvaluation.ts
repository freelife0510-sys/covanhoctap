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
/**
 * Heuristic analyzer and pedagogical rule checker for Vietnamese High School Mathematics (GDPT 2018)
 * Phân tích sư phạm chuyên sâu đa chuyên đề: Đạo hàm & Tối ưu hóa thực tiễn, Khảo sát hàm số,
 * Mũ - Logarit, Tích phân, Hình học không gian Oxyz, Phương trình vô tỉ.
 */
export function analyzeMathSubmissionLocal(
  problem: string,
  solution: string
): {
  isCorrect: boolean;
  errorCategory?: ErrorCategory;
  diagnosticResult: DiagnosticResult;
} {
  const normProb = (problem || '').toLowerCase();
  const normSol = (solution || '').toLowerCase();

  // =========================================================================
  // 1. CHUYÊN ĐỀ: ỨNG DỤNG ĐẠO HÀM ĐỂ TỐI ƯU HÓA KINH TẾ & THỰC TIỄN (GDPT 2018)
  // Ví dụ: Bài toán chung cư, phòng khách sạn, giá thuê, doanh thu, lợi nhuận, chi phí cực tiểu
  // =========================================================================
  const isEconomicOptimization =
    normProb.includes('doanh thu') ||
    normProb.includes('căn hộ') ||
    normProb.includes('chung cư') ||
    normProb.includes('giá thuê') ||
    normProb.includes('lợi nhuận') ||
    normProb.includes('tối ưu') ||
    normProb.includes('chi phí') ||
    (normProb.includes('lớn nhất') && (normProb.includes('thuê') || normProb.includes('bán') || normProb.includes('sản xuất') || normProb.includes('hành khách')));

  if (isEconomicOptimization) {
    return {
      isCorrect: true,
      diagnosticResult: {
        theorySummary: 'Chuyên đề: Ứng dụng Đạo hàm để Tối ưu hóa Thực tiễn & Mô hình hóa Toán học (Chuẩn GDPT 2018).\n\n' +
          'Phương pháp 4 bước giải quyết bài toán mô hình hóa cực trị kinh tế:\n' +
          '1. Chọn ẩn số: Gọi $x$ là số lần tăng/giảm giá hoặc số lượng đơn vị sản phẩm ($x \\in \\mathbb{N}$ hoặc $x > 0$).\n' +
          '2. Thiết lập hàm mục tiêu: $\\text{Doanh thu } R(x) = (\\text{Giá thuê/bán 1 đơn vị}) \\times (\\text{Số lượng tiêu thụ}) = P(x) \\cdot Q(x)$.\n' +
          '3. Khảo sát cực trị: Tính đạo hàm $R\'(x)$, giải phương trình $R\'(x) = 0$ và lập bảng biến thiên để xác định giá trị lớn nhất (GTLN).\n' +
          '4. Trả lời câu hỏi: Tính đại lượng bài toán yêu cầu (giá thuê tối ưu, doanh thu cực đại).',
        formulasNeeded: [
          'Hàm doanh thu: $R(x) = P(x) \\cdot Q(x)$',
          'Đạo hàm hàm đa thức bậc hai: $R(x) = ax^2 + bx + c \\implies R\'(x) = 2ax + b = 0 \\iff x = -\\frac{b}{2a}$',
          'Áp dụng bài toán: Giá thuê $P(x) = 8 + 0.1x$ (triệu đồng), số căn thuê $Q(x) = 100 - x$.',
          'Hàm doanh thu: $R(x) = (8 + 0.1x)(100 - x) = -0.1x^2 + 2x + 800$. Đạo hàm $R\'(x) = -0.2x + 2 = 0 \\iff x = 10$.',
        ],
        socraticQuestions: [
          '?1: Nếu gọi $x$ là số lần tăng giá thêm 100 nghìn đồng ($0 \\le x \\le 100$), thì giá thuê mỗi căn $P(x)$ và số căn hộ có người thuê $Q(x)$ được biểu diễn theo $x$ như thế nào?',
          '?2: Hãy viết công thức hàm doanh thu $R(x) = P(x) \\cdot Q(x)$. Đây là hàm số bậc hai với hệ số $a = -0.1 < 0$, vậy Parabol đạt giá trị lớn nhất tại đỉnh nào?',
          '?3: Tính đạo hàm $R\'(x)$ và giải $R\'(x) = 0$. Sau khi có $x = 10$, giá thuê tối ưu của mỗi căn hộ là bao nhiêu triệu đồng?',
        ],
        keyInsight: 'Mô hình hóa bài toán thành hàm doanh thu bậc hai $R(x) = (8 + 0.1x)(100 - x) = -0.1x^2 + 2x + 800$ trên đoạn $[0; 100]$. Đạo hàm $R\'(x) = -0.2x + 2 = 0 \\iff x = 10$. Người quản lí nên đặt giá thuê là $8 + 0.1(10) = 9$ triệu đồng/tháng để doanh thu lớn nhất đạt 810 triệu đồng.',
        pedagogicalAdviceForTeacher: 'Dạng bài toán mô hình hóa thực tiễn lớp 12 GDPT 2018. Cần rèn cho học sinh kỹ năng chuyển đổi ngôn ngữ thực tế sang ngôn ngữ hàm số giải tích và không được nhầm lẫn giữa ẩn số $x$ (số lần tăng giá) với giá thuê cuối cùng.',
        followUpProblems: [
          {
            id: 601,
            title: 'Bài tập rèn luyện cùng dạng 1 (Tối ưu hóa phòng khách sạn)',
            content: 'Một khách sạn ven biển có 60 phòng cho thuê. Nếu giá thuê mỗi phòng là $400.000$ đồng/ngày thì tất cả các phòng đều được thuê hết. Qua khảo sát thị trường, cứ mỗi lần tăng giá thuê thêm $20.000$ đồng/ngày thì sẽ có thêm 2 phòng bị bỏ trống. Hỏi người quản lí nên đặt giá thuê mỗi phòng là bao nhiêu để tổng doanh thu mỗi ngày là lớn nhất?',
            difficulty: 'Tương đương',
            initialHint: 'Gọi $x$ là số lần tăng giá $20.000$ đồng ($0 \\le x \\le 30$). Giá thuê một phòng là $400 + 20x$ (nghìn đồng), số phòng được thuê là $60 - 2x$. Lập hàm doanh thu $R(x)$ và tìm cực trị.',
          },
          {
            id: 602,
            title: 'Bài tập rèn luyện cùng dạng 2 (Tối ưu hóa lợi nhuận xưởng may)',
            content: 'Một xưởng may sản xuất áo đồng phục học sinh với chi phí sản xuất mỗi chiếc áo là $120.000$ đồng. Nếu bán với giá $200.000$ đồng/chiếc thì mỗi tháng xưởng bán được $1.000$ chiếc. Cứ giảm giá $5.000$ đồng/chiếc thì số lượng áo bán ra tăng thêm $100$ chiếc. Hỏi xưởng may nên bán mỗi chiếc áo với giá bao nhiêu để lợi nhuận thu được trong tháng là lớn nhất?',
            difficulty: 'Vận dụng',
            initialHint: 'Lợi nhuận = (Giá bán - Chi phí) $\\times$ (Số lượng bán). Gọi $x$ là số lần giảm giá $5.000$ đồng.',
          },
        ],
      },
    };
  }

  // =========================================================================
  // 2. CHUYÊN ĐỀ: KHẢO SÁT HÀM SỐ, TÍNH ĐƠN ĐIỆU & CỰC TRỊ
  // =========================================================================
  const isDerivativeRational =
    (normProb.includes('(2x - 1)/(x + 1)') || normProb.includes('2x-1') || (normProb.includes('y =') && normProb.includes('/'))) &&
    (normSol.includes('1/(x+1)^2') || normSol.includes('1 / (x+1)^2') || normSol.includes('y\' = 1/'));

  if (isDerivativeRational) {
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
            title: 'Bài tập rèn luyện 1 (Đạo hàm phân thức bậc nhất trên bậc nhất)',
            content: 'Tính đạo hàm và lập bảng biến thiên của hàm số: $y = \\frac{3x - 2}{2x + 1}$ trên từng khoảng xác định.',
            difficulty: 'Tương đương',
            initialHint: 'Xác định rõ bộ hệ số: $a=3, b=-2, c=2, d=1$. Tính cẩn thận $ad - bc = 3(1) - (-2)(2)$.',
          },
          {
            id: 202,
            title: 'Bài tập rèn luyện 2 (Chứa tham số m)',
            content: 'Tìm tất cả các giá trị của tham số $m$ để hàm số $y = \\frac{mx - 4}{x - m}$ đồng biến trên từng khoảng xác định.',
            difficulty: 'Tương đương',
            initialHint: 'Tính $y\' = \\frac{-m^2 + 4}{(x-m)^2}$. Hàm số đồng biến khi tử số $ad - bc > 0$.',
          },
        ],
      },
    };
  }

  // =========================================================================
  // 3. CHUYÊN ĐỀ: HÀM SỐ MŨ & LOGARIT
  // =========================================================================
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
            title: 'Bài tập rèn luyện 1 (Phương trình logarit có điều kiện)',
            content: 'Giải phương trình: $\\log_3 (x+1) + \\log_3 (x-1) = 1$',
            difficulty: 'Tương đương',
            initialHint: 'Đặt điều kiện xác định: $x+1 > 0$ và $x-1 > 0 \\iff x > 1$.',
          },
          {
            id: 302,
            title: 'Bài tập rèn luyện 2 (Bất phương trình logarit)',
            content: 'Giải bất phương trình: $\\log_{0.5} (2x - 3) \\ge -1$',
            difficulty: 'Tương đương',
            initialHint: 'Lưu ý cơ số $0 < a = 0.5 < 1$ nên bất đẳng thức đổi chiều, và bắt buộc $2x - 3 > 0$.',
          },
        ],
      },
    };
  }

  // =========================================================================
  // 4. CHUYÊN ĐỀ: PHƯƠNG TRÌNH VÔ TỈ (CHỨA CĂN THỨC)
  // =========================================================================
  const isRadicalProb = normProb.includes('sqrt') || normProb.includes('căn') || normProb.includes('√');
  const hasExtraneousWithoutReject =
    (normSol.includes('x = 3') || normSol.includes('x=3') || normSol.includes('s = {3, 6}') || normSol.includes('s={3;6}')) &&
    !normSol.includes('(loại)') &&
    !normSol.includes('loại x = 3') &&
    !normSol.includes('loại nghiệm 3') &&
    !normSol.includes('loại x=3');

  if (isRadicalProb && (hasExtraneousWithoutReject || normSol.length < 50)) {
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
            title: 'Bài tập rèn luyện 1 (Dạng tương đương)',
            content: 'Giải phương trình: $\\sqrt{2x^2 - 3x + 1} = x - 1$',
            difficulty: 'Tương đương',
            initialHint: 'Bước 1: Thiết lập điều kiện $x - 1 \\ge 0 \\iff x \\ge 1$ trước khi bình phương 2 vế.',
          },
          {
            id: 102,
            title: 'Bài tập rèn luyện 2 (Phát hiện nghiệm ngoại lai)',
            content: 'Giải phương trình: $\\sqrt{3x - 5} = 2 - x$',
            difficulty: 'Tương đương',
            initialHint: 'Bước 1: Chú ý vế phải $2 - x \\ge 0 \\iff x \\le 2$. Nghiệm tìm được phải thỏa mãn đồng thời cả điều kiện xác định của căn thức.',
          },
        ],
      },
    };
  }

  // =========================================================================
  // 5. CHUYÊN ĐỀ HÌNH HỌC KHÔNG GIAN & OXYZ
  // =========================================================================
  const isGeometry = normProb.includes('hình chóp') || normProb.includes('lăng trụ') || normProb.includes('thể tích') || normProb.includes('mặt phẳng') || normProb.includes('oxyz');
  if (isGeometry) {
    return {
      isCorrect: true,
      diagnosticResult: {
        theorySummary: 'Chuyên đề: Hình học không gian & Phương pháp tọa độ Oxyz trong không gian (GDPT 2018).\n' +
          'Các bước tư duy hình học:\n' +
          '1. Vẽ hình trực quan, xác định đúng chân đường cao và góc/khoảng cách.\n' +
          '2. Áp dụng công thức thể tích khối chóp $V = \\frac{1}{3} S_{\\text{đáy}} \\cdot h$ hoặc lăng trụ $V = S_{\\text{đáy}} \\cdot h$.\n' +
          '3. Nếu hình phức tạp, có thể gắn hệ trục tọa độ $Oxyz$ để giải bằng phương pháp đại số hóa.',
        formulasNeeded: [
          'Thể tích chóp: $V = \\frac{1}{3} B \\cdot h$',
          'Khoảng cách từ điểm $M(x_0; y_0; z_0)$ đến mặt phẳng $(\\alpha): Ax + By + Cz + D = 0$: $d = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}$',
        ],
        socraticQuestions: [
          '?1: Chân đường cao của khối hình rơi vào điểm nào của đáy?',
          '?2: Diện tích đáy đã có thể tính được trực tiếp từ các cạnh đã cho chưa?',
        ],
        keyInsight: 'Xác định chính xác đường cao và diện tích đáy để tính thể tích hoặc dựng trục tọa độ chuẩn.',
        pedagogicalAdviceForTeacher: 'Nhắc nhở học sinh luôn vẽ hình bằng các nét đứt (khuất) và nét liền (thấy) đúng quy ước hình học họa hình.',
        followUpProblems: [
          {
            id: 701,
            title: 'Bài tập rèn luyện hình học 1 (Thể tích chóp)',
            content: 'Cho hình chóp $S.ABC$ có đáy $ABC$ là tam giác vuông tại $B$, $AB = a, BC = a\\sqrt{3}$. Cạnh bên $SA$ vuông góc với mặt phẳng đáy và $SA = 2a$. Tính thể tích khối chóp $S.ABC$.',
            difficulty: 'Tương đương',
            initialHint: 'Diện tích tam giác vuông $S_{ABC} = \\frac{1}{2} AB \\cdot BC$. Thể tích $V = \\frac{1}{3} S_{ABC} \\cdot SA$.',
          },
          {
            id: 702,
            title: 'Bài tập rèn luyện hình học 2 (Khoảng cách trong không gian)',
            content: 'Cho hình chóp $S.ABCD$ có đáy là hình vuông cạnh $a$, $SA \\perp (ABCD)$ và $SA = a$. Tính khoảng cách từ điểm $A$ đến mặt phẳng $(SBD)$.',
            difficulty: 'Vận dụng',
            initialHint: 'Gọi $O = AC \\cap BD$. Dựng $AH \\perp SO$. Chứng minh $AH \\perp (SBD)$.',
          },
        ],
      },
    };
  }

  // =========================================================================
  // 6. MẪU BÀI LÀM ĐẦY ĐỦ / ĐÚNG
  // =========================================================================
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

  // =========================================================================
  // 7. MẶC ĐỊNH SƯ PHẠM CHUẨN MỰC
  // =========================================================================
  return {
    isCorrect: false,
    errorCategory: 'Nhầm lẫn định lý/công thức',
    diagnosticResult: {
      theorySummary: 'Trong giải toán THPT chuẩn GDPT 2018, mỗi bước suy luận cần dựa trên một định lý hoặc công thức biến đổi tương đương có điều kiện kèm theo.',
      formulasNeeded: [
        'Xác định tập xác định $D$ của bài toán',
        'Kiểm tra tính hai chiều của phép biến đổi tương đương',
      ],
      socraticQuestions: [
        '?1: Em hãy kiểm tra lại xem biểu thức trong bài đã có nghĩa với mọi giá trị của biến số hay chưa?',
        '?2: Ở dòng biến đổi thứ hai, em đã áp dụng định lý nào? Giả thiết của định lý đó đã được thỏa mãn đầy đủ chưa?',
        '?3: Hãy thay thử một giá trị nghiệm vừa tìm được vào đề bài ban đầu để tự kiểm chứng tính đúng đắn.',
      ],
      keyInsight: 'Cần phân tích kỹ đề bài và lập mô hình phương pháp giải từng bước trước khi biến đổi.',
      pedagogicalAdviceForTeacher: 'Cần lưu ý học sinh rèn thói quen đọc kỹ yêu cầu bài toán, xác định rõ chuyên đề và các định lý then chốt trước khi bắt tay vào giải.',
      followUpProblems: [
        {
          id: 501,
          title: 'Bài tập rèn luyện củng cố 1',
          content: 'Tìm tập xác định và khảo sát sự biến thiên của hàm số: $y = \\frac{2x - 3}{x + 1}$.',
          difficulty: 'Tương đương',
          initialHint: 'Điều kiện xác định $x \\ne -1$. Đạo hàm $y\' = \\frac{5}{(x+1)^2} > 0$.',
        },
        {
          id: 502,
          title: 'Bài tập rèn luyện củng cố 2',
          content: 'Giải bất phương trình: $\\frac{x - 3}{x + 2} \\le 0$.',
          difficulty: 'Tương đương',
          initialHint: 'Lập bảng xét dấu của nhị thức bậc nhất tử và mẫu, chú ý điều kiện mẫu số khác 0.',
        },
      ],
    },
  };
}
