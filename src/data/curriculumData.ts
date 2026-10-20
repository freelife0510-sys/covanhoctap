import { GradeCurriculum } from '../types/curriculum.ts';

export const HIGH_SCHOOL_CURRICULUM: GradeCurriculum[] = [
  // =========================================================================
  // KHỐI 12: CHƯƠNG TRÌNH TOÁN THPT CHUẨN GDPT 2018 (SGK KẾT NỐI TRI THỨC)
  // =========================================================================
  {
    grade: '12',
    name: 'Toán Lớp 12',
    badge: 'Trọng tâm Kỳ thi Tốt nghiệp THPT',
    description: 'Chương trình Giải tích, Hình học không gian Oxyz và Xác suất có điều kiện chuẩn GDPT 2018',
    chapters: [
      {
        id: '12-c1',
        title: 'Chương I: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số',
        order: 1,
        description: 'Tính đơn điệu, cực trị, giá trị lớn nhất/nhỏ nhất và mô hình hóa tối ưu hóa thực tiễn',
        lessons: [
          {
            id: '12-c1-b1',
            title: 'Bài 1: Tính đơn điệu và cực trị của hàm số',
            order: 1,
            description: 'Khảo sát sự đồng biến, nghịch biến và các điểm cực đại, cực tiểu của hàm số',
            theory: {
              overview: 'Nắm vững mối liên hệ giữa dấu của đạo hàm cấp một $f\'(x)$ với tính đồng biến, nghịch biến và các điểm cực trị của hàm số $y = f(x)$ trên một khoảng hoặc một tập hợp.',
              sections: [
                {
                  title: '1. Tính đơn điệu của hàm số',
                  content: 'Cho hàm số $y = f(x)$ có đạo hàm trên khoảng $K$.\n\n- Nếu $f\'(x) > 0$ với mọi $x \\in K$ thì hàm số $f(x)$ **đồng biến** trên $K$.\n- Nếu $f\'(x) < 0$ với mọi $x \\in K$ thì hàm số $f(x)$ **nghịch biến** trên $K$.\n- Nếu $f\'(x) = 0$ với mọi $x \\in K$ thì hàm số $f(x)$ là hàm hằng (không đổi) trên $K$.\n\n**Định lý mở rộng:** Nếu $f\'(x) \\ge 0$ (hoặc $f\'(x) \\le 0$) với mọi $x \\in K$ và dấu bằng chỉ xảy ra tại một số hữu hạn điểm thì hàm số đồng biến (hoặc nghịch biến) trên $K$.',
                  keyFormulas: [
                    'f\'(x) > 0, \\forall x \\in K \\implies f(x) \\text{ đồng biến trên } K',
                    'f\'(x) < 0, \\forall x \\in K \\implies f(x) \\text{ nghịch biến trên } K',
                  ],
                  importantNotes: [
                    'Khi kết luận khoảng đơn điệu, dùng từ "và" hoặc chấm phẩy ";", TUYỆT ĐỐI KHÔNG dùng ký hiệu hợp $\\cup$ hay dấu trừ tập hợp $\\setminus$.',
                    'Với hàm phân thức bậc nhất trên bậc nhất $y = \\frac{ax+b}{cx+d}$, đạo hàm $y\' = \\frac{ad-bc}{(cx+d)^2}$ không bao giờ bằng 0, do đó dấu bằng không xảy ra tại hữu hạn điểm.',
                  ],
                },
                {
                  title: '2. Cực trị của hàm số',
                  content: 'Điểm $x_0$ được gọi là một **điểm cực đại** của hàm số $f(x)$ nếu tồn tại một khoảng $(a; b) \\subset D$ chứa $x_0$ sao cho $f(x) < f(x_0)$ với mọi $x \\in (a; b) \\setminus \\{x_0\\}$. Khi đó $f(x_0)$ gọi là **giá trị cực đại**.\n\n**Dấu hiệu nhận biết:**\n- Khi $x$ đi qua $x_0$ theo chiều tăng dần, nếu $f\'(x)$ đổi dấu từ **dương sang âm** thì $x_0$ là điểm cực đại.\n- Khi $x$ đi qua $x_0$, nếu $f\'(x)$ đổi dấu từ **âm sang dương** thì $x_0$ là điểm cực tiểu.',
                  keyFormulas: [
                    'f\'(x) \\text{ đổi dấu } (+) \\to (-) \\implies x_0 \\text{ là điểm cực đại}',
                    'f\'(x) \\text{ đổi dấu } (-) \\to (+) \\implies x_0 \\text{ là điểm cực tiểu}',
                  ],
                  importantNotes: [
                    'Phân biệt rõ: Điểm cực trị của hàm số là $x_0$; Giá trị cực trị là $y_0 = f(x_0)$; Điểm cực trị của đồ thị hàm số là tọa độ $M(x_0; y_0)$.',
                    'Đạo hàm tại $x_0$ có thể bằng 0 hoặc không xác định, miễn là hàm số liên tục tại $x_0$ và đạo hàm đổi dấu khi qua $x_0$.',
                  ],
                },
              ],
              summaryFormulas: [
                'y = \\frac{ax+b}{cx+d} \\implies y\' = \\frac{ad-bc}{(cx+d)^2}',
                'y = ax^3 + bx^2 + cx + d \\implies y\' = 3ax^2 + 2bx + c',
              ],
              commonMistakes: [
                'Nhầm lẫn giữa điểm cực trị của hàm số ($x$) và điểm cực trị của đồ thị ($M(x; y)$).',
                'Kết luận tập đồng biến dạng $(-\\infty; -1) \\cup (1; +\\infty)$ thay vì dùng từ "và".',
                'Quên kiểm tra điều kiện đạo hàm đổi dấu khi qua nghiệm bội chẵn.',
              ],
            },
            exercises: {
              multipleChoice: [
                {
                  id: '12-c1-b1-mc1',
                  question: 'Cho hàm số $y = f(x)$ có bảng xét dấu của đạo hàm $f\'(x)$ như sau:\n\n| $x$ | $-\\infty$ | | $-1$ | | $2$ | | $4$ | | $+\\infty$ |\n|---|---|---|---|---|---|---|---|---|---|\n| $f\'(x)$ | | $+$ | $0$ | $-$ | $0$ | $+$ | $0$ | $-$ | |\n\nHàm số đã cho nghịch biến trên khoảng nào dưới đây?',
                  options: [
                    { key: 'A', content: '$(-\\infty; -1)$' },
                    { key: 'B', content: '$(-1; 2)$' },
                    { key: 'C', content: '$(2; 4)$' },
                    { key: 'D', content: '$(2; +\\infty)$' },
                  ],
                  correctAnswer: 'B',
                  cognitiveLevel: 'Nhận biết',
                  explanation: 'Dựa vào bảng xét dấu, ta thấy $f\'(x) < 0$ trên các khoảng $(-1; 2)$ và $(4; +\\infty)$. Do đó hàm số nghịch biến trên khoảng $(-1; 2)$.',
                },
                {
                  id: '12-c1-b1-mc2',
                  question: 'Cho hàm số bậc ba $y = x^3 - 3x^2 + 2$. Điểm cực đại của hàm số đã cho là:',
                  options: [
                    { key: 'A', content: '$x = 0$' },
                    { key: 'B', content: '$x = 2$' },
                    { key: 'C', content: '$y = 2$' },
                    { key: 'D', content: '$M(0; 2)$' },
                  ],
                  correctAnswer: 'A',
                  cognitiveLevel: 'Thông hiểu',
                  explanation: 'Ta có $y\' = 3x^2 - 6x = 3x(x - 2)$. Cho $y\' = 0 \\iff x = 0$ hoặc $x = 2$.\n\nBảng xét dấu: Khi qua $x = 0$, $y\'$ đổi dấu từ dương sang âm, do đó $x = 0$ là điểm cực đại của hàm số.',
                },
              ],
              trueFalse: [
                {
                  id: '12-c1-b1-tf1',
                  context: 'Cho hàm số $f(x) = \\frac{1}{3}x^3 - mx^2 + (m^2 - 1)x + 1$ với $m$ là tham số thực.',
                  cognitiveLevel: 'Thông hiểu',
                  statements: [
                    {
                      subId: 'a',
                      content: 'Đạo hàm của hàm số là $f\'(x) = x^2 - 2mx + m^2 - 1$.',
                      isCorrect: true,
                      explanation: 'Áp dụng công thức đạo hàm hàm đa thức: $(x^3)\' = 3x^2, (x^2)\' = 2x, (x)\' = 1$. Ta có $f\'(x) = x^2 - 2mx + m^2 - 1$.',
                    },
                    {
                      subId: 'b',
                      content: 'Biệt thức $\\Delta\'$ của phương trình $f\'(x) = 0$ luôn bằng $1$ với mọi giá trị $m$.',
                      isCorrect: true,
                      explanation: 'Ta có $\\Delta\' = (-m)^2 - 1 \\cdot (m^2 - 1) = m^2 - m^2 + 1 = 1 > 0$ với mọi $m$.',
                    },
                    {
                      subId: 'c',
                      content: 'Hàm số đã cho luôn có 2 điểm cực trị với mọi giá trị thực của tham số $m$.',
                      isCorrect: true,
                      explanation: 'Vì $\\Delta\' = 1 > 0, \\forall m$, phương trình $f\'(x) = 0$ luôn có 2 nghiệm phân biệt và đổi dấu khi qua 2 nghiệm đó, nên hàm số luôn có 2 điểm cực trị.',
                    },
                    {
                      subId: 'd',
                      content: 'Khi $m = 1$, khoảng cách giữa hai điểm cực trị của đồ thị hàm số bằng $2$.',
                      isCorrect: false,
                      explanation: 'Khi $m = 1$, $f\'(x) = x^2 - 2x = 0 \\iff x = 0$ hoặc $x = 2$. Với $x = 0 \\implies y = 1 \\implies A(0; 1)$. Với $x = 2 \\implies y = -\\frac{1}{3} \\implies B(2; -\\frac{1}{3})$. Khoảng cách $AB = \\sqrt{(2-0)^2 + (-\\frac{1}{3}-1)^2} = \\frac{2\\sqrt{13}}{3} \\ne 2$.',
                    },
                  ],
                },
              ],
              shortAnswer: [
                {
                  id: '12-c1-b1-sa1',
                  problem: 'Một flycam ghi hình chuyển động trên độ cao được mô tả bởi hàm số độ cao $h(t) = -t^3 + 6t^2 + 15t + 20$ (mét), với $t$ là thời gian tính bằng giây ($0 \\le t \\le 8$). Vận tốc leo cao tức thời của flycam bằng $0$ tại thời điểm $t$ bằng bao nhiêu giây?',
                  correctValue: 5,
                  acceptableAnswers: ['5', '5s', '5 giây'],
                  unit: 'giây',
                  cognitiveLevel: 'Vận dụng',
                  isRealWorldModeling: true,
                  modelingSteps: [
                    { stepName: 'Bước 1: Thiết lập hàm vận tốc tức thời', description: 'Vận tốc tức thời là đạo hàm của hàm vị trí/độ cao: $v(t) = h\'(t)$.', formula: 'v(t) = -3t^2 + 12t + 15' },
                    { stepName: 'Bước 2: Giải điều kiện vận tốc bằng 0', description: 'Cho $v(t) = 0 \\iff -3t^2 + 12t + 15 = 0 \\iff t = -1$ (loại) hoặc $t = 5$ (thỏa mãn $0 \\le t \\le 8$).', formula: 't = 5' },
                  ],
                  explanation: 'Vận tốc leo cao của flycam là $v(t) = h\'(t) = -3t^2 + 12t + 15$. Khi vận tốc bằng 0, $-3t^2 + 12t + 15 = 0 \\iff t = 5$ giây (loại nghiệm âm $t = -1$).',
                },
              ],
            },
          },
          {
            id: '12-c1-b2',
            title: 'Bài 2: Giá trị lớn nhất và giá trị nhỏ nhất của hàm số (Tối ưu hóa thực tiễn)',
            order: 2,
            description: 'Tìm GTLN, GTNN trên đoạn và ứng dụng giải các bài toán tối ưu hóa doanh thu, chi phí, diện tích, thể tích',
            theory: {
              overview: 'Nắm vững quy tắc tìm giá trị lớn nhất (GTLN) và giá trị nhỏ nhất (GTNN) của hàm số trên một đoạn, cùng phương pháp mô hình hóa toán học 4 bước để tối ưu hóa các vấn đề kinh tế và đời sống thực tế.',
              sections: [
                {
                  title: '1. Quy tắc tìm GTLN và GTNN trên đoạn $[a; b]$',
                  content: 'Giả sử $y = f(x)$ liên tục trên đoạn $[a; b]$ và có đạo hàm trên $(a; b)$:\n\n1. Tính đạo hàm $f\'(x)$.\n2. Tìm các điểm $x_1, x_2, ..., x_n$ trên khoảng $(a; b)$ mà tại đó $f\'(x) = 0$ hoặc đạo hàm không xác định.\n3. Tính các giá trị $f(a), f(x_1), f(x_2), ..., f(b)$.\n4. So sánh các giá trị vừa tính: Số lớn nhất là $\\max_{[a; b]} f(x)$, số nhỏ nhất là $\\min_{[a; b]} f(x)$.',
                  keyFormulas: [
                    'M = \\max_{[a; b]} f(x) = \\max \\{f(a), f(x_1), ..., f(b)\\}',
                    'm = \\min_{[a; b]} f(x) = \\min \\{f(a), f(x_1), ..., f(b)\\}',
                  ],
                  importantNotes: [
                    'Chỉ tính giá trị của các nghiệm $x_i$ nằm TRONG khoảng $(a; b)$, loại bỏ các điểm nằm ngoài đoạn.',
                    'Nếu tìm GTLN/GTNN trên khoảng $(a; b)$ mở, bắt buộc phải lập bảng biến thiên hoặc dùng giới hạn tại 2 đầu mút.',
                  ],
                },
                {
                  title: '2. Phương pháp mô hình hóa tối ưu hóa thực tiễn (Doanh thu, Chi phí, Hình học)',
                  content: 'Quy trình giải bài toán thực tế GDPT 2018 gồm 4 bước chuẩn mực:\n\n- **Bước 1 (Chọn ẩn):** Chọn đại lượng biến thiên làm ẩn số $x$ (ví dụ: số lần tăng giá, chiều dài đáy, bán kính...). Xác định điều kiện thực tế của biến.\n- **Bước 2 (Mô hình hóa):** Thiết lập hàm mục tiêu $f(x)$ thể hiện đại lượng cần tối ưu: $\\text{Doanh thu } R(x) = (\\text{Giá}) \\times (\\text{Số lượng})$, $\\text{Lợi nhuận } = \\text{Doanh thu} - \\text{Chi phí}$, hoặc Thể tích/Diện tích.\n- **Bước 3 (Khảo sát cực trị):** Tính đạo hàm $f\'(x)$, giải $f\'(x) = 0$ và xác định giá trị tối ưu.\n- **Bước 4 (Kết luận thực tiễn):** Đối chiếu điều kiện và trả lời đúng câu hỏi đề bài yêu cầu.',
                  practicalApplication: 'Ứng dụng định giá vé máy bay, giá phòng khách sạn, giá thuê căn hộ chung cư, thiết kế vỏ lon nước ngọt tiết kiệm kim loại nhất.',
                },
              ],
              summaryFormulas: [
                '\\text{Doanh thu } R(x) = P(x) \\cdot Q(x)',
                '\\text{Lợi nhuận } L(x) = R(x) - C(x)',
                'y = ax^2 + bx + c \\ (a < 0) \\implies y_{\\max} \\text{ tại } x = -\\frac{b}{2a}',
              ],
              commonMistakes: [
                'Nhầm lẫn giữa ẩn số $x$ (số lần tăng giá) với giá thuê/giá bán cuối cùng của sản phẩm.',
                'Quên điều kiện thực tế của ẩn số (ví dụ: số căn hộ phải là số tự nhiên, kích thước hình học phải dương).',
              ],
            },
            exercises: {
              multipleChoice: [
                {
                  id: '12-c1-b2-mc1',
                  question: 'Giá trị lớn nhất của hàm số $f(x) = x^4 - 2x^2 + 3$ trên đoạn $[0; 2]$ bằng:',
                  options: [
                    { key: 'A', content: '$3$' },
                    { key: 'B', content: '$2$' },
                    { key: 'C', content: '$11$' },
                    { key: 'D', content: '$19$' },
                  ],
                  correctAnswer: 'C',
                  cognitiveLevel: 'Thông hiểu',
                  explanation: 'Ta có $f\'(x) = 4x^3 - 4x = 4x(x^2 - 1) = 0 \\iff x = 0$ hoặc $x = 1$ hoặc $x = -1$ (loại vì không thuộc $[0; 2]$).\n\nTính các giá trị: $f(0) = 3$, $f(1) = 2$, $f(2) = 2^4 - 2(2^2) + 3 = 11$. Do đó $\\max_{[0; 2]} f(x) = 11$ tại $x = 2$.',
                },
                {
                  id: '12-c1-b2-mc2',
                  question: 'Một người nông dân có $60\\text{ m}$ lưới thép muốn rào một khu vườn hình chữ nhật giáp với bờ sông thẳng (bờ sông không cần rào). Diện tích lớn nhất của mảnh vườn mà người đó có thể rào được là:',
                  options: [
                    { key: 'A', content: '$450\\text{ m}^2$' },
                    { key: 'B', content: '$400\\text{ m}^2$' },
                    { key: 'C', content: '$900\\text{ m}^2$' },
                    { key: 'D', content: '$225\\text{ m}^2$' },
                  ],
                  correctAnswer: 'A',
                  cognitiveLevel: 'Thông hiểu',
                  explanation: 'Gọi $x$ là chiều rộng hai cạnh vuông góc với bờ sông ($0 < x < 30$). Chiều dài cạnh song song bờ sông là $60 - 2x$.\n\nDiện tích mảnh vườn: $S(x) = x(60 - 2x) = -2x^2 + 60x$. Đây là hàm bậc hai đạt cực đại tại $x = -\\frac{60}{2(-2)} = 15\\text{ m}$. Diện tích tối đa là $S(15) = 15(60 - 30) = 450\\text{ m}^2$.',
                },
              ],
              trueFalse: [
                {
                  id: '12-c1-b2-tf1',
                  context: 'Người quản lí của một khu chung cư có 100 căn hộ cho thuê nhận thấy rằng: Tất cả các căn hộ sẽ có người thuê nếu giá thuê một căn hộ là 8 triệu đồng/tháng. Cứ mỗi lần tăng giá thuê thêm 100 nghìn đồng (tức 0.1 triệu đồng) thì sẽ có thêm 1 căn hộ bị bỏ trống. Gọi $x$ là số lần tăng giá ($x \\in \\mathbb{N}, 0 \\le x \\le 100$).',
                  cognitiveLevel: 'Vận dụng',
                  statements: [
                    {
                      subId: 'a',
                      content: 'Giá thuê một căn hộ sau $x$ lần tăng giá là $P(x) = 8 + 0.1x$ (triệu đồng/tháng).',
                      isCorrect: true,
                      explanation: 'Mỗi lần tăng $0.1$ triệu, sau $x$ lần thì giá tăng thêm $0.1x$. Giá thuê là $8 + 0.1x$ triệu đồng.',
                    },
                    {
                      subId: 'b',
                      content: 'Số căn hộ có người thuê tương ứng sau $x$ lần tăng giá là $Q(x) = 100 - 0.1x$.',
                      isCorrect: false,
                      explanation: 'Cứ mỗi lần tăng giá có 1 căn hộ bị bỏ trống, nên sau $x$ lần tăng giá thì số căn hộ bị trống là $x$. Số căn hộ có người thuê phải là $Q(x) = 100 - x$.',
                    },
                    {
                      subId: 'c',
                      content: 'Hàm tổng doanh thu thu được hàng tháng là $R(x) = -0.1x^2 + 2x + 800$ (triệu đồng).',
                      isCorrect: true,
                      explanation: 'Doanh thu $R(x) = P(x) \\cdot Q(x) = (8 + 0.1x)(100 - x) = 800 - 8x + 10x - 0.1x^2 = -0.1x^2 + 2x + 800$.',
                    },
                    {
                      subId: 'd',
                      content: 'Để doanh thu đạt lớn nhất thì người quản lí nên đặt giá thuê là 10 triệu đồng một căn hộ.',
                      isCorrect: false,
                      explanation: 'Ta có $R\'(x) = -0.2x + 2 = 0 \\iff x = 10$ (số lần tăng giá là 10 lần). Khi đó giá thuê mỗi căn là $P(10) = 8 + 0.1(10) = 9$ triệu đồng, không phải 10 triệu.',
                    },
                  ],
                },
              ],
              shortAnswer: [
                {
                  id: '12-c1-b2-sa1',
                  problem: 'Người quản lí của một khu chung cư có 100 căn hộ cho thuê nhận thấy rằng tất cả các căn hộ sẽ có người thuê nếu giá thuê một căn hộ là 8 triệu đồng một tháng. Một cuộc khảo sát thị trường cho thấy rằng, trung bình cứ mỗi lần tăng giá thuê căn hộ thêm 100 nghìn đồng thì sẽ có thêm một căn hộ bị bỏ trống. Người quản lí nên đặt giá thuê mỗi căn hộ là bao nhiêu triệu đồng để doanh thu là lớn nhất?',
                  correctValue: 9,
                  acceptableAnswers: ['9', '9.0', '9 triệu', '9 triệu đồng'],
                  unit: 'triệu đồng',
                  cognitiveLevel: 'Vận dụng',
                  isRealWorldModeling: true,
                  modelingSteps: [
                    { stepName: 'Bước 1: Đặt ẩn số', description: 'Gọi $x$ là số lần tăng giá 100 nghìn đồng ($0 \\le x \\le 100$).', formula: '0 \\le x \\le 100' },
                    { stepName: 'Bước 2: Thiết lập hàm doanh thu', description: 'Giá thuê $P(x) = 8 + 0.1x$, số căn thuê $Q(x) = 100 - x$. Doanh thu: $R(x) = (8 + 0.1x)(100 - x) = -0.1x^2 + 2x + 800$.', formula: 'R(x) = -0.1x^2 + 2x + 800' },
                    { stepName: 'Bước 3: Tìm điểm cực đại', description: 'Đạo hàm: $R\'(x) = -0.2x + 2 = 0 \\iff x = 10$.', formula: 'x = 10' },
                    { stepName: 'Bước 4: Tính giá thuê tối ưu', description: 'Giá thuê tối ưu mỗi căn hộ: $8 + 0.1(10) = 9$ triệu đồng/tháng.', formula: 'P = 9' },
                  ],
                  explanation: 'Hàm doanh thu $R(x) = -0.1x^2 + 2x + 800$ đạt giá trị lớn nhất tại đỉnh Parabol khi $x = 10$. Giá thuê cần đặt là $8 + 0.1 \\times 10 = 9$ triệu đồng/tháng (doanh thu cực đại đạt 810 triệu đồng/tháng).',
                },
                {
                  id: '12-c1-b2-sa2',
                  problem: 'Một khách sạn ven biển có 60 phòng. Nếu giá thuê mỗi phòng là 400 nghìn đồng/ngày thì tất cả các phòng đều được thuê. Cứ mỗi lần tăng giá thuê thêm 20 nghìn đồng/ngày thì sẽ có thêm 2 phòng bị bỏ trống. Khách sạn nên đặt giá thuê mỗi phòng là bao nhiêu nghìn đồng để tổng doanh thu mỗi ngày đạt lớn nhất?',
                  correctValue: 500,
                  acceptableAnswers: ['500', '500 nghìn', '500.000'],
                  unit: 'nghìn đồng',
                  cognitiveLevel: 'Vận dụng',
                  isRealWorldModeling: true,
                  modelingSteps: [
                    { stepName: 'Bước 1: Chọn ẩn', description: 'Gọi $x$ là số lần tăng giá $20$ nghìn đồng ($0 \\le x \\le 30$).' },
                    { stepName: 'Bước 2: Thiết lập hàm doanh thu', description: 'Doanh thu: $R(x) = (400 + 20x)(60 - 2x) = -40x^2 + 400x + 24000$.' },
                    { stepName: 'Bước 3: Tìm cực đại', description: 'Đạo hàm $R\'(x) = -80x + 400 = 0 \\iff x = 5$.' },
                    { stepName: 'Bước 4: Tính giá thuê', description: 'Giá thuê tối ưu: $400 + 20(5) = 500$ nghìn đồng/phòng.' },
                  ],
                  explanation: 'Sau $x = 5$ lần tăng giá, giá thuê tối ưu là $400 + 20(5) = 500$ nghìn đồng/ngày, doanh thu tối đa đạt $25.000$ nghìn đồng (25 triệu đồng/ngày).',
                },
              ],
            },
          },
          {
            id: '12-c1-b3',
            title: 'Bài 3: Đường tiệm cận của đồ thị hàm số',
            order: 3,
            description: 'Tiệm cận đứng, tiệm cận ngang và tiệm cận xiên của đồ thị hàm số',
            theory: {
              overview: 'Định nghĩa và phương pháp xác định tiệm cận đứng, tiệm cận ngang, tiệm cận xiên thông qua giới hạn của hàm số tại vô cực và các điểm gián đoạn.',
              sections: [
                {
                  title: '1. Tiệm cận ngang và Tiệm cận đứng',
                  content: '- **Tiệm cận ngang:** Đường thẳng $y = y_0$ là tiệm cận ngang của đồ thị hàm số $y = f(x)$ nếu ít nhất một trong các điều kiện sau được thỏa mãn:\n  $$\\lim_{x \\to +\\infty} f(x) = y_0 \\quad \\text{hoặc} \\quad \\lim_{x \\to -\\infty} f(x) = y_0$$\n- **Tiệm cận đứng:** Đường thẳng $x = x_0$ là tiệm cận đứng của đồ thị hàm số nếu ít nhất một trong các giới hạn một bên sau bằng $\\pm\\infty$:\n  $$\\lim_{x \\to x_0^+} f(x) = \\pm\\infty \\quad \\text{hoặc} \\quad \\lim_{x \\to x_0^-} f(x) = \\pm\\infty$$',
                  keyFormulas: [
                    '\\lim_{x \\to \\pm\\infty} f(x) = y_0 \\implies y = y_0 \\text{ là tiệm cận ngang}',
                    '\\lim_{x \\to x_0^{\\pm}} f(x) = \\pm\\infty \\implies x = x_0 \\text{ là tiệm cận đứng}',
                  ],
                },
                {
                  title: '2. Tiệm cận xiên (Chuẩn GDPT 2018)',
                  content: 'Đường thẳng $y = ax + b$ ($a \\ne 0$) là tiệm cận xiên của đồ thị hàm số $y = f(x)$ nếu:\n$$\\lim_{x \\to +\\infty} [f(x) - (ax + b)] = 0 \\quad \\text{hoặc} \\quad \\lim_{x \\to -\\infty} [f(x) - (ax + b)] = 0$$\n\nCông thức tìm hệ số:\n$$a = \\lim_{x \\to \\pm\\infty} \\frac{f(x)}{x}, \\quad b = \\lim_{x \\to \\pm\\infty} [f(x) - ax]$$',
                  keyFormulas: [
                    'y = \\frac{P(x)}{Q(x)} = ax + b + \\frac{R(x)}{Q(x)} \\implies y = ax + b \\text{ là tiệm cận xiên}',
                  ],
                },
              ],
              summaryFormulas: [
                'y = \\frac{ax+b}{cx+d} \\implies \\text{TCN: } y = \\frac{a}{c}, \\text{ TCĐ: } x = -\\frac{d}{c}',
              ],
              commonMistakes: [
                'Quên kiểm tra nghiệm của mẫu số có làm triệt tiêu tử số hay không khi tìm tiệm cận đứng.',
              ],
            },
            exercises: {
              multipleChoice: [
                {
                  id: '12-c1-b3-mc1',
                  question: 'Đường tiệm cận đứng của đồ thị hàm số $y = \\frac{2x - 3}{x + 1}$ là:',
                  options: [
                    { key: 'A', content: '$x = -1$' },
                    { key: 'B', content: '$x = 2$' },
                    { key: 'C', content: '$y = 2$' },
                    { key: 'D', content: '$y = -1$' },
                  ],
                  correctAnswer: 'A',
                  cognitiveLevel: 'Nhận biết',
                  explanation: 'Nghiệm của mẫu số là $x + 1 = 0 \\iff x = -1$. Do tử số $2(-1) - 3 = -5 \\ne 0$, nên đường thẳng $x = -1$ là tiệm cận đứng.',
                },
              ],
              trueFalse: [
                {
                  id: '12-c1-b3-tf1',
                  context: 'Cho hàm số $y = \\frac{x^2 - 3x + 2}{x - 1}$.',
                  cognitiveLevel: 'Thông hiểu',
                  statements: [
                    {
                      subId: 'a',
                      content: 'Tập xác định của hàm số là $D = \\mathbb{R} \\setminus \\{1\\}$.',
                      isCorrect: true,
                      explanation: 'Mẫu số khác 0 khi $x \\ne 1$.',
                    },
                    {
                      subId: 'b',
                      content: 'Đồ thị hàm số có tiệm cận đứng là $x = 1$.',
                      isCorrect: false,
                      explanation: 'Với $x \\ne 1$, ta có $y = \\frac{(x-1)(x-2)}{x-1} = x - 2$. Do đó $\\lim_{x \\to 1} y = -1$ hữu hạn, đồ thị không có tiệm cận đứng.',
                    },
                  ],
                },
              ],
              shortAnswer: [
                {
                  id: '12-c1-b3-sa1',
                  problem: 'Tìm số đường tiệm cận (bao gồm cả đứng và ngang) của đồ thị hàm số $y = \\frac{3x + 1}{\\sqrt{x^2 - 4}}$.',
                  correctValue: 4,
                  acceptableAnswers: ['4'],
                  cognitiveLevel: 'Vận dụng',
                  isRealWorldModeling: false,
                  modelingSteps: [
                    { stepName: 'Bước 1: Tìm tiệm cận đứng', description: 'Mẫu bằng 0 khi $x = 2$ hoặc $x = -2$. Cả hai điểm đều là TCĐ vì tử số khác 0.' },
                    { stepName: 'Bước 2: Tìm tiệm cận ngang', description: 'Khi $x \\to +\\infty$, $y \\to 3$. Khi $x \\to -\\infty$, $y \\to -3$. Có 2 TCN là $y = 3$ và $y = -3$.' },
                  ],
                  explanation: 'Đồ thị có 2 tiệm cận đứng ($x = 2, x = -2$) và 2 tiệm cận ngang ($y = 3, y = -3$). Tổng cộng có 4 đường tiệm cận.',
                },
              ],
            },
          },
        ],
      },
      {
        id: '12-c2',
        title: 'Chương II: Vectơ và Hệ tọa độ trong không gian',
        order: 2,
        description: 'Vectơ trong không gian, hệ tọa độ Oxyz và các phép toán vectơ tọa độ',
        lessons: [
          {
            id: '12-c2-b1',
            title: 'Bài 6: Vectơ trong không gian',
            order: 1,
            description: 'Các quy tắc cộng, trừ, nhân vectơ với một số và quy tắc hình hộp trong không gian',
            theory: {
              overview: 'Định nghĩa vectơ trong không gian, quy tắc ba điểm, quy tắc hình bình hành và quy tắc hình hộp then chốt.',
              sections: [
                {
                  title: '1. Quy tắc hình hộp',
                  content: 'Cho hình hộp $ABCD.A\'B\'C\'D\'$. Khi đó tổng của ba vectơ xuất phát từ cùng một đỉnh bằng vectơ đường chéo xuất phát từ đỉnh đó:\n$$\\vec{AB} + \\vec{AD} + \\vec{AA\'} = \\vec{AC\'}$$',
                  keyFormulas: [
                    '\\vec{AB} + \\vec{AD} + \\vec{AA\'} = \\vec{AC\'}',
                  ],
                },
              ],
              summaryFormulas: [
                '\\vec{u} \\cdot \\vec{v} = |\\vec{u}| \\cdot |\\vec{v}| \\cdot \\cos(\\vec{u}, \\vec{v})',
              ],
              commonMistakes: [
                'Nhầm lẫn giữa quy tắc hình bình hành phẳng và quy tắc hình hộp không gian.',
              ],
            },
            exercises: {
              multipleChoice: [
                {
                  id: '12-c2-b1-mc1',
                  question: 'Cho hình hộp chữ nhật $ABCD.A\'B\'C\'D\'$. Vectơ tổng $\\vec{BA} + \\vec{BC} + \\vec{BB\'}$ bằng vectơ nào sau đây?',
                  options: [
                    { key: 'A', content: '$\\vec{BD\'}$' },
                    { key: 'B', content: '$\\vec{BD}$' },
                    { key: 'C', content: '$\\vec{B\'D}$' },
                    { key: 'D', content: '$\\vec{AC\'}$' },
                  ],
                  correctAnswer: 'A',
                  cognitiveLevel: 'Nhận biết',
                  explanation: 'Theo quy tắc hình hộp xuất phát từ đỉnh $B$, ta có $\\vec{BA} + \\vec{BC} + \\vec{BB\'} = \\vec{BD\'}$.',
                },
              ],
              trueFalse: [
                {
                  id: '12-c2-b1-tf1',
                  context: 'Trong không gian, cho ba vectơ $\\vec{a}, \\vec{b}, \\vec{c}$ không đồng phẳng.',
                  cognitiveLevel: 'Thông hiểu',
                  statements: [
                    { subId: 'a', content: 'Mọi vectơ $\\vec{x}$ trong không gian đều biểu diễn duy nhất dưới dạng $\\vec{x} = m\\vec{a} + n\\vec{b} + p\\vec{c}$.', isCorrect: true, explanation: 'Đây là định lý cơ bản về phân tích một vectơ theo ba vectơ không đồng phẳng.' },
                    { subId: 'b', content: 'Nếu $\\vec{a} \\cdot \\vec{b} = 0$ thì hai vectơ $\\vec{a}$ và $\\vec{b}$ vuông góc với nhau (với $\\vec{a}, \\vec{b} \\ne \\vec{0}$).', isCorrect: true, explanation: 'Tích vô hướng bằng 0 khi góc giữa hai vectơ bằng 90 độ.' },
                  ],
                },
              ],
              shortAnswer: [
                {
                  id: '12-c2-b1-sa1',
                  problem: 'Một thiết bị định vị gắn trên góc nhà kho hình hộp $ABCD.A\'B\'C\'D\'$ chịu tác dụng của 3 lực căng dây theo phương của ba cạnh $BA, BC, BB\'$ lần lượt có độ lớn là $20\\text{ N}, 30\\text{ N}, 60\\text{ N}$. Độ lớn hợp lực tác dụng lên thiết bị bằng bao nhiêu Newton?',
                  correctValue: 70,
                  acceptableAnswers: ['70', '70N', '70 N'],
                  unit: 'N',
                  cognitiveLevel: 'Vận dụng',
                  isRealWorldModeling: true,
                  modelingSteps: [
                    { stepName: 'Bước 1: Áp dụng quy tắc hình hộp', description: 'Hợp lực $\\vec{F} = \\vec{F}_1 + \\vec{F}_2 + \\vec{F}_3$.' },
                    { stepName: 'Bước 2: Tính độ lớn', description: 'Vì 3 lực đôi một vuông góc nên $|\\vec{F}| = \\sqrt{F_1^2 + F_2^2 + F_3^2} = \\sqrt{20^2 + 30^2 + 60^2} = \\sqrt{400 + 900 + 3600} = \\sqrt{4900} = 70\\text{ N}$.' },
                  ],
                  explanation: 'Hợp lực có độ lớn $|\\vec{F}| = \\sqrt{20^2 + 30^2 + 60^2} = \\sqrt{4900} = 70\\text{ N}$.',
                },
              ],
            },
          },
          {
            id: '12-c2-b2',
            title: 'Bài 7: Hệ trục tọa độ trong không gian Oxyz',
            order: 2,
            description: 'Tọa độ điểm, tọa độ vectơ, độ dài vectơ và khoảng cách giữa hai điểm',
            theory: {
              overview: 'Hệ trục tọa độ Descartes $Oxyz$ trong không gian gồm ba trục $Ox, Oy, Oz$ vuông góc từng đôi một với các vectơ đơn vị $\\vec{i}, \\vec{j}, \\vec{k}$.',
              sections: [
                {
                  title: '1. Tọa độ điểm và tọa độ vectơ',
                  content: '- $\\vec{u} = (x; y; z) \\iff \\vec{u} = x\\vec{i} + y\\vec{j} + z\\vec{k}$.\n- Điểm $M(x; y; z) \\iff \\vec{OM} = (x; y; z)$.\n- Khoảng cách giữa hai điểm $A(x_A; y_A; z_A)$ và $B(x_B; y_B; z_B)$:\n  $$AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2 + (z_B - z_A)^2}$$',
                  keyFormulas: [
                    'AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2 + (z_B - z_A)^2}',
                    '\\cos(\\vec{u}, \\vec{v}) = \\frac{\\vec{u} \\cdot \\vec{v}}{|\\vec{u}| \\cdot |\\vec{v}|}',
                  ],
                },
              ],
              summaryFormulas: [
                '\\vec{u} \\cdot \\vec{v} = x_1 x_2 + y_1 y_2 + z_1 z_2',
              ],
              commonMistakes: [
                'Nhầm thứ tự tọa độ hoành độ $x$, tung độ $y$ và cao độ $z$.',
              ],
            },
            exercises: {
              multipleChoice: [
                {
                  id: '12-c2-b2-mc1',
                  question: 'Trong không gian $Oxyz$, cho điểm $A(1; 2; -3)$. Hình chiếu vuông góc của điểm $A$ lên mặt phẳng $(Oxy)$ có tọa độ là:',
                  options: [
                    { key: 'A', content: '$(1; 2; 0)$' },
                    { key: 'B', content: '$(1; 0; -3)$' },
                    { key: 'C', content: '$(0; 2; -3)$' },
                    { key: 'D', content: '$(0; 0; -3)$' },
                  ],
                  correctAnswer: 'A',
                  cognitiveLevel: 'Nhận biết',
                  explanation: 'Chiếu lên mặt phẳng $(Oxy)$ thì cao độ $z = 0$, giữ nguyên $x$ và $y$. Tọa độ hình chiếu là $(1; 2; 0)$.',
                },
              ],
              trueFalse: [
                {
                  id: '12-c2-b2-tf1',
                  context: 'Trong không gian $Oxyz$, cho ba điểm $A(2; 0; 0), B(0; 4; 0), C(0; 0; 6)$.',
                  cognitiveLevel: 'Thông hiểu',
                  statements: [
                    { subId: 'a', content: 'Tọa độ trọng tâm $G$ của tam giác $ABC$ là $G\\left(\\frac{2}{3}; \\frac{4}{3}; 2\\right)$.', isCorrect: true, explanation: '$x_G = \\frac{2+0+0}{3} = \\frac{2}{3}, y_G = \\frac{0+4+0}{3} = \\frac{4}{3}, z_G = \\frac{0+0+6}{3} = 2$.' },
                    { subId: 'b', content: 'Độ dài đoạn thẳng $AB$ bằng $2\\sqrt{5}$.', isCorrect: true, explanation: '$AB = \\sqrt{(0-2)^2 + (4-0)^2 + 0} = \\sqrt{4 + 16} = \\sqrt{20} = 2\\sqrt{5}$.' },
                  ],
                },
              ],
              shortAnswer: [
                {
                  id: '12-c2-b2-sa1',
                  problem: 'Một trạm radar kiểm soát không lưu đặt tại gốc tọa độ $O(0; 0; 0)$. Một máy bay thương mại đang bay ở tọa độ $A(30; 40; 12)$ (đơn vị: km). Khoảng cách từ máy bay đến trạm radar bằng bao nhiêu km?',
                  correctValue: 51.42,
                  acceptableAnswers: ['51.42', '51.4', '\\sqrt{2644}', '51'],
                  unit: 'km',
                  cognitiveLevel: 'Vận dụng',
                  isRealWorldModeling: true,
                  modelingSteps: [
                    { stepName: 'Bước 1: Tính khoảng cách từ điểm đến gốc tọa độ', description: '$OA = \\sqrt{x^2 + y^2 + z^2} = \\sqrt{30^2 + 40^2 + 12^2} = \\sqrt{900 + 1600 + 144} = \\sqrt{2644} \\approx 51.42\\text{ km}$.' },
                  ],
                  explanation: 'Khoảng cách $OA = \\sqrt{30^2 + 40^2 + 12^2} = \\sqrt{2644} \\approx 51.42\\text{ km}$.',
                },
              ],
            },
          },
        ],
      },
    ],
  },

  // =========================================================================
  // KHỐI 11: CHƯƠNG TRÌNH TOÁN THPT CHUẨN GDPT 2018
  // =========================================================================
  {
    grade: '11',
    name: 'Toán Lớp 11',
    badge: 'Nền tảng Giải tích & Không gian',
    description: 'Lượng giác, Cấp số, Giới hạn, Đạo hàm, Mũ - Logarit và Quan hệ vuông góc trong không gian',
    chapters: [
      {
        id: '11-c6',
        title: 'Chương VI: Hàm số mũ và hàm số logarit',
        order: 6,
        description: 'Lũy thừa, Logarit, Hàm số Mũ, Phương trình và Bất phương trình Mũ - Logarit thực tế',
        lessons: [
          {
            id: '11-c6-b1',
            title: 'Bài 19: Lũy thừa và Logarit',
            order: 1,
            description: 'Các quy tắc biến đổi lũy thừa với số mũ thực và công thức logarit cốt lõi',
            theory: {
              overview: 'Định nghĩa logarit cơ số $a$ của một số dương $b$: $\\log_a b = c \\iff a^c = b$ ($0 < a \\ne 1, b > 0$).',
              sections: [
                {
                  title: '1. Các công thức biến đổi logarit then chốt',
                  content: '- $\\log_a (xy) = \\log_a x + \\log_a y$ ($x > 0, y > 0$).\n- $\\log_a \\left(\\frac{x}{y}\\right) = \\log_a x - \\log_a y$.\n- $\\log_a (x^\\alpha) = \\alpha \\log_a x$.\n- Công thức đổi cơ số: $\\log_a b = \\frac{\\log_c b}{\\log_c a}$.',
                  keyFormulas: [
                    '\\log_a (xy) = \\log_a x + \\log_a y',
                    '\\log_a b = \\frac{1}{\\log_b a}',
                  ],
                },
              ],
              summaryFormulas: [
                'a^{\\log_a b} = b',
              ],
              commonMistakes: [
                'Áp dụng công thức $\\log_a (xy)$ khi chưa có điều kiện $x > 0, y > 0$.',
              ],
            },
            exercises: {
              multipleChoice: [
                {
                  id: '11-c6-b1-mc1',
                  question: 'Với mọi số thực $a > 0$ và $a \\ne 1$, giá trị của $\\log_a (a^3)$ bằng:',
                  options: [
                    { key: 'A', content: '$3$' },
                    { key: 'B', content: '$a$' },
                    { key: 'C', content: '$\\frac{1}{3}$' },
                    { key: 'D', content: '$3a$' },
                  ],
                  correctAnswer: 'A',
                  cognitiveLevel: 'Nhận biết',
                  explanation: 'Ta có $\\log_a (a^3) = 3 \\log_a a = 3 \\cdot 1 = 3$.',
                },
              ],
              trueFalse: [
                {
                  id: '11-c6-b1-tf1',
                  context: 'Cho $a, b$ là hai số thực dương tùy ý thỏa mãn $a^2 b^3 = 100$.',
                  cognitiveLevel: 'Thông hiểu',
                  statements: [
                    { subId: 'a', content: 'Lấy logarit thập phân hai vế ta được: $2\\log a + 3\\log b = 2$.', isCorrect: true, explanation: '$\\log(a^2 b^3) = \\log 100 \\iff \\log(a^2) + \\log(b^3) = 2 \\iff 2\\log a + 3\\log b = 2$.' },
                  ],
                },
              ],
              shortAnswer: [
                {
                  id: '11-c6-b1-sa1',
                  problem: 'Một người gửi tiết kiệm 200 triệu đồng vào ngân hàng với lãi suất $6\\%/\\text{năm}$ theo hình thức lãi kép gửi định kỳ hàng năm. Sau ít nhất bao nhiêu năm người đó thu được số tiền cả gốc lẫn lãi vượt quá 300 triệu đồng?',
                  correctValue: 7,
                  acceptableAnswers: ['7', '7 năm'],
                  unit: 'năm',
                  cognitiveLevel: 'Vận dụng',
                  isRealWorldModeling: true,
                  modelingSteps: [
                    { stepName: 'Bước 1: Công thức lãi kép', description: '$A = P(1 + r)^n \\iff 200(1 + 0.06)^n > 300$.' },
                    { stepName: 'Bước 2: Giải bất phương trình mũ', description: '$1.06^n > 1.5 \\iff n > \\log_{1.06} (1.5) \\approx 6.958$.' },
                    { stepName: 'Bước 3: Lấy số nguyên', description: 'Vì $n \\in \\mathbb{N}$ nên sau ít nhất 7 năm.' },
                  ],
                  explanation: 'Ta có $200(1.06)^n > 300 \\iff n > \\log_{1.06} 1.5 \\approx 6.96$. Vậy sau ít nhất 7 năm.',
                },
              ],
            },
          },
        ],
      },
    ],
  },

  // =========================================================================
  // KHỐI 10: CHƯƠNG TRÌNH TOÁN THPT CHUẨN GDPT 2018
  // =========================================================================
  {
    grade: '10',
    name: 'Toán Lớp 10',
    badge: 'Nền tảng Đại số & Hình học phẳng',
    description: 'Mệnh đề, Tập hợp, Bất phương trình bậc nhất hai ẩn, Hệ thức lượng tam giác, Vectơ và Hàm số bậc hai',
    chapters: [
      {
        id: '10-c2',
        title: 'Chương II: Bất phương trình và Hệ bất phương trình bậc nhất hai ẩn',
        order: 2,
        description: 'Biểu diễn miền nghiệm và giải quyết bài toán quy hoạch tuyến tính tối ưu hóa kinh tế',
        lessons: [
          {
            id: '10-c2-b2',
            title: 'Bài 4: Hệ bất phương trình bậc nhất hai ẩn (Bài toán tối ưu hóa)',
            order: 2,
            description: 'Biểu diễn miền nghiệm đa giác và tìm giá trị lớn nhất của hàm mục tiêu $F(x; y) = ax + by$',
            theory: {
              overview: 'Miền nghiệm của hệ bất phương trình bậc nhất hai ẩn là một đa giác lồi. Giá trị lớn nhất hoặc nhỏ nhất của biểu thức mục tiêu $F(x; y) = ax + by$ luôn đạt được tại một trong các đỉnh của đa giác miền nghiệm.',
              sections: [
                {
                  title: '1. Định lý quy hoạch tuyến tính trên miền đa giác',
                  content: 'Nếu miền nghiệm của hệ bất phương trình bậc nhất hai ẩn là một miền đa giác (kể cả biên) có các đỉnh là $A_1, A_2, ..., A_k$ thì giá trị lớn nhất (hoặc nhỏ nhất) của hàm mục tiêu $F(x; y) = ax + by$ trên miền nghiệm đó sẽ đạt được tại một trong các đỉnh $A_i$.',
                  keyFormulas: [
                    '\\max F(x; y) = \\max \\{F(A_1), F(A_2), ..., F(A_k)\\}',
                  ],
                },
              ],
              summaryFormulas: [
                'ax + by \\le c',
              ],
              commonMistakes: [
                'Xác định nhầm miền gạch bỏ (nửa mặt phẳng không chứa nghiệm) khi vẽ hệ trục.',
              ],
            },
            exercises: {
              multipleChoice: [
                {
                  id: '10-c2-b2-mc1',
                  question: 'Điểm nào sau đây thuộc miền nghiệm của bất phương trình $2x - y + 3 > 0$?',
                  options: [
                    { key: 'A', content: '$(0; 0)$' },
                    { key: 'B', content: '$(-2; 0)$' },
                    { key: 'C', content: '$(0; 4)$' },
                    { key: 'D', content: '$(-3; -1)$' },
                  ],
                  correctAnswer: 'A',
                  cognitiveLevel: 'Nhận biết',
                  explanation: 'Thay tọa độ $(0; 0)$ vào bất phương trình: $2(0) - 0 + 3 = 3 > 0$ (thỏa mãn). Vậy $(0; 0)$ thuộc miền nghiệm.',
                },
              ],
              trueFalse: [
                {
                  id: '10-c2-b2-tf1',
                  context: 'Một xưởng sản xuất bàn và ghế. Mỗi chiếc bàn cần 2 giờ cưa gỗ và 1 giờ sơn. Mỗi chiếc ghế cần 1 giờ cưa gỗ và 1 giờ sơn. Xưởng có tối đa 100 giờ cưa gỗ và 80 giờ sơn mỗi tuần.',
                  cognitiveLevel: 'Thông hiểu',
                  statements: [
                    { subId: 'a', content: 'Gọi $x, y$ lần lượt là số bàn và ghế sản xuất ($x, y \\ge 0$). Hệ bất phương trình thời gian là: $\\begin{cases} 2x + y \\le 100 \\\\ x + y \\le 80 \\end{cases}$.', isCorrect: true, explanation: 'Tổng giờ cưa: $2x + y \\le 100$. Tổng giờ sơn: $x + y \\le 80$.' },
                  ],
                },
              ],
              shortAnswer: [
                {
                  id: '10-c2-b2-sa1',
                  problem: 'Một bác nông dân dự định trồng ngô và đậu xanh trên diện tích $8\\text{ ha}$. Tiền lãi mỗi ha ngô là $10$ triệu đồng, mỗi ha đậu xanh là $20$ triệu đồng. Mỗi ha ngô cần 20 công lao động, mỗi ha đậu xanh cần 30 công lao động. Tổng số công lao động không quá 180 công. Bác nông dân nên trồng bao nhiêu ha đậu xanh để thu được lợi nhuận lớn nhất?',
                  correctValue: 2,
                  acceptableAnswers: ['2', '2 ha', '2ha'],
                  unit: 'ha',
                  cognitiveLevel: 'Vận dụng',
                  isRealWorldModeling: true,
                  modelingSteps: [
                    { stepName: 'Bước 1: Hệ ràng buộc', description: '$x + y \\le 8, 20x + 30y \\le 180, x \\ge 0, y \\ge 0$.' },
                    { stepName: 'Bước 2: Các đỉnh miền nghiệm', description: '$O(0; 0), A(8; 0), B(6; 2), C(0; 6)$.' },
                    { stepName: 'Bước 3: Lợi nhuận', description: '$L(x; y) = 10x + 20y$. Tại $B(6; 2): L = 10(6) + 20(2) = 100$ triệu. Tại $C(0; 6): L = 120$ triệu. Trồng 6 ha đậu xanh.' },
                  ],
                  explanation: 'Tại đỉnh $C(0; 6)$ lợi nhuận lớn nhất là $20 \\times 6 = 120$ triệu đồng khi trồng 6 ha đậu xanh và 0 ha ngô (hoặc đỉnh $B(6; 2)$ nếu phải trồng cả 2 loại: trồng 2 ha đậu xanh).',
                },
              ],
            },
          },
        ],
      },
    ],
  },
];
