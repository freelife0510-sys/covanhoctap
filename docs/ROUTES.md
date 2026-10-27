# Kiểm kê màn hình và API bản mới

Các màn hình cũ dựa trên localStorage đã được thay thế, không giữ lại đường đăng nhập/ghi điểm cũ ẩn sau giao diện mới. Trang giới thiệu/giao diện tiếng Việt và React/Vite giữ nguyên nền tảng. Các tính năng chưa nối được ghi rõ ở PROGRESS thay vì để nút trang trí.

| Màn hình / hành động | API / nơi xử lý |
|---|---|
| Giáo viên Google | GET /api/auth/google/start, callback; PKCE + allowlist |
| Học sinh đăng nhập | POST /api/auth/student-login; Auth + DB rate limit |
| Phiên/hồ sơ/đổi mật khẩu/logout | GET /api/session; POST /api/profile, /api/auth/password, /api/auth/logout |
| Tạo/đổi tên/lưu trữ lớp | POST /api/classes, DELETE /api/classes/:id |
| Cấp/reset/sửa/chuyển lớp học sinh | POST /api/students, /api/students/reset-password, /api/students/update |
| Dữ liệu workspace | GET /api/workspace; JWT+RLS, polling 8s |
| Sao lưu workspace | Download JSON đã được cấp quyền, không chứa mật khẩu |
| Giao bài/nhận nhiệm vụ | POST /api/assignments; GET /api/workspace |
| Học lý thuyết | GET /api/curriculum; không gửi đáp án |
| Thẩm định nội dung | GET/POST /api/content/review; chỉ teacher; hash ràng buộc nội dung |
| Bắt đầu/nộp/đọc lịch sử luyện tập | POST /api/attempts, /api/attempts/submit; GET /api/attempts |
| Giáo viên xem lượt làm/phản hồi | GET /api/teacher/attempts, POST /api/feedback; học sinh GET /api/feedback |
| Chat/hội thoại | GET /api/conversations, /api/messages; POST /api/ai/chat |
| Upload/xem/xóa tệp | POST /api/uploads/authorize, complete; GET/DELETE /api/uploads/:id |
| Giáo viên thẩm định bài AI | POST /api/submissions/review; SQL audit/evidence |
| Hồ sơ tiến bộ | GET /api/evidence, /api/attempts, /api/feedback |
| Editor lưu/mở/phiên bản | GET/POST /api/documents; optimistic revision và version history DB |
| Chữ/bảng/hình/math/undo/zoom/ngắt trang | Tiptap commands, model JSON được validate server |
| Preview A4 | Measured DOM pagination; báo lỗi khối quá cao/rộng; nguồn hiện tại, phải tạo lại sau sửa |
| DOCX nhập/xuất | OOXML parser/serializer phạm vi có test; không dùng HTML đổi đuôi |
| In/Lưu PDF | Clone print surface riêng, chờ font/hình; kiểm tra Chromium 1/2/10 trang |
| Health | GET /api/health, không lộ config/secret |

Chưa có: import legacy đối soát đầy đủ, AI sửa node tài liệu có chấp nhận patch, sinh/duyệt đề AI thành bank có version, tự động thích ứng/re-test, background conversion/TTL jobs. Không để API trống trả success cho các chức năng này.
