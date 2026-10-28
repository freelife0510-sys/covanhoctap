# Báo Cáo Thẩm Định Ngân Hàng Câu Hỏi Toán THPT (GDPT 2018)

## 1. Tổng Quan & Phương Pháp Kiểm Toán Toán Học

- **Tổng số khối lớp**: 3 khối (Lớp 10, Lớp 11, Lớp 12)
- **Tổng số chương**: 24 chương (Lớp 12: 6 chương; Lớp 11: 9 chương; Lớp 10: 9 chương)
- **Tổng số cụm bài học**: 28 bài học trọng tâm
- **Tổng số câu hỏi gốc**: 84 câu hỏi (28 Trắc nghiệm 4 lựa chọn, 28 Đúng/Sai với 112 mệnh đề a/b/c/d, 28 Trả lời ngắn)
- **Phân bố đáp án gốc Trắc nghiệm**: 7 câu A, 7 câu B, 7 câu C, 7 câu D (kết hợp trộn thứ tự lựa chọn theo seed từng lượt làm bài)

## 2. Các Lỗi / Điểm Mơ Hồ Toán Học Đã Phát Hiện Và Xử Lý

| Mã câu | Vấn đề phát hiện khi rà soát | Biện pháp xử lý chính thức |
|---|---|---|
| `10-c3-b1-mc1` | Phương án D cũ trùng giá trị lượng giác tương đương ($150^\circ$ và $5\pi/6$). | Thay phương án nhiễu D bằng `$45^\circ$`, đảm bảo 4 phương án phân biệt hoàn toàn. |
| `11-c6-b1-sa1` | Bài toán dân số $N(t) = 100 \cdot e^{0,012t} > 120$: nghiệm liên tục $t \approx 15,19$; làm tròn xuống $15$ cho $N(15) \approx 119,72 < 120$ (chưa vượt ngưỡng). | Quy định rõ $t \in \mathbb{N}^*$ (số năm nguyên) và cập nhật đáp án đúng thành `16` năm ($N(16) \approx 121,17 > 120$). |
| `11-c1-b2-sa1` | Hàm số giờ nắng $d(t) = 3\sin\left[\frac{2\pi}{365}(t-80)\right]+12$ đạt cực đại liên tục tại $t = 171,25$. | Bổ sung lập luận khoảng cách $|171 - 171,25| = 0,25 < |172 - 171,25| = 0,75$ để chứng minh ngày nguyên $t = 171$ là duy nhất đạt cực đại. |
| `12-c1-b1-sa1` | Đề cũ ghi "Tìm tất cả các giá trị nguyên của $m$" nhưng đáp án chấm theo số lượng giá trị (`1 giá trị`, tức $m=0$). | Sửa đề thành "Có bao nhiêu giá trị nguyên của tham số $m \in [-5; 5]$..." để đồng nhất với đáp án `1` và đơn vị `giá trị`. |
| Toàn bộ 28 câu MC | Ngân hàng gốc trước đây đặt cả 28/28 câu có `correctAnswer = "A"`. | Phân bổ đều đáp án gốc `A, B, C, D` (mỗi nhãn 7 câu) và giữ cơ chế `stableShuffle` khi tạo lượt làm. |

## 3. Ma Trận Bao Phủ Chương Trình (Khối / Chương / Bài)

