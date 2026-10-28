# Tiến độ hoàn thiện sản phẩm — Nhánh `feat/production-readiness`

Baseline: `aad90c2cdcca012a735febe01fc5661cad1818a2`. Nhánh triển khai: `feat/production-readiness`.
Mục tiêu Vercel Project: `troliai3439s-projects/covanhoctap` (`prj_n5niEi4sbkgrqQTPrAtIxX6P1DIA`).

| Chặng | Trạng thái mã nguồn & kiểm thử cục bộ | Chi tiết đã hoàn thành / Điều kiện dịch vụ ngoài còn lại |
|---|---|---|
| S0 | PASS | Baseline, backup bundle, nhánh riêng; đã xác thực GitHub & Vercel CLI (`troliai3439s-projects/covanhoctap`). |
| S1 | IMPLEMENTED, LIVE BLOCKED | BFF HttpOnly/PKCE/Auth; schema/RLS/ownership; tạo/reset học sinh; lớp, hồ sơ, chuyển lớp. Cần cấu hình biến môi trường Supabase trên Vercel để mở khóa cổng live. |
| S2 | IMPLEMENTED, LIVE BLOCKED | SDK chỉ chạy phía máy chủ (`server/ai.ts`), `checkAIConnection`, schema Zod nghiêm ngặt, lịch sử hội thoại, quota/idempotency (`reserve_ai`/`finish_ai`), sinh bài tập AI (`POST /api/ai/exercises`) và đề xuất bản vá tài liệu (`POST /api/ai/document-patch`). Cần `GEMINI_API_KEY` và `GEMINI_PRIMARY_MODEL` trên Vercel. |
| S3 | IMPLEMENTED, LIVE BLOCKED | Tải tệp trực tiếp qua signed URL, hậu kiểm magic bytes/MIME/SHA-256/số trang PDF/kích thước ảnh, signed download/delete; nhập/xuất DOCX chuẩn OOXML/OMML. Cần Supabase Storage thật để chạy live. |
| S4 | PASS | Kiểm toán toán học toàn bộ 84 câu hỏi gốc (28 MC, 28 TF với 112 mệnh đề, 28 SA) trong `docs/CURRICULUM_REVIEW.md` & `docs/CURRICULUM_REVIEW.csv`; cân bằng đáp án gốc A/B/C/D (7/7/7/7); hỗ trợ cả thang điểm Đúng/Sai THPT 2025 (0,1 / 0,25 / 0,5 / 1,0đ) và chế độ luyện tập từng ý. |
| S5 | IMPLEMENTED, LIVE BLOCKED | Giao/nhận/nộp/chấm/feedback API+UI; học sinh gửi bản tự sửa (`POST /api/submissions/self-correction`) tách biệt với xác nhận khắc phục của giáo viên; lộ trình ôn tập thích ứng Rule-based (`GET /api/recommendations`); phân tích lớp học minh bạch mẫu số (`GET /api/analytics/class`) và xuất CSV chống formula injection (`GET /api/exports/students.csv`). |
| S6 | PASS local | Tiptap A4 editor với `nodeId` ổn định, autosave/khóa phiên bản `revision`, đề xuất & chấp nhận bản vá AI theo đoạn văn, danh sách chấm/số, bảng, công thức OMML, đo phân trang thực tế và bề mặt in `#print-root` 1/2/10 trang. |
| S7 | PASS local | TypeScript strict (`tsc --noEmit`), Biome lint (`0 warnings/errors`), 17 unit tests, HTTP/SQL integration tests, 22 Playwright E2E tests (desktop & mobile 360px), và quét bundle `scan:build`. |
| S8 | PREVIEW READY, PROD GATE ACTIVE | Build & deploy Vercel Preview tự động; `scripts/production-gate.ts` giữ nguyên cơ chế bảo vệ không cho ghi đè Production khi Vercel chưa cấu hình đủ biến môi trường Supabase/Gemini. |

## Theo F01–F21

