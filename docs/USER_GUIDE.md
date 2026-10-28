# Hướng dẫn sử dụng hệ thống Cố Vấn Học Tập (GDPT 2018)

## 1. Dành cho Giáo viên / Cố vấn

1. **Đăng nhập**: Bấm **“Đăng nhập bằng Google (Giáo viên)”**, chọn tài khoản Gmail có sẵn trên trình duyệt và bấm **Tiếp tục** để vào thẳng bảng điều khiển giáo viên. Hệ thống tự động xác thực PKCE qua Google OAuth, khởi tạo hồ sơ giáo viên và cấp quyền `teacher_access` ngay lập tức.
2. **Quản lý lớp & cấp tài khoản học sinh**:
   - Tạo lớp mới theo khối (10, 11, 12), năm học và mã lớp.
   - Cấp tài khoản học sinh theo họ tên và mã học sinh duy nhất. Mật khẩu tạm thời ngẫu nhiên chỉ hiển thị **một lần duy nhất**; giao riêng cho học sinh và học sinh sẽ được yêu cầu đổi mật khẩu ngay lần đăng nhập đầu tiên.
   - Xuất danh sách học sinh ra CSV qua nút **“Xuất CSV học sinh”** (đã tự động chống lỗi công thức Excel/Sheets).
3. **Giao bài, Thẩm định bài nộp & Xác nhận khắc phục lỗi**:
   - Giao nhiệm vụ theo lớp, bài học và hạn nộp; xem kết quả từng lượt làm và gửi phản hồi.
   - Trong tab **Bài nộp**, kiểm tra kết luận sơ bộ của AI (`unreviewed`) và ghi căn cứ thẩm định (`correct` / `incorrect` / `inconclusive`).
   - Khi học sinh gửi ghi chú tự sửa lỗi (`self_correction_submitted`), hệ thống hiển thị nội dung tự sửa nhưng **không tự động tính là đã khắc phục** cho đến khi giáo viên kiểm tra lại và nhấn **“Xác nhận đã khắc phục”**.
4. **Phân tích lớp học & Di trú dữ liệu trình duyệt cũ**:
   - Trong tab **Phân tích & Sao lưu**, xem tỉ lệ bài nộp đúng và tỉ lệ khắc phục lỗi với tử số / mẫu số minh bạch (loại trừ hoàn toàn câu hỏi gợi ý, chưa kết luận, AI chưa duyệt và dữ liệu cũ `legacy_unverified`).
   - Sử dụng công cụ **Quét dữ liệu localStorage** hoặc dán JSON sao lưu cũ, bấm **1. Xem trước & Đối soát (Preview)** rồi **2. Nhập dữ liệu an toàn (Commit)**. Có thể hoàn tác toàn bộ lô nhập bằng nút **Rollback Batch**.
5. **Soạn thảo tài liệu A4 & Xuất Word (.docx) / PDF**:
   - Hỗ trợ chữ đậm/nghiêng, tiêu đề, danh sách chấm/số, bảng, hình PNG/JPEG, công thức LaTeX (`inlineMath` / `blockMath`) và ngắt trang chủ động.
   - Đề xuất chỉnh sửa đoạn văn bằng AI theo `nodeId` và phiên bản `revision` (tự động từ chối nếu tài liệu đã bị sửa ở tab khác).
   - Xem trước phân trang A4 đo thực tế trên DOM, xuất `.docx` chuẩn OOXML/OMML (Word Equation) và In/Lưu PDF.

## 2. Dành cho Học sinh

1. **Đăng nhập & Đổi mật khẩu lần đầu**: Đăng nhập bằng Mã học sinh và mật khẩu tạm do giáo viên cấp, sau đó đặt mật khẩu mới (tối thiểu 12 ký tự). Hệ thống tự động đăng nhập lại và kiểm tra trạng thái kết nối Cố vấn AI.
2. **Cố vấn AI Socratic**:
   - Chọn **Hỏi hướng dẫn** khi cần gợi ý phương pháp (không chấm điểm, không ghi lỗi).
   - Chọn **Nộp lời giải** khi muốn kiểm tra bài làm; có thể đính kèm ảnh chụp hoặc PDF (tối đa 10 MB, PDF không quá 20 trang).
3. **Tự học theo bài & Luyện tập chuẩn THPT 2025**:
   - Ôn tập lý thuyết trọng tâm và làm bài tập theo 3 dạng: Trắc nghiệm 4 lựa chọn, Đúng/Sai 4 mệnh đề (hỗ trợ cả thang điểm thi THPT 2025: 1 ý = 0,1đ; 2 ý = 0,25đ; 3 ý = 0,5đ; 4 ý = 1,0đ) và Trả lời ngắn.
   - Có thể tạo thêm bài tập tương tự bằng AI (hiển thị rõ nhãn **Bản nháp do AI đề xuất — Chưa được giáo viên thẩm định**).
4. **Hồ sơ tiến bộ & Tự sửa lỗi**:
   - Xem lộ trình ôn tập thích ứng theo quy tắc (Rule-based) dựa trên các lỗi đã được giáo viên xác minh.
   - Gửi bản tự sửa cho từng lỗi cần củng cố để giáo viên kiểm tra và xác nhận.
