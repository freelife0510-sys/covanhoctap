import { GradeCurriculum } from '../types/curriculum.ts';

/**
 * MATHDIAGNOSTIC AI - GDPT 2018 CURRICULUM DATA
 * Bộ dữ liệu chương trình chuẩn DUY NHẤT: SÁCH GIÁO KHOA KẾT NỐI TRI THỨC VỚI CUỘC SỐNG
 * ĐẦY ĐỦ 100% CÁC CHƯƠNG CHO KHỐI 10, KHỐI 11, KHỐI 12 (Tổng cộng 24 chương)
 * Mỗi bài học đều có đầy đủ 3 định dạng câu hỏi chuẩn Bộ GD&ĐT:
 * 1. Trắc nghiệm 4 lựa chọn (Nhận biết, Thông hiểu)
 * 2. Câu hỏi Đúng / Sai 4 ý a, b, c, d (Nhận biết, Thông hiểu, Vận dụng)
 * 3. Trả lời ngắn (Vận dụng, Mô hình hóa thực tiễn có các bước giải)
 */
export const HIGH_SCHOOL_CURRICULUM: GradeCurriculum[] = [
  {
    "grade": "12",
    "name": "Toán Lớp 12",
    "badge": "Trọng tâm Kỳ thi Tốt nghiệp THPT",
    "description": "Chương trình Giải tích, Hình học không gian Oxyz và Xác suất có điều kiện chuẩn SGK Kết nối tri thức với cuộc sống (GDPT 2018)",
    "chapters": [
      {
        "id": "12-c1",
        "title": "Chương I: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số",
        "order": 1,
        "description": "Tính đơn điệu, cực trị, giá trị lớn nhất/nhỏ nhất, đường tiệm cận, khảo sát hàm số và bài toán tối ưu hóa thực tiễn",
        "lessons": [
          {
            "id": "12-c1-b1",
            "title": "Bài 1: Tính đơn điệu và cực trị của hàm số",
            "order": 1,
            "description": "Mối liên hệ giữa dấu đạo hàm và tính đồng biến, nghịch biến, các điểm cực trị",
            "theory": {
              "overview": "Nắm vững mối liên hệ giữa dấu của đạo hàm cấp một $f'(x)$ với tính đồng biến, nghịch biến và các điểm cực trị của hàm số $y = f(x)$ trên một khoảng hoặc một tập hợp.",
              "sections": [
                {
                  "title": "1. Tính đơn điệu của hàm số",
                  "content": "Cho hàm số $y = f(x)$ có đạo hàm trên khoảng $K$.\n\n- Nếu $f'(x) > 0, \\forall x \\in K$ thì hàm số đồng biến trên $K$.\n- Nếu $f'(x) < 0, \\forall x \\in K$ thì hàm số nghịch biến trên $K$.\n- Định lý mở rộng: Nếu $f'(x) \\ge 0$ (hoặc $\\le 0$) và dấu bằng chỉ xảy ra tại hữu hạn điểm thì hàm số vẫn đồng biến (hoặc nghịch biến) trên $K$.",
                  "keyFormulas": [
                    "f'(x) > 0, \\forall x \\in K \\implies f(x) \\text{ đồng biến trên } K",
                    "f'(x) < 0, \\forall x \\in K \\implies f(x) \\text{ nghịch biến trên } K"
                  ],
                  "importantNotes": [
                    "Khoảng đồng biến/nghịch biến phải viết rời nhau bằng từ \"và\" hoặc chấm phẩy, TUYỆT ĐỐI không dùng ký hiệu hợp $\\cup$."
                  ]
                },
                {
                  "title": "2. Cực trị của hàm số",
                  "content": "Dấu hiệu đổi dấu của đạo hàm khi qua điểm $x_0$:\n- Đổi dấu từ $(+)$ sang $(-)$ khi qua $x_0$: $x_0$ là điểm cực đại.\n- Đổi dấu từ $(-)$ sang $(+)$ khi qua $x_0$: $x_0$ là điểm cực tiểu.",
                  "keyFormulas": [
                    "f'(x) \\text{ đổi dấu } (+) \\to (-) \\implies x_0 \\text{ là điểm cực đại}",
                    "f'(x) \\text{ đổi dấu } (-) \\to (+) \\implies x_0 \\text{ là điểm cực tiểu}"
                  ]
                }
              ],
              "summaryFormulas": [
                "y = ax^3 + bx^2 + cx + d \\implies y' = 3ax^2 + 2bx + c",
                "y = \\frac{ax+b}{cx+d} \\implies y' = \\frac{ad-bc}{(cx+d)^2}"
              ],
              "commonMistakes": [
                "Nhầm lẫn giữa điểm cực trị của hàm số ($x$) và điểm cực trị của đồ thị hàm số ($M(x; y)$)."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "12-c1-b1-mc1",
                  "question": "Cho hàm số bậc ba $y = x^3 - 3x^2 + 2$. Điểm cực đại của hàm số đã cho là:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$x = 0$"
                    },
                    {
                      "key": "B",
                      "content": "$x = 2$"
                    },
                    {
                      "key": "C",
                      "content": "$y = 2$"
                    },
                    {
                      "key": "D",
                      "content": "$M(0; 2)$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Thông hiểu",
                  "explanation": "Ta có $y' = 3x^2 - 6x = 3x(x - 2)$. Cho $y' = 0 \\iff x = 0$ hoặc $x = 2$. Bảng xét dấu cho thấy $y'$ đổi dấu từ $+$ sang $-$ khi qua $x = 0$, do đó $x = 0$ là điểm cực đại."
                }
              ],
              "trueFalse": [
                {
                  "id": "12-c1-b1-tf1",
                  "context": "Cho hàm số $f(x) = \\frac{1}{3}x^3 - 2x^2 + 3x + 1$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Đạo hàm của hàm số là $f'(x) = x^2 - 4x + 3$.",
                      "isCorrect": true,
                      "explanation": "Đạo hàm đúng theo quy tắc lũy thừa."
                    },
                    {
                      "subId": "b",
                      "content": "Phương trình $f'(x) = 0$ có hai nghiệm phân biệt $x = 1$ và $x = 3$.",
                      "isCorrect": true,
                      "explanation": "$x^2 - 4x + 3 = 0 \\iff x = 1$ hoặc $x = 3$."
                    },
                    {
                      "subId": "c",
                      "content": "Hàm số đã cho nghịch biến trên khoảng $(1; 3)$.",
                      "isCorrect": true,
                      "explanation": "Trong khoảng $(1; 3)$, tam thức bậc hai $x^2 - 4x + 3 < 0$ nên $f'(x) < 0$."
                    },
                    {
                      "subId": "d",
                      "content": "Giá trị cực tiểu của hàm số bằng $3$.",
                      "isCorrect": false,
                      "explanation": "Điểm cực tiểu là $x = 3$, giá trị cực tiểu là $f(3) = 1$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "12-c1-b1-sa1",
                  "problem": "Cho hàm số $y = x^3 - 3mx^2 + 3(m^2 - 1)x + 2$. Tìm tất cả các giá trị nguyên của tham số $m \\in [-5; 5]$ để hàm số có hai điểm cực trị nằm về hai phía của trục tung $Oy$.",
                  "correctValue": 1,
                  "acceptableAnswers": [
                    "1",
                    "m=0",
                    "1 giá trị"
                  ],
                  "unit": "giá trị",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": false,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Tính đạo hàm",
                      "description": "$y' = 3[x^2 - 2mx + (m^2 - 1)]$."
                    },
                    {
                      "stepName": "Bước 2: Điều kiện cực trị trái dấu",
                      "description": "$x_1 x_2 < 0 \\iff m^2 - 1 < 0 \\iff -1 < m < 1$."
                    },
                    {
                      "stepName": "Bước 3: Đếm số nguyên",
                      "description": "Vì $m \\in \\mathbb{Z}$ nên $m = 0$. Có 1 giá trị duy nhất."
                    }
                  ],
                  "explanation": "Hai nghiệm của $y' = 0$ trái dấu khi $m^2 - 1 < 0 \\iff -1 < m < 1$. Do $m$ nguyên nên $m = 0$."
                }
              ]
            }
          },
          {
            "id": "12-c1-b2",
            "title": "Bài 2 & 5: GTLN, GTNN và bài toán tối ưu hóa thực tiễn",
            "order": 2,
            "description": "Khảo sát cực trị ứng dụng tối ưu hóa doanh thu, chi phí, lợi nhuận",
            "theory": {
              "overview": "Phương pháp tìm GTLN, GTNN trên đoạn và ứng dụng giải các bài toán tối ưu hóa kinh tế thực tiễn chuẩn GDPT 2018.",
              "sections": [
                {
                  "title": "1. Bài toán tối ưu hóa kinh tế",
                  "content": "Hàm doanh thu: $R(x) = P(x) \\cdot Q(x)$.\nHàm lợi nhuận: $L(x) = R(x) - C(x)$. Tìm cực trị bằng cách giải $L'(x) = 0$ và lập bảng biến thiên.",
                  "keyFormulas": [
                    "R(x) = P(x) \\cdot Q(x)",
                    "L(x) = R(x) - C(x)"
                  ]
                }
              ],
              "summaryFormulas": [
                "\\max_{[a; b]} f(x) = \\max \\{f(a), f(b), f(x_i)\\}"
              ],
              "commonMistakes": [
                "Quên đối chiếu điều kiện của ẩn số trong bài toán thực tế."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "12-c1-b2-mc1",
                  "question": "Giá trị lớn nhất của hàm số $f(x) = x^4 - 2x^2 + 3$ trên đoạn $[0; 2]$ bằng:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$11$"
                    },
                    {
                      "key": "B",
                      "content": "$3$"
                    },
                    {
                      "key": "C",
                      "content": "$2$"
                    },
                    {
                      "key": "D",
                      "content": "$19$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Thông hiểu",
                  "explanation": "$f(0) = 3, f(1) = 2, f(2) = 11 \\implies \\max = 11$."
                }
              ],
              "trueFalse": [
                {
                  "id": "12-c1-b2-tf1",
                  "context": "Một công ty sản xuất sản phẩm $A$. Chi phí sản xuất $x$ sản phẩm mỗi ngày là $C(x) = x^2 + 20x + 100$ (nghìn đồng). Giá bán mỗi sản phẩm là $P(x) = 100 - x$ (nghìn đồng).",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Hàm doanh thu là $R(x) = 100x - x^2$.",
                      "isCorrect": true,
                      "explanation": "$R(x) = x(100 - x) = 100x - x^2$."
                    },
                    {
                      "subId": "b",
                      "content": "Hàm lợi nhuận là $L(x) = -2x^2 + 80x - 100$.",
                      "isCorrect": true,
                      "explanation": "$L(x) = R(x) - C(x) = -2x^2 + 80x - 100$."
                    },
                    {
                      "subId": "c",
                      "content": "Để lợi nhuận lớn nhất thì công ty nên sản xuất $20$ sản phẩm.",
                      "isCorrect": true,
                      "explanation": "$L'(x) = -4x + 80 = 0 \\iff x = 20$."
                    },
                    {
                      "subId": "d",
                      "content": "Lợi nhuận lớn nhất đạt $800$ nghìn đồng.",
                      "isCorrect": false,
                      "explanation": "$L(20) = -2(400) + 80(20) - 100 = 700$ nghìn đồng."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "12-c1-b2-sa1",
                  "problem": "Một chung cư mini có 100 căn hộ cho thuê. Nếu giá thuê mỗi căn là 8 triệu đồng/tháng thì tất cả 100 căn hộ đều được thuê hết. Cứ mỗi lần tăng giá thêm 100.000 đồng/tháng thì sẽ có thêm 1 căn hộ bị bỏ trống. Người quản lí nên đặt giá thuê mỗi căn hộ là bao nhiêu triệu đồng/tháng để tổng số tiền cho thuê thu về mỗi tháng là lớn nhất?",
                  "correctValue": 9,
                  "acceptableAnswers": [
                    "9",
                    "9 triệu",
                    "9.0"
                  ],
                  "unit": "triệu đồng/tháng",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": true,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Chọn ẩn",
                      "description": "Gọi $x$ là số lần tăng giá $100.000$ đồng ($x \\in [0; 100]$). Giá thuê $8 + 0{,}1x$, số căn thuê $100 - x$."
                    },
                    {
                      "stepName": "Bước 2: Hàm doanh thu",
                      "description": "$R(x) = (8 + 0{,}1x)(100 - x) = -0{,}1x^2 + 2x + 800$."
                    },
                    {
                      "stepName": "Bước 3: Tìm GTLN",
                      "description": "$R'(x) = -0{,}2x + 2 = 0 \\iff x = 10$. Giá thuê tối ưu: $8 + 0{,}1(10) = 9$ triệu."
                    }
                  ],
                  "explanation": "Giá thuê tối ưu là 9 triệu đồng/tháng."
                }
              ]
            }
          },
          {
            "id": "12-c1-b3",
            "title": "Bài 3 & 4: Tiệm cận và Khảo sát sự biến thiên hàm số",
            "order": 3,
            "description": "Tiệm cận đứng, tiệm cận ngang, tiệm cận xiên và sơ đồ khảo sát hàm số",
            "theory": {
              "overview": "Định nghĩa các đường tiệm cận và quy trình khảo sát hàm phân thức bậc nhất trên bậc nhất, bậc hai trên bậc nhất.",
              "sections": [
                {
                  "title": "1. Tiệm cận của đồ thị hàm số",
                  "content": "- Tiệm cận ngang: $y = \\lim_{x \\to \\pm\\infty} f(x)$.\n- Tiệm cận đứng: $x = x_0$ khi $\\lim_{x \\to x_0^\\pm} f(x) = \\pm\\infty$.\n- Tiệm cận xiên: $y = ax + b$ khi $\\lim_{x \\to \\pm\\infty} [f(x) - (ax + b)] = 0$.",
                  "keyFormulas": [
                    "\\lim_{x \\to \\pm\\infty} f(x) = y_0 \\implies y = y_0 \\text{ là TC ngang}",
                    "\\lim_{x \\to x_0^\\pm} f(x) = \\pm\\infty \\implies x = x_0 \\text{ là TC đứng}"
                  ]
                }
              ],
              "summaryFormulas": [
                "y = \\frac{ax^2+bx+c}{px+q} \\implies y = mx + n \\text{ là TC xiên}"
              ],
              "commonMistakes": [
                "Nhầm giữa tiệm cận đứng và nghiệm của tử số."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "12-c1-b3-mc1",
                  "question": "Đồ thị hàm số $y = \\frac{2x - 1}{x + 1}$ có đường tiệm cận ngang là:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$y = 2$"
                    },
                    {
                      "key": "B",
                      "content": "$x = -1$"
                    },
                    {
                      "key": "C",
                      "content": "$y = -1$"
                    },
                    {
                      "key": "D",
                      "content": "$x = 2$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "$\\lim_{x \\to \\pm\\infty} \\frac{2x - 1}{x + 1} = 2 \\implies y = 2$ là tiệm cận ngang."
                }
              ],
              "trueFalse": [
                {
                  "id": "12-c1-b3-tf1",
                  "context": "Cho hàm số $y = \\frac{x^2 - 3x + 4}{x - 1}$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Tập xác định của hàm số là $D = \\mathbb{R} \\setminus \\{1\\}$.",
                      "isCorrect": true,
                      "explanation": "$x \\ne 1$."
                    },
                    {
                      "subId": "b",
                      "content": "Đường thẳng $x = 1$ là tiệm cận đứng của đồ thị hàm số.",
                      "isCorrect": true,
                      "explanation": "$\\lim_{x \\to 1} y = \\infty$."
                    },
                    {
                      "subId": "c",
                      "content": "Đường thẳng $y = x - 2$ là tiệm cận xiên của đồ thị hàm số.",
                      "isCorrect": true,
                      "explanation": "Chia đa thức được $x - 2 + \\frac{2}{x - 1}$."
                    },
                    {
                      "subId": "d",
                      "content": "Đồ thị hàm số có tiệm cận ngang.",
                      "isCorrect": false,
                      "explanation": "Bậc tử lớn hơn bậc mẫu nên không có tiệm cận ngang."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "12-c1-b3-sa1",
                  "problem": "Tìm tọa độ giao điểm $I(x_0; y_0)$ của đường tiệm cận đứng và tiệm cận xiên của đồ thị hàm số $y = \\frac{2x^2 - 3x + 1}{x - 2}$. Tính tổng giá trị $S = x_0 + y_0$.",
                  "correctValue": 7,
                  "acceptableAnswers": [
                    "7",
                    "S=7"
                  ],
                  "unit": "",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": false,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Tiệm cận đứng",
                      "description": "Tiệm cận đứng $x = 2 \\implies x_0 = 2$."
                    },
                    {
                      "stepName": "Bước 2: Tiệm cận xiên",
                      "description": "Chia đa thức được $y = 2x + 1$."
                    },
                    {
                      "stepName": "Bước 3: Giao điểm",
                      "description": "$y_0 = 2(2) + 1 = 5 \\implies S = 2 + 5 = 7$."
                    }
                  ],
                  "explanation": "Giao điểm $I(2; 5) \\implies S = 2 + 5 = 7$."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "12-c2",
        "title": "Chương II: Vectơ và hệ tọa độ trong không gian",
        "order": 2,
        "description": "Vectơ trong không gian, hệ trục tọa độ Oxyz và biểu thức tọa độ",
        "lessons": [
          {
            "id": "12-c2-b1",
            "title": "Bài 6 & 7 & 8: Vectơ và Hệ trục tọa độ Oxyz",
            "order": 1,
            "description": "Quy tắc hình hộp, tọa độ điểm, vectơ và tích vô hướng trong không gian",
            "theory": {
              "overview": "Hệ trục tọa độ Oxyz và các quy tắc vectơ cơ bản trong không gian 3 chiều.",
              "sections": [
                {
                  "title": "1. Các công thức cốt lõi",
                  "content": "$\\vec{u} = (x_1; y_1; z_1), \\vec{v} = (x_2; y_2; z_2)$:\n- $\\vec{u} \\cdot \\vec{v} = x_1 x_2 + y_1 y_2 + z_1 z_2$.\n- $|\\vec{u}| = \\sqrt{x_1^2 + y_1^2 + z_1^2}$.\n- Quy tắc hình hộp: $\\vec{AC'} = \\vec{AB} + \\vec{AD} + \\vec{AA'}$.",
                  "keyFormulas": [
                    "\\vec{u} \\cdot \\vec{v} = x_1 x_2 + y_1 y_2 + z_1 z_2",
                    "\\vec{u} \\perp \\vec{v} \\iff x_1 x_2 + y_1 y_2 + z_1 z_2 = 0"
                  ]
                }
              ],
              "summaryFormulas": [
                "AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2 + (z_B - z_A)^2}"
              ],
              "commonMistakes": [
                "Nhầm dấu trừ trong công thức tọa độ vectơ $\\vec{AB} = (x_B - x_A; y_B - y_A; z_B - z_A)$."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "12-c2-b1-mc1",
                  "question": "Trong không gian $Oxyz$, cho $A(1; 2; -1)$ và $B(3; 0; 1)$. Tọa độ trung điểm $M$ của đoạn thẳng $AB$ là:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$(2; 1; 0)$"
                    },
                    {
                      "key": "B",
                      "content": "$(4; 2; 0)$"
                    },
                    {
                      "key": "C",
                      "content": "$(2; -2; 2)$"
                    },
                    {
                      "key": "D",
                      "content": "$(1; -1; 1)$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "$M = \\left(\\frac{1+3}{2}; \\frac{2+0}{2}; \\frac{-1+1}{2}\\right) = (2; 1; 0)$."
                }
              ],
              "trueFalse": [
                {
                  "id": "12-c2-b1-tf1",
                  "context": "Trong không gian $Oxyz$, cho ba điểm $A(1; 0; 0), B(0; 2; 0), C(0; 0; 3)$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Tọa độ vectơ $\\vec{AB} = (-1; 2; 0)$.",
                      "isCorrect": true,
                      "explanation": "$\\vec{AB} = (0 - 1; 2 - 0; 0 - 0) = (-1; 2; 0)$."
                    },
                    {
                      "subId": "b",
                      "content": "Độ dài đoạn thẳng $AB = \\sqrt{5}$.",
                      "isCorrect": true,
                      "explanation": "$\\sqrt{(-1)^2 + 2^2 + 0^2} = \\sqrt{5}$."
                    },
                    {
                      "subId": "c",
                      "content": "Tọa độ trọng tâm tam giác $ABC$ là $G\\left(\\frac{1}{3}; \\frac{2}{3}; 1\\right)$.",
                      "isCorrect": true,
                      "explanation": "$G = \\left(\\frac{1}{3}; \\frac{2}{3}; \\frac{3}{3}\\right)$."
                    },
                    {
                      "subId": "d",
                      "content": "Vectơ $\\vec{AB}$ vuông góc với vectơ $\\vec{OC}$.",
                      "isCorrect": true,
                      "explanation": "$\\vec{AB} \\cdot \\vec{OC} = -1(0) + 2(0) + 0(3) = 0$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "12-c2-b1-sa1",
                  "problem": "Trong không gian $Oxyz$, cho hai vectơ $\\vec{u} = (1; m; 2)$ và $\\vec{v} = (m; 3; -4)$. Tìm giá trị của tham số $m$ để hai vectơ vuông góc với nhau.",
                  "correctValue": 2,
                  "acceptableAnswers": [
                    "2",
                    "m=2"
                  ],
                  "unit": "",
                  "cognitiveLevel": "Thông hiểu",
                  "isRealWorldModeling": false,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Tích vô hướng",
                      "description": "$\\vec{u} \\cdot \\vec{v} = 1(m) + m(3) + 2(-4) = 4m - 8$."
                    },
                    {
                      "stepName": "Bước 2: Giải điều kiện vuông góc",
                      "description": "$4m - 8 = 0 \\iff m = 2$."
                    }
                  ],
                  "explanation": "$4m - 8 = 0 \\iff m = 2$."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "12-c3",
        "title": "Chương III: Các số đặc trưng đo mức độ phân tán cho mẫu số liệu ghép nhóm",
        "order": 3,
        "description": "Khoảng biến thiên, khoảng tứ phân vị, phương sai và độ lệch chuẩn",
        "lessons": [
          {
            "id": "12-c3-b1",
            "title": "Bài 9 & 10: Khoảng biến thiên, phương sai và độ lệch chuẩn",
            "order": 1,
            "description": "Đo lường độ rủi ro, phân tán dữ liệu và ứng dụng thống kê thực tế",
            "theory": {
              "overview": "Các số đặc trưng đo mức độ biến thiên, mức độ đồng đều hoặc độ phân tán của mẫu dữ liệu ghép nhóm.",
              "sections": [
                {
                  "title": "1. Khoảng biến thiên và độ lệch chuẩn",
                  "content": "- Khoảng biến thiên $R = a_k - a_0$.\n- Phương sai $s^2 = \\frac{1}{n} \\sum n_i (c_i - \\bar{x})^2$.\n- Độ lệch chuẩn $s = \\sqrt{s^2}$.",
                  "keyFormulas": [
                    "s = \\sqrt{s^2}",
                    "\\Delta_Q = Q_3 - Q_1"
                  ]
                }
              ],
              "summaryFormulas": [
                "s^2 = \\frac{1}{n}\\sum n_i c_i^2 - (\\bar{x})^2"
              ],
              "commonMistakes": [
                "Quên khai căn bậc hai khi đề bài yêu cầu tìm độ lệch chuẩn."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "12-c3-b1-mc1",
                  "question": "Nếu một mẫu số liệu ghép nhóm có phương sai $s^2 = 16$ thì độ lệch chuẩn của mẫu số liệu đó là:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$4$"
                    },
                    {
                      "key": "B",
                      "content": "$256$"
                    },
                    {
                      "key": "C",
                      "content": "$8$"
                    },
                    {
                      "key": "D",
                      "content": "$2$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "$s = \\sqrt{s^2} = \\sqrt{16} = 4$."
                }
              ],
              "trueFalse": [
                {
                  "id": "12-c3-b1-tf1",
                  "context": "Một xạ thủ bắn 20 phát đạn vào bia. Điểm số trung bình là $8{,}5$ điểm, phương sai là $s^2 = 0{,}64$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Độ lệch chuẩn điểm bắn của xạ thủ là $s = 0{,}8$ điểm.",
                      "isCorrect": true,
                      "explanation": "$s = \\sqrt{0{,}64} = 0{,}8$."
                    },
                    {
                      "subId": "b",
                      "content": "Độ lệch chuẩn càng nhỏ chứng tỏ tay súng bắn càng ổn định và đồng đều.",
                      "isCorrect": true,
                      "explanation": "Độ lệch chuẩn đo mức độ ổn định."
                    },
                    {
                      "subId": "c",
                      "content": "Nếu xạ thủ thứ hai có độ lệch chuẩn $1{,}2$ thì xạ thủ thứ hai bắn ổn định hơn xạ thủ thứ nhất.",
                      "isCorrect": false,
                      "explanation": "Độ lệch chuẩn nhỏ hơn thì ổn định hơn ($0{,}8 < 1{,}2$)."
                    },
                    {
                      "subId": "d",
                      "content": "Phương sai luôn là một số không âm.",
                      "isCorrect": true,
                      "explanation": "Phương sai luôn $\\ge 0$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "12-c3-b1-sa1",
                  "problem": "Một lớp học khảo sát chiều cao học sinh được bảng phân bố ghép nhóm. Sau khi tính toán ta được $\\bar{x} = 165\\text{ cm}$ và phương sai $s^2 = 25\\text{ cm}^2$. Tính độ lệch chuẩn chiều cao của học sinh lớp đó (cm).",
                  "correctValue": 5,
                  "acceptableAnswers": [
                    "5",
                    "5 cm",
                    "5cm"
                  ],
                  "unit": "cm",
                  "cognitiveLevel": "Nhận biết",
                  "isRealWorldModeling": true,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Tính độ lệch chuẩn",
                      "description": "$s = \\sqrt{s^2} = \\sqrt{25} = 5\\text{ cm}$."
                    }
                  ],
                  "explanation": "$s = \\sqrt{25} = 5\\text{ cm}$."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "12-c4",
        "title": "Chương IV: Nguyên hàm và Tích phân",
        "order": 4,
        "description": "Nguyên hàm, tích phân và ứng dụng hình học tính diện tích, thể tích",
        "lessons": [
          {
            "id": "12-c4-b1",
            "title": "Bài 11 & 12: Nguyên hàm và Tích phân",
            "order": 1,
            "description": "Bảng nguyên hàm cơ bản, tích phân xác định và phương pháp tính",
            "theory": {
              "overview": "Lý thuyết nguyên hàm, định lý cơ bản giải tích Newton-Leibniz và các quy tắc tích phân.",
              "sections": [
                {
                  "title": "1. Bảng nguyên hàm chuẩn",
                  "content": "- $\\int x^\\alpha dx = \\frac{x^{\\alpha+1}}{\\alpha+1} + C$ ($\\alpha \\ne -1$)\n- $\\int \\frac{1}{x} dx = \\ln|x| + C$\n- $\\int e^x dx = e^x + C$\n- $\\int_a^b f(x) dx = F(b) - F(a)$",
                  "keyFormulas": [
                    "\\int_a^b f(x) dx = F(b) - F(a)",
                    "\\int u dv = uv - \\int v du"
                  ]
                }
              ],
              "summaryFormulas": [
                "\\int_a^b f(x) dx = \\int_a^c f(x) dx + \\int_c^b f(x) dx"
              ],
              "commonMistakes": [
                "Quên đổi cận khi đổi biến số."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "12-c4-b1-mc1",
                  "question": "Tích phân $\\int_0^1 (2x + 1) dx$ bằng:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$2$"
                    },
                    {
                      "key": "B",
                      "content": "$1$"
                    },
                    {
                      "key": "C",
                      "content": "$3$"
                    },
                    {
                      "key": "D",
                      "content": "$4$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "$[x^2 + x]_0^1 = 2$."
                }
              ],
              "trueFalse": [
                {
                  "id": "12-c4-b1-tf1",
                  "context": "Cho hàm số $f(x)$ liên tục trên $\\mathbb{R}$ thỏa mãn $\\int_1^3 f(x) dx = 4$ và $\\int_3^5 f(x) dx = 6$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Tích phân $\\int_1^5 f(x) dx = 10$.",
                      "isCorrect": true,
                      "explanation": "$\\int_1^5 = 4 + 6 = 10$."
                    },
                    {
                      "subId": "b",
                      "content": "Tích phân $\\int_3^1 f(x) dx = -4$.",
                      "isCorrect": true,
                      "explanation": "Đổi cận đổi dấu: $-\\int_1^3 = -4$."
                    },
                    {
                      "subId": "c",
                      "content": "Tích phân $\\int_1^3 3f(x) dx = 12$.",
                      "isCorrect": true,
                      "explanation": "$3 \\times 4 = 12$."
                    },
                    {
                      "subId": "d",
                      "content": "Tích phân $\\int_1^3 [f(x) + 2x] dx = 10$.",
                      "isCorrect": false,
                      "explanation": "$4 + [x^2]_1^3 = 4 + 8 = 12$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "12-c4-b1-sa1",
                  "problem": "Một vật chuyển động thẳng với gia tốc biến thiên $a(t) = 6t - 2\\text{ m/s}^2$. Vận tốc ban đầu của vật là $v(0) = 4\\text{ m/s}$. Tính quãng đường vật đi được từ thời điểm $t = 0$ đến $t = 2$ giây (mét).",
                  "correctValue": 12,
                  "acceptableAnswers": [
                    "12",
                    "12 m",
                    "12m"
                  ],
                  "unit": "m",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": true,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Tìm vận tốc",
                      "description": "$v(t) = 3t^2 - 2t + 4$."
                    },
                    {
                      "stepName": "Bước 2: Tính quãng đường",
                      "description": "$s = \\int_0^2 (3t^2 - 2t + 4) dt = [t^3 - t^2 + 4t]_0^2 = 12\\text{ m}$."
                    }
                  ],
                  "explanation": "$s = 12\\text{ m}$."
                }
              ]
            }
          },
          {
            "id": "12-c4-b2",
            "title": "Bài 13: Ứng dụng hình học của tích phân",
            "order": 2,
            "description": "Tính diện tích hình phẳng và thể tích vật thể tròn xoay",
            "theory": {
              "overview": "Ứng dụng tích phân để tính diện tích hình phẳng giới hạn bởi các đường cong và thể tích khối tròn xoay.",
              "sections": [
                {
                  "title": "1. Diện tích và thể tích tròn xoay",
                  "content": "- Diện tích: $S = \\int_a^b |f(x) - g(x)| dx$.\n- Thể tích khối tròn xoay quay quanh $Ox$: $V = \\pi \\int_a^b [f(x)]^2 dx$.",
                  "keyFormulas": [
                    "S = \\int_a^b |f(x) - g(x)| dx",
                    "V = \\pi \\int_a^b f^2(x) dx"
                  ]
                }
              ],
              "summaryFormulas": [
                "V = \\pi \\int_a^b |f^2(x) - g^2(x)| dx"
              ],
              "commonMistakes": [
                "Quên nhân $\\pi$ trong công thức thể tích."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "12-c4-b2-mc1",
                  "question": "Diện tích hình phẳng giới hạn bởi đồ thị hàm số $y = x^2$, trục hoành và hai đường thẳng $x = 0, x = 3$ bằng:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$9$"
                    },
                    {
                      "key": "B",
                      "content": "$27$"
                    },
                    {
                      "key": "C",
                      "content": "$3$"
                    },
                    {
                      "key": "D",
                      "content": "$9\\pi$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "$S = \\int_0^3 x^2 dx = [x^3/3]_0^3 = 9$."
                }
              ],
              "trueFalse": [
                {
                  "id": "12-c4-b2-tf1",
                  "context": "Cho hình phẳng $(H)$ giới hạn bởi Parabol $y = 4 - x^2$ và trục hoành $Ox$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Phương trình hoành độ giao điểm có hai nghiệm $x = \\pm 2$.",
                      "isCorrect": true,
                      "explanation": "$4 - x^2 = 0 \\iff x = \\pm 2$."
                    },
                    {
                      "subId": "b",
                      "content": "Diện tích hình phẳng $(H)$ là $S = \\frac{32}{3}$.",
                      "isCorrect": true,
                      "explanation": "$\\int_{-2}^2 (4 - x^2) dx = 32/3$."
                    },
                    {
                      "subId": "c",
                      "content": "Khi quay $(H)$ quanh trục $Ox$, thể tích tạo thành có dạng $V = \\pi \\int_{-2}^2 (4 - x^2)^2 dx$.",
                      "isCorrect": true,
                      "explanation": "Công thức thể tích tròn xoay chuẩn."
                    },
                    {
                      "subId": "d",
                      "content": "Hình phẳng $(H)$ không đối xứng qua trục tung $Oy$.",
                      "isCorrect": false,
                      "explanation": "Parabol $y = 4 - x^2$ là hàm chẵn nên nhận $Oy$ làm trục đối xứng."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "12-c4-b2-sa1",
                  "problem": "Một bồn chứa nước có hình dạng khối tròn xoay được tạo thành khi quay đồ thị hàm số $y = \\sqrt{x}$ với $0 \\le x \\le 4$ (đơn vị: mét) quanh trục $Ox$. Tính thể tích của bồn nước theo đơn vị mét khối (lấy $\\pi = 3{,}14$, làm tròn đến 1 chữ số thập phân).",
                  "correctValue": 25.1,
                  "acceptableAnswers": [
                    "25.1",
                    "25,1",
                    "8 pi"
                  ],
                  "unit": "m³",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": true,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Công thức",
                      "description": "$V = \\pi \\int_0^4 (\\sqrt{x})^2 dx = \\pi \\int_0^4 x dx = 8\\pi$."
                    },
                    {
                      "stepName": "Bước 2: Tính số",
                      "description": "$V = 8 \\times 3{,}14 = 25{,}12 \\approx 25{,}1\\text{ m}^3$."
                    }
                  ],
                  "explanation": "$V = 8\\pi \\approx 25{,}1\\text{ m}^3$."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "12-c5",
        "title": "Chương V: Phương pháp tọa độ trong không gian",
        "order": 5,
        "description": "Phương trình mặt phẳng, đường thẳng, mặt cầu và khoảng cách trong Oxyz",
        "lessons": [
          {
            "id": "12-c5-b1",
            "title": "Bài 14 & 15 & 16 & 17: Mặt phẳng, Đường thẳng và Mặt cầu",
            "order": 1,
            "description": "Lập phương trình mặt phẳng, đường thẳng, tính khoảng cách và phương trình mặt cầu",
            "theory": {
              "overview": "Phương pháp tọa độ giải quyết các bài toán quan hệ vị trí, góc, khoảng cách và mặt cầu trong không gian Oxyz.",
              "sections": [
                {
                  "title": "1. Mặt phẳng, đường thẳng và mặt cầu",
                  "content": "- Mặt phẳng: $A(x - x_0) + B(y - y_0) + C(z - z_0) = 0$.\n- Khoảng cách: $d(M_0, (P)) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}$.\n- Mặt cầu tâm $I(a; b; c)$ bán kính $R$: $(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$.",
                  "keyFormulas": [
                    "Ax + By + Cz + D = 0",
                    "(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2"
                  ]
                }
              ],
              "summaryFormulas": [
                "d(M, (P)) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}"
              ],
              "commonMistakes": [
                "Nhầm giữa VTPT của mặt phẳng và VTCP của đường thẳng."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "12-c5-b1-mc1",
                  "question": "Mặt phẳng $(P): 2x - y + 3z - 5 = 0$ có một vectơ pháp tuyến là:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$\\vec{n} = (2; -1; 3)$"
                    },
                    {
                      "key": "B",
                      "content": "$\\vec{n} = (2; 1; 3)$"
                    },
                    {
                      "key": "C",
                      "content": "$\\vec{n} = (2; -1; -5)$"
                    },
                    {
                      "key": "D",
                      "content": "$\\vec{n} = (-1; 3; -5)$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "$\\vec{n} = (2; -1; 3)$."
                }
              ],
              "trueFalse": [
                {
                  "id": "12-c5-b1-tf1",
                  "context": "Trong không gian $Oxyz$, cho điểm $A(1; 2; 3)$ và mặt phẳng $(P): 2x + y - 2z + 1 = 0$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Điểm $A$ không thuộc mặt phẳng $(P)$.",
                      "isCorrect": true,
                      "explanation": "$2(1) + 2 - 2(3) + 1 = -1 \\ne 0$."
                    },
                    {
                      "subId": "b",
                      "content": "Khoảng cách từ điểm $A$ đến mặt phẳng $(P)$ bằng $\\frac{1}{3}$.",
                      "isCorrect": true,
                      "explanation": "$d = \\frac{|-1|}{\\sqrt{4+1+4}} = \\frac{1}{3}$."
                    },
                    {
                      "subId": "c",
                      "content": "Đường thẳng đi qua $A$ vuông góc với $(P)$ có VTCP là $\\vec{u} = (2; 1; -2)$.",
                      "isCorrect": true,
                      "explanation": "VTCP trùng VTPT của $(P)$."
                    },
                    {
                      "subId": "d",
                      "content": "Mặt cầu tâm $A$ tiếp xúc với $(P)$ có bán kính $R = 1$.",
                      "isCorrect": false,
                      "explanation": "Bán kính tiếp xúc $R = d(A, (P)) = 1/3$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "12-c5-b1-sa1",
                  "problem": "Trong không gian $Oxyz$, cho mặt cầu $(S): x^2 + y^2 + z^2 - 2x + 4y - 6z - 11 = 0$. Tính bán kính $R$ của mặt cầu $(S)$.",
                  "correctValue": 5,
                  "acceptableAnswers": [
                    "5",
                    "R=5"
                  ],
                  "unit": "",
                  "cognitiveLevel": "Thông hiểu",
                  "isRealWorldModeling": false,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Hệ số",
                      "description": "$a = 1, b = -2, c = 3, d = -11$."
                    },
                    {
                      "stepName": "Bước 2: Bán kính",
                      "description": "$R = \\sqrt{1 + 4 + 9 - (-11)} = \\sqrt{25} = 5$."
                    }
                  ],
                  "explanation": "$R = 5$."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "12-c6",
        "title": "Chương VI: Xác suất có điều kiện",
        "order": 6,
        "description": "Xác suất có điều kiện, công thức xác suất toàn phần và công thức Bayes",
        "lessons": [
          {
            "id": "12-c6-b1",
            "title": "Bài 18 & 19: Xác suất có điều kiện và công thức Bayes",
            "order": 1,
            "description": "Định nghĩa $P(A|B)$, công thức nhân, xác suất toàn phần và công thức Bayes",
            "theory": {
              "overview": "Đánh giá xác suất khi có thêm thông tin điều kiện và bài toán chẩn đoán y khoa bằng công thức Bayes.",
              "sections": [
                {
                  "title": "1. Xác suất có điều kiện và công thức Bayes",
                  "content": "- $P(A|B) = \\frac{P(AB)}{P(B)}$.\n- Xác suất toàn phần: $P(A) = P(B_1)P(A|B_1) + P(B_2)P(A|B_2)$.\n- Bayes: $P(B_1|A) = \\frac{P(B_1)P(A|B_1)}{P(A)}$.",
                  "keyFormulas": [
                    "P(AB) = P(B)P(A|B)",
                    "P(B_1|A) = \\frac{P(B_1)P(A|B_1)}{P(A)}"
                  ]
                }
              ],
              "summaryFormulas": [
                "P(A|B) + P(\\bar{A}|B) = 1"
              ],
              "commonMistakes": [
                "Nhầm giữa $P(A|B)$ và $P(AB)$."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "12-c6-b1-mc1",
                  "question": "Cho hai biến cố $A$ và $B$ thỏa mãn $P(B) = 0{,}5$ và $P(AB) = 0{,}2$. Xác suất có điều kiện $P(A|B)$ bằng:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$0{,}4$"
                    },
                    {
                      "key": "B",
                      "content": "$0{,}1$"
                    },
                    {
                      "key": "C",
                      "content": "$0{,}7$"
                    },
                    {
                      "key": "D",
                      "content": "$0{,}25$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "$P(A|B) = 0{,}2 / 0{,}5 = 0{,}4$."
                }
              ],
              "trueFalse": [
                {
                  "id": "12-c6-b1-tf1",
                  "context": "Một hộp có 10 viên bi gồm 6 bi đỏ và 4 bi xanh. Rút ngẫu nhiên liên tiếp 2 viên bi không hoàn lại. Gọi $A$ là biến cố \"Viên thứ nhất màu đỏ\", $B$ là biến cố \"Viên thứ hai màu đỏ\".",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Xác suất $P(A) = 0{,}6$.",
                      "isCorrect": true,
                      "explanation": "$6/10 = 0{,}6$."
                    },
                    {
                      "subId": "b",
                      "content": "Xác suất $P(B|A) = \\frac{5}{9}$.",
                      "isCorrect": true,
                      "explanation": "Còn 5 bi đỏ trên 9 bi."
                    },
                    {
                      "subId": "c",
                      "content": "Xác suất cả hai viên màu đỏ là $P(AB) = \\frac{1}{3}$.",
                      "isCorrect": true,
                      "explanation": "$\\frac{6}{10} \\times \\frac{5}{9} = \\frac{1}{3}$."
                    },
                    {
                      "subId": "d",
                      "content": "Hai biến cố $A$ và $B$ độc lập nhau.",
                      "isCorrect": false,
                      "explanation": "Rút không hoàn lại nên $A$ và $B$ phụ thuộc."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "12-c6-b1-sa1",
                  "problem": "Tỉ lệ người mắc một căn bệnh trong cộng đồng là $1\\%$. Một bộ kit xét nghiệm cho kết quả đúng $95\\%$ với người có bệnh và có $2\\%$ bị dương tính giả với người không bệnh. Một người đi xét nghiệm nhận kết quả dương tính. Tính xác suất người này thực sự mắc bệnh (Làm tròn đến 2 chữ số thập phân).",
                  "correctValue": 0.32,
                  "acceptableAnswers": [
                    "0.32",
                    "0,32",
                    "32%"
                  ],
                  "unit": "",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": true,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Tính P(dương tính)",
                      "description": "$P(T) = 0{,}01(0{,}95) + 0{,}99(0{,}02) = 0{,}0293$."
                    },
                    {
                      "stepName": "Bước 2: Bayes",
                      "description": "$P(B|T) = \\frac{0{,}0095}{0{,}0293} \\approx 0{,}32$."
                    }
                  ],
                  "explanation": "$P(B|T) \\approx 0{,}32$."
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    "grade": "11",
    "name": "Toán Lớp 11",
    "badge": "Giải tích & Hình học Không gian",
    "description": "Lượng giác, Cấp số cộng/nhân, Giới hạn, Hàm số mũ/lôgarit, Đạo hàm, Quan hệ không gian và Xác suất chuẩn SGK Kết nối tri thức với cuộc sống",
    "chapters": [
      {
        "id": "11-c1",
        "title": "Chương I: Hàm số lượng giác và phương trình lượng giác",
        "order": 1,
        "description": "Giá trị lượng giác, công thức cộng, nhân đôi, hàm số lượng giác và phương trình lượng giác cơ bản",
        "lessons": [
          {
            "id": "11-c1-b1",
            "title": "Bài 1 & 2: Giá trị lượng giác và công thức lượng giác",
            "order": 1,
            "description": "Công thức cộng, công thức nhân đôi, biến đổi tích thành tổng và tổng thành tích",
            "theory": {
              "overview": "Hệ thống công thức lượng giác cơ bản và nâng cao cần nhớ cho chương trình Toán 11 GDPT 2018.",
              "sections": [
                {
                  "title": "1. Công thức cộng và nhân đôi",
                  "content": "- $\\sin(a \\pm b) = \\sin a \\cos b \\pm \\cos a \\sin b$\n- $\\cos(a \\pm b) = \\cos a \\cos b \\mp \\sin a \\sin b$\n- $\\sin 2a = 2\\sin a \\cos a$\n- $\\cos 2a = \\cos^2 a - \\sin^2 a = 2\\cos^2 a - 1 = 1 - 2\\sin^2 a$",
                  "keyFormulas": [
                    "\\sin^2 x + \\cos^2 x = 1",
                    "\\sin 2x = 2\\sin x \\cos x",
                    "\\cos 2x = 2\\cos^2 x - 1"
                  ]
                }
              ],
              "summaryFormulas": [
                "\\tan(a + b) = \\frac{\\tan a + \\tan b}{1 - \\tan a \\tan b}"
              ],
              "commonMistakes": [
                "Nhầm dấu trừ trong công thức $\\cos(a + b) = \\cos a \\cos b - \\sin a \\sin b$."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "11-c1-b1-mc1",
                  "question": "Công thức nào sau đây là ĐÚNG?",
                  "options": [
                    {
                      "key": "A",
                      "content": "$\\cos 2a = \\cos^2 a - \\sin^2 a$"
                    },
                    {
                      "key": "B",
                      "content": "$\\cos 2a = \\cos^2 a + \\sin^2 a$"
                    },
                    {
                      "key": "C",
                      "content": "$\\sin 2a = \\sin a \\cos a$"
                    },
                    {
                      "key": "D",
                      "content": "$\\cos 2a = 1 - 2\\cos^2 a$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "Công thức nhân đôi chuẩn mực: $\\cos 2a = \\cos^2 a - \\sin^2 a$."
                }
              ],
              "trueFalse": [
                {
                  "id": "11-c1-b1-tf1",
                  "context": "Cho góc $\\alpha$ thỏa mãn $\\frac{\\pi}{2} < \\alpha < \\pi$ và $\\sin \\alpha = \\frac{3}{5}$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Điểm biểu diễn góc $\\alpha$ nằm ở góc phần tư thứ II.",
                      "isCorrect": true,
                      "explanation": "Khoảng $(\\frac{\\pi}{2}; \\pi)$ thuộc góc phần tư II."
                    },
                    {
                      "subId": "b",
                      "content": "Giá trị $\\cos \\alpha = -\\frac{4}{5}$.",
                      "isCorrect": true,
                      "explanation": "Ở góc phần tư II, $\\cos < 0 \\implies \\cos = -\\sqrt{1 - \\frac{9}{25}} = -\\frac{4}{5}$."
                    },
                    {
                      "subId": "c",
                      "content": "Giá trị $\\sin 2\\alpha = -\\frac{24}{25}$.",
                      "isCorrect": true,
                      "explanation": "$\\sin 2\\alpha = 2\\sin\\alpha\\cos\\alpha = 2(\\frac{3}{5})(-\\frac{4}{5}) = -\\frac{24}{25}$."
                    },
                    {
                      "subId": "d",
                      "content": "Giá trị $\\tan \\alpha > 0$.",
                      "isCorrect": false,
                      "explanation": "Ở góc phần tư II, $\\tan\\alpha = \\frac{\\sin\\alpha}{\\cos\\alpha} < 0$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "11-c1-b1-sa1",
                  "problem": "Cho $\\cos x = \\frac{1}{3}$. Tính giá trị của biểu thức $P = \\cos 2x$. (Nhập kết quả dưới dạng số thập phân làm tròn 2 chữ số)",
                  "correctValue": -0.78,
                  "acceptableAnswers": [
                    "-7/9",
                    "-0.78",
                    "-0,78"
                  ],
                  "unit": "",
                  "cognitiveLevel": "Thông hiểu",
                  "isRealWorldModeling": false,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Áp dụng công thức nhân đôi",
                      "description": "$\\cos 2x = 2\\cos^2 x - 1 = 2\\left(\\frac{1}{3}\\right)^2 - 1 = \\frac{2}{9} - 1 = -\\frac{7}{9} \\approx -0{,}78$."
                    }
                  ],
                  "explanation": "$P = 2(1/9) - 1 = -7/9 \\approx -0{,}78$."
                }
              ]
            }
          },
          {
            "id": "11-c1-b2",
            "title": "Bài 3 & 4: Hàm số lượng giác và phương trình lượng giác cơ bản",
            "order": 2,
            "description": "Tập xác định, chu kỳ, đồ thị của sin, cos, tan và nghiệm phương trình lượng giác",
            "theory": {
              "overview": "Khảo sát hàm số lượng giác và các công thức nghiệm chuẩn của phương trình $\\sin x = m, \\cos x = m, \\tan x = m$.",
              "sections": [
                {
                  "title": "1. Nghiệm của phương trình cơ bản",
                  "content": "- $\\sin x = \\sin \\alpha \\iff x = \\alpha + k2\\pi$ hoặc $x = \\pi - \\alpha + k2\\pi$\n- $\\cos x = \\cos \\alpha \\iff x = \\pm \\alpha + k2\\pi$\n- $\\tan x = \\tan \\alpha \\iff x = \\alpha + k\\pi$",
                  "keyFormulas": [
                    "\\sin x = 0 \\iff x = k\\pi",
                    "\\cos x = 0 \\iff x = \\frac{\\pi}{2} + k\\pi"
                  ]
                }
              ],
              "summaryFormulas": [
                "k \\in \\mathbb{Z}"
              ],
              "commonMistakes": [
                "Quên đuôi chu kỳ $+ k2\\pi$ hoặc $+ k\\pi$ khi kết luận họ nghiệm."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "11-c1-b2-mc1",
                  "question": "Nghiệm của phương trình $\\cos x = 0$ là:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$x = \\frac{\\pi}{2} + k\\pi, k \\in \\mathbb{Z}$"
                    },
                    {
                      "key": "B",
                      "content": "$x = k\\pi, k \\in \\mathbb{Z}$"
                    },
                    {
                      "key": "C",
                      "content": "$x = \\frac{\\pi}{2} + k2\\pi, k \\in \\mathbb{Z}$"
                    },
                    {
                      "key": "D",
                      "content": "$x = \\pi + k2\\pi, k \\in \\mathbb{Z}$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "Nghiệm của $\\cos x = 0$ là $x = \\frac{\\pi}{2} + k\\pi$."
                }
              ],
              "trueFalse": [
                {
                  "id": "11-c1-b2-tf1",
                  "context": "Cho phương trình $2\\sin x - 1 = 0$ trên đoạn $[0; 2\\pi]$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Phương trình tương đương với $\\sin x = \\frac{1}{2}$.",
                      "isCorrect": true,
                      "explanation": "$2\\sin x = 1 \\iff \\sin x = 1/2$."
                    },
                    {
                      "subId": "b",
                      "content": "Nghiệm nhỏ nhất của phương trình trên đoạn $[0; 2\\pi]$ là $x = \\frac{\\pi}{6}$.",
                      "isCorrect": true,
                      "explanation": "$\\sin(\\pi/6) = 1/2$."
                    },
                    {
                      "subId": "c",
                      "content": "Phương trình có đúng 2 nghiệm trên đoạn $[0; 2\\pi]$.",
                      "isCorrect": true,
                      "explanation": "Hai nghiệm là $\\frac{\\pi}{6}$ và $\\frac{5\\pi}{6}$."
                    },
                    {
                      "subId": "d",
                      "content": "Tổng các nghiệm của phương trình trên đoạn $[0; 2\\pi]$ bằng $2\\pi$.",
                      "isCorrect": false,
                      "explanation": "Tổng nghiệm: $\\frac{\\pi}{6} + \\frac{5\\pi}{6} = \\pi$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "11-c1-b2-sa1",
                  "problem": "Số giờ có ánh sáng mặt trời của một thành phố $A$ ở vĩ độ $40^\\circ$ Bắc trong ngày thứ $t$ của một năm không nhuận được cho bởi hàm số $d(t) = 3\\sin\\left[\\frac{2\\pi}{365}(t - 80)\\right] + 12$ với $t \\in \\mathbb{Z}$ và $1 \\le t \\le 365$. Vào ngày nào trong năm thì thành phố $A$ có số giờ có ánh sáng mặt trời nhiều nhất?",
                  "correctValue": 171,
                  "acceptableAnswers": [
                    "171",
                    "ngày 171"
                  ],
                  "unit": "",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": true,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Điều kiện đạt max",
                      "description": "$\\sin\\left[\\frac{2\\pi}{365}(t - 80)\\right] = 1$."
                    },
                    {
                      "stepName": "Bước 2: Giải tìm $t$",
                      "description": "$\\frac{2\\pi}{365}(t - 80) = \\frac{\\pi}{2} \\implies t \\approx 171$."
                    }
                  ],
                  "explanation": "Đạt cực đại khi $t \\approx 171$."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "11-c2",
        "title": "Chương II: Dãy số. Cấp số cộng và cấp số nhân",
        "order": 2,
        "description": "Số hạng tổng quát, tính đơn điệu, bị chặn, công sai, công bội và bài toán thực tế",
        "lessons": [
          {
            "id": "11-c2-b1",
            "title": "Bài 5 & 6 & 7: Cấp số cộng và Cấp số nhân",
            "order": 1,
            "description": "Số hạng tổng quát, tổng n số hạng đầu và bài toán tăng trưởng lãi kép",
            "theory": {
              "overview": "Hệ thống công thức cấp số cộng và cấp số nhân ứng dụng trong các bài toán tăng trưởng và lãi kép tài chính.",
              "sections": [
                {
                  "title": "1. Cấp số cộng và cấp số nhân",
                  "content": "- Cấp số cộng: $u_n = u_1 + (n - 1)d$, tổng $S_n = \\frac{n(u_1 + u_n)}{2}$.\n- Cấp số nhân: $u_n = u_1 \\cdot q^{n-1}$, tổng $S_n = u_1 \\frac{1 - q^n}{1 - q}$ ($q \\ne 1$).",
                  "keyFormulas": [
                    "u_n = u_1 + (n - 1)d",
                    "u_n = u_1 \\cdot q^{n - 1}"
                  ]
                }
              ],
              "summaryFormulas": [
                "S_n = \\frac{n[2u_1 + (n-1)d]}{2}"
              ],
              "commonMistakes": [
                "Nhầm lẫn giữa công thức tính số hạng $u_n$ và công thức tổng $S_n$."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "11-c2-b1-mc1",
                  "question": "Cho cấp số cộng $(u_n)$ có $u_1 = 3$ và công sai $d = 2$. Số hạng thứ 5 là:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$11$"
                    },
                    {
                      "key": "B",
                      "content": "$13$"
                    },
                    {
                      "key": "C",
                      "content": "$10$"
                    },
                    {
                      "key": "D",
                      "content": "$15$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "$u_5 = 3 + 4(2) = 11$."
                }
              ],
              "trueFalse": [
                {
                  "id": "11-c2-b1-tf1",
                  "context": "Cho cấp số nhân $(u_n)$ có $u_1 = 2$ và công bội $q = 3$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Số hạng thứ hai $u_2 = 6$.",
                      "isCorrect": true,
                      "explanation": "$u_2 = 2 \\times 3 = 6$."
                    },
                    {
                      "subId": "b",
                      "content": "Số hạng thứ tư $u_4 = 54$.",
                      "isCorrect": true,
                      "explanation": "$u_4 = 2 \\times 27 = 54$."
                    },
                    {
                      "subId": "c",
                      "content": "Tổng của 3 số hạng đầu tiên là $S_3 = 26$.",
                      "isCorrect": true,
                      "explanation": "$2 + 6 + 18 = 26$."
                    },
                    {
                      "subId": "d",
                      "content": "Dãy số $(u_n)$ là một dãy số giảm.",
                      "isCorrect": false,
                      "explanation": "Vì $u_1 > 0, q = 3 > 1$ nên là dãy tăng."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "11-c2-b1-sa1",
                  "problem": "Một người gửi tiết kiệm $100$ triệu đồng vào ngân hàng với lãi suất $6\\%/\\text{năm}$ theo hình thức lãi kép. Sau $5$ năm, người đó nhận được tổng số tiền gốc và lãi là bao nhiêu triệu đồng? (Làm tròn đến 1 chữ số thập phân)",
                  "correctValue": 133.8,
                  "acceptableAnswers": [
                    "133.8",
                    "133,8",
                    "133.8 triệu"
                  ],
                  "unit": "triệu đồng",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": true,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Công thức lãi kép",
                      "description": "$A = 100(1 + 0{,}06)^5$."
                    },
                    {
                      "stepName": "Bước 2: Tính toán",
                      "description": "$A \\approx 100 \\times 1{,}3382 = 133{,}8$ triệu đồng."
                    }
                  ],
                  "explanation": "Số tiền thu được là khoảng 133.8 triệu đồng."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "11-c3",
        "title": "Chương III: Các số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm",
        "order": 3,
        "description": "Số trung bình, trung vị, tứ phân vị và mốt của mẫu số liệu ghép nhóm",
        "lessons": [
          {
            "id": "11-c3-b1",
            "title": "Bài 8 & 9: Mẫu số liệu ghép nhóm và các số đặc trưng xu thế trung tâm",
            "order": 1,
            "description": "Tính số trung bình $\\bar{x}$, trung vị $M_e$, tứ phân vị $Q_1, Q_2, Q_3$ và mốt $M_o$",
            "theory": {
              "overview": "Phương pháp xác định nhóm chứa trung vị, tứ phân vị, mốt và công thức tính các số đặc trưng đo xu thế trung tâm.",
              "sections": [
                {
                  "title": "1. Trung vị và Mốt của mẫu số liệu ghép nhóm",
                  "content": "- Trung vị $M_e = u_m + \\frac{\\frac{n}{2} - C}{n_m}(u_{m+1} - u_m)$.\n- Mốt $M_o = u_j + \\frac{n_j - n_{j-1}}{(n_j - n_{j-1}) + (n_j - n_{j+1})}(u_{j+1} - u_j)$.",
                  "keyFormulas": [
                    "\\bar{x} = \\frac{1}{n}\\sum n_i c_i",
                    "M_e = u_m + \\frac{n/2 - C}{n_m}(u_{m+1} - u_m)"
                  ]
                }
              ],
              "summaryFormulas": [
                "Q_2 = M_e"
              ],
              "commonMistakes": [
                "Nhầm giữa giá trị đại diện $c_i = \\frac{a_{i-1} + a_i}{2}$ và độ dài nhóm."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "11-c3-b1-mc1",
                  "question": "Giá trị đại diện của nhóm số liệu $[20; 30)$ là:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$25$"
                    },
                    {
                      "key": "B",
                      "content": "$20$"
                    },
                    {
                      "key": "C",
                      "content": "$30$"
                    },
                    {
                      "key": "D",
                      "content": "$10$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "Giá trị đại diện bằng trung bình cộng hai đầu mút: $(20 + 30)/2 = 25$."
                }
              ],
              "trueFalse": [
                {
                  "id": "11-c3-b1-tf1",
                  "context": "Một khảo sát về thời gian tự học (giờ/tuần) của 40 học sinh thu được bảng phân bố ghép nhóm có nhóm trung vị là $[10; 15)$ với tần số nhóm là 15, tổng tần số các nhóm trước là 12.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Tổng cỡ mẫu khảo sát là $n = 40$.",
                      "isCorrect": true,
                      "explanation": "Đề bài cho 40 học sinh."
                    },
                    {
                      "subId": "b",
                      "content": "Vị trí của trung vị tương ứng với giá trị $\\frac{n}{2} = 20$.",
                      "isCorrect": true,
                      "explanation": "$40 / 2 = 20$."
                    },
                    {
                      "subId": "c",
                      "content": "Độ dài của nhóm $[10; 15)$ là $5$.",
                      "isCorrect": true,
                      "explanation": "$15 - 10 = 5$."
                    },
                    {
                      "subId": "d",
                      "content": "Trung vị tính được xấp xỉ bằng $12{,}67$ giờ.",
                      "isCorrect": true,
                      "explanation": "$M_e = 10 + \\frac{20 - 12}{15} \\times 5 = 10 + \\frac{8}{3} \\approx 12{,}67$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "11-c3-b1-sa1",
                  "problem": "Cho bảng số liệu gồm 2 nhóm: nhóm $[0; 10)$ có 4 học sinh, nhóm $[10; 20)$ có 6 học sinh. Tính số trung bình của mẫu số liệu ghép nhóm này.",
                  "correctValue": 11,
                  "acceptableAnswers": [
                    "11"
                  ],
                  "unit": "",
                  "cognitiveLevel": "Thông hiểu",
                  "isRealWorldModeling": false,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Tìm giá trị đại diện",
                      "description": "$c_1 = 5, c_2 = 15$."
                    },
                    {
                      "stepName": "Bước 2: Tính số trung bình",
                      "description": "$\\bar{x} = \\frac{4(5) + 6(15)}{10} = \\frac{20 + 90}{10} = 11$."
                    }
                  ],
                  "explanation": "Số trung bình bằng 11."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "11-c4",
        "title": "Chương IV: Quan hệ song song trong không gian",
        "order": 4,
        "description": "Đường thẳng và mặt phẳng trong không gian, quan hệ song song và phép chiếu song song",
        "lessons": [
          {
            "id": "11-c4-b1",
            "title": "Bài 10 & 11 & 12 & 13: Quan hệ song song trong không gian",
            "order": 1,
            "description": "Đường thẳng song song đường thẳng, đường thẳng song song mặt phẳng và hai mặt phẳng song song",
            "theory": {
              "overview": "Các tính chất và định lý cơ bản về quan hệ song song trong hình học không gian.",
              "sections": [
                {
                  "title": "1. Các định lý then chốt",
                  "content": "- Nếu đường thẳng $d$ không nằm trong $(P)$ và $d \\parallel a \\subset (P)$ thì $d \\parallel (P)$.\n- Nếu $(P) \\parallel (Q)$ và $(R)$ cắt $(P), (Q)$ theo hai giao tuyến $a, b$ thì $a \\parallel b$.\n- Định lý Talet trong không gian.",
                  "keyFormulas": [
                    "d \\not\\subset (P), d \\parallel a, a \\subset (P) \\implies d \\parallel (P)"
                  ]
                }
              ],
              "summaryFormulas": [
                "(P) \\parallel (Q) \\iff \\text{chứa hai đường thẳng cắt nhau cùng song song}"
              ],
              "commonMistakes": [
                "Quên điều kiện hai đường thẳng trong mặt phẳng phải cắt nhau khi chứng minh hai mặt phẳng song song."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "11-c4-b1-mc1",
                  "question": "Cho đường thẳng $a$ song song với mặt phẳng $(P)$. Khẳng định nào sau đây là ĐÚNG?",
                  "options": [
                    {
                      "key": "A",
                      "content": "Đường thẳng $a$ không có điểm chung với mặt phẳng $(P)$"
                    },
                    {
                      "key": "B",
                      "content": "Đường thẳng $a$ có đúng 1 điểm chung với mặt phẳng $(P)$"
                    },
                    {
                      "key": "C",
                      "content": "Đường thẳng $a$ nằm trong mặt phẳng $(P)$"
                    },
                    {
                      "key": "D",
                      "content": "Đường thẳng $a$ vuông góc với mặt phẳng $(P)$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "Theo định nghĩa, đường thẳng song song với mặt phẳng thì không có điểm chung nào."
                }
              ],
              "trueFalse": [
                {
                  "id": "11-c4-b1-tf1",
                  "context": "Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình bình hành tâm $O$. Gọi $M, N$ lần lượt là trung điểm của $SA$ và $SC$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Đường thẳng $MN$ song song với đường thẳng $AC$.",
                      "isCorrect": true,
                      "explanation": "$MN$ là đường trung bình tam giác $SAC$."
                    },
                    {
                      "subId": "b",
                      "content": "Đường thẳng $MN$ song song với mặt phẳng $(ABCD)$.",
                      "isCorrect": true,
                      "explanation": "$MN \\parallel AC \\subset (ABCD)$ và $MN \\not\\subset (ABCD)$."
                    },
                    {
                      "subId": "c",
                      "content": "Giao điểm của đường thẳng $SO$ và mặt phẳng $(BMD)$ là trung điểm của $SO$.",
                      "isCorrect": true,
                      "explanation": "Giao điểm là trung điểm của $SO$."
                    },
                    {
                      "subId": "d",
                      "content": "Mặt phẳng $(BMD)$ song song với mặt phẳng $(SAC)$.",
                      "isCorrect": false,
                      "explanation": "Hai mặt phẳng này cắt nhau theo đường thẳng đi qua các điểm chung."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "11-c4-b1-sa1",
                  "problem": "Cho hình chóp $S.ABCD$ có đáy là hình thang, đáy lớn $AB = 8$, đáy nhỏ $CD = 4$. Mặt phẳng $(\\alpha)$ song song với đáy cắt các cạnh $SA, SB, SC, SD$ lần lượt tại $M, N, P, Q$. Biết $SM/SA = 1/2$. Tính độ dài đoạn thẳng $MN$.",
                  "correctValue": 4,
                  "acceptableAnswers": [
                    "4"
                  ],
                  "unit": "",
                  "cognitiveLevel": "Thông hiểu",
                  "isRealWorldModeling": false,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Áp dụng định lý Talet",
                      "description": "$MN \\parallel AB \\implies \\frac{MN}{AB} = \\frac{SM}{SA} = \\frac{1}{2}$."
                    },
                    {
                      "stepName": "Bước 2: Tính độ dài",
                      "description": "$MN = \\frac{1}{2} AB = \\frac{1}{2}(8) = 4$."
                    }
                  ],
                  "explanation": "$MN = 4$."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "11-c5",
        "title": "Chương V: Giới hạn. Hàm số liên tục",
        "order": 5,
        "description": "Giới hạn dãy số, giới hạn hàm số và tính liên tục của hàm số",
        "lessons": [
          {
            "id": "11-c5-b1",
            "title": "Bài 15 & 16 & 17: Giới hạn và Hàm số liên tục",
            "order": 1,
            "description": "Khử dạng vô định $0/0$, $\\infty/\\infty$ và định lý giá trị trung gian",
            "theory": {
              "overview": "Phương pháp khử các dạng vô định trong giải tích và ứng dụng hàm số liên tục chứng minh phương trình có nghiệm.",
              "sections": [
                {
                  "title": "1. Khử dạng vô định $0/0$",
                  "content": "Khi tính $\\lim_{x \\to x_0} \\frac{P(x)}{Q(x)}$ có dạng $\\frac{0}{0}$:\n- Phân tích đa thức thành nhân tử $(x - x_0)$ để rút gọn.\n- Nhân liên hợp nếu chứa căn thức.",
                  "keyFormulas": [
                    "\\lim_{x \\to x_0} f(x) = f(x_0) \\implies f(x) \\text{ liên tục tại } x_0"
                  ]
                }
              ],
              "summaryFormulas": [
                "f(a) \\cdot f(b) < 0 \\implies \\exists c \\in (a; b): f(c) = 0"
              ],
              "commonMistakes": [
                "Quên đổi dấu liên hợp."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "11-c5-b1-mc1",
                  "question": "Giới hạn $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$ bằng:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$4$"
                    },
                    {
                      "key": "B",
                      "content": "$2$"
                    },
                    {
                      "key": "C",
                      "content": "$0$"
                    },
                    {
                      "key": "D",
                      "content": "$\\infty$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "$\\lim_{x \\to 2} (x + 2) = 4$."
                }
              ],
              "trueFalse": [
                {
                  "id": "11-c5-b1-tf1",
                  "context": "Cho phương trình $x^3 + 3x - 5 = 0$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Hàm số $f(x) = x^3 + 3x - 5$ liên tục trên $\\mathbb{R}$.",
                      "isCorrect": true,
                      "explanation": "Hàm đa thức luôn liên tục."
                    },
                    {
                      "subId": "b",
                      "content": "Giá trị $f(1) = -1 < 0$.",
                      "isCorrect": true,
                      "explanation": "$1 + 3 - 5 = -1$."
                    },
                    {
                      "subId": "c",
                      "content": "Giá trị $f(2) = 9 > 0$.",
                      "isCorrect": true,
                      "explanation": "$8 + 6 - 5 = 9$."
                    },
                    {
                      "subId": "d",
                      "content": "Phương trình không có nghiệm nào trên khoảng $(1; 2)$.",
                      "isCorrect": false,
                      "explanation": "Vì $f(1)f(2) < 0$ nên có ít nhất 1 nghiệm."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "11-c5-b1-sa1",
                  "problem": "Tính giới hạn: $L = \\lim_{x \\to 1} \\frac{\\sqrt{x + 3} - 2}{x - 1}$. (Nhập số thập phân)",
                  "correctValue": 0.25,
                  "acceptableAnswers": [
                    "0.25",
                    "0,25",
                    "1/4"
                  ],
                  "unit": "",
                  "cognitiveLevel": "Thông hiểu",
                  "isRealWorldModeling": false,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Nhân liên hợp",
                      "description": "Rút gọn được $\\frac{1}{\\sqrt{x+3} + 2}$."
                    },
                    {
                      "stepName": "Bước 2: Thay số",
                      "description": "$L = \\frac{1}{4} = 0{,}25$."
                    }
                  ],
                  "explanation": "$L = 0{,}25$."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "11-c6",
        "title": "Chương VI: Hàm số mũ và hàm số lôgarit",
        "order": 6,
        "description": "Lũy thừa, lôgarit, hàm số mũ, hàm số lôgarit và phương trình mũ, lôgarit",
        "lessons": [
          {
            "id": "11-c6-b1",
            "title": "Bài 18 & 19 & 20 & 21: Mũ và Lôgarit",
            "order": 1,
            "description": "Quy tắc tính lũy thừa, logarit và giải phương trình, bất phương trình mũ/logarit",
            "theory": {
              "overview": "Lý thuyết toàn diện về hàm số mũ $y = a^x$ và hàm số logarit $y = \\log_a x$, bài toán tăng trưởng dân số và phóng xạ.",
              "sections": [
                {
                  "title": "1. Tính chất logarit và hàm số mũ",
                  "content": "- $\\log_a b = c \\iff b = a^c$ ($0 < a \\ne 1, b > 0$).\n- $\\log_a(xy) = \\log_a x + \\log_a y$.\n- $(a^x)' = a^x \\ln a, \\quad (\\log_a x)' = \\frac{1}{x \\ln a}$.",
                  "keyFormulas": [
                    "\\log_a b = c \\iff b = a^c",
                    "(\\ln x)' = \\frac{1}{x}"
                  ]
                }
              ],
              "summaryFormulas": [
                "a^{\\log_a b} = b"
              ],
              "commonMistakes": [
                "Quên đặt điều kiện biểu thức dưới logarit dương."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "11-c6-b1-mc1",
                  "question": "Nghiệm của phương trình $\\log_2 (x - 1) = 3$ là:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$x = 9$"
                    },
                    {
                      "key": "B",
                      "content": "$x = 7$"
                    },
                    {
                      "key": "C",
                      "content": "$x = 8$"
                    },
                    {
                      "key": "D",
                      "content": "$x = 10$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "$x - 1 = 2^3 = 8 \\iff x = 9$."
                }
              ],
              "trueFalse": [
                {
                  "id": "11-c6-b1-tf1",
                  "context": "Cho hàm số $y = \\log_3 (2x - 4)$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Tập xác định của hàm số là $D = (2; +\\infty)$.",
                      "isCorrect": true,
                      "explanation": "$2x - 4 > 0 \\iff x > 2$."
                    },
                    {
                      "subId": "b",
                      "content": "Hàm số đồng biến trên tập xác định.",
                      "isCorrect": true,
                      "explanation": "Vì cơ số $3 > 1$."
                    },
                    {
                      "subId": "c",
                      "content": "Đồ thị hàm số đi qua điểm $A(3; 0)$.",
                      "isCorrect": false,
                      "explanation": "$y(3) = \\log_3 2 \\ne 0$."
                    },
                    {
                      "subId": "d",
                      "content": "Đường thẳng $x = 2$ là tiệm cận đứng của đồ thị hàm số.",
                      "isCorrect": true,
                      "explanation": "$\\lim_{x \\to 2^+} y = -\\infty$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "11-c6-b1-sa1",
                  "problem": "Dân số của một quốc gia sau $t$ năm kể từ năm 2020 được ước tính theo công thức $N(t) = 100 \\cdot e^{0{,}012 t}$ (triệu người). Hỏi sau bao nhiêu năm (kể từ năm 2020) thì dân số vượt qua 120 triệu người? (Làm tròn đến số nguyên)",
                  "correctValue": 15,
                  "acceptableAnswers": [
                    "15",
                    "15 năm"
                  ],
                  "unit": "năm",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": true,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Bất phương trình",
                      "description": "$e^{0{,}012 t} \\ge 1{,}2$."
                    },
                    {
                      "stepName": "Bước 2: Logarit",
                      "description": "$t \\ge \\frac{\\ln 1{,}2}{0{,}012} \\approx 15{,}2 \\approx 15$."
                    }
                  ],
                  "explanation": "$t \\approx 15$ năm."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "11-c7",
        "title": "Chương VII: Đạo hàm",
        "order": 7,
        "description": "Định nghĩa đạo hàm, ý nghĩa hình học/vật lý, quy tắc tính đạo hàm và đạo hàm cấp hai",
        "lessons": [
          {
            "id": "11-c7-b1",
            "title": "Bài 22 & 23 & 24: Toàn bộ lý thuyết và quy tắc tính Đạo hàm",
            "order": 1,
            "description": "Tiếp tuyến của đồ thị, quy tắc đạo hàm tổng, tích, thương và hàm hợp",
            "theory": {
              "overview": "Khái niệm đạo hàm tại một điểm, phương trình tiếp tuyến của đồ thị hàm số và các quy tắc tính đạo hàm cơ bản.",
              "sections": [
                {
                  "title": "1. Ý nghĩa hình học và quy tắc",
                  "content": "- Tiếp tuyến tại $M_0(x_0; y_0)$: $y = f'(x_0)(x - x_0) + y_0$.\n- Quy tắc tích: $(uv)' = u'v + uv'$.\n- Quy tắc thương: $\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}$.\n- Hàm hợp: $y'_x = y'_u \\cdot u'_x$.",
                  "keyFormulas": [
                    "y = f'(x_0)(x - x_0) + f(x_0)",
                    "v(t) = s'(t), \\quad a(t) = v'(t) = s''(t)"
                  ]
                }
              ],
              "summaryFormulas": [
                "(x^n)' = n x^{n-1}, \\quad (\\sqrt{x})' = \\frac{1}{2\\sqrt{x}}"
              ],
              "commonMistakes": [
                "Nhầm dấu cộng trong công thức đạo hàm thương."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "11-c7-b1-mc1",
                  "question": "Đạo hàm của hàm số $y = x^3 - 2x + 1$ là:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$y' = 3x^2 - 2$"
                    },
                    {
                      "key": "B",
                      "content": "$y' = 3x^2 - 2x$"
                    },
                    {
                      "key": "C",
                      "content": "$y' = 3x^2 + 2$"
                    },
                    {
                      "key": "D",
                      "content": "$y' = x^2 - 2$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "$(x^3)' = 3x^2, (-2x)' = -2, 1' = 0 \\implies y' = 3x^2 - 2$."
                }
              ],
              "trueFalse": [
                {
                  "id": "11-c7-b1-tf1",
                  "context": "Cho hàm số $y = f(x) = x^2 - 4x + 3$ có đồ thị $(C)$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Đạo hàm của hàm số là $f'(x) = 2x - 4$.",
                      "isCorrect": true,
                      "explanation": "Quy tắc đạo hàm chuẩn."
                    },
                    {
                      "subId": "b",
                      "content": "Hệ số góc của tiếp tuyến của $(C)$ tại điểm có hoành độ $x_0 = 3$ bằng $2$.",
                      "isCorrect": true,
                      "explanation": "$f'(3) = 2(3) - 4 = 2$."
                    },
                    {
                      "subId": "c",
                      "content": "Phương trình tiếp tuyến của $(C)$ tại điểm $M(3; 0)$ là $y = 2x - 6$.",
                      "isCorrect": true,
                      "explanation": "$y = 2(x - 3) + 0 = 2x - 6$."
                    },
                    {
                      "subId": "d",
                      "content": "Không có tiếp tuyến nào của $(C)$ song song với trục hoành.",
                      "isCorrect": false,
                      "explanation": "Tại đỉnh Parabol $x = 2$, $f'(2) = 0$ nên tiếp tuyến $y = -1$ song song với trục hoành."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "11-c7-b1-sa1",
                  "problem": "Một chuyển động xác định bởi phương trình $s(t) = t^3 - 3t^2 + 5t$ với $t$ tính bằng giây, $s$ tính bằng mét. Tính gia tốc của chuyển động tại thời điểm vận tốc triệt tiêu ($v = 0$). (m/s²)",
                  "correctValue": 0,
                  "acceptableAnswers": [
                    "0",
                    "không có",
                    "0 m/s^2"
                  ],
                  "unit": "m/s²",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": true,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Tính vận tốc",
                      "description": "$v(t) = s'(t) = 3t^2 - 6t + 5$."
                    },
                    {
                      "stepName": "Bước 2: Xét nghiệm $v = 0$",
                      "description": "$\\Delta' = 9 - 15 = -6 < 0 \\implies v(t) > 0, \\forall t$, vận tốc không bao giờ triệt tiêu (kết quả bằng 0)."
                    }
                  ],
                  "explanation": "Vận tốc không bao giờ triệt tiêu vì $\\Delta < 0$."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "11-c8",
        "title": "Chương VIII: Quan hệ vuông góc trong không gian",
        "order": 8,
        "description": "Đường thẳng vuông góc mặt phẳng, hai mặt phẳng vuông góc, khoảng cách và thể tích khối đa diện",
        "lessons": [
          {
            "id": "11-c8-b1",
            "title": "Bài 25 & 26 & 27 & 28 & 29: Quan hệ vuông góc và Khoảng cách",
            "order": 1,
            "description": "Đường vuông góc mặt, góc giữa đường và mặt, góc nhị diện và công thức thể tích chóp/lăng trụ",
            "theory": {
              "overview": "Lý thuyết trọng tâm hình học không gian: Chứng minh đường vuông góc mặt, xác định góc giữa đường và mặt, tính khoảng cách từ điểm đến mặt phẳng.",
              "sections": [
                {
                  "title": "1. Điều kiện vuông góc và thể tích",
                  "content": "- $d \\perp a, d \\perp b$ ($a, b \\subset (P)$ cắt nhau) $\\implies d \\perp (P)$.\n- Thể tích chóp: $V = \\frac{1}{3} B \\cdot h$.\n- Thể tích lăng trụ: $V = B \\cdot h$.",
                  "keyFormulas": [
                    "V_{\\text{chóp}} = \\frac{1}{3} S_{\\text{đáy}} \\cdot h",
                    "V_{\\text{lăng trụ}} = S_{\\text{đáy}} \\cdot h"
                  ]
                }
              ],
              "summaryFormulas": [
                "d(M, (P)) = MH \\quad (MH \\perp (P) \\text{ tại } H)"
              ],
              "commonMistakes": [
                "Quên hệ số 1/3 trong công thức thể tích khối chóp."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "11-c8-b1-mc1",
                  "question": "Cho hình chóp $S.ABC$ có đáy $ABC$ là tam giác vuông tại $B$, $SA \\perp (ABC)$. Khẳng định nào sau đây ĐÚNG?",
                  "options": [
                    {
                      "key": "A",
                      "content": "$BC \\perp (SAB)$"
                    },
                    {
                      "key": "B",
                      "content": "$BC \\perp (SAC)$"
                    },
                    {
                      "key": "C",
                      "content": "$AB \\perp (SBC)$"
                    },
                    {
                      "key": "D",
                      "content": "$AC \\perp (SAB)$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Thông hiểu",
                  "explanation": "$BC \\perp AB$ và $BC \\perp SA \\implies BC \\perp (SAB)$."
                }
              ],
              "trueFalse": [
                {
                  "id": "11-c8-b1-tf1",
                  "context": "Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $a$, $SA \\perp (ABCD)$ và $SA = a\\sqrt{2}$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Diện tích đáy $S_{ABCD} = a^2$.",
                      "isCorrect": true,
                      "explanation": "Hình vuông cạnh $a$."
                    },
                    {
                      "subId": "b",
                      "content": "Thể tích khối chóp $S.ABCD$ là $V = \\frac{a^3\\sqrt{2}}{3}$.",
                      "isCorrect": true,
                      "explanation": "$V = \\frac{1}{3} a^2 \\cdot a\\sqrt{2} = \\frac{a^3\\sqrt{2}}{3}$."
                    },
                    {
                      "subId": "c",
                      "content": "Tam giác $SBC$ là tam giác vuông tại $B$.",
                      "isCorrect": true,
                      "explanation": "Vì $BC \\perp (SAB) \\implies BC \\perp SB$."
                    },
                    {
                      "subId": "d",
                      "content": "Góc giữa đường thẳng $SC$ và mặt phẳng đáy bằng $60^\\circ$.",
                      "isCorrect": false,
                      "explanation": "Hình chiếu của $SC$ lên đáy là $AC = a\\sqrt{2}$. Vì $SA = AC = a\\sqrt{2}$ nên góc $\\widehat{SCA} = 45^\\circ$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "11-c8-b1-sa1",
                  "problem": "Cho hình chóp tam giác đều $S.ABC$ có cạnh đáy bằng $6$ và chiều cao $h = 4$. Tính thể tích khối chóp $S.ABC$. (Làm tròn đến 1 chữ số thập phân)",
                  "correctValue": 20.8,
                  "acceptableAnswers": [
                    "20.8",
                    "20,8",
                    "12 căn 3",
                    "20.78"
                  ],
                  "unit": "",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": false,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Diện tích đáy",
                      "description": "$S = \\frac{6^2\\sqrt{3}}{4} = 9\\sqrt{3}$."
                    },
                    {
                      "stepName": "Bước 2: Thể tích",
                      "description": "$V = \\frac{1}{3} (9\\sqrt{3}) (4) = 12\\sqrt{3} \\approx 20{,}78 \\approx 20{,}8$."
                    }
                  ],
                  "explanation": "$V = 12\\sqrt{3} \\approx 20{,}8$."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "11-c9",
        "title": "Chương IX: Xác suất",
        "order": 9,
        "description": "Biến cố giao, biến cố hợp, quy tắc nhân và quy tắc cộng xác suất",
        "lessons": [
          {
            "id": "11-c9-b1",
            "title": "Bài 30 & 31: Quy tắc cộng và Quy tắc nhân xác suất",
            "order": 1,
            "description": "Biến cố xung khắc, biến cố độc lập và công thức tính xác suất",
            "theory": {
              "overview": "Phân biệt hai biến cố độc lập và hai biến cố xung khắc; áp dụng công thức cộng và công thức nhân xác suất.",
              "sections": [
                {
                  "title": "1. Quy tắc cộng và nhân xác suất",
                  "content": "- Nếu $A$ và $B$ xung khắc: $P(A \\cup B) = P(A) + P(B)$.\n- Với hai biến cố bất kỳ: $P(A \\cup B) = P(A) + P(B) - P(AB)$.\n- Nếu $A$ và $B$ độc lập: $P(AB) = P(A) \\cdot P(B)$.",
                  "keyFormulas": [
                    "P(A \\cup B) = P(A) + P(B) - P(AB)",
                    "P(AB) = P(A) \\cdot P(B) \\quad (A, B \\text{ độc lập})"
                  ]
                }
              ],
              "summaryFormulas": [
                "P(\\bar{A}) = 1 - P(A)"
              ],
              "commonMistakes": [
                "Nhầm lẫn giữa độc lập và xung khắc."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "11-c9-b1-mc1",
                  "question": "Cho hai biến cố $A$ và $B$ độc lập thỏa mãn $P(A) = 0{,}3$ và $P(B) = 0{,}4$. Xác suất $P(AB)$ bằng:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$0{,}12$"
                    },
                    {
                      "key": "B",
                      "content": "$0{,}7$"
                    },
                    {
                      "key": "C",
                      "content": "$0{,}1$"
                    },
                    {
                      "key": "D",
                      "content": "$0{,}58$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "Do $A$ và $B$ độc lập nên $P(AB) = P(A)P(B) = 0{,}3 \\times 0{,}4 = 0{,}12$."
                }
              ],
              "trueFalse": [
                {
                  "id": "11-c9-b1-tf1",
                  "context": "Hai xạ thủ cùng bắn độc lập vào một bia. Xác suất bắn trúng bia của xạ thủ 1 là $0{,}8$, của xạ thủ 2 là $0{,}7$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Xác suất để cả hai xạ thủ cùng bắn trúng là $0{,}56$.",
                      "isCorrect": true,
                      "explanation": "$0{,}8 \\times 0{,}7 = 0{,}56$."
                    },
                    {
                      "subId": "b",
                      "content": "Xác suất để cả hai xạ thủ cùng bắn trượt là $0{,}06$.",
                      "isCorrect": true,
                      "explanation": "$(1 - 0{,}8)(1 - 0{,}7) = 0{,}2 \\times 0{,}3 = 0{,}06$."
                    },
                    {
                      "subId": "c",
                      "content": "Xác suất để có ít nhất một xạ thủ bắn trúng bia là $0{,}94$.",
                      "isCorrect": true,
                      "explanation": "$1 - 0{,}06 = 0{,}94$."
                    },
                    {
                      "subId": "d",
                      "content": "Xác suất để chỉ có đúng một xạ thủ bắn trúng là $0{,}56$.",
                      "isCorrect": false,
                      "explanation": "$0{,}8(0{,}3) + 0{,}2(0{,}7) = 0{,}24 + 0{,}14 = 0{,}38$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "11-c9-b1-sa1",
                  "problem": "Một đề thi trắc nghiệm gồm 4 câu hỏi độc lập, mỗi câu có 4 phương án lựa chọn và chỉ có 1 phương án đúng. Một học sinh chọn ngẫu nhiên đáp án cho cả 4 câu. Tính xác suất để học sinh đó trả lời đúng cả 4 câu. (Nhập số thập phân làm tròn 4 chữ số)",
                  "correctValue": 0.0039,
                  "acceptableAnswers": [
                    "0.0039",
                    "0,0039",
                    "1/256"
                  ],
                  "unit": "",
                  "cognitiveLevel": "Thông hiểu",
                  "isRealWorldModeling": true,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Xác suất mỗi câu",
                      "description": "$p = 1/4 = 0{,}25$."
                    },
                    {
                      "stepName": "Bước 2: Xác suất cả 4 câu",
                      "description": "$P = (1/4)^4 = 1/256 \\approx 0{,}0039$."
                    }
                  ],
                  "explanation": "$P = 1/256 \\approx 0{,}0039$."
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    "grade": "10",
    "name": "Toán Lớp 10",
    "badge": "Nền tảng Đại số & Hình học phẳng",
    "description": "Mệnh đề, Tập hợp, Bất phương trình hai ẩn, Hệ thức lượng tam giác, Vectơ, Thống kê, Bậc hai, Conic, Tổ hợp và Xác suất cổ điển chuẩn SGK Kết nối tri thức với cuộc sống",
    "chapters": [
      {
        "id": "10-c1",
        "title": "Chương I: Mệnh đề và tập hợp",
        "order": 1,
        "description": "Mệnh đề toán học, mệnh đề phủ định, tập hợp và các phép toán giao, hợp, hiệu",
        "lessons": [
          {
            "id": "10-c1-b1",
            "title": "Bài 1 & 2: Mệnh đề và các phép toán trên tập hợp",
            "order": 1,
            "description": "Giao $A \\cap B$, hợp $A \\cup B$, hiệu $A \\setminus B$ và phần bù",
            "theory": {
              "overview": "Nền tảng logic toán học và lý thuyết tập hợp mở đầu cho chương trình THPT.",
              "sections": [
                {
                  "title": "1. Các phép toán tập hợp",
                  "content": "- Giao: $A \\cap B = \\{x \\mid x \\in A \\text{ và } x \\in B\\}$\n- Hợp: $A \\cup B = \\{x \\mid x \\in A \\text{ hoặc } x \\in B\\}$\n- Hiệu: $A \\setminus B = \\{x \\mid x \\in A \\text{ và } x \\notin B\\}$",
                  "keyFormulas": [
                    "A \\cap B, \\quad A \\cup B, \\quad A \\setminus B"
                  ]
                }
              ],
              "summaryFormulas": [
                "C_E A = E \\setminus A"
              ],
              "commonMistakes": [
                "Nhầm lẫn giữa ngoặc tròn (khoảng) và ngoặc vuông (đoạn)."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "10-c1-b1-mc1",
                  "question": "Cho hai tập hợp $A = [1; 4]$ và $B = (2; 6)$. Tập hợp $A \\cap B$ là:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$(2; 4]$"
                    },
                    {
                      "key": "B",
                      "content": "[1; 6)"
                    },
                    {
                      "key": "C",
                      "content": "[2; 4]"
                    },
                    {
                      "key": "D",
                      "content": "(1; 4)"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "Phần chung của $[1; 4]$ và $(2; 6)$ là $(2; 4]$."
                }
              ],
              "trueFalse": [
                {
                  "id": "10-c1-b1-tf1",
                  "context": "Cho hai tập hợp $A = \\{x \\in \\mathbb{R} \\mid x^2 - 4x + 3 = 0\\}$ và $B = \\{1; 3; 5\\}$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Tập hợp $A = \\{1; 3\\}$.",
                      "isCorrect": true,
                      "explanation": "$x^2 - 4x + 3 = 0 \\iff x = 1$ hoặc $x = 3$."
                    },
                    {
                      "subId": "b",
                      "content": "Tập hợp $A$ là tập con của tập hợp $B$.",
                      "isCorrect": true,
                      "explanation": "Mọi phần tử của $A$ đều thuộc $B$."
                    },
                    {
                      "subId": "c",
                      "content": "Tập hợp giao $A \\cap B = \\{1; 3; 5\\}$.",
                      "isCorrect": false,
                      "explanation": "$A \\cap B = \\{1; 3\\}$."
                    },
                    {
                      "subId": "d",
                      "content": "Tập hợp hiệu $B \\setminus A = \\{5\\}$.",
                      "isCorrect": true,
                      "explanation": "Bỏ các phần tử thuộc $A$ khỏi $B$ còn $\\{5\\}$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "10-c1-b1-sa1",
                  "problem": "Lớp 10A có 45 học sinh, trong đó có 25 học sinh thích môn Toán, 20 học sinh thích môn Văn và 10 học sinh thích cả hai môn Toán và Văn. Hỏi có bao nhiêu học sinh trong lớp không thích cả hai môn Toán và Văn?",
                  "correctValue": 10,
                  "acceptableAnswers": [
                    "10",
                    "10 học sinh",
                    "10 em"
                  ],
                  "unit": "học sinh",
                  "cognitiveLevel": "Thông hiểu",
                  "isRealWorldModeling": true,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Công thức hợp",
                      "description": "$|A \\cup B| = 25 + 20 - 10 = 35$."
                    },
                    {
                      "stepName": "Bước 2: Tìm phần bù",
                      "description": "$45 - 35 = 10$."
                    }
                  ],
                  "explanation": "Số bạn không thích môn nào là $45 - 35 = 10$."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "10-c2",
        "title": "Chương II: Bất phương trình và Hệ bất phương trình bậc nhất hai ẩn",
        "order": 2,
        "description": "Biểu diễn miền nghiệm và bài toán quy hoạch tuyến tính tối ưu hóa kinh tế",
        "lessons": [
          {
            "id": "10-c2-b1",
            "title": "Bài 3 & 4: Bất phương trình và hệ bất phương trình bậc nhất hai ẩn",
            "order": 1,
            "description": "Miền nghiệm đa giác và tìm giá trị lớn nhất của biểu thức mục tiêu $F(x; y) = ax + by$",
            "theory": {
              "overview": "Biểu diễn miền nghiệm của hệ bất phương trình bậc nhất hai ẩn và áp dụng tìm phương án sản xuất tối ưu tại các đỉnh của đa giác miền nghiệm.",
              "sections": [
                {
                  "title": "1. Định lý tối ưu hóa trên miền đa giác",
                  "content": "Giá trị lớn nhất hoặc nhỏ nhất của biểu thức $F(x; y) = ax + by$ trên miền đa giác lồi luôn đạt được tại một trong các đỉnh của miền đa giác đó.",
                  "keyFormulas": [
                    "\\max F(x; y) = \\max \\{F(A_1), F(A_2), ..., F(A_k)\\}"
                  ]
                }
              ],
              "summaryFormulas": [
                "ax + by \\le c"
              ],
              "commonMistakes": [
                "Xác định nhầm miền nghiệm khi gạch bỏ nửa mặt phẳng không thỏa mãn."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "10-c2-b1-mc1",
                  "question": "Điểm nào sau đây thuộc miền nghiệm của bất phương trình $2x - y + 3 > 0$?",
                  "options": [
                    {
                      "key": "A",
                      "content": "$(0; 0)$"
                    },
                    {
                      "key": "B",
                      "content": "$(-2; 0)$"
                    },
                    {
                      "key": "C",
                      "content": "$(0; 4)$"
                    },
                    {
                      "key": "D",
                      "content": "$(-3; -1)$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "Thay $(0; 0)$ vào ta được $2(0) - 0 + 3 = 3 > 0$ (thỏa mãn)."
                }
              ],
              "trueFalse": [
                {
                  "id": "10-c2-b1-tf1",
                  "context": "Một xưởng sản xuất bàn và ghế. Mỗi chiếc bàn cần 2 giờ cưa gỗ và 1 giờ sơn. Mỗi chiếc ghế cần 1 giờ cưa gỗ và 1 giờ sơn. Xưởng có tối đa 100 giờ cưa gỗ và 80 giờ sơn mỗi tuần.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Gọi $x, y$ lần lượt là số bàn và ghế ($x, y \\ge 0$). Hệ ràng buộc là $\\begin{cases} 2x + y \\le 100 \\\\ x + y \\le 80 \\end{cases}$.",
                      "isCorrect": true,
                      "explanation": "Đúng theo dữ kiện đề bài."
                    },
                    {
                      "subId": "b",
                      "content": "Cặp số $(30; 30)$ là một phương án sản xuất khả thi.",
                      "isCorrect": true,
                      "explanation": "$2(30) + 30 = 90 \\le 100$ và $30 + 30 = 60 \\le 80$."
                    },
                    {
                      "subId": "c",
                      "content": "Miền nghiệm của hệ là một miền đa giác tứ giác kể cả biên.",
                      "isCorrect": true,
                      "explanation": "Các đỉnh là $O(0; 0), A(50; 0), B(20; 60), C(0; 80)$."
                    },
                    {
                      "subId": "d",
                      "content": "Nếu tiền lãi mỗi chiếc bàn là 400 nghìn, mỗi ghế là 300 nghìn thì lợi nhuận lớn nhất đạt được khi sản xuất 50 bàn và 0 ghế.",
                      "isCorrect": false,
                      "explanation": "Tại $B(20; 60)$, lãi $= 26$ triệu, lớn hơn tại $A(50; 0)$ là 20 triệu."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "10-c2-b1-sa1",
                  "problem": "Một bác nông dân dự định trồng ngô và đậu xanh trên diện tích 8 ha. Tiền lãi mỗi ha ngô là 10 triệu đồng, mỗi ha đậu xanh là 20 triệu đồng. Mỗi ha ngô cần 20 công, mỗi ha đậu xanh cần 30 công. Tổng số công không quá 180. Hỏi bác nông dân nên trồng bao nhiêu ha đậu xanh để thu được lợi nhuận lớn nhất?",
                  "correctValue": 6,
                  "acceptableAnswers": [
                    "6",
                    "6 ha",
                    "6ha"
                  ],
                  "unit": "ha",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": true,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Hệ ràng buộc",
                      "description": "$x + y \\le 8, 20x + 30y \\le 180 \\implies 2x + 3y \\le 18, x \\ge 0, y \\ge 0$."
                    },
                    {
                      "stepName": "Bước 2: Tìm đỉnh miền nghiệm",
                      "description": "Giao điểm các biên là $O(0; 0), A(8; 0), B(6; 2), C(0; 6)$."
                    },
                    {
                      "stepName": "Bước 3: Lợi nhuận",
                      "description": "$L = 10x + 20y$. Tại $C(0; 6): L = 120$ triệu. Tại $B(6; 2): L = 100$ triệu. Nên trồng 6 ha đậu xanh."
                    }
                  ],
                  "explanation": "Lợi nhuận lớn nhất 120 triệu khi trồng 6 ha đậu xanh và 0 ha ngô."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "10-c3",
        "title": "Chương III: Hệ thức lượng trong tam giác",
        "order": 3,
        "description": "Định lý cosin, định lý sin và các công thức tính diện tích tam giác",
        "lessons": [
          {
            "id": "10-c3-b1",
            "title": "Bài 5 & 6: Định lý cosin, định lý sin và công thức diện tích tam giác",
            "order": 1,
            "description": "Giải tam giác và ứng dụng đo đạc khoảng cách thực tế",
            "theory": {
              "overview": "Hệ thức lượng trong tam giác bất kỳ: Định lý cosin, định lý sin, công thức Heron và ứng dụng đo đạc chiều cao ngọn hải đăng, khoảng cách giữa hai đảo.",
              "sections": [
                {
                  "title": "1. Định lý cosin và định lý sin",
                  "content": "- Định lý cosin: $a^2 = b^2 + c^2 - 2bc \\cos A$\n- Định lý sin: $\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R$\n- Diện tích: $S = \\frac{1}{2}ab\\sin C = \\frac{abc}{4R} = pr = \\sqrt{p(p-a)(p-b)(p-c)}$",
                  "keyFormulas": [
                    "a^2 = b^2 + c^2 - 2bc \\cos A",
                    "\\frac{a}{\\sin A} = 2R"
                  ]
                }
              ],
              "summaryFormulas": [
                "S = \\sqrt{p(p-a)(p-b)(p-c)}"
              ],
              "commonMistakes": [
                "Quên dấu trừ trước số hạng $2bc \\cos A$ trong định lý cosin."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "10-c3-b1-mc1",
                  "question": "Cho tam giác $ABC$ có $b = 5, c = 8$ và góc $\\widehat{A} = 60^\\circ$. Độ dài cạnh $a$ bằng:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$7$"
                    },
                    {
                      "key": "B",
                      "content": "$\\sqrt{49}$"
                    },
                    {
                      "key": "C",
                      "content": "$6$"
                    },
                    {
                      "key": "D",
                      "content": "$8$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Thông hiểu",
                  "explanation": "$a^2 = 25 + 64 - 2(5)(8)(0{,}5) = 49 \\implies a = 7$."
                }
              ],
              "trueFalse": [
                {
                  "id": "10-c3-b1-tf1",
                  "context": "Cho tam giác $ABC$ có ba cạnh $a = 13, b = 14, c = 15$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Nửa chu vi của tam giác là $p = 21$.",
                      "isCorrect": true,
                      "explanation": "$p = (13 + 14 + 15)/2 = 21$."
                    },
                    {
                      "subId": "b",
                      "content": "Diện tích tam giác $ABC$ theo công thức Heron là $S = 84$.",
                      "isCorrect": true,
                      "explanation": "$S = \\sqrt{21(8)(7)(6)} = 84$."
                    },
                    {
                      "subId": "c",
                      "content": "Bán kính đường tròn ngoại tiếp tam giác là $R = 8{,}125$.",
                      "isCorrect": true,
                      "explanation": "$R = \\frac{abc}{4S} = \\frac{2730}{336} = 8{,}125$."
                    },
                    {
                      "subId": "d",
                      "content": "Tam giác $ABC$ là tam giác vuông.",
                      "isCorrect": false,
                      "explanation": "$13^2 + 14^2 \\ne 15^2$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "10-c3-b1-sa1",
                  "problem": "Để đo khoảng cách giữa hai điểm $A$ và $B$ bị ngăn cách bởi một hồ nước, một trắc địa viên đứng tại vị trí $C$ đo được $CA = 100\\text{ m}, CB = 150\\text{ m}$ và góc $\\widehat{ACB} = 60^\\circ$. Khoảng cách $AB$ bằng bao nhiêu mét? (Làm tròn đến hàng đơn vị mét)",
                  "correctValue": 132,
                  "acceptableAnswers": [
                    "132",
                    "132 m",
                    "132m"
                  ],
                  "unit": "m",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": true,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Áp dụng định lý cosin",
                      "description": "$AB^2 = 100^2 + 150^2 - 2(100)(150)(0{,}5) = 17500$."
                    },
                    {
                      "stepName": "Bước 2: Khai căn",
                      "description": "$AB = \\sqrt{17500} \\approx 132{,}287 \\approx 132\\text{ m}$."
                    }
                  ],
                  "explanation": "$AB = \\sqrt{17500} \\approx 132\\text{ m}$."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "10-c4",
        "title": "Chương IV: Vectơ",
        "order": 4,
        "description": "Khái niệm vectơ, tổng và hiệu hai vectơ, tích vectơ với số và tích vô hướng",
        "lessons": [
          {
            "id": "10-c4-b1",
            "title": "Bài 7 & 8 & 9 & 10: Toàn bộ lý thuyết và bài toán Vectơ phẳng",
            "order": 1,
            "description": "Quy tắc 3 điểm, hình bình hành, trọng tâm, trung điểm và tích vô hướng hai vectơ",
            "theory": {
              "overview": "Hệ thống quy tắc hình học vectơ cơ bản: quy tắc 3 điểm, quy tắc hình bình hành, quy tắc trung điểm và tích vô hướng.",
              "sections": [
                {
                  "title": "1. Các quy tắc cơ bản",
                  "content": "- Quy tắc 3 điểm: $\\vec{AB} + \\vec{BC} = \\vec{AC}, \\quad \\vec{AB} - \\vec{AC} = \\vec{CB}$\n- Quy tắc trung điểm: $M$ là trung điểm $AB \\implies \\vec{OA} + \\vec{OB} = 2\\vec{OM}$\n- Tích vô hướng: $\\vec{u} \\cdot \\vec{v} = |\\vec{u}| |\\vec{v}| \\cos(\\vec{u}, \\vec{v})$",
                  "keyFormulas": [
                    "\\vec{AB} + \\vec{BC} = \\vec{AC}",
                    "\\vec{u} \\cdot \\vec{v} = |\\vec{u}| |\\vec{v}| \\cos\\theta"
                  ]
                }
              ],
              "summaryFormulas": [
                "\\vec{GA} + \\vec{GB} + \\vec{GC} = \\vec{0}"
              ],
              "commonMistakes": [
                "Nhầm thứ tự điểm trong quy tắc trừ."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "10-c4-b1-mc1",
                  "question": "Cho hình bình hành $ABCD$. Đẳng thức nào sau đây ĐÚNG?",
                  "options": [
                    {
                      "key": "A",
                      "content": "$\\vec{AB} + \\vec{AD} = \\vec{AC}$"
                    },
                    {
                      "key": "B",
                      "content": "$\\vec{AB} + \\vec{AC} = \\vec{AD}$"
                    },
                    {
                      "key": "C",
                      "content": "$\\vec{AB} + \\vec{AD} = \\vec{BD}$"
                    },
                    {
                      "key": "D",
                      "content": "$\\vec{BA} + \\vec{BC} = \\vec{DB}$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "Quy tắc hình bình hành: $\\vec{AB} + \\vec{AD} = \\vec{AC}$."
                }
              ],
              "trueFalse": [
                {
                  "id": "10-c4-b1-tf1",
                  "context": "Cho tam giác đều $ABC$ cạnh bằng $a$, gọi $H$ là trung điểm của cạnh $BC$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Vectơ $\\vec{AH}$ vuông góc với vectơ $\\vec{BC}$.",
                      "isCorrect": true,
                      "explanation": "Trong tam giác đều, trung tuyến đồng thời là đường cao."
                    },
                    {
                      "subId": "b",
                      "content": "Tích vô hướng $\\vec{AH} \\cdot \\vec{BC} = 0$.",
                      "isCorrect": true,
                      "explanation": "Hai vectơ vuông góc có tích vô hướng bằng 0."
                    },
                    {
                      "subId": "c",
                      "content": "Độ dài vectơ $|\\vec{AB} + \\vec{AC}| = a\\sqrt{3}$.",
                      "isCorrect": true,
                      "explanation": "$2AH = 2(a\\sqrt{3}/2) = a\\sqrt{3}$."
                    },
                    {
                      "subId": "d",
                      "content": "Góc giữa hai vectơ $\\vec{AB}$ và $\\vec{AC}$ bằng $120^\\circ$.",
                      "isCorrect": false,
                      "explanation": "Góc giữa hai cạnh của tam giác đều bằng $60^\\circ$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "10-c4-b1-sa1",
                  "problem": "Hai lực $\\vec{F}_1$ và $\\vec{F}_2$ cùng tác dụng vào một vật tại điểm $O$. Biết hai lực vuông góc với nhau và có độ lớn lần lượt là $|\\vec{F}_1| = 30\\text{ N}$ và $|\\vec{F}_2| = 40\\text{ N}$. Tính độ lớn của hợp lực $\\vec{F} = \\vec{F}_1 + \\vec{F}_2$ tác dụng lên vật (Newton).",
                  "correctValue": 50,
                  "acceptableAnswers": [
                    "50",
                    "50 N",
                    "50N"
                  ],
                  "unit": "N",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": true,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Tính độ lớn",
                      "description": "$|\\vec{F}| = \\sqrt{30^2 + 40^2} = \\sqrt{2500} = 50\\text{ N}$."
                    }
                  ],
                  "explanation": "Hợp lực có độ lớn bằng $50\\text{ N}$."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "10-c5",
        "title": "Chương V: Các số đặc trưng của mẫu số liệu không ghép nhóm",
        "order": 5,
        "description": "Số gần đúng, sai số, số trung bình, trung vị, tứ phân vị, khoảng biến thiên và độ lệch chuẩn",
        "lessons": [
          {
            "id": "10-c5-b1",
            "title": "Bài 11 & 12 & 13 & 14: Thống kê mô tả mẫu số liệu không ghép nhóm",
            "order": 1,
            "description": "Đo xu thế trung tâm và độ phân tán cho bảng số liệu rời rạc",
            "theory": {
              "overview": "Các số đặc trưng đo xu thế trung tâm (số trung bình, trung vị, mốt) và đo độ phân tán (khoảng biến thiên, khoảng tứ phân vị, phương sai, độ lệch chuẩn).",
              "sections": [
                {
                  "title": "1. Các số đặc trưng thống kê",
                  "content": "- Số trung bình: $\\bar{x} = \\frac{x_1 + x_2 + ... + x_n}{n}$.\n- Khoảng biến thiên: $R = x_{\\max} - x_{\\min}$.\n- Khoảng tứ phân vị: $\\Delta_Q = Q_3 - Q_1$.\n- Phương sai $s^2$, độ lệch chuẩn $s = \\sqrt{s^2}$.",
                  "keyFormulas": [
                    "\\bar{x} = \\frac{1}{n}\\sum x_i",
                    "s = \\sqrt{s^2}"
                  ]
                }
              ],
              "summaryFormulas": [
                "\\Delta_Q = Q_3 - Q_1"
              ],
              "commonMistakes": [
                "Quên sắp xếp mẫu số liệu theo thứ tự không giảm trước khi tìm trung vị và tứ phân vị."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "10-c5-b1-mc1",
                  "question": "Cho mẫu số liệu: $2, 4, 6, 8, 10$. Số trung bình của mẫu số liệu trên là:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$6$"
                    },
                    {
                      "key": "B",
                      "content": "$5$"
                    },
                    {
                      "key": "C",
                      "content": "$7$"
                    },
                    {
                      "key": "D",
                      "content": "$8$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "$\\bar{x} = (2 + 4 + 6 + 8 + 10)/5 = 30/5 = 6$."
                }
              ],
              "trueFalse": [
                {
                  "id": "10-c5-b1-tf1",
                  "context": "Cho mẫu số liệu điểm kiểm tra của 7 học sinh: $5, 6, 7, 7, 8, 9, 10$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Mốt của mẫu số liệu là $M_o = 7$.",
                      "isCorrect": true,
                      "explanation": "Điểm 7 xuất hiện nhiều nhất (2 lần)."
                    },
                    {
                      "subId": "b",
                      "content": "Trung vị của mẫu số liệu là $M_e = 7$.",
                      "isCorrect": true,
                      "explanation": "Số đứng ở vị trí thứ 4 là 7."
                    },
                    {
                      "subId": "c",
                      "content": "Khoảng biến thiên của mẫu số liệu là $R = 5$.",
                      "isCorrect": true,
                      "explanation": "$10 - 5 = 5$."
                    },
                    {
                      "subId": "d",
                      "content": "Số trung bình của mẫu số liệu nhỏ hơn trung vị.",
                      "isCorrect": false,
                      "explanation": "$\\bar{x} = 52/7 \\approx 7{,}43 > 7$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "10-c5-b1-sa1",
                  "problem": "Cho mẫu số liệu điểm số: $4, 6, 7, 9, 14$. Tìm khoảng biến thiên $R$ của mẫu số liệu này.",
                  "correctValue": 10,
                  "acceptableAnswers": [
                    "10"
                  ],
                  "unit": "",
                  "cognitiveLevel": "Nhận biết",
                  "isRealWorldModeling": false,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Tính khoảng biến thiên",
                      "description": "$R = x_{\\max} - x_{\\min} = 14 - 4 = 10$."
                    }
                  ],
                  "explanation": "$R = 14 - 4 = 10$."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "10-c6",
        "title": "Chương VI: Hàm số, đồ thị và ứng dụng",
        "order": 6,
        "description": "Hàm số bậc hai, dấu tam thức bậc hai và phương trình quy về bậc hai",
        "lessons": [
          {
            "id": "10-c6-b1",
            "title": "Bài 15 & 16 & 17 & 18: Hàm số bậc hai và Tam thức bậc hai",
            "order": 1,
            "description": "Đỉnh Parabol, bảng biến thiên, định lý dấu tam thức bậc hai và phương trình chứa căn",
            "theory": {
              "overview": "Khảo sát hàm số bậc hai $y = ax^2 + bx + c$, định lý về dấu tam thức bậc hai và giải phương trình vô tỉ $\\sqrt{A} = B, \\sqrt{A} = \\sqrt{B}$.",
              "sections": [
                {
                  "title": "1. Hàm số bậc hai và dấu tam thức",
                  "content": "- Đỉnh Parabol: $I\\left(-\\frac{b}{2a}; -\\frac{\\Delta}{4a}\\right)$, trục đối xứng $x = -\\frac{b}{2a}$.\n- Dấu tam thức: \"Trong trái, ngoài cùng\" khi $\\Delta > 0$.\n- Giải $\\sqrt{A} = B \\iff \\begin{cases} B \\ge 0 \\\\ A = B^2 \\end{cases}$.",
                  "keyFormulas": [
                    "x = -\\frac{b}{2a}",
                    "\\sqrt{A} = B \\iff \\begin{cases} B \\ge 0 \\\\ A = B^2 \\end{cases}"
                  ]
                }
              ],
              "summaryFormulas": [
                "\\Delta = b^2 - 4ac"
              ],
              "commonMistakes": [
                "Quên điều kiện $B \\ge 0$ khi bình phương hai vế phương trình $\\sqrt{A} = B$."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "10-c6-b1-mc1",
                  "question": "Tọa độ đỉnh $I$ của Parabol $y = x^2 - 4x + 3$ là:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$I(2; -1)$"
                    },
                    {
                      "key": "B",
                      "content": "$I(-2; 15)$"
                    },
                    {
                      "key": "C",
                      "content": "$I(1; 0)$"
                    },
                    {
                      "key": "D",
                      "content": "$I(2; 1)$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "$x = -b/(2a) = 4/2 = 2 \\implies y = 4 - 8 + 3 = -1$. Đỉnh $I(2; -1)$."
                }
              ],
              "trueFalse": [
                {
                  "id": "10-c6-b1-tf1",
                  "context": "Cho phương trình vô tỉ $\\sqrt{2x - 3} = x - 3$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Điều kiện xác định của biểu thức dưới căn là $x \\ge \\frac{3}{2}$.",
                      "isCorrect": true,
                      "explanation": "$2x - 3 \\ge 0 \\iff x \\ge 3/2$."
                    },
                    {
                      "subId": "b",
                      "content": "Khi bình phương hai vế, điều kiện để phương trình tương đương là vế phải $x - 3 \\ge 0 \\iff x \\ge 3$.",
                      "isCorrect": true,
                      "explanation": "Vế phải phải không âm trước khi bình phương."
                    },
                    {
                      "subId": "c",
                      "content": "Phương trình quy về có hai nghiệm là $x = 2$ và $x = 6$.",
                      "isCorrect": true,
                      "explanation": "$2x - 3 = x^2 - 6x + 9 \\iff x^2 - 8x + 12 = 0 \\iff x = 2$ hoặc $x = 6$."
                    },
                    {
                      "subId": "d",
                      "content": "Tập nghiệm của phương trình là $S = \\{2; 6\\}$.",
                      "isCorrect": false,
                      "explanation": "Vì điều kiện $x \\ge 3$ nên loại nghiệm ngoại lai $x = 2$. Tập nghiệm chỉ có $S = \\{6\\}$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "10-c6-b1-sa1",
                  "problem": "Cổng vào một công viên có hình dạng một Parabol có chiều rộng ở mặt đất là $8\\text{ m}$ và chiều cao đỉnh cổng là $4\\text{ m}$. Một chiếc xe tải chở hàng có chiều rộng $4\\text{ m}$ muốn đi qua cổng. Hỏi chiều cao tối đa của xe tải bằng bao nhiêu mét để có thể qua cổng an toàn?",
                  "correctValue": 3,
                  "acceptableAnswers": [
                    "3",
                    "3 m",
                    "3m"
                  ],
                  "unit": "m",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": true,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Chọn hệ trục tọa độ",
                      "description": "Gốc $O$ tại tâm đáy, Parabol có phương trình $y = -ax^2 + 4$."
                    },
                    {
                      "stepName": "Bước 2: Tìm hệ số $a$",
                      "description": "Đi qua điểm $(4; 0) \\implies -a(16) + 4 = 0 \\implies a = 1/4$. Phương trình $y = -\\frac{1}{4}x^2 + 4$."
                    },
                    {
                      "stepName": "Bước 3: Chiều cao tối đa",
                      "description": "Xe rộng $4\\text{ m} \\implies x = 2$. Thay vào: $y = -\\frac{1}{4}(4) + 4 = 3\\text{ m}$."
                    }
                  ],
                  "explanation": "Chiều cao tối đa của xe là $3\\text{ m}$."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "10-c7",
        "title": "Chương VII: Phương pháp tọa độ trong mặt phẳng",
        "order": 7,
        "description": "Phương trình đường thẳng, góc, khoảng cách, phương trình đường tròn và ba đường conic",
        "lessons": [
          {
            "id": "10-c7-b1",
            "title": "Bài 19 & 20 & 21 & 22: Hình học phẳng Oxy và ba đường Conic",
            "order": 1,
            "description": "Vị trí tương đối, khoảng cách, phương trình tiếp tuyến đường tròn và Elip, Hypebol, Parabol",
            "theory": {
              "overview": "Lập phương trình đường thẳng, đường tròn trong mặt phẳng Oxy và các tính chất của ba đường conic (Elip, Hypebol, Parabol).",
              "sections": [
                {
                  "title": "1. Đường thẳng, đường tròn và Elip",
                  "content": "- Đường thẳng: $Ax + By + C = 0$.\n- Khoảng cách: $d(M_0, \\Delta) = \\frac{|Ax_0 + By_0 + C|}{\\sqrt{A^2 + B^2}}$.\n- Đường tròn: $(x - a)^2 + (y - b)^2 = R^2$.\n- Elip chính tắc: $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ ($a^2 = b^2 + c^2$).",
                  "keyFormulas": [
                    "d(M_0, \\Delta) = \\frac{|Ax_0 + By_0 + C|}{\\sqrt{A^2 + B^2}}",
                    "\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1"
                  ]
                }
              ],
              "summaryFormulas": [
                "R^2 = a^2 + b^2 - c"
              ],
              "commonMistakes": [
                "Nhầm giữa hệ thức $a^2 = b^2 + c^2$ của Elip và $c^2 = a^2 + b^2$ của Hypebol."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "10-c7-b1-mc1",
                  "question": "Khoảng cách từ điểm $M(1; 2)$ đến đường thẳng $\\Delta: 3x - 4y + 10 = 0$ bằng:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$1$"
                    },
                    {
                      "key": "B",
                      "content": "$5$"
                    },
                    {
                      "key": "C",
                      "content": "$2$"
                    },
                    {
                      "key": "D",
                      "content": "$3$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "$d = \\frac{|3(1) - 4(2) + 10|}{\\sqrt{9 + 16}} = \\frac{|5|}{5} = 1$."
                }
              ],
              "trueFalse": [
                {
                  "id": "10-c7-b1-tf1",
                  "context": "Cho đường tròn $(C): x^2 + y^2 - 4x + 6y - 12 = 0$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Tâm của đường tròn là điểm $I(2; -3)$.",
                      "isCorrect": true,
                      "explanation": "$a = 2, b = -3$."
                    },
                    {
                      "subId": "b",
                      "content": "Bán kính của đường tròn là $R = 5$.",
                      "isCorrect": true,
                      "explanation": "$R = \\sqrt{4 + 9 - (-12)} = \\sqrt{25} = 5$."
                    },
                    {
                      "subId": "c",
                      "content": "Điểm $O(0; 0)$ nằm trong đường tròn $(C)$.",
                      "isCorrect": true,
                      "explanation": "$0^2 + 0^2 - 0 + 0 - 12 = -12 < 0$."
                    },
                    {
                      "subId": "d",
                      "content": "Đường thẳng $x = 7$ tiếp xúc với đường tròn $(C)$.",
                      "isCorrect": true,
                      "explanation": "$d(I, x=7) = |2 - 7| = 5 = R$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "10-c7-b1-sa1",
                  "problem": "Cho Elip có phương trình chính tắc $(E): \\frac{x^2}{25} + \\frac{y^2}{9} = 1$. Tính tiêu cự $2c$ của Elip.",
                  "correctValue": 8,
                  "acceptableAnswers": [
                    "8",
                    "2c=8"
                  ],
                  "unit": "",
                  "cognitiveLevel": "Thông hiểu",
                  "isRealWorldModeling": false,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Tìm $a$ và $b$",
                      "description": "$a^2 = 25, b^2 = 9$."
                    },
                    {
                      "stepName": "Bước 2: Tìm tiêu cự",
                      "description": "$c^2 = a^2 - b^2 = 16 \\implies c = 4$. Tiêu cự là $2c = 8$."
                    }
                  ],
                  "explanation": "$2c = 2\\sqrt{25 - 9} = 8$."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "10-c8",
        "title": "Chương VIII: Đại số tổ hợp",
        "order": 8,
        "description": "Quy tắc đếm, sơ đồ hình cây, hoán vị, chỉnh hợp, tổ hợp và nhị thức Newton",
        "lessons": [
          {
            "id": "10-c8-b1",
            "title": "Bài 23 & 24 & 25: Đại số tổ hợp và Nhị thức Newton",
            "order": 1,
            "description": "Quy tắc cộng, quy tắc nhân, hoán vị $P_n$, chỉnh hợp $A_n^k$, tổ hợp $C_n^k$ và khai triển Newton",
            "theory": {
              "overview": "Phương pháp đếm nâng cao: Phân biệt hoán vị, chỉnh hợp (có sắp thứ tự) và tổ hợp (không sắp thứ tự), khai triển nhị thức Newton bậc 4 và bậc 5.",
              "sections": [
                {
                  "title": "1. Các công thức tổ hợp",
                  "content": "- Hoán vị: $P_n = n!$\n- Chỉnh hợp: $A_n^k = \\frac{n!}{(n - k)!}$\n- Tổ hợp: $C_n^k = \\frac{n!}{k!(n - k)!}$\n- Khai triển nhị thức Newton: $(a + b)^4, (a + b)^5$.",
                  "keyFormulas": [
                    "C_n^k = \\frac{n!}{k!(n - k)!}",
                    "A_n^k = k! \\cdot C_n^k"
                  ]
                }
              ],
              "summaryFormulas": [
                "C_n^k = C_n^{n - k}"
              ],
              "commonMistakes": [
                "Nhầm giữa chỉnh hợp (chọn có thứ tự) và tổ hợp (chọn không thứ tự)."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "10-c8-b1-mc1",
                  "question": "Có bao nhiêu cách chọn 3 học sinh từ một nhóm gồm 10 học sinh để đi lao động?",
                  "options": [
                    {
                      "key": "A",
                      "content": "$C_{10}^3 = 120$"
                    },
                    {
                      "key": "B",
                      "content": "$A_{10}^3 = 720$"
                    },
                    {
                      "key": "C",
                      "content": "$30$"
                    },
                    {
                      "key": "D",
                      "content": "$10^3 = 1000$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "Chọn 3 người không phân biệt thứ tự là một tổ hợp: $C_{10}^3 = 120$."
                }
              ],
              "trueFalse": [
                {
                  "id": "10-c8-b1-tf1",
                  "context": "Một hộp chứa 5 viên bi đỏ và 4 viên bi xanh.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Có $C_9^3 = 84$ cách chọn ngẫu nhiên 3 viên bi từ hộp.",
                      "isCorrect": true,
                      "explanation": "$C_9^3 = 84$."
                    },
                    {
                      "subId": "b",
                      "content": "Có $C_5^3 = 10$ cách chọn 3 viên bi cùng màu đỏ.",
                      "isCorrect": true,
                      "explanation": "$C_5^3 = 10$."
                    },
                    {
                      "subId": "c",
                      "content": "Có $C_4^3 = 4$ cách chọn 3 viên bi cùng màu xanh.",
                      "isCorrect": true,
                      "explanation": "$C_4^3 = 4$."
                    },
                    {
                      "subId": "d",
                      "content": "Có 14 cách chọn 3 viên bi trong đó có cả bi đỏ và bi xanh.",
                      "isCorrect": false,
                      "explanation": "Tổng số cách là $84 - (10 + 4) = 70$ cách."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "10-c8-b1-sa1",
                  "problem": "Tìm hệ số của số hạng chứa $x^3$ trong khai triển nhị thức Newton của $(2x + 1)^4$.",
                  "correctValue": 32,
                  "acceptableAnswers": [
                    "32"
                  ],
                  "unit": "",
                  "cognitiveLevel": "Thông hiểu",
                  "isRealWorldModeling": false,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Số hạng tổng quát",
                      "description": "$T_{k+1} = C_4^k (2x)^{4-k} (1)^k = C_4^k 2^{4-k} x^{4-k}$."
                    },
                    {
                      "stepName": "Bước 2: Tìm $k$",
                      "description": "$4 - k = 3 \\iff k = 1$."
                    },
                    {
                      "stepName": "Bước 3: Tính hệ số",
                      "description": "Hệ số là $C_4^1 \\cdot 2^3 = 4 \\times 8 = 32$."
                    }
                  ],
                  "explanation": "Hệ số là $C_4^1 \\times 2^3 = 32$."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "10-c9",
        "title": "Chương IX: Tính xác suất theo định nghĩa cổ điển",
        "order": 9,
        "description": "Không gian mẫu, biến cố và thực hành tính xác suất theo định nghĩa cổ điển",
        "lessons": [
          {
            "id": "10-c9-b1",
            "title": "Bài 26 & 27: Xác suất cổ điển và thực hành tính toán",
            "order": 1,
            "description": "Không gian mẫu $\\Omega$, số phần tử thuận lợi $n(A)$ và công thức cổ điển $P(A) = \\frac{n(A)}{n(\\Omega)}$",
            "theory": {
              "overview": "Định nghĩa cổ điển của xác suất dựa trên các kết quả đồng khả năng của một phép thử ngẫu nhiên.",
              "sections": [
                {
                  "title": "1. Định nghĩa cổ điển",
                  "content": "Nếu một phép thử có không gian mẫu $\\Omega$ gồm hữu hạn các kết quả đồng khả năng và biến cố $A$ có $n(A)$ kết quả thuận lợi thì:\n$$P(A) = \\frac{n(A)}{n(\\Omega)}$$",
                  "keyFormulas": [
                    "P(A) = \\frac{n(A)}{n(\\Omega)}",
                    "0 \\le P(A) \\le 1"
                  ]
                }
              ],
              "summaryFormulas": [
                "P(\\bar{A}) = 1 - P(A)"
              ],
              "commonMistakes": [
                "Đếm thiếu hoặc đếm trùng các phần tử trong không gian mẫu."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "10-c9-b1-mc1",
                  "question": "Gieo một con xúc xắc cân đối và đồng chất một lần. Xác suất để xuất hiện mặt có số chấm là số chẵn bằng:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$0{,}5$"
                    },
                    {
                      "key": "B",
                      "content": "$1/6$"
                    },
                    {
                      "key": "C",
                      "content": "$1/3$"
                    },
                    {
                      "key": "D",
                      "content": "$2/3$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "$n(\\Omega) = 6$, số chẵn là $\\{2; 4; 6\\} \\implies n(A) = 3$. $P = 3/6 = 0{,}5$."
                }
              ],
              "trueFalse": [
                {
                  "id": "10-c9-b1-tf1",
                  "context": "Gieo đồng thời hai đồng xu cân đối và đồng chất.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Không gian mẫu của phép thử có 4 phần tử.",
                      "isCorrect": true,
                      "explanation": "$\\Omega = \\{SS, SN, NS, NN\\}$."
                    },
                    {
                      "subId": "b",
                      "content": "Xác suất để cả hai đồng xu đều xuất hiện mặt sấp là $0{,}25$.",
                      "isCorrect": true,
                      "explanation": "$P(SS) = 1/4 = 0{,}25$."
                    },
                    {
                      "subId": "c",
                      "content": "Xác suất để có đúng một đồng xu xuất hiện mặt sấp là $0{,}5$.",
                      "isCorrect": true,
                      "explanation": "$\\{SN, NS\\} \\implies 2/4 = 0{,}5$."
                    },
                    {
                      "subId": "d",
                      "content": "Xác suất để có ít nhất một đồng xu xuất hiện mặt ngửa là $0{,}5$.",
                      "isCorrect": false,
                      "explanation": "$1 - P(SS) = 1 - 0{,}25 = 0{,}75$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "10-c9-b1-sa1",
                  "problem": "Một hộp có 10 tấm thẻ được đánh số từ 1 đến 10. Rút ngẫu nhiên một tấm thẻ. Tính xác suất để rút được tấm thẻ ghi số nguyên tố. (Nhập số thập phân)",
                  "correctValue": 0.4,
                  "acceptableAnswers": [
                    "0.4",
                    "0,4",
                    "2/5"
                  ],
                  "unit": "",
                  "cognitiveLevel": "Thông hiểu",
                  "isRealWorldModeling": false,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Không gian mẫu",
                      "description": "$n(\\Omega) = 10$."
                    },
                    {
                      "stepName": "Bước 2: Các số nguyên tố",
                      "description": "Các số nguyên tố từ 1 đến 10 là $\\{2; 3; 5; 7\\} \\implies n(A) = 4$."
                    },
                    {
                      "stepName": "Bước 3: Tính xác suất",
                      "description": "$P(A) = 4/10 = 0{,}4$."
                    }
                  ],
                  "explanation": "$P = 4/10 = 0{,}4$."
                }
              ]
            }
          }
        ]
      }
    ]
  }
];

export default HIGH_SCHOOL_CURRICULUM;