| ID | Trạng thái mã / Gate |
|---|---|
| F01 | DB/API thay thế hoàn toàn `localStorage` cho dữ liệu vận hành; công cụ di trú dữ liệu cũ an toàn có preview/commit/rollback (`server/legacy.ts`). |
| F02 | Xóa toàn bộ dữ liệu mẫu/mật khẩu giả khỏi runtime và trang chủ; kiểm thử E2E xác nhận workspace trống sạch. |
| F03 | Xóa toàn bộ số liệu quảng cáo giả (`50,000+`, `98%`, `1,200+`, `+50xp`) trên `LandingPage.tsx`; thay bằng thông tin cấu trúc chương trình GDPT 2018. |
| F04 | Server Auth, RLS, HttpOnly cookie, thu hồi phiên `revoked_before`; chờ kết nối Supabase live. |
| F05 | Google OAuth qua Supabase PKCE, `prompt: select_account` và bảng `teacher_access`; chờ cấu hình Google OAuth live. |
| F06 | Không còn SDK hay API key Gemini ở frontend; `scan:build` đạt 100%. |
| F07 | Kiểm tra kết nối model thực qua `/api/ai/status` và `scripts/verify-ai.ts`; chờ `GEMINI_API_KEY` trên Vercel. |
| F08 | Hội thoại, tin nhắn, lịch sử ngữ cảnh và tệp đính kèm lưu trên PostgreSQL. |
| F09 | Xóa hoàn toàn heuristic đoán đúng/sai; mọi kết quả đánh giá tuân thủ `aiResultSchema`. |
| F10 | Không dùng tiến trình/timer giả; hiển thị trạng thái mạng và kiểm tra AI thực tế. |
| F11 | Kiểm định PDF (magic bytes, tối đa 20 trang), ảnh (PNG/JPEG/WebP), và DOCX OOXML thực. |
| F12 | Tách biệt rõ `ask_guidance`, `submit_solution`, `request_exercises`; chỉ giáo viên mới tạo/cập nhật `mastery_evidence`. |
| F13 | `GET /api/analytics/class` tính toán minh bạch tử số/mẫu số, loại trừ `legacy_unverified`, `unreviewed`, `ask_guidance` và `inconclusive`. |
| F14 | Học sinh gửi ghi chú tự sửa (`submit_self_correction`) không tự đổi `hasResolvedMistake`; xuất CSV trung hòa công thức độc hại (`buildSafeCsv`). |
| F15 | Đã kiểm toán toán học toàn bộ 84 câu hỏi gốc (`docs/CURRICULUM_REVIEW.md`), sửa các câu `10-c3-b1-mc1`, `11-c6-b1-sa1`, `11-c1-b2-sa1`, `12-c1-b1-sa1`, và cân bằng đáp án gốc A/B/C/D (7 câu mỗi nhãn). |
| F16 | Bộ chấm trả lời ngắn hỗ trợ phân số, số thập phân dấu phẩy, phần trăm, đơn vị, sai số; Đúng/Sai hỗ trợ thang điểm THPT 2025 (0,1 / 0,25 / 0,5 / 1,0đ). |
| F17 | Sinh câu hỏi AI (`POST /api/ai/exercises`) có kiểm định cấu trúc và gắn nhãn `draft_ai`; gợi ý ôn tập thích ứng Rule-based (`GET /api/recommendations`). |
| F18 | Trình soạn thảo A4 hỗ trợ `nodeId` ổn định, đề xuất vá đoạn văn AI có kiểm tra xung đột `revision`, xuất/nhập DOCX OOXML/OMML (gồm cả danh sách chấm/số, bảng, công thức). |
| F19 | Lưu trữ bền vững với khóa lạc quan `revision` và idempotency theo `requestId` / `source_checksum`. |
| F20 | Toàn bộ kiểm thử tự động (`typecheck`, `lint`, `test:curriculum`, `test:unit`, `test:integration`, `test:e2e`, `build`, `build:server`, `scan:build`) đều xanh. |
| F21 | Hoàn thiện toàn bộ các tuyến API và màn hình trong `docs/ROUTES.md`. |
