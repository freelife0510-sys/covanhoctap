# Kiểm kê màn hình và API bản mới

Các màn hình cũ dựa trên localStorage đã được thay thế hoàn toàn bởi kiến trúc BFF + Supabase/PostgreSQL. Không giữ lại đường đăng nhập hoặc tự chấm điểm ở phía trình duyệt.

| Màn hình / hành động | API / nơi xử lý |
|---|---|
| Giáo viên Google OAuth | `GET /api/auth/google/start`, `/api/auth/google/callback`; PKCE + `teacher_access` allowlist + `prompt: select_account` |
| Học sinh đăng nhập | `POST /api/auth/student-login`; Supabase Auth + `login_rate_limit` + kiểm tra kết nối Gemini nền |
| Phiên / hồ sơ / đổi mật khẩu / đăng xuất | `GET /api/session`; `POST /api/profile`, `/api/auth/password`, `/api/auth/logout` |
| Kiểm tra kết nối AI | `GET /api/ai/status` (`?force=1` kiểm tra lại trực tiếp với Gemini bằng key máy chủ) |
| Tạo / đổi tên / lưu trữ lớp | `POST /api/classes`, `DELETE /api/classes/:id` |
| Cấp / reset / sửa / chuyển lớp học sinh | `POST /api/students`, `/api/students/reset-password`, `/api/students/update` |
| Dữ liệu workspace | `GET /api/workspace`; JWT + RLS, polling 8 giây |
| Phân tích lớp học (Rule-based) | `GET /api/analytics/class`; loại trừ `legacy_unverified`, `unreviewed`, `ask_guidance`, `inconclusive` khỏi mẫu số |
| Xuất danh sách học sinh CSV an toàn | `GET /api/exports/students.csv`; tự động trung hòa công thức bảng tính (`=`, `+`, `-`, `@`, `\t`, `\r`) |
| Di trú & đối soát dữ liệu localStorage cũ | `POST /api/import/legacy` (`preview` / `commit` idempotent theo checksum) và `POST /api/import/legacy/rollback` |
| Giao bài / nhận nhiệm vụ | `POST /api/assignments`; `GET /api/workspace` |
| Học lý thuyết & ngân hàng câu hỏi | `GET /api/curriculum`; 28 bài học / 24 chương / 84 câu gốc đã kiểm toán toán học (`docs/CURRICULUM_REVIEW.md`) |
| Thẩm định / thu hồi câu hỏi | `GET/POST /api/content/review`; chỉ giáo viên; ràng buộc `content_hash` |
| Bắt đầu / nộp / đọc lịch sử luyện tập | `POST /api/attempts`, `/api/attempts/submit` (hỗ trợ cả thang điểm Đúng/Sai THPT 2025: 0,1 / 0,25 / 0,5 / 1,0đ); `GET /api/attempts` |
| Sinh bài tập tham khảo bằng AI | `GET/POST /api/ai/exercises`; kiểm định schema, lưu vào `ai_generated_questions` với nhãn `draft_ai` |
| Lộ trình ôn tập thích ứng (Rule-based) | `GET /api/recommendations`; tổng hợp từ `mastery_evidence` và `attempts` (báo rõ `Chưa đủ dữ liệu` khi trống) |
| Giáo viên xem lượt làm & phản hồi | `GET /api/teacher/attempts`, `POST /api/feedback`; học sinh `GET /api/feedback` |
| Chat / hội thoại cố vấn Socratic | `GET /api/conversations`, `/api/messages`; `POST /api/ai/chat` |
| Tải lên / xem / xóa tệp đính kèm | `POST /api/uploads/authorize`, `/api/uploads/complete`; `GET/DELETE /api/uploads/:id` |
| Học sinh gửi ghi chú tự sửa lỗi | `POST /api/submissions/self-correction`; lưu `workflowState = self_correction_submitted`, không tự đổi `hasResolvedMistake` |
| Giáo viên thẩm định bài nộp AI | `POST /api/submissions/review`; ghi `audit_events` và `mastery_evidence` trong transaction |
| Hồ sơ tiến bộ học sinh | `GET /api/evidence`, `/api/attempts`, `/api/feedback`, `/api/recommendations` |
| Trình soạn thảo A4 lưu / mở / phiên bản | `GET/POST /api/documents`; khóa lạc quan theo `revision`, lưu lịch sử `document_versions` và gán `nodeId` ổn định |
| Đề xuất vá đoạn văn tài liệu bằng AI | `POST /api/ai/document-patch`; kiểm tra `revision` và `targetNodeId`, trả về bản xem trước để giáo viên chấp nhận/từ chối |
| Xuất / Nhập DOCX chuẩn OOXML/OMML | Trình duyệt (`exportDocx.ts` / `importDocx.ts`) và máy chủ (`POST /api/exports/docx`) |
| In / Lưu PDF A4 | Bề mặt `#print-root` tách biệt, chờ font/hình; kiểm thử Chromium 1 / 2 / 10 trang |
| Healthcheck | `GET /api/health`; không lộ cấu hình hay khóa bí mật |