| Khối | Chương | Bài học | MC | TF (mệnh đề) | SA | Trạng thái ngân hàng |
|---|---|---|---:|---:|---:|---|
| Lớp 12 | Chương I: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số | Bài 1: Tính đơn điệu và cực trị của hàm số (`12-c1-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 12 | Chương I: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số | Bài 2 & 5: GTLN, GTNN và bài toán tối ưu hóa thực tiễn (`12-c1-b2`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 12 | Chương I: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số | Bài 3 & 4: Tiệm cận và Khảo sát sự biến thiên hàm số (`12-c1-b3`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 12 | Chương II: Vectơ và hệ tọa độ trong không gian | Bài 6 & 7 & 8: Vectơ và Hệ trục tọa độ Oxyz (`12-c2-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 12 | Chương III: Các số đặc trưng đo mức độ phân tán cho mẫu số liệu ghép nhóm | Bài 9 & 10: Khoảng biến thiên, phương sai và độ lệch chuẩn (`12-c3-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 12 | Chương IV: Nguyên hàm và Tích phân | Bài 11 & 12: Nguyên hàm và Tích phân (`12-c4-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 12 | Chương IV: Nguyên hàm và Tích phân | Bài 13: Ứng dụng hình học của tích phân (`12-c4-b2`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 12 | Chương V: Phương pháp tọa độ trong không gian | Bài 14 & 15 & 16 & 17: Mặt phẳng, Đường thẳng và Mặt cầu (`12-c5-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 12 | Chương VI: Xác suất có điều kiện | Bài 18 & 19: Xác suất có điều kiện và công thức Bayes (`12-c6-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 11 | Chương I: Hàm số lượng giác và phương trình lượng giác | Bài 1 & 2: Giá trị lượng giác và công thức lượng giác (`11-c1-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 11 | Chương I: Hàm số lượng giác và phương trình lượng giác | Bài 3 & 4: Hàm số lượng giác và phương trình lượng giác cơ bản (`11-c1-b2`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 11 | Chương II: Dãy số. Cấp số cộng và cấp số nhân | Bài 5 & 6 & 7: Cấp số cộng và Cấp số nhân (`11-c2-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 11 | Chương III: Các số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm | Bài 8 & 9: Mẫu số liệu ghép nhóm và các số đặc trưng xu thế trung tâm (`11-c3-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 11 | Chương IV: Quan hệ song song trong không gian | Bài 10 & 11 & 12 & 13: Quan hệ song song trong không gian (`11-c4-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 11 | Chương V: Giới hạn. Hàm số liên tục | Bài 15 & 16 & 17: Giới hạn và Hàm số liên tục (`11-c5-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 11 | Chương VI: Hàm số mũ và hàm số lôgarit | Bài 18 & 19 & 20 & 21: Mũ và Lôgarit (`11-c6-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 11 | Chương VII: Đạo hàm | Bài 22 & 23 & 24: Toàn bộ lý thuyết và quy tắc tính Đạo hàm (`11-c7-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 11 | Chương VIII: Quan hệ vuông góc trong không gian | Bài 25 & 26 & 27 & 28 & 29: Quan hệ vuông góc và Khoảng cách (`11-c8-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 11 | Chương IX: Xác suất | Bài 30 & 31: Quy tắc cộng và Quy tắc nhân xác suất (`11-c9-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 10 | Chương I: Mệnh đề và tập hợp | Bài 1 & 2: Mệnh đề và các phép toán trên tập hợp (`10-c1-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 10 | Chương II: Bất phương trình và Hệ bất phương trình bậc nhất hai ẩn | Bài 3 & 4: Bất phương trình và hệ bất phương trình bậc nhất hai ẩn (`10-c2-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 10 | Chương III: Hệ thức lượng trong tam giác | Bài 5 & 6: Định lý cosin, định lý sin và công thức diện tích tam giác (`10-c3-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 10 | Chương IV: Vectơ | Bài 7 & 8 & 9 & 10: Toàn bộ lý thuyết và bài toán Vectơ phẳng (`10-c4-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 10 | Chương V: Các số đặc trưng của mẫu số liệu không ghép nhóm | Bài 11 & 12 & 13 & 14: Thống kê mô tả mẫu số liệu không ghép nhóm (`10-c5-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 10 | Chương VI: Hàm số, đồ thị và ứng dụng | Bài 15 & 16 & 17 & 18: Hàm số bậc hai và Tam thức bậc hai (`10-c6-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 10 | Chương VII: Phương pháp tọa độ trong mặt phẳng | Bài 19 & 20 & 21 & 22: Hình học phẳng Oxy và ba đường Conic (`10-c7-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 10 | Chương VIII: Đại số tổ hợp | Bài 23 & 24 & 25: Đại số tổ hợp và Nhị thức Newton (`10-c8-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |
| Lớp 10 | Chương IX: Tính xác suất theo định nghĩa cổ điển | Bài 26 & 27: Xác suất cổ điển và thực hành tính toán (`10-c9-b1`) | 1 | 1 (4) | 1 | Đã thẩm định đủ 3 dạng (VERIFIED) |

## 4. Bảng Thẩm Định Chi Tiết 84 Câu Hỏi

| Mã câu | Bài | Dạng | Đáp án | Lý do đúng / Giải thích | Trạng thái |
|---|---|---|---|---|---|
| `12-c1-b1-mc1` | `12-c1-b1` | Trắc nghiệm | A ($x = 0$) | Ta có $y' = 3x^2 - 6x = 3x(x - 2)$. Cho $y' = 0 \iff x = 0$ hoặc $x = 2$. Bảng xét dấu cho thấy $y'$ đổi dấu từ $+$ sang $-$ khi qua $x = 0$, do đó $x = 0$ là điểm cực đại. | `VERIFIED` |
| `12-c1-b1-tf1` | `12-c1-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) Đạo hàm đúng theo quy tắc lũy thừa. | (b) $x^2 - 4x + 3 = 0 \iff x = 1$ hoặc $x = 3$. | (c) Trong khoảng $(1; 3)$, tam thức bậc hai $x^2 - 4x + 3 < 0$ nên $f'(x) < 0$. | (d) Điểm cực tiểu là $x = 3$, giá trị cực tiểu là $f(3) = 1$. | `VERIFIED` |
| `12-c1-b1-sa1` | `12-c1-b1` | Trả lời ngắn | 1 giá trị (chấp nhận: 1 | m=0 | 1 giá trị) | Hai nghiệm của $y' = 3x^2 - 6mx + 3(m^2 - 1) = 0$ trái dấu khi $x_1 x_2 = m^2 - 1 < 0 \iff -1 < m < 1$. Do $m \in \mathbb{Z}$ nên chỉ có $m = 0$, tức là có $1$ giá trị nguyên. | `VERIFIED` |
| `12-c1-b2-mc1` | `12-c1-b2` | Trắc nghiệm | B ($11$) | $f(0) = 3, f(1) = 2, f(2) = 11 \implies \max = 11$. | `VERIFIED` |
| `12-c1-b2-tf1` | `12-c1-b2` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) $R(x) = x(100 - x) = 100x - x^2$. | (b) $L(x) = R(x) - C(x) = -2x^2 + 80x - 100$. | (c) $L'(x) = -4x + 80 = 0 \iff x = 20$. | (d) $L(20) = -2(400) + 80(20) - 100 = 700$ nghìn đồng. | `VERIFIED` |
| `12-c1-b2-sa1` | `12-c1-b2` | Trả lời ngắn | 9 triệu đồng/tháng (chấp nhận: 9 | 9 triệu | 9.0) | Giá thuê tối ưu là 9 triệu đồng/tháng. | `VERIFIED` |
| `12-c1-b3-mc1` | `12-c1-b3` | Trắc nghiệm | C ($y = 2$) | $\lim_{x \to \pm\infty} \frac{2x - 1}{x + 1} = 2 \implies y = 2$ là tiệm cận ngang. | `VERIFIED` |
| `12-c1-b3-tf1` | `12-c1-b3` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) $x \ne 1$. | (b) $\lim_{x \to 1} y = \infty$. | (c) Chia đa thức được $x - 2 + \frac{2}{x - 1}$. | (d) Bậc tử lớn hơn bậc mẫu nên không có tiệm cận ngang. | `VERIFIED` |
| `12-c1-b3-sa1` | `12-c1-b3` | Trả lời ngắn | 7 (chấp nhận: 7 | S=7) | Giao điểm $I(2; 5) \implies S = 2 + 5 = 7$. | `VERIFIED` |
| `12-c2-b1-mc1` | `12-c2-b1` | Trắc nghiệm | D ($(2; 1; 0)$) | $M = \left(\frac{1+3}{2}; \frac{2+0}{2}; \frac{-1+1}{2}\right) = (2; 1; 0)$. | `VERIFIED` |
| `12-c2-b1-tf1` | `12-c2-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:Đ | (a) $\vec{AB} = (0 - 1; 2 - 0; 0 - 0) = (-1; 2; 0)$. | (b) $\sqrt{(-1)^2 + 2^2 + 0^2} = \sqrt{5}$. | (c) $G = \left(\frac{1}{3}; \frac{2}{3}; \frac{3}{3}\right)$. | (d) $\vec{AB} \cdot \vec{OC} = -1(0) + 2(0) + 0(3) = 0$. | `VERIFIED` |
| `12-c2-b1-sa1` | `12-c2-b1` | Trả lời ngắn | 2 (chấp nhận: 2 | m=2) | $4m - 8 = 0 \iff m = 2$. | `VERIFIED` |
| `12-c3-b1-mc1` | `12-c3-b1` | Trắc nghiệm | A ($4$) | $s = \sqrt{s^2} = \sqrt{16} = 4$. | `VERIFIED` |
| `12-c3-b1-tf1` | `12-c3-b1` | Đúng/Sai | a:Đ; b:Đ; c:S; d:Đ | (a) $s = \sqrt{0{,}64} = 0{,}8$. | (b) Độ lệch chuẩn đo mức độ ổn định. | (c) Độ lệch chuẩn nhỏ hơn thì ổn định hơn ($0{,}8 < 1{,}2$). | (d) Phương sai luôn $\ge 0$. | `VERIFIED` |
| `12-c3-b1-sa1` | `12-c3-b1` | Trả lời ngắn | 5 cm (chấp nhận: 5 | 5 cm | 5cm) | $s = \sqrt{25} = 5\text{ cm}$. | `VERIFIED` |
| `12-c4-b1-mc1` | `12-c4-b1` | Trắc nghiệm | B ($2$) | $[x^2 + x]_0^1 = 2$. | `VERIFIED` |
| `12-c4-b1-tf1` | `12-c4-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) $\int_1^5 = 4 + 6 = 10$. | (b) Đổi cận đổi dấu: $-\int_1^3 = -4$. | (c) $3 \times 4 = 12$. | (d) $4 + [x^2]_1^3 = 4 + 8 = 12$. | `VERIFIED` |
| `12-c4-b1-sa1` | `12-c4-b1` | Trả lời ngắn | 12 m (chấp nhận: 12 | 12 m | 12m) | $s = 12\text{ m}$. | `VERIFIED` |
| `12-c4-b2-mc1` | `12-c4-b2` | Trắc nghiệm | C ($9$) | $S = \int_0^3 x^2 dx = [x^3/3]_0^3 = 9$. | `VERIFIED` |
| `12-c4-b2-tf1` | `12-c4-b2` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) $4 - x^2 = 0 \iff x = \pm 2$. | (b) $\int_{-2}^2 (4 - x^2) dx = 32/3$. | (c) Công thức thể tích tròn xoay chuẩn. | (d) Parabol $y = 4 - x^2$ là hàm chẵn nên nhận $Oy$ làm trục đối xứng. | `VERIFIED` |
| `12-c4-b2-sa1` | `12-c4-b2` | Trả lời ngắn | 25.1 m³ (chấp nhận: 25.1 | 25,1 | 8 pi) | $V = 8\pi \approx 25{,}1\text{ m}^3$. | `VERIFIED` |
| `12-c5-b1-mc1` | `12-c5-b1` | Trắc nghiệm | D ($\vec{n} = (2; -1; 3)$) | $\vec{n} = (2; -1; 3)$. | `VERIFIED` |
| `12-c5-b1-tf1` | `12-c5-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) $2(1) + 2 - 2(3) + 1 = -1 \ne 0$. | (b) $d = \frac{|-1|}{\sqrt{4+1+4}} = \frac{1}{3}$. | (c) VTCP trùng VTPT của $(P)$. | (d) Bán kính tiếp xúc $R = d(A, (P)) = 1/3$. | `VERIFIED` |
| `12-c5-b1-sa1` | `12-c5-b1` | Trả lời ngắn | 5 (chấp nhận: 5 | R=5) | $R = 5$. | `VERIFIED` |
| `12-c6-b1-mc1` | `12-c6-b1` | Trắc nghiệm | A ($0{,}4$) | $P(A|B) = 0{,}2 / 0{,}5 = 0{,}4$. | `VERIFIED` |
| `12-c6-b1-tf1` | `12-c6-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) $6/10 = 0{,}6$. | (b) Còn 5 bi đỏ trên 9 bi. | (c) $\frac{6}{10} \times \frac{5}{9} = \frac{1}{3}$. | (d) Rút không hoàn lại nên $A$ và $B$ phụ thuộc. | `VERIFIED` |
| `12-c6-b1-sa1` | `12-c6-b1` | Trả lời ngắn | 0.32 (chấp nhận: 0.32 | 0,32 | 32%) | $P(B|T) \approx 0{,}32$. | `VERIFIED` |
| `11-c1-b1-mc1` | `11-c1-b1` | Trắc nghiệm | B ($\cos 2a = \cos^2 a - \sin^2 a$) | Công thức nhân đôi chuẩn mực: $\cos 2a = \cos^2 a - \sin^2 a$. | `VERIFIED` |
| `11-c1-b1-tf1` | `11-c1-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) Khoảng $(\frac{\pi}{2}; \pi)$ thuộc góc phần tư II. | (b) Ở góc phần tư II, $\cos < 0 \implies \cos = -\sqrt{1 - \frac{9}{25}} = -\frac{4}{5}$. | (c) $\sin 2\alpha = 2\sin\alpha\cos\alpha = 2(\frac{3}{5})(-\frac{4}{5}) = -\frac{24}{25}$. | (d) Ở góc phần tư II, $\tan\alpha = \frac{\sin\alpha}{\cos\alpha} < 0$. | `VERIFIED` |
| `11-c1-b1-sa1` | `11-c1-b1` | Trả lời ngắn | -0.78 (chấp nhận: -7/9 | -0.78 | -0,78) | $P = 2(1/9) - 1 = -7/9 \approx -0{,}78$. | `VERIFIED` |
| `11-c1-b2-mc1` | `11-c1-b2` | Trắc nghiệm | C ($x = \frac{\pi}{2} + k\pi, k \in \mathbb{Z}$) | Nghiệm của $\cos x = 0$ là $x = \frac{\pi}{2} + k\pi$. | `VERIFIED` |
| `11-c1-b2-tf1` | `11-c1-b2` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) $2\sin x = 1 \iff \sin x = 1/2$. | (b) $\sin(\pi/6) = 1/2$. | (c) Hai nghiệm là $\frac{\pi}{6}$ và $\frac{5\pi}{6}$. | (d) Tổng nghiệm: $\frac{\pi}{6} + \frac{5\pi}{6} = \pi$. | `VERIFIED` |
| `11-c1-b2-sa1` | `11-c1-b2` | Trả lời ngắn | 171 (chấp nhận: 171 | ngày 171) | Hàm đạt cực đại liên tục tại $t = 171{,}25$; xét trên các ngày nguyên $t \in \mathbb{Z}, 1 \le t \le 365$, giá trị lớn nhất đạt tại $t = 171$. | `VERIFIED` |
| `11-c2-b1-mc1` | `11-c2-b1` | Trắc nghiệm | D ($11$) | $u_5 = 3 + 4(2) = 11$. | `VERIFIED` |
| `11-c2-b1-tf1` | `11-c2-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) $u_2 = 2 \times 3 = 6$. | (b) $u_4 = 2 \times 27 = 54$. | (c) $2 + 6 + 18 = 26$. | (d) Vì $u_1 > 0, q = 3 > 1$ nên là dãy tăng. | `VERIFIED` |
| `11-c2-b1-sa1` | `11-c2-b1` | Trả lời ngắn | 133.8 triệu đồng (chấp nhận: 133.8 | 133,8 | 133.8 triệu) | Số tiền thu được là khoảng 133.8 triệu đồng. | `VERIFIED` |
| `11-c3-b1-mc1` | `11-c3-b1` | Trắc nghiệm | A ($25$) | Giá trị đại diện bằng trung bình cộng hai đầu mút: $(20 + 30)/2 = 25$. | `VERIFIED` |
| `11-c3-b1-tf1` | `11-c3-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:Đ | (a) Đề bài cho 40 học sinh. | (b) $40 / 2 = 20$. | (c) $15 - 10 = 5$. | (d) $M_e = 10 + \frac{20 - 12}{15} \times 5 = 10 + \frac{8}{3} \approx 12{,}67$. | `VERIFIED` |
| `11-c3-b1-sa1` | `11-c3-b1` | Trả lời ngắn | 11 (chấp nhận: 11) | Số trung bình bằng 11. | `VERIFIED` |
| `11-c4-b1-mc1` | `11-c4-b1` | Trắc nghiệm | B (Đường thẳng $a$ không có điểm chung với mặt phẳng $(P)$) | Theo định nghĩa, đường thẳng song song với mặt phẳng thì không có điểm chung nào. | `VERIFIED` |
| `11-c4-b1-tf1` | `11-c4-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) $MN$ là đường trung bình tam giác $SAC$. | (b) $MN \parallel AC \subset (ABCD)$ và $MN \not\subset (ABCD)$. | (c) Giao điểm là trung điểm của $SO$. | (d) Hai mặt phẳng này cắt nhau theo đường thẳng đi qua các điểm chung. | `VERIFIED` |
| `11-c4-b1-sa1` | `11-c4-b1` | Trả lời ngắn | 4 (chấp nhận: 4) | $MN = 4$. | `VERIFIED` |
| `11-c5-b1-mc1` | `11-c5-b1` | Trắc nghiệm | C ($4$) | $\lim_{x \to 2} (x + 2) = 4$. | `VERIFIED` |
| `11-c5-b1-tf1` | `11-c5-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) Hàm đa thức luôn liên tục. | (b) $1 + 3 - 5 = -1$. | (c) $8 + 6 - 5 = 9$. | (d) Vì $f(1)f(2) < 0$ nên có ít nhất 1 nghiệm. | `VERIFIED` |
| `11-c5-b1-sa1` | `11-c5-b1` | Trả lời ngắn | 0.25 (chấp nhận: 0.25 | 0,25 | 1/4) | $L = 0{,}25$. | `VERIFIED` |
| `11-c6-b1-mc1` | `11-c6-b1` | Trắc nghiệm | D ($x = 9$) | $x - 1 = 2^3 = 8 \iff x = 9$. | `VERIFIED` |
| `11-c6-b1-tf1` | `11-c6-b1` | Đúng/Sai | a:Đ; b:Đ; c:S; d:Đ | (a) $2x - 4 > 0 \iff x > 2$. | (b) Vì cơ số $3 > 1$. | (c) $y(3) = \log_3 2 \ne 0$. | (d) $\lim_{x \to 2^+} y = -\infty$. | `VERIFIED` |
| `11-c6-b1-sa1` | `11-c6-b1` | Trả lời ngắn | 16 năm (chấp nhận: 16 | 16 năm) | Nghiệm liên tục $t > \frac{\ln 1{,}2}{0{,}012} \approx 15{,}19$ năm. Vì $t \in \mathbb{N}^*$ và tại $t = 15$ dân số mới đạt $119{,}72 < 120$, nên cần ít nhất $16$ năm nguyên để vượt qua 120 triệu người. | `VERIFIED` |
| `11-c7-b1-mc1` | `11-c7-b1` | Trắc nghiệm | A ($y' = 3x^2 - 2$) | $(x^3)' = 3x^2, (-2x)' = -2, 1' = 0 \implies y' = 3x^2 - 2$. | `VERIFIED` |
| `11-c7-b1-tf1` | `11-c7-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) Quy tắc đạo hàm chuẩn. | (b) $f'(3) = 2(3) - 4 = 2$. | (c) $y = 2(x - 3) + 0 = 2x - 6$. | (d) Tại đỉnh Parabol $x = 2$, $f'(2) = 0$ nên tiếp tuyến $y = -1$ song song với trục hoành. | `VERIFIED` |
| `11-c7-b1-sa1` | `11-c7-b1` | Trả lời ngắn | 6 m/s² (chấp nhận: 6 | 6 m/s^2 | 6m/s2) | Vận tốc triệt tiêu tại thời điểm $t = 2\text{ s}$. Gia tốc tức thời tương ứng là $a(2) = 6(2) - 6 = 6\text{ m/s}^2$. | `VERIFIED` |
| `11-c8-b1-mc1` | `11-c8-b1` | Trắc nghiệm | B ($BC \perp (SAB)$) | $BC \perp AB$ và $BC \perp SA \implies BC \perp (SAB)$. | `VERIFIED` |
| `11-c8-b1-tf1` | `11-c8-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) Hình vuông cạnh $a$. | (b) $V = \frac{1}{3} a^2 \cdot a\sqrt{2} = \frac{a^3\sqrt{2}}{3}$. | (c) Vì $BC \perp (SAB) \implies BC \perp SB$. | (d) Hình chiếu của $SC$ lên đáy là $AC = a\sqrt{2}$. Vì $SA = AC = a\sqrt{2}$ nên góc $\widehat{SCA} = 45^\circ$. | `VERIFIED` |
| `11-c8-b1-sa1` | `11-c8-b1` | Trả lời ngắn | 20.8 (chấp nhận: 20.8 | 20,8 | 12 căn 3 | 20.78) | $V = 12\sqrt{3} \approx 20{,}8$. | `VERIFIED` |
| `11-c9-b1-mc1` | `11-c9-b1` | Trắc nghiệm | C ($0{,}12$) | Do $A$ và $B$ độc lập nên $P(AB) = P(A)P(B) = 0{,}3 \times 0{,}4 = 0{,}12$. | `VERIFIED` |
| `11-c9-b1-tf1` | `11-c9-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) $0{,}8 \times 0{,}7 = 0{,}56$. | (b) $(1 - 0{,}8)(1 - 0{,}7) = 0{,}2 \times 0{,}3 = 0{,}06$. | (c) $1 - 0{,}06 = 0{,}94$. | (d) $0{,}8(0{,}3) + 0{,}2(0{,}7) = 0{,}24 + 0{,}14 = 0{,}38$. | `VERIFIED` |
| `11-c9-b1-sa1` | `11-c9-b1` | Trả lời ngắn | 0.0039 (chấp nhận: 0.0039 | 0,0039 | 1/256) | $P = 1/256 \approx 0{,}0039$. | `VERIFIED` |
| `10-c1-b1-mc1` | `10-c1-b1` | Trắc nghiệm | D ($(2; 4]$) | Phần chung của $[1; 4]$ và $(2; 6)$ là $(2; 4]$. | `VERIFIED` |
| `10-c1-b1-tf1` | `10-c1-b1` | Đúng/Sai | a:Đ; b:Đ; c:S; d:Đ | (a) $x^2 - 4x + 3 = 0 \iff x = 1$ hoặc $x = 3$. | (b) Mọi phần tử của $A$ đều thuộc $B$. | (c) $A \cap B = \{1; 3\}$. | (d) Bỏ các phần tử thuộc $A$ khỏi $B$ còn $\{5\}$. | `VERIFIED` |
| `10-c1-b1-sa1` | `10-c1-b1` | Trả lời ngắn | 10 học sinh (chấp nhận: 10 | 10 học sinh | 10 em) | Số bạn không thích môn nào là $45 - 35 = 10$. | `VERIFIED` |
| `10-c2-b1-mc1` | `10-c2-b1` | Trắc nghiệm | A ($(0; 0)$) | Thay $(0; 0)$ vào ta được $2(0) - 0 + 3 = 3 > 0$ (thỏa mãn). | `VERIFIED` |
| `10-c2-b1-tf1` | `10-c2-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) Đúng theo dữ kiện đề bài. | (b) $2(30) + 30 = 90 \le 100$ và $30 + 30 = 60 \le 80$. | (c) Các đỉnh là $O(0; 0), A(50; 0), B(20; 60), C(0; 80)$. | (d) Tại $B(20; 60)$, lãi $= 26$ triệu, lớn hơn tại $A(50; 0)$ là 20 triệu. | `VERIFIED` |
| `10-c2-b1-sa1` | `10-c2-b1` | Trả lời ngắn | 6 ha (chấp nhận: 6 | 6 ha | 6ha) | Lợi nhuận lớn nhất 120 triệu khi trồng 6 ha đậu xanh và 0 ha ngô. | `VERIFIED` |
| `10-c3-b1-mc1` | `10-c3-b1` | Trắc nghiệm | B ($7$) | $a^2 = 25 + 64 - 2(5)(8)(0{,}5) = 49 \implies a = 7$. | `VERIFIED` |
| `10-c3-b1-tf1` | `10-c3-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) $p = (13 + 14 + 15)/2 = 21$. | (b) $S = \sqrt{21(8)(7)(6)} = 84$. | (c) $R = \frac{abc}{4S} = \frac{2730}{336} = 8{,}125$. | (d) $13^2 + 14^2 \ne 15^2$. | `VERIFIED` |
| `10-c3-b1-sa1` | `10-c3-b1` | Trả lời ngắn | 132 m (chấp nhận: 132 | 132 m | 132m) | $AB = \sqrt{17500} \approx 132\text{ m}$. | `VERIFIED` |
| `10-c4-b1-mc1` | `10-c4-b1` | Trắc nghiệm | C ($\vec{AB} + \vec{AD} = \vec{AC}$) | Quy tắc hình bình hành: $\vec{AB} + \vec{AD} = \vec{AC}$. | `VERIFIED` |
| `10-c4-b1-tf1` | `10-c4-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) Trong tam giác đều, trung tuyến đồng thời là đường cao. | (b) Hai vectơ vuông góc có tích vô hướng bằng 0. | (c) $2AH = 2(a\sqrt{3}/2) = a\sqrt{3}$. | (d) Góc giữa hai cạnh của tam giác đều bằng $60^\circ$. | `VERIFIED` |
| `10-c4-b1-sa1` | `10-c4-b1` | Trả lời ngắn | 50 N (chấp nhận: 50 | 50 N | 50N) | Hợp lực có độ lớn bằng $50\text{ N}$. | `VERIFIED` |
| `10-c5-b1-mc1` | `10-c5-b1` | Trắc nghiệm | D ($6$) | $\bar{x} = (2 + 4 + 6 + 8 + 10)/5 = 30/5 = 6$. | `VERIFIED` |
| `10-c5-b1-tf1` | `10-c5-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) Điểm 7 xuất hiện nhiều nhất (2 lần). | (b) Số đứng ở vị trí thứ 4 là 7. | (c) $10 - 5 = 5$. | (d) $\bar{x} = 52/7 \approx 7{,}43 > 7$. | `VERIFIED` |
| `10-c5-b1-sa1` | `10-c5-b1` | Trả lời ngắn | 10 (chấp nhận: 10) | $R = 14 - 4 = 10$. | `VERIFIED` |
| `10-c6-b1-mc1` | `10-c6-b1` | Trắc nghiệm | A ($I(2; -1)$) | $x = -b/(2a) = 4/2 = 2 \implies y = 4 - 8 + 3 = -1$. Đỉnh $I(2; -1)$. | `VERIFIED` |
| `10-c6-b1-tf1` | `10-c6-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) $2x - 3 \ge 0 \iff x \ge 3/2$. | (b) Vế phải phải không âm trước khi bình phương. | (c) $2x - 3 = x^2 - 6x + 9 \iff x^2 - 8x + 12 = 0 \iff x = 2$ hoặc $x = 6$. | (d) Vì điều kiện $x \ge 3$ nên loại nghiệm ngoại lai $x = 2$. Tập nghiệm chỉ có $S = \{6\}$. | `VERIFIED` |
| `10-c6-b1-sa1` | `10-c6-b1` | Trả lời ngắn | 3 m (chấp nhận: 3 | 3 m | 3m) | Chiều cao tối đa của xe là $3\text{ m}$. | `VERIFIED` |
| `10-c7-b1-mc1` | `10-c7-b1` | Trắc nghiệm | B ($1$) | $d = \frac{|3(1) - 4(2) + 10|}{\sqrt{9 + 16}} = \frac{|5|}{5} = 1$. | `VERIFIED` |
| `10-c7-b1-tf1` | `10-c7-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:Đ | (a) $a = 2, b = -3$. | (b) $R = \sqrt{4 + 9 - (-12)} = \sqrt{25} = 5$. | (c) $0^2 + 0^2 - 0 + 0 - 12 = -12 < 0$. | (d) $d(I, x=7) = |2 - 7| = 5 = R$. | `VERIFIED` |
| `10-c7-b1-sa1` | `10-c7-b1` | Trả lời ngắn | 8 (chấp nhận: 8 | 2c=8) | $2c = 2\sqrt{25 - 9} = 8$. | `VERIFIED` |
| `10-c8-b1-mc1` | `10-c8-b1` | Trắc nghiệm | C ($C_{10}^3 = 120$) | Chọn 3 người không phân biệt thứ tự là một tổ hợp: $C_{10}^3 = 120$. | `VERIFIED` |
| `10-c8-b1-tf1` | `10-c8-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) $C_9^3 = 84$. | (b) $C_5^3 = 10$. | (c) $C_4^3 = 4$. | (d) Tổng số cách là $84 - (10 + 4) = 70$ cách. | `VERIFIED` |
| `10-c8-b1-sa1` | `10-c8-b1` | Trả lời ngắn | 32 (chấp nhận: 32) | Hệ số là $C_4^1 \times 2^3 = 32$. | `VERIFIED` |
| `10-c9-b1-mc1` | `10-c9-b1` | Trắc nghiệm | D ($0{,}5$) | $n(\Omega) = 6$, số chẵn là $\{2; 4; 6\} \implies n(A) = 3$. $P = 3/6 = 0{,}5$. | `VERIFIED` |
| `10-c9-b1-tf1` | `10-c9-b1` | Đúng/Sai | a:Đ; b:Đ; c:Đ; d:S | (a) $\Omega = \{SS, SN, NS, NN\}$. | (b) $P(SS) = 1/4 = 0{,}25$. | (c) $\{SN, NS\} \implies 2/4 = 0{,}5$. | (d) $1 - P(SS) = 1 - 0{,}25 = 0{,}75$. | `VERIFIED` |
| `10-c9-b1-sa1` | `10-c9-b1` | Trả lời ngắn | 0.4 (chấp nhận: 0.4 | 0,4 | 2/5) | $P = 4/10 = 0{,}4$. | `VERIFIED` |
