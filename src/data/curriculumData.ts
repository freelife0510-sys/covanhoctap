import { GradeCurriculum } from '../types/curriculum.ts';

/**
 * MATHDIAGNOSTIC AI - GDPT 2018 CURRICULUM DATA
 * Bộ dữ liệu chương trình chuẩn duy nhất: SÁCH GIÁO KHOA KẾT NỐI TRI THỨC VỚI CUỘC SỐNG
 * Đầy đủ Khối 10, Khối 11, Khối 12 kèm 3 định dạng câu hỏi chuẩn Bộ GD&ĐT:
 * 1. Trắc nghiệm 4 lựa chọn (Nhận biết, Thông hiểu)
 * 2. Câu hỏi Đúng / Sai (Nhận biết, Thông hiểu, Vận dụng)
 * 3. Trả lời ngắn (Vận dụng, Mô hình hóa thực tiễn)
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
                "Nhầm lẫn giữa điểm cực trị của hàm số ($x$) và điểm cực trị của đồ thị hàm số ($M(x; y)$).",
                "Dùng ký hiệu hợp $\\cup$ khi kết luận khoảng đơn điệu."
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
                },
                {
                  "id": "12-c1-b1-mc2",
                  "question": "Hàm số $y = \\frac{2x - 1}{x + 1}$ đồng biến trên khoảng nào dưới đây?",
                  "options": [
                    {
                      "key": "A",
                      "content": "$(-\\infty; -1)$"
                    },
                    {
                      "key": "B",
                      "content": "$(-\\infty; +\\infty)$"
                    },
                    {
                      "key": "C",
                      "content": "$\\mathbb{R} \\setminus \\{-1\\}$"
                    },
                    {
                      "key": "D",
                      "content": "$(-1; 2)$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "Tập xác định $D = \\mathbb{R} \\setminus \\{-1\\}$. Đạo hàm $y' = \\frac{2(1) - (-1)(1)}{(x+1)^2} = \\frac{3}{(x+1)^2} > 0, \\forall x \\ne -1$. Do đó hàm số đồng biến trên từng khoảng $(-\\infty; -1)$ và $(-1; +\\infty)$."
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
                      "explanation": "Điểm cực tiểu là $x = 3$, giá trị cực tiểu là $f(3) = \\frac{1}{3}(27) - 2(9) + 3(3) + 1 = 9 - 18 + 9 + 1 = 1$."
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
                    "m=0 có 1 giá trị",
                    "1 giá trị"
                  ],
                  "unit": "giá trị",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": false,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Tính đạo hàm",
                      "description": "$y' = 3x^2 - 6mx + 3(m^2 - 1) = 3[x^2 - 2mx + (m^2 - 1)]$."
                    },
                    {
                      "stepName": "Bước 2: Điều kiện hai điểm cực trị trái dấu",
                      "description": "Hai điểm cực trị nằm về hai phía trục $Oy \\iff x_1 x_2 < 0 \\iff m^2 - 1 < 0 \\iff -1 < m < 1$."
                    },
                    {
                      "stepName": "Bước 3: Đếm số nguyên",
                      "description": "Vì $m \\in \\mathbb{Z}$ nên $m = 0$. Có duy nhất 1 giá trị."
                    }
                  ],
                  "explanation": "Hai nghiệm của $y' = 0$ trái dấu khi tích $P = m^2 - 1 < 0 \\iff -1 < m < 1$. Do $m$ nguyên nên $m = 0$. Có 1 giá trị."
                }
              ]
            }
          },
          {
            "id": "12-c1-b2",
            "title": "Bài 2: Giá trị lớn nhất và giá trị nhỏ nhất của hàm số",
            "order": 2,
            "description": "Phương pháp tìm GTLN, GTNN trên đoạn, trên khoảng và ứng dụng thực tiễn",
            "theory": {
              "overview": "Định nghĩa và quy tắc tìm giá trị lớn nhất (GTLN) và giá trị nhỏ nhất (GTNN) của hàm số trên một khoảng hoặc trên đoạn $[a; b]$.",
              "sections": [
                {
                  "title": "1. Quy tắc tìm GTLN, GTNN trên đoạn $[a; b]$",
                  "content": "Bước 1: Tìm các điểm $x_1, x_2, ... \\in (a; b)$ mà tại đó $f'(x) = 0$ hoặc không xác định.\nBước 2: Tính $f(a), f(b), f(x_1), f(x_2), ...$\nBước 3: So sánh các giá trị đã tính: Số lớn nhất là $\\max$, số nhỏ nhất là $\\min$.",
                  "keyFormulas": [
                    "\\max_{[a; b]} f(x) = \\max \\{f(a), f(b), f(x_i)\\}",
                    "\\min_{[a; b]} f(x) = \\min \\{f(a), f(b), f(x_i)\\}"
                  ]
                }
              ],
              "summaryFormulas": [
                "M = \\max f(x) \\iff f(x) \\le M, \\forall x \\in D \\text{ và } \\exists x_0 \\in D: f(x_0) = M"
              ],
              "commonMistakes": [
                "Quên kiểm tra xem điểm làm cho đạo hàm bằng 0 có thuộc đoạn $[a; b]$ hay không."
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
                  "explanation": "Đạo hàm $f'(x) = 4x^3 - 4x = 4x(x^2 - 1)$. Trên $[0; 2]$, $f'(x) = 0 \\iff x = 0$ hoặc $x = 1$. Ta có: $f(0) = 3, f(1) = 2, f(2) = 11$. Do đó $\\max = 11$."
                }
              ],
              "trueFalse": [
                {
                  "id": "12-c1-b2-tf1",
                  "context": "Cho hàm số $y = x + \\frac{4}{x}$ xác định trên khoảng $(0; +\\infty)$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Đạo hàm của hàm số là $y' = 1 - \\frac{4}{x^2}$.",
                      "isCorrect": true,
                      "explanation": "Quy tắc đạo hàm đúng."
                    },
                    {
                      "subId": "b",
                      "content": "Trên khoảng $(0; +\\infty)$, phương trình $y' = 0$ có nghiệm duy nhất $x = 2$.",
                      "isCorrect": true,
                      "explanation": "$1 - \\frac{4}{x^2} = 0 \\iff x^2 = 4 \\implies x = 2$ (vì $x > 0$)."
                    },
                    {
                      "subId": "c",
                      "content": "Giá trị nhỏ nhất của hàm số trên khoảng $(0; +\\infty)$ bằng $4$.",
                      "isCorrect": true,
                      "explanation": "Bất đẳng thức AM-GM: $x + \\frac{4}{x} \\ge 2\\sqrt{x \\cdot \\frac{4}{x}} = 4$. Dấu bằng xảy ra khi $x = 2$."
                    },
                    {
                      "subId": "d",
                      "content": "Hàm số không có giá trị lớn nhất trên khoảng $(0; +\\infty)$.",
                      "isCorrect": true,
                      "explanation": "Khi $x \\to +\\infty$ thì $y \\to +\\infty$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "12-c1-b2-sa1",
                  "problem": "Một xưởng cơ khí cần làm một thùng hình hộp chữ nhật có nắp bằng tôn có thể tích $V = 500\\text{ dm}^3$. Đáy hộp là hình vuông cạnh $x\\text{ dm}$. Chi phí làm hộp nhỏ nhất khi diện tích toàn phần của hộp nhỏ nhất. Hỏi cạnh đáy $x$ bằng bao nhiêu dm để tiết kiệm vật liệu nhất?",
                  "correctValue": 10,
                  "acceptableAnswers": [
                    "10",
                    "10 dm",
                    "10dm"
                  ],
                  "unit": "dm",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": true,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Thiết lập biểu thức",
                      "description": "Thể tích $V = x^2 h = 500 \\implies h = \\frac{500}{x^2}$."
                    },
                    {
                      "stepName": "Bước 2: Diện tích toàn phần",
                      "description": "$S_{tp} = 2x^2 + 4xh = 2x^2 + \\frac{2000}{x}$."
                    },
                    {
                      "stepName": "Bước 3: Khảo sát cực trị",
                      "description": "$S'(x) = 4x - \\frac{2000}{x^2} = 0 \\iff 4x^3 = 2000 \\iff x^3 = 500 \\times \\dots \\iff x = 10$."
                    }
                  ],
                  "explanation": "$S'(x) = 0 \\iff 4x^3 = 2000 \\iff x = 10\\text{ dm}$. Khi đó diện tích tôn nhỏ nhất."
                }
              ]
            }
          },
          {
            "id": "12-c1-b3",
            "title": "Bài 3: Đường tiệm cận của đồ thị hàm số",
            "order": 3,
            "description": "Tiệm cận đứng, tiệm cận ngang và tiệm cận xiên của đồ thị hàm số",
            "theory": {
              "overview": "Định nghĩa các đường tiệm cận đứng, tiệm cận ngang và tiệm cận xiên qua giới hạn hàm số tại vô cực và tại điểm gián đoạn.",
              "sections": [
                {
                  "title": "1. Tiệm cận đứng và tiệm cận ngang",
                  "content": "- Đường thẳng $x = x_0$ là tiệm cận đứng nếu ít nhất một trong các giới hạn $\\lim_{x \\to x_0^\\pm} f(x) = \\pm\\infty$.\n- Đường thẳng $y = y_0$ là tiệm cận ngang nếu $\\lim_{x \\to +\\infty} f(x) = y_0$ hoặc $\\lim_{x \\to -\\infty} f(x) = y_0$.",
                  "keyFormulas": [
                    "\\lim_{x \\to \\pm\\infty} f(x) = y_0 \\implies y = y_0 \\text{ là tiệm cận ngang}",
                    "\\lim_{x \\to x_0^\\pm} f(x) = \\pm\\infty \\implies x = x_0 \\text{ là tiệm cận đứng}"
                  ]
                },
                {
                  "title": "2. Tiệm cận xiên (GDPT 2018)",
                  "content": "Đường thẳng $y = ax + b$ ($a \\ne 0$) là tiệm cận xiên nếu $\\lim_{x \\to \\pm\\infty} [f(x) - (ax + b)] = 0$.\nVới hàm phân thức bậc hai trên bậc nhất $y = \\frac{ax^2+bx+c}{px+q}$, chia đa thức được thương $Ax + B$ chính là phương trình tiệm cận xiên.",
                  "keyFormulas": [
                    "a = \\lim_{x \\to \\pm\\infty} \\frac{f(x)}{x}, \\quad b = \\lim_{x \\to \\pm\\infty} [f(x) - ax]"
                  ]
                }
              ],
              "summaryFormulas": [
                "y = \\frac{Ax^2+Bx+C}{px+q} = mx + n + \\frac{r}{px+q} \\implies y = mx + n \\text{ là tiệm cận xiên}"
              ],
              "commonMistakes": [
                "Quên rút gọn phân thức dẫn đến nhận nhầm tiệm cận đứng khi nghiệm của mẫu cũng là nghiệm của tử."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "12-c1-b3-mc1",
                  "question": "Đồ thị hàm số $y = \\frac{3x - 1}{x + 2}$ có đường tiệm cận ngang là:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$y = 3$"
                    },
                    {
                      "key": "B",
                      "content": "$x = -2$"
                    },
                    {
                      "key": "C",
                      "content": "$y = -2$"
                    },
                    {
                      "key": "D",
                      "content": "$x = 3$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "Ta có $\\lim_{x \\to \\pm\\infty} \\frac{3x - 1}{x + 2} = 3$, do đó $y = 3$ là tiệm cận ngang."
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
                      "explanation": "Mẫu thức khác 0 khi $x \\ne 1$."
                    },
                    {
                      "subId": "b",
                      "content": "Đường thẳng $x = 1$ là tiệm cận đứng của đồ thị hàm số.",
                      "isCorrect": true,
                      "explanation": "Khi $x = 1$, tử số bằng $2 \\ne 0$, mẫu số bằng 0 nên $\\lim_{x \\to 1} y = \\infty$."
                    },
                    {
                      "subId": "c",
                      "content": "Đồ thị hàm số có tiệm cận ngang là $y = 1$.",
                      "isCorrect": false,
                      "explanation": "Hàm bậc 2 trên bậc 1 có bậc tử cao hơn bậc mẫu nên không có tiệm cận ngang."
                    },
                    {
                      "subId": "d",
                      "content": "Đường thẳng $y = x - 2$ là tiệm cận xiên của đồ thị hàm số.",
                      "isCorrect": true,
                      "explanation": "Chia đa thức: $\\frac{x^2 - 3x + 4}{x - 1} = x - 2 + \\frac{2}{x - 1}$. Vì $\\lim_{x \\to \\infty} \\frac{2}{x - 1} = 0$ nên $y = x - 2$ là tiệm cận xiên."
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
                      "description": "Tiệm cận đứng là $x = 2 \\implies x_0 = 2$."
                    },
                    {
                      "stepName": "Bước 2: Tiệm cận xiên",
                      "description": "Chia đa thức: $2x^2 - 3x + 1 = (x - 2)(2x + 1) + 3 \\implies y = 2x + 1$."
                    },
                    {
                      "stepName": "Bước 3: Giao điểm",
                      "description": "Thay $x = 2$ vào tiệm cận xiên: $y_0 = 2(2) + 1 = 5$. Vậy $S = 2 + 5 = 7$."
                    }
                  ],
                  "explanation": "Giao điểm $I(2; 5) \\implies S = 2 + 5 = 7$."
                }
              ]
            }
          },
          {
            "id": "12-c1-b4",
            "title": "Bài 4: Khảo sát sự biến thiên và vẽ đồ thị của hàm số",
            "order": 4,
            "description": "Sơ đồ khảo sát hoàn chỉnh các dạng hàm số bậc ba, phân thức bậc nhất/bậc nhất và bậc hai/bậc nhất",
            "theory": {
              "overview": "Quy trình 3 bước khảo sát sự biến thiên và vẽ đồ thị hàm số: Tập xác định, Sự biến thiên (đạo hàm, bảng biến thiên, tiệm cận) và Vẽ đồ thị (giao trục tọa độ, tâm đối xứng).",
              "sections": [
                {
                  "title": "1. Quy trình chuẩn khảo sát hàm số GDPT 2018",
                  "content": "Bước 1: Tìm tập xác định $D$.\nBước 2: Khảo sát sự biến thiên: Tính đạo hàm $y'$, tìm nghiệm $y' = 0$, tính giới hạn và tiệm cận, lập bảng biến thiên.\nBước 3: Vẽ đồ thị: Xác định các điểm đặc biệt (giao với $Ox, Oy$, tâm đối xứng).",
                  "keyFormulas": [
                    "y = ax^3+bx^2+cx+d \\implies \\text{Tâm đối xứng là điểm uốn } U\\left(-\\frac{b}{3a}; y\\left(-\\frac{b}{3a}\\right)\\right)",
                    "y = \\frac{ax+b}{cx+d} \\implies \\text{Tâm đối xứng là giao 2 tiệm cận } I\\left(-\\frac{d}{c}; \\frac{a}{c}\\right)"
                  ]
                }
              ],
              "summaryFormulas": [
                "y = \\frac{ax^2+bx+c}{px+q} \\implies \\text{Tâm đối xứng là giao điểm của TC đứng và TC xiên}"
              ],
              "commonMistakes": [
                "Vẽ đồ thị cắt qua đường tiệm cận đứng."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "12-c1-b4-mc1",
                  "question": "Tâm đối xứng của đồ thị hàm số $y = \\frac{2x - 3}{x + 1}$ là điểm:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$I(-1; 2)$"
                    },
                    {
                      "key": "B",
                      "content": "$I(1; 2)$"
                    },
                    {
                      "key": "C",
                      "content": "$I(-1; -3)$"
                    },
                    {
                      "key": "D",
                      "content": "$I(2; -1)$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "Tiệm cận đứng $x = -1$, tiệm cận ngang $y = 2$. Tâm đối xứng là giao hai tiệm cận $I(-1; 2)$."
                }
              ],
              "trueFalse": [
                {
                  "id": "12-c1-b4-tf1",
                  "context": "Cho đồ thị hàm số bậc ba $y = f(x) = ax^3 + bx^2 + cx + d$ có đồ thị đi qua gốc tọa độ $O(0; 0)$ và có hai điểm cực trị là $A(1; -2)$ và $B(-1; 2)$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Hệ số tự do $d = 0$.",
                      "isCorrect": true,
                      "explanation": "Đồ thị đi qua gốc tọa độ $O(0; 0) \\implies d = 0$."
                    },
                    {
                      "subId": "b",
                      "content": "Hàm số đã cho là hàm số lẻ.",
                      "isCorrect": true,
                      "explanation": "Vì hai điểm cực trị đối xứng nhau qua gốc $O(0; 0)$ và $d = 0, b = 0$."
                    },
                    {
                      "subId": "c",
                      "content": "Hệ số $a > 0$.",
                      "isCorrect": false,
                      "explanation": "Tại $x = -1$ có giá trị cực đại $y = 2$ và $x = 1$ có giá trị cực tiểu $y = -2$, suy ra hàm số nghịch biến giữa hai cực trị và hệ số $a > 0$ khi xét nhánh vô cùng."
                    },
                    {
                      "subId": "d",
                      "content": "Phương trình hàm số là $y = x^3 - 3x$.",
                      "isCorrect": true,
                      "explanation": "$f'(x) = 3x^2 - 3 = 0 \\iff x = \\pm 1$. $f(1) = 1 - 3 = -2$, $f(-1) = -1 + 3 = 2$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "12-c1-b4-sa1",
                  "problem": "Cho hàm số $y = x^3 - 3x + 1$. Gọi $A(x_1; y_1)$ và $B(x_2; y_2)$ là hai điểm cực trị của đồ thị hàm số. Tính độ dài đoạn thẳng $AB$. (Làm tròn đến 1 chữ số thập phân)",
                  "correctValue": 4.5,
                  "acceptableAnswers": [
                    "4.5",
                    "4,5",
                    "2 căn 5",
                    "4.47"
                  ],
                  "unit": "",
                  "cognitiveLevel": "Thông hiểu",
                  "isRealWorldModeling": false,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Tìm tọa độ cực trị",
                      "description": "$y' = 3x^2 - 3 = 0 \\iff x = \\pm 1$. Cực trị là $A(-1; 3)$ và $B(1; -1)$."
                    },
                    {
                      "stepName": "Bước 2: Tính độ dài $AB$",
                      "description": "$AB = \\sqrt{(1 - (-1))^2 + (-1 - 3)^2} = \\sqrt{4 + 16} = \\sqrt{20} \\approx 4{,}47 \\approx 4{,}5$."
                    }
                  ],
                  "explanation": "$AB = \\sqrt{20} \\approx 4{,}5$."
                }
              ]
            }
          },
          {
            "id": "12-c1-b5",
            "title": "Bài 5: Ứng dụng đạo hàm để giải quyết một số vấn đề thực tiễn",
            "order": 5,
            "description": "Mô hình hóa toán học các bài toán tối ưu hóa chi phí, doanh thu, lợi nhuận, vật lý và hình học",
            "theory": {
              "overview": "Ứng dụng giải tích để xây dựng mô hình toán học giải quyết các bài toán tối ưu hóa trong kinh tế, kinh doanh, vật lý và kỹ thuật xây dựng.",
              "sections": [
                {
                  "title": "1. Quy trình 4 bước mô hình hóa tối ưu hóa",
                  "content": "Bước 1: Đặt ẩn số thích hợp kèm điều kiện thực tế.\nBước 2: Lập hàm mục tiêu $f(x)$ cần tối đa hóa hoặc tối thiểu hóa.\nBước 3: Khảo sát hàm số $f(x)$ trên miền xác định để tìm cực trị hoặc GTLN/GTNN.\nBước 4: Đối chiếu điều kiện và đưa ra kết luận thực tiễn.",
                  "keyFormulas": [
                    "\\text{Lợi nhuận } L(x) = \\text{Doanh thu } R(x) - \\text{Chi phí } C(x)",
                    "\\text{Doanh thu } R(x) = P(x) \\cdot Q(x)"
                  ]
                }
              ],
              "summaryFormulas": [
                "v(t) = s'(t), \\quad a(t) = v'(t) = s''(t)"
              ],
              "commonMistakes": [
                "Quên đặt điều kiện thực tế của ẩn số (ví dụ kích thước phải dương, số lượng phải nguyên)."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "12-c1-b5-mc1",
                  "question": "Một chất điểm chuyển động theo phương trình $s(t) = -t^3 + 9t^2 + t$ với $t$ tính bằng giây, $s$ tính bằng mét. Vận tốc tức thời của chất điểm đạt giá trị lớn nhất tại thời điểm nào?",
                  "options": [
                    {
                      "key": "A",
                      "content": "$t = 3\\text{ s}$"
                    },
                    {
                      "key": "B",
                      "content": "$t = 6\\text{ s}$"
                    },
                    {
                      "key": "C",
                      "content": "$t = 9\\text{ s}$"
                    },
                    {
                      "key": "D",
                      "content": "$t = 1\\text{ s}$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Thông hiểu",
                  "explanation": "Vận tốc tức thời $v(t) = s'(t) = -3t^2 + 18t + 1$. Đây là hàm bậc hai có $a = -3 < 0$, đạt giá trị lớn nhất tại đỉnh $t = -\\frac{b}{2a} = -\\frac{18}{2(-3)} = 3\\text{ s}$."
                }
              ],
              "trueFalse": [
                {
                  "id": "12-c1-b5-tf1",
                  "context": "Một công ty sản xuất sản phẩm $A$. Chi phí sản xuất $x$ sản phẩm mỗi ngày là $C(x) = x^2 + 20x + 100$ (nghìn đồng). Giá bán mỗi sản phẩm là $P(x) = 100 - x$ (nghìn đồng).",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Hàm doanh thu bán hàng mỗi ngày là $R(x) = 100x - x^2$.",
                      "isCorrect": true,
                      "explanation": "$R(x) = x \\cdot P(x) = x(100 - x) = 100x - x^2$."
                    },
                    {
                      "subId": "b",
                      "content": "Hàm lợi nhuận là $L(x) = -2x^2 + 80x - 100$.",
                      "isCorrect": true,
                      "explanation": "$L(x) = R(x) - C(x) = (100x - x^2) - (x^2 + 20x + 100) = -2x^2 + 80x - 100$."
                    },
                    {
                      "subId": "c",
                      "content": "Để lợi nhuận lớn nhất thì công ty nên sản xuất 40 sản phẩm mỗi ngày.",
                      "isCorrect": false,
                      "explanation": "Đạo hàm $L'(x) = -4x + 80 = 0 \\iff x = 20$. Vậy nên sản xuất 20 sản phẩm."
                    },
                    {
                      "subId": "d",
                      "content": "Lợi nhuận lớn nhất đạt được là $700$ nghìn đồng/ngày.",
                      "isCorrect": true,
                      "explanation": "$L(20) = -2(400) + 80(20) - 100 = -800 + 1600 - 100 = 700$ nghìn đồng."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "12-c1-b5-sa1",
                  "problem": "Một chung cư mini có 100 căn hộ cho thuê. Nếu giá thuê mỗi căn là 8 triệu đồng/tháng thì tất cả 100 căn hộ đều được thuê hết. Cứ mỗi lần tăng giá thêm 100.000 đồng/tháng thì sẽ có thêm 1 căn hộ bị bỏ trống. Người quản lí nên đặt giá thuê mỗi căn hộ là bao nhiêu triệu đồng/tháng để tổng số tiền cho thuê thu về mỗi tháng là lớn nhất?",
                  "correctValue": 9,
                  "acceptableAnswers": [
                    "9",
                    "9 triệu",
                    "9.0",
                    "9 triệu đồng"
                  ],
                  "unit": "triệu đồng/tháng",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": true,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Chọn ẩn số",
                      "description": "Gọi $x$ là số lần tăng giá $100.000$ đồng ($x \\in \\mathbb{N}, 0 \\le x \\le 100$). Giá thuê là $8 + 0{,}1x$ triệu đồng, số căn cho thuê là $100 - x$."
                    },
                    {
                      "stepName": "Bước 2: Thiết lập hàm doanh thu",
                      "description": "$R(x) = (8 + 0{,}1x)(100 - x) = -0{,}1x^2 + 2x + 800$."
                    },
                    {
                      "stepName": "Bước 3: Khảo sát cực trị",
                      "description": "$R'(x) = -0{,}2x + 2 = 0 \\iff x = 10$. Giá thuê tối ưu: $8 + 0{,}1(10) = 9$ triệu đồng."
                    }
                  ],
                  "explanation": "Hàm doanh thu đạt cực đại tại $x = 10$, giá thuê tối ưu là $8 + 0{,}1(10) = 9$ triệu đồng/tháng."
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
        "description": "Vectơ trong không gian, hệ trục tọa độ Oxyz và tọa độ các phép toán vectơ",
        "lessons": [
          {
            "id": "12-c2-b1",
            "title": "Bài 6: Vectơ trong không gian",
            "order": 1,
            "description": "Quy tắc cộng, trừ vectơ, quy tắc hình hộp và điều kiện đồng phẳng",
            "theory": {
              "overview": "Mở rộng khái niệm vectơ từ mặt phẳng vào không gian: quy tắc ba điểm, quy tắc hình bình hành và quy tắc hình hộp.",
              "sections": [
                {
                  "title": "1. Quy tắc hình hộp",
                  "content": "Cho hình hộp $ABCD.A'B'C'D'.$\nKhi đó ta có quy tắc hình hộp:\n$$\\vec{AC'} = \\vec{AB} + \\vec{AD} + \\vec{AA'}$$",
                  "keyFormulas": [
                    "\\vec{AC'} = \\vec{AB} + \\vec{AD} + \\vec{AA'}"
                  ]
                }
              ],
              "summaryFormulas": [
                "\\vec{u} \\cdot \\vec{v} = |\\vec{u}| \\cdot |\\vec{v}| \\cos(\\vec{u}, \\vec{v})"
              ],
              "commonMistakes": [
                "Áp dụng quy tắc hình bình hành thay vì quy tắc hình hộp khi cộng 3 vectơ xuất phát từ một đỉnh."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "12-c2-b1-mc1",
                  "question": "Cho tứ diện $ABCD$. Tổng vectơ $\\vec{AB} + \\vec{BC} + \\vec{CD}$ bằng:",
                  "options": [
                    {
                      "key": "A",
                      "content": "$\\vec{AD}$"
                    },
                    {
                      "key": "B",
                      "content": "$\\vec{DA}$"
                    },
                    {
                      "key": "C",
                      "content": "$\\vec{AC}$"
                    },
                    {
                      "key": "D",
                      "content": "$\\vec{BD}$"
                    }
                  ],
                  "correctAnswer": "A",
                  "cognitiveLevel": "Nhận biết",
                  "explanation": "Áp dụng quy tắc ba điểm liên tiếp: $\\vec{AB} + \\vec{BC} + \\vec{CD} = \\vec{AC} + \\vec{CD} = \\vec{AD}$."
                }
              ],
              "trueFalse": [
                {
                  "id": "12-c2-b1-tf1",
                  "context": "Cho hình hộp chữ nhật $ABCD.A'B'C'D'$ có $AB = 3, AD = 4, AA' = 5$.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Vectơ $\\vec{AC'} = \\vec{AB} + \\vec{AD} + \\vec{AA'}$.",
                      "isCorrect": true,
                      "explanation": "Quy tắc hình hộp chuẩn mực."
                    },
                    {
                      "subId": "b",
                      "content": "Độ dài vectơ $|\\vec{AC'}| = \\sqrt{3^2 + 4^2 + 5^2} = 5\\sqrt{2}$.",
                      "isCorrect": true,
                      "explanation": "Đường chéo hình hộp: $\\sqrt{9 + 16 + 25} = \\sqrt{50} = 5\\sqrt{2}$."
                    },
                    {
                      "subId": "c",
                      "content": "Tích vô hướng $\\vec{AB} \\cdot \\vec{AD} = 12$.",
                      "isCorrect": false,
                      "explanation": "Vì $ABCD$ là hình chữ nhật nên $\\vec{AB} \\perp \\vec{AD} \\implies \\vec{AB} \\cdot \\vec{AD} = 0$."
                    },
                    {
                      "subId": "d",
                      "content": "Góc giữa $\\vec{AA'}$ và $\\vec{AC'}$ là góc nhọn.",
                      "isCorrect": true,
                      "explanation": "Tam giác $AA'C'$ vuông tại $A'$ nên góc $\\widehat{A'AC'}$ nhọn."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "12-c2-b1-sa1",
                  "problem": "Cho hình lập phương $ABCD.A'B'C'D'$ có cạnh bằng $2$. Tính độ dài vectơ $\\vec{u} = \\vec{AB} + \\vec{BC} + \\vec{CC'} + \\vec{C'D'}$.",
                  "correctValue": 2.8,
                  "acceptableAnswers": [
                    "2.8",
                    "2,8",
                    "2 căn 2",
                    "2.83"
                  ],
                  "unit": "",
                  "cognitiveLevel": "Thông hiểu",
                  "isRealWorldModeling": false,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Rút gọn vectơ",
                      "description": "$\\vec{AB} + \\vec{BC} + \\vec{CC'} + \\vec{C'D'} = \\vec{AC} + \\vec{CD'} = \\vec{AD'}$."
                    },
                    {
                      "stepName": "Bước 2: Tính độ dài",
                      "description": "$|\\vec{AD'}| = \\sqrt{2^2 + 2^2} = 2\\sqrt{2} \\approx 2{,}83$."
                    }
                  ],
                  "explanation": "Vectơ thu gọn là $\\vec{AD'}$, có độ dài bằng đường chéo hình vuông cạnh 2: $2\\sqrt{2} \\approx 2{,}8$."
                }
              ]
            }
          },
          {
            "id": "12-c2-b2",
            "title": "Bài 7 & 8: Hệ tọa độ trong không gian và biểu thức tọa độ",
            "order": 2,
            "description": "Tọa độ điểm, tọa độ vectơ, tích vô hướng và độ dài đoạn thẳng trong không gian Oxyz",
            "theory": {
              "overview": "Hệ trục tọa độ Oxyz với 3 trục vuông góc đôi một. Tọa độ của điểm và các công thức tọa độ của phép toán vectơ.",
              "sections": [
                {
                  "title": "1. Các công thức tọa độ cốt lõi",
                  "content": "Cho $\\vec{u} = (x_1; y_1; z_1)$ và $\\vec{v} = (x_2; y_2; z_2)$:\n- $\\vec{u} \\cdot \\vec{v} = x_1 x_2 + y_1 y_2 + z_1 z_2$\n- $|\\vec{u}| = \\sqrt{x_1^2 + y_1^2 + z_1^2}$\n- $\\cos(\\vec{u}, \\vec{v}) = \\frac{x_1 x_2 + y_1 y_2 + z_1 z_2}{\\sqrt{x_1^2+y_1^2+z_1^2}\\sqrt{x_2^2+y_2^2+z_2^2}}$",
                  "keyFormulas": [
                    "\\vec{u} \\perp \\vec{v} \\iff x_1 x_2 + y_1 y_2 + z_1 z_2 = 0",
                    "M(\\text{trung điểm } AB) = \\left(\\frac{x_A+x_B}{2}; \\frac{y_A+y_B}{2}; \\frac{z_A+z_B}{2}\\right)"
                  ]
                }
              ],
              "summaryFormulas": [
                "AB = \\sqrt{(x_B-x_A)^2 + (y_B-y_A)^2 + (z_B-z_A)^2}"
              ],
              "commonMistakes": [
                "Nhầm lẫn giữa tọa độ điểm và tọa độ vectơ."
              ]
            },
            "exercises": {
              "multipleChoice": [
                {
                  "id": "12-c2-b2-mc1",
                  "question": "Trong không gian $Oxyz$, cho hai điểm $A(1; 2; -1)$ và $B(3; 0; 1)$. Tọa độ trung điểm $M$ của đoạn thẳng $AB$ là:",
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
                  "id": "12-c2-b2-tf1",
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
                      "content": "Tọa độ trọng tâm tam giác $ABC$ là $G\\left(\\frac{1}{3}; \\frac{2}{3}; 1\\right)$.",
                      "isCorrect": true,
                      "explanation": "$G = \\left(\\frac{1+0+0}{3}; \\frac{0+2+0}{3}; \\frac{0+0+3}{3}\\right) = \\left(\\frac{1}{3}; \\frac{2}{3}; 1\\right)$."
                    },
                    {
                      "subId": "c",
                      "content": "Độ dài đoạn thẳng $AB = \\sqrt{5}$.",
                      "isCorrect": true,
                      "explanation": "$AB = \\sqrt{(-1)^2 + 2^2 + 0^2} = \\sqrt{5}$."
                    },
                    {
                      "subId": "d",
                      "content": "Tam giác $ABC$ là tam giác đều.",
                      "isCorrect": false,
                      "explanation": "$AB = \\sqrt{5}, BC = \\sqrt{13}, CA = \\sqrt{10}$ nên không đều."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "12-c2-b2-sa1",
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
                      "stepName": "Bước 1: Điều kiện vuông góc",
                      "description": "$\\vec{u} \\perp \\vec{v} \\iff \\vec{u} \\cdot \\vec{v} = 0$."
                    },
                    {
                      "stepName": "Bước 2: Giải phương trình",
                      "description": "$1(m) + m(3) + 2(-4) = 0 \\iff 4m - 8 = 0 \\iff m = 2$."
                    }
                  ],
                  "explanation": "$\\vec{u} \\cdot \\vec{v} = 4m - 8 = 0 \\iff m = 2$."
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
        "description": "Khoảng biến thiên, khoảng tứ phân vị, phương sai và độ lệch chuẩn của mẫu số liệu ghép nhóm",
        "lessons": [
          {
            "id": "12-c3-b1",
            "title": "Bài 9 & 10: Khoảng biến thiên, phương sai và độ lệch chuẩn",
            "order": 1,
            "description": "Đo lường độ rủi ro, phân tán dữ liệu và ứng dụng thống kê thực tế",
            "theory": {
              "overview": "Các số đặc trưng đo mức độ biến thiên, mức độ đồng đều hoặc độ phân tán của mẫu dữ liệu ghép nhóm trong phân tích kinh tế xã hội.",
              "sections": [
                {
                  "title": "1. Khoảng biến thiên và độ lệch chuẩn",
                  "content": "- Khoảng biến thiên $R = a_k - a_0$.\n- Phương sai $s^2 = \\frac{1}{n} \\sum n_i (c_i - \\bar{x})^2$.\n- Độ lệch chuẩn $s = \\sqrt{s^2}$.",
                  "keyFormulas": [
                    "s^2 = \\frac{1}{n}\\sum_{i=1}^k n_i c_i^2 - (\\bar{x})^2",
                    "s = \\sqrt{s^2}"
                  ]
                }
              ],
              "summaryFormulas": [
                "\\Delta_Q = Q_3 - Q_1"
              ],
              "commonMistakes": [
                "Quên lấy căn bậc hai của phương sai khi đề bài yêu cầu tìm độ lệch chuẩn."
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
                  "explanation": "Độ lệch chuẩn $s = \\sqrt{s^2} = \\sqrt{16} = 4$."
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
                      "explanation": "Độ lệch chuẩn đo lường mức độ ổn định và rủi ro."
                    },
                    {
                      "subId": "c",
                      "content": "Nếu một xạ thủ khác có điểm trung bình $8{,}5$ và độ lệch chuẩn $1{,}2$ thì xạ thủ thứ hai bắn ổn định hơn xạ thủ thứ nhất.",
                      "isCorrect": false,
                      "explanation": "Xạ thủ thứ nhất có độ lệch chuẩn nhỏ hơn ($0{,}8 < 1{,}2$) nên ổn định hơn."
                    },
                    {
                      "subId": "d",
                      "content": "Phương sai luôn là một số không âm.",
                      "isCorrect": true,
                      "explanation": "Phương sai là trung bình bình phương khoảng cách nên luôn $\\ge 0$."
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
                  "explanation": "Độ lệch chuẩn $s = \\sqrt{25} = 5\\text{ cm}$."
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
            "description": "Bảng nguyên hàm cơ bản, phương pháp đổi biến số và tích phân từng phần",
            "theory": {
              "overview": "Khái niệm nguyên hàm, định lý cơ bản của giải tích và các phương pháp tính tích phân (đổi biến, từng phần).",
              "sections": [
                {
                  "title": "1. Bảng nguyên hàm chuẩn mực",
                  "content": "- $\\int x^\\alpha dx = \\frac{x^{\\alpha+1}}{\\alpha+1} + C$ (với $\\alpha \\ne -1$)\n- $\\int \\frac{1}{x} dx = \\ln|x| + C$\n- $\\int e^x dx = e^x + C$\n- $\\int \\sin x dx = -\\cos x + C, \\quad \\int \\cos x dx = \\sin x + C$",
                  "keyFormulas": [
                    "\\int f'(x) dx = f(x) + C",
                    "\\int_a^b f(x) dx = F(b) - F(a)",
                    "\\int u dv = uv - \\int v du"
                  ]
                }
              ],
              "summaryFormulas": [
                "\\int_a^b [f(x) \\pm g(x)] dx = \\int_a^b f(x) dx \\pm \\int_a^b g(x) dx"
              ],
              "commonMistakes": [
                "Quên đổi cận khi dùng phương pháp đổi biến số trong tích phân xác định."
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
                  "explanation": "$\\int_0^1 (2x + 1) dx = [x^2 + x]_0^1 = (1 + 1) - 0 = 2$."
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
                      "explanation": "$\\int_1^5 = \\int_1^3 + \\int_3^5 = 4 + 6 = 10$."
                    },
                    {
                      "subId": "b",
                      "content": "Tích phân $\\int_3^1 f(x) dx = -4$.",
                      "isCorrect": true,
                      "explanation": "Đổi cận thì đổi dấu: $\\int_3^1 = -\\int_1^3 = -4$."
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
                      "explanation": "$\\int_1^3 2x dx = [x^2]_1^3 = 9 - 1 = 8$. Tổng là $4 + 8 = 12$."
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
                      "description": "$v(t) = \\int (6t - 2) dt = 3t^2 - 2t + C$. Vì $v(0) = 4 \\implies C = 4$. Do đó $v(t) = 3t^2 - 2t + 4$."
                    },
                    {
                      "stepName": "Bước 2: Tính quãng đường",
                      "description": "$s = \\int_0^2 (3t^2 - 2t + 4) dt = [t^3 - t^2 + 4t]_0^2 = (8 - 4 + 8) = 12\\text{ m}$."
                    }
                  ],
                  "explanation": "Quãng đường $s = \\int_0^2 (3t^2 - 2t + 4) dt = 12\\text{ m}$."
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
              "overview": "Sử dụng tích phân để tính diện tích hình phẳng giới hạn bởi các đồ thị và thể tích vật thể quay quanh trục $Ox$.",
              "sections": [
                {
                  "title": "1. Diện tích và thể tích tròn xoay",
                  "content": "- Diện tích giới hạn bởi $y = f(x)$ và $y = g(x)$ từ $a$ đến $b$:\n$$S = \\int_a^b |f(x) - g(x)| dx$$\n- Thể tích khối tròn xoay quay quanh trục $Ox$:\n$$V = \\pi \\int_a^b [f(x)]^2 dx$$",
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
                "Quên nhân hệ số $\\pi$ trong công thức tính thể tích tròn xoay."
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
                  "explanation": "$S = \\int_0^3 x^2 dx = [\\frac{x^3}{3}]_0^3 = \\frac{27}{3} = 9$."
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
                      "content": "Phương trình hoành độ giao điểm $4 - x^2 = 0$ có hai nghiệm $x = -2$ và $x = 2$.",
                      "isCorrect": true,
                      "explanation": "$x = \\pm 2$."
                    },
                    {
                      "subId": "b",
                      "content": "Diện tích hình phẳng $(H)$ là $S = \\int_{-2}^2 (4 - x^2) dx$.",
                      "isCorrect": true,
                      "explanation": "Trên đoạn $[-2; 2]$, $4 - x^2 \\ge 0$."
                    },
                    {
                      "subId": "c",
                      "content": "Giá trị diện tích $S = \\frac{32}{3}$.",
                      "isCorrect": true,
                      "explanation": "$S = [4x - \\frac{x^3}{3}]_{-2}^2 = (8 - \\frac{8}{3}) - (-8 + \\frac{8}{3}) = \\frac{32}{3}$."
                    },
                    {
                      "subId": "d",
                      "content": "Khi quay $(H)$ quanh trục $Ox$, thể tích khối tròn xoay tạo thành không phụ thuộc vào $\\pi$.",
                      "isCorrect": false,
                      "explanation": "Công thức thể tích luôn có hệ số $\\pi$."
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
                    "8 pi",
                    "8pi"
                  ],
                  "unit": "m³",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": true,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Công thức thể tích",
                      "description": "$V = \\pi \\int_0^4 (\\sqrt{x})^2 dx = \\pi \\int_0^4 x dx$."
                    },
                    {
                      "stepName": "Bước 2: Tính tích phân",
                      "description": "$V = \\pi [\\frac{x^2}{2}]_0^4 = \\pi \\times 8 = 8\\pi \\approx 8 \\times 3{,}14 = 25{,}12 \\approx 25{,}1\\text{ m}^3$."
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
            "title": "Bài 14 & 15: Phương trình mặt phẳng và đường thẳng",
            "order": 1,
            "description": "Vectơ pháp tuyến, vectơ chỉ phương và cách lập phương trình hình học trong không gian",
            "theory": {
              "overview": "Lập phương trình tổng quát của mặt phẳng $Ax + By + Cz + D = 0$ và phương trình tham số/chính tắc của đường thẳng trong không gian.",
              "sections": [
                {
                  "title": "1. Phương trình mặt phẳng và đường thẳng",
                  "content": "- Mặt phẳng đi qua $M_0(x_0; y_0; z_0)$ có VTPT $\\vec{n} = (A; B; C)$:\n$$A(x - x_0) + B(y - y_0) + C(z - z_0) = 0$$\n- Đường thẳng đi qua $M_0$ có VTCP $\\vec{u} = (a; b; c)$:\n$$\\begin{cases} x = x_0 + at \\\\ y = y_0 + bt \\\\ z = z_0 + ct \\end{cases}$$",
                  "keyFormulas": [
                    "Ax + By + Cz + D = 0",
                    "\\frac{x - x_0}{a} = \\frac{y - y_0}{b} = \\frac{z - z_0}{c}"
                  ]
                }
              ],
              "summaryFormulas": [
                "d(M_0, (P)) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}"
              ],
              "commonMistakes": [
                "Nhầm giữa vectơ pháp tuyến của mặt phẳng và vectơ chỉ phương của đường thẳng."
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
                  "explanation": "Các hệ số trước $x, y, z$ cho vectơ pháp tuyến $\\vec{n} = (2; -1; 3)$."
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
                      "explanation": "Thay tọa độ: $2(1) + 2 - 2(3) + 1 = 2 + 2 - 6 + 1 = -1 \\ne 0$."
                    },
                    {
                      "subId": "b",
                      "content": "Khoảng cách từ điểm $A$ đến mặt phẳng $(P)$ bằng $\\frac{1}{3}$.",
                      "isCorrect": true,
                      "explanation": "$d = \\frac{|2(1) + 2 - 6 + 1|}{\\sqrt{4 + 1 + 4}} = \\frac{|-1|}{3} = \\frac{1}{3}$."
                    },
                    {
                      "subId": "c",
                      "content": "Đường thẳng đi qua $A$ và vuông góc với $(P)$ có VTCP là $\\vec{u} = (2; 1; -2)$.",
                      "isCorrect": true,
                      "explanation": "VTCP của đường thẳng vuông góc mặt phẳng chính là VTPT của $(P)$."
                    },
                    {
                      "subId": "d",
                      "content": "Mặt phẳng song song với $(P)$ đi qua $A$ có phương trình $2x + y - 2z + 2 = 0$.",
                      "isCorrect": true,
                      "explanation": "$2(x - 1) + 1(y - 2) - 2(z - 3) = 0 \\iff 2x + y - 2z + 2 = 0$."
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
                      "stepName": "Bước 1: Tìm tâm $I$",
                      "description": "$a = 1, b = -2, c = 3, d = -11$. Tâm $I(1; -2; 3)$."
                    },
                    {
                      "stepName": "Bước 2: Tính bán kính $R$",
                      "description": "$R = \\sqrt{a^2 + b^2 + c^2 - d} = \\sqrt{1 + 4 + 9 - (-11)} = \\sqrt{25} = 5$."
                    }
                  ],
                  "explanation": "$R = \\sqrt{1 + 4 + 9 + 11} = 5$."
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
            "description": "Định nghĩa $P(A|B)$, công thức nhân xác suất, xác suất toàn phần và công thức Bayes trong chẩn đoán y khoa",
            "theory": {
              "overview": "Chuyên đề trọng tâm mới trong kỳ thi THPT theo GDPT 2018: Đánh giá xác suất khi có thêm thông tin (điều kiện) và chẩn đoán nghịch đảo theo Bayes.",
              "sections": [
                {
                  "title": "1. Xác suất có điều kiện và công thức Bayes",
                  "content": "- Xác suất của $A$ với điều kiện $B$ ($P(B) > 0$):\n$$P(A|B) = \\frac{P(AB)}{P(B)}$$\n- Công thức xác suất toàn phần:\n$$P(A) = P(B_1)P(A|B_1) + P(B_2)P(A|B_2)$$\n- Công thức Bayes:\n$$P(B_i|A) = \\frac{P(B_i)P(A|B_i)}{P(A)}$$",
                  "keyFormulas": [
                    "P(AB) = P(B) \\cdot P(A|B) = P(A) \\cdot P(B|A)",
                    "P(B_1|A) = \\frac{P(B_1)P(A|B_1)}{P(B_1)P(A|B_1) + P(B_2)P(A|B_2)}"
                  ]
                }
              ],
              "summaryFormulas": [
                "P(A|B) + P(\\bar{A}|B) = 1"
              ],
              "commonMistakes": [
                "Nhầm lẫn giữa xác suất điều kiện $P(A|B)$ và xác suất giao $P(AB)$."
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
                  "explanation": "$P(A|B) = \\frac{P(AB)}{P(B)} = \\frac{0{,}2}{0{,}5} = 0{,}4$."
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
                      "content": "Xác suất $P(A) = \\frac{6}{10} = 0{,}6$.",
                      "isCorrect": true,
                      "explanation": "Tỉ lệ ban đầu là 6/10."
                    },
                    {
                      "subId": "b",
                      "content": "Xác suất $P(B|A) = \\frac{5}{9}$.",
                      "isCorrect": true,
                      "explanation": "Sau khi viên thứ nhất đỏ được rút ra, trong hộp còn 9 viên và 5 viên đỏ."
                    },
                    {
                      "subId": "c",
                      "content": "Xác suất để cả 2 viên bi rút ra đều màu đỏ là $\\frac{1}{3}$.",
                      "isCorrect": true,
                      "explanation": "$P(AB) = P(A) \\times P(B|A) = \\frac{6}{10} \\times \\frac{5}{9} = \\frac{30}{90} = \\frac{1}{3}$."
                    },
                    {
                      "subId": "d",
                      "content": "Hai biến cố $A$ và $B$ là hai biến cố độc lập.",
                      "isCorrect": false,
                      "explanation": "Vì việc rút không hoàn lại làm thay đổi số bi còn lại nên $A$ và $B$ phụ thuộc nhau."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "12-c6-b1-sa1",
                  "problem": "Tỉ lệ người mắc một căn bệnh hiếm trong dân số là $1\\%$. Một bộ kit xét nghiệm chẩn đoán bệnh này có độ chính xác như sau: Nếu người có bệnh thì kết quả dương tính là $95\\%$; nếu người không có bệnh thì vẫn có $2\\%$ bị dương tính giả. Một người đi xét nghiệm ngẫu nhiên nhận kết quả dương tính. Tính xác suất người này thực sự mắc bệnh (Làm tròn kết quả đến hàng phần trăm, ví dụ 0.32).",
                  "correctValue": 0.32,
                  "acceptableAnswers": [
                    "0.32",
                    "0,32",
                    "32%",
                    "32{,}4%"
                  ],
                  "unit": "",
                  "cognitiveLevel": "Vận dụng",
                  "isRealWorldModeling": true,
                  "modelingSteps": [
                    {
                      "stepName": "Bước 1: Đặt biến cố",
                      "description": "Gọi $B$ là mắc bệnh ($P(B) = 0{,}01, P(\\bar{B}) = 0{,}99$), $T$ là dương tính."
                    },
                    {
                      "stepName": "Bước 2: Xác suất toàn phần",
                      "description": "$P(T) = P(B)P(T|B) + P(\\bar{B})P(T|\\bar{B}) = 0{,}01 \\times 0{,}95 + 0{,}99 \\times 0{,}02 = 0{,}0095 + 0{,}0198 = 0{,}0293$."
                    },
                    {
                      "stepName": "Bước 3: Công thức Bayes",
                      "description": "$P(B|T) = \\frac{0{,}0095}{0{,}0293} \\approx 0{,}3242 \\approx 0{,}32$."
                    }
                  ],
                  "explanation": "Áp dụng công thức Bayes: $P(B|T) = \\frac{0{,}0095}{0{,}0293} \\approx 0{,}32$."
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
    "description": "Lượng giác, Cấp số cộng/nhân, Giới hạn, Hàm số mũ/lôgarit, Đạo hàm và Quan hệ không gian chuẩn SGK Kết nối tri thức với cuộc sống",
    "chapters": [
      {
        "id": "11-c1",
        "title": "Chương I: Hàm số lượng giác và phương trình lượng giác",
        "order": 1,
        "description": "Góc lượng giác, công thức lượng giác, hàm số lượng giác và phương trình lượng giác cơ bản",
        "lessons": [
          {
            "id": "11-c1-b1",
            "title": "Bài 1 & 2: Giá trị lượng giác và công thức lượng giác",
            "order": 1,
            "description": "Công thức cộng, nhân đôi, biến đổi tích thành tổng và tổng thành tích",
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
                  "problem": "Cho $\\cos x = \\frac{1}{3}$. Tính giá trị của biểu thức $P = \\cos 2x$. (Nhập kết quả dưới dạng phân số tối giản a/b hoặc số thập phân làm tròn 2 chữ số)",
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
                      "description": "$\\frac{2\\pi}{365}(t - 80) = \\frac{\\pi}{2} \\iff t - 80 = \\frac{365}{4} = 91{,}25 \\implies t \\approx 171{,}25$. Ngày thứ 171."
                    }
                  ],
                  "explanation": "Đạt cực đại khi góc lượng giác bằng $\\pi/2$, ứng với $t \\approx 171$."
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
        "description": "Công thức số hạng tổng quát, tính chất và tổng n số hạng đầu tiên",
        "lessons": [
          {
            "id": "11-c2-b1",
            "title": "Bài 5 & 6 & 7: Cấp số cộng và Cấp số nhân",
            "order": 1,
            "description": "Số hạng tổng quát $u_n$, công sai $d$, công bội $q$ và ứng dụng tài chính",
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
                  "explanation": "$u_5 = u_1 + 4d = 3 + 4(2) = 11$."
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
                      "explanation": "$u_4 = 2 \\times 3^3 = 2 \\times 27 = 54$."
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
                      "explanation": "Vì $u_1 > 0, q = 3 > 1$ nên là dãy tăng vô hạn."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "11-c2-b1-sa1",
                  "problem": "Một người gửi tiết kiệm $100$ triệu đồng vào ngân hàng với lãi suất $6\\%/\\text{năm}$ theo hình thức lãi kép (tiền lãi hàng năm được cộng dồn vào gốc). Sau $5$ năm, người đó nhận được tổng số tiền gốc và lãi là bao nhiêu triệu đồng? (Làm tròn đến 1 chữ số thập phân)",
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
                      "description": "$A = P(1 + r)^n = 100(1 + 0{,}06)^5$."
                    },
                    {
                      "stepName": "Bước 2: Tính toán",
                      "description": "$A = 100 \\times (1{,}06)^5 \\approx 100 \\times 1{,}3382 = 133{,}82 \\approx 133{,}8$ triệu đồng."
                    }
                  ],
                  "explanation": "Số tiền thu được sau 5 năm: $100 \\times 1{,}06^5 \\approx 133{,}8$ triệu đồng."
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
                "Quên đổi dấu liên hợp $(\\sqrt{A} - B)(\\sqrt{A} + B) = A - B^2$."
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
                  "explanation": "$\\frac{x^2 - 4}{x - 2} = x + 2$. Khi $x \\to 2$, giới hạn bằng $2 + 2 = 4$."
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
                      "explanation": "Hàm đa thức luôn liên tục trên $\\mathbb{R}$."
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
                      "content": "Phương trình đã cho không có nghiệm trên khoảng $(1; 2)$.",
                      "isCorrect": false,
                      "explanation": "Vì $f(1)f(2) = -9 < 0$ nên phương trình có ít nhất một nghiệm trên $(1; 2)$."
                    }
                  ]
                }
              ],
              "shortAnswer": [
                {
                  "id": "11-c5-b1-sa1",
                  "problem": "Tính giới hạn: $L = \\lim_{x \\to 1} \\frac{\\sqrt{x + 3} - 2}{x - 1}$. (Nhập kết quả dưới dạng số thập phân, ví dụ: 0.25)",
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
                      "description": "$\\frac{\\sqrt{x + 3} - 2}{x - 1} = \\frac{(x + 3) - 4}{(x - 1)(\\sqrt{x + 3} + 2)} = \\frac{1}{\\sqrt{x + 3} + 2}$."
                    },
                    {
                      "stepName": "Bước 2: Thay số",
                      "description": "Khi $x \\to 1$, $L = \\frac{1}{\\sqrt{4} + 2} = \\frac{1}{4} = 0{,}25$."
                    }
                  ],
                  "explanation": "Khử dạng $0/0$ bằng nhân liên hợp thu được $L = 1/4 = 0{,}25$."
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
              "overview": "Lý thuyết toàn diện về hàm số mũ $y = a^x$ và hàm số logarit $y = \\log_a x$, các bài toán tăng trưởng dân số và phóng xạ hạt nhân.",
              "sections": [
                {
                  "title": "1. Tính chất logarit và hàm số mũ",
                  "content": "- Điều kiện: $\\log_a b$ có nghĩa khi $0 < a \\ne 1, b > 0$.\n- $\\log_a (xy) = \\log_a x + \\log_a y$\n- $\\log_a \\frac{x}{y} = \\log_a x - \\log_a y$\n- $(a^x)' = a^x \\ln a, \\quad (e^x)' = e^x$",
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
                "Quên đặt điều kiện xác định cho biểu thức dưới dấu logarit $x > 0$."
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
                  "explanation": "Điều kiện $x > 1$. Ta có $x - 1 = 2^3 = 8 \\iff x = 9$ (thỏa mãn)."
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
                      "explanation": "Vì cơ số $a = 3 > 1$."
                    },
                    {
                      "subId": "c",
                      "content": "Đồ thị hàm số đi qua điểm $A(3; 0)$.",
                      "isCorrect": false,
                      "explanation": "$y(3) = \\log_3(6 - 4) = \\log_3 2 \\ne 0$."
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
                  "problem": "Dân số của một quốc gia sau $t$ năm kể từ năm 2020 được ước tính theo công thức $N(t) = 100 \\cdot e^{0{,}012 t}$ (triệu người). Hỏi sau bao nhiêu năm (kể từ năm 2020) thì dân số quốc gia đó vượt qua mốc 120 triệu người? (Làm tròn đến số nguyên gần nhất)",
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
                      "stepName": "Bước 1: Thiết lập bất phương trình",
                      "description": "$100 \\cdot e^{0{,}012 t} \\ge 120 \\iff e^{0{,}012 t} \\ge 1{,}2$."
                    },
                    {
                      "stepName": "Bước 2: Lấy logarit tự nhiên",
                      "description": "$0{,}012 t \\ge \\ln(1{,}2) \\approx 0{,}1823 \\implies t \\ge \\frac{0{,}1823}{0{,}012} \\approx 15{,}19$. Sau khoảng 15 năm."
                    }
                  ],
                  "explanation": "$t = \\frac{\\ln(1{,}2)}{0{,}012} \\approx 15{,}2 \\approx 15$ năm."
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
    "description": "Mệnh đề, Tập hợp, Bất phương trình hai ẩn, Hệ thức lượng tam giác, Vectơ chuẩn SGK Kết nối tri thức với cuộc sống",
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
                  "context": "Cho mệnh đề chứa biến $P(n): \"n^2 - 1 \\text{ chia hết cho } 4\"$ với $n$ là số tự nhiên.",
                  "cognitiveLevel": "Thông hiểu",
                  "statements": [
                    {
                      "subId": "a",
                      "content": "Mệnh đề $P(3)$ là mệnh đề đúng.",
                      "isCorrect": true,
                      "explanation": "$3^2 - 1 = 8$ chia hết cho 4."
                    },
                    {
                      "subId": "b",
                      "content": "Mệnh đề $P(2)$ là mệnh đề sai.",
                      "isCorrect": true,
                      "explanation": "$2^2 - 1 = 3$ không chia hết cho 4."
                    },
                    {
                      "subId": "c",
                      "content": "Với mọi số tự nhiên lẻ $n$, mệnh đề $P(n)$ luôn đúng.",
                      "isCorrect": false,
                      "explanation": "Nếu $n = 2k + 1$ thì $n^2 - 1 = 4k(k+1)$ chia hết cho 8 nên luôn chia hết cho 4. Vậy mệnh đề này đúng!"
                    },
                    {
                      "subId": "d",
                      "content": "Phủ định của mệnh đề \"$\\forall x \\in \\mathbb{R}, x^2 > 0$\" là \"$\\exists x \\in \\mathbb{R}, x^2 \\le 0$\".",
                      "isCorrect": true,
                      "explanation": "Quy tắc phủ định lượng từ chuẩn xác."
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
                      "description": "$|A \\cup B| = |A| + |B| - |A \\cap B| = 25 + 20 - 10 = 35$."
                    },
                    {
                      "stepName": "Bước 2: Tìm phần bù",
                      "description": "Số học sinh không thích cả hai: $45 - 35 = 10$."
                    }
                  ],
                  "explanation": "Số bạn thích ít nhất 1 môn là 35. Số bạn không thích môn nào là $45 - 35 = 10$."
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
                      "explanation": "Tại $B(20; 60)$, lãi $= 20(400) + 60(300) = 8000 + 18000 = 26$ triệu. Tại $A(50; 0)$, lãi $= 50(400) = 20$ triệu. Vậy tại $B(20; 60)$ lớn hơn."
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
                  "explanation": "$a^2 = 5^2 + 8^2 - 2(5)(8)\\cos 60^\\circ = 25 + 64 - 80(0{,}5) = 89 - 40 = 49 \\implies a = 7$."
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
                      "explanation": "$S = \\sqrt{21(21-13)(21-14)(21-15)} = \\sqrt{21 \\times 8 \\times 7 \\times 6} = 84$."
                    },
                    {
                      "subId": "c",
                      "content": "Bán kính đường tròn ngoại tiếp tam giác là $R = 8{,}125$.",
                      "isCorrect": true,
                      "explanation": "$R = \\frac{abc}{4S} = \\frac{13 \\times 14 \\times 15}{4 \\times 84} = \\frac{2730}{336} = 8{,}125$."
                    },
                    {
                      "subId": "d",
                      "content": "Tam giác $ABC$ là tam giác vuông.",
                      "isCorrect": false,
                      "explanation": "$13^2 + 14^2 = 169 + 196 = 365 \\ne 15^2 = 225$."
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
                      "description": "$AB^2 = CA^2 + CB^2 - 2 CA \\cdot CB \\cos 60^\\circ = 100^2 + 150^2 - 2(100)(150)(0{,}5)$."
                    },
                    {
                      "stepName": "Bước 2: Tính toán",
                      "description": "$AB^2 = 10000 + 22500 - 15000 = 17500 \\implies AB = \\sqrt{17500} \\approx 132{,}287 \\approx 132\\text{ m}$."
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
                  "content": "- Quy tắc 3 điểm: $\\vec{AB} + \\vec{BC} = \\vec{AC}, \\quad \\vec{AB} - \\vec{AC} = \\vec{CB}$\n- Quy tắc trung điểm: $M$ là trung điểm $AB \\implies \\vec{MA} + \\vec{MB} = \\vec{0}, \\quad \\vec{OA} + \\vec{OB} = 2\\vec{OM}$\n- Tích vô hướng: $\\vec{u} \\cdot \\vec{v} = |\\vec{u}| |\\vec{v}| \\cos(\\vec{u}, \\vec{v})$",
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
                "Nhầm thứ tự điểm trong quy tắc trừ: $\\vec{AB} - \\vec{AC} = \\vec{CB}$ chứ không phải $\\vec{BC}$."
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
                      "explanation": "Trong tam giác đều, đường trung tuyến đồng thời là đường cao."
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
                      "explanation": "$\\vec{AB} + \\vec{AC} = 2\\vec{AH}$, độ dài bằng $2 \\times \\frac{a\\sqrt{3}}{2} = a\\sqrt{3}$."
                    },
                    {
                      "subId": "d",
                      "content": "Góc giữa hai vectơ $\\vec{AB}$ và $\\vec{AC}$ bằng $120^\\circ$.",
                      "isCorrect": false,
                      "explanation": "Tam giác đều nên góc giữa hai cạnh chung gốc $A$ bằng $60^\\circ$."
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
                      "stepName": "Bước 1: Tính độ lớn hợp lực",
                      "description": "Vì hai lực vuông góc, theo định lý Pythagore: $|\\vec{F}| = \\sqrt{F_1^2 + F_2^2} = \\sqrt{30^2 + 40^2} = \\sqrt{2500} = 50\\text{ N}$."
                    }
                  ],
                  "explanation": "Hợp lực có độ lớn bằng $50\\text{ N}$."
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
