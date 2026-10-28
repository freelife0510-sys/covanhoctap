# Báo cáo nghiệm thu kỹ thuật (T01–T40)

Môi trường kiểm thử cục bộ: Windows, Node.js `v24.14.1`, TypeScript strict, Biome `2.6.3`, Vite `8.3.4`, Playwright Chromium (Desktop & Mobile 360×780).

| Mã | Trạng thái | Bằng chứng kiểm chứng / Điều kiện dịch vụ ngoài |
|---|---|---|
| T01 | PASS | `npm run typecheck`, `npm run lint`, `npm run build`, `npm run build:server` đều đạt 0 lỗi. |
| T02 | PASS local / LIVE BLOCKED | Trang chủ và workspace giáo viên mới hoàn toàn không có lớp/học sinh/mật khẩu mẫu (`tests/e2e/app.spec.ts`). Cần Supabase thật để đăng nhập Google live. |
| T03 | LIVE BLOCKED | Mã nguồn tạo lớp/học sinh và lưu PostgreSQL đã hoàn chỉnh; chờ cấu hình `SUPABASE_URL` & keys trên Vercel. |
| T04 | LIVE BLOCKED | Như T03; cơ chế đồng bộ 8 giây qua `/api/workspace` đã hoạt động. |
| T05 | PASS SQL / LIVE BLOCKED | RLS PostgreSQL (`tests/integration/database.test.ts`) chặn truy cập chéo giữa học sinh và giáo viên. |
| T06 | PASS SQL / LIVE BLOCKED | Giáo viên A không đọc/sửa được lớp hoặc học sinh của giáo viên B. |
| T07 | PASS | Zod `.strict()` từ chối mọi trường `role`, `score`, `owner_id` từ phía trình duyệt (`tests/unit/core.test.ts`). |
| T08 | PASS code / LIVE BLOCKED | Cookie `HttpOnly`, `SameSite=Lax`, `revoked_before` thu hồi phiên cũ khi đổi/reset mật khẩu. |
| T09 | PASS | `npm run scan:build` xác nhận bundle frontend không chứa khóa bí mật hay SDK quản trị. |
| T10 | LIVE BLOCKED | `scripts/verify-ai.ts` và `/api/ai/status` báo trung thực `SETUP_REQUIRED` khi chưa cấu hình `GEMINI_API_KEY`. |
| T11 | PASS | `classifyProviderError` phân loại chính xác 401/403 (`AI_CREDENTIAL_ERROR`), 429 (`AI_QUOTA`), 404 (`AI_MODEL_UNAVAILABLE`), 504 (`AI_TIMEOUT`). |
| T12 | PASS | `validateAI` và `validateAIExercise` từ chối JSON sai cấu trúc, boolean dạng chuỗi, phương án trùng hoặc thiếu bằng chứng lỗi. |
| T13 | PASS | `intent = ask_guidance` luôn chuẩn hóa `verdict = not_applicable` và không ghi nhận lỗi sai cho học sinh. |
| T14 | PASS code / LIVE BLOCKED | `/api/ai/chat` nạp lịch sử hội thoại trong ngân sách 24.000 ký tự và tệp đính kèm cùng chủ sở hữu. |
| T15 | PASS | `inspectFile` kiểm tra magic bytes PNG/JPEG/WebP/PDF thực tế. |
| T16 | PASS | PDF hỏng hoặc vượt quá 20 trang bị từ chối với thông báo rõ ràng (`tests/unit/core.test.ts`). |
| T17 | PASS code / LIVE BLOCKED | Quy trình cấp signed upload URL -> hậu kiểm SHA-256/magic bytes đã hoàn chỉnh; chờ Supabase Storage live. |
| T18 | PASS | Nhập/xuất `.docx` giữ nguyên tiếng Việt, công thức OMML, danh sách và bảng (`tests/e2e/documents.spec.ts`). |
| T19 | PASS | `npm run test:curriculum` kiểm toán toán học toàn bộ 84 câu (112 mệnh đề Đúng/Sai), phân bổ đều đáp án gốc `{"A":7,"B":7,"C":7,"D":7}`, báo cáo chi tiết tại `docs/CURRICULUM_REVIEW.md` và `docs/CURRICULUM_REVIEW.csv`. |
| T20 | PASS | `stableShuffle` giữ nguyên thứ tự phương án theo `(attemptId, questionId)` và ràng buộc `content_hash`. |
| T21 | PASS | `gradeShortAnswer` chấp nhận `0`, số âm, phân số (`-7/9`), số thập phân dấu phẩy (`2,0`), phần trăm (`32%`), đơn vị và sai số; từ chối biểu thức/mã độc. |
| T22 | PASS | `gradeTrueFalseQuestion` và `submitAttempt` hỗ trợ đầy đủ quy tắc điểm Đúng/Sai THPT 2025 (`0.1 / 0.25 / 0.5 / 1.0`) và chế độ luyện tập từng mệnh đề. |
| T23 | PASS | `submit_attempt` và `reserve_ai` đảm bảo tính idempotent khi gửi trùng yêu cầu. |
| T24 | PASS | `submit_self_correction` lưu bản tự sửa của học sinh (`self_correction_submitted`) mà không tự ý đổi `hasResolvedMistake`; chỉ giáo viên mới xác nhận `resolved` kèm căn cứ. |
| T25 | PASS | `computeClassAnalytics` loại trừ `legacy_unverified`, `unreviewed`, `ask_guidance`, `inconclusive` khỏi mẫu số; `buildSafeCsv` chặn CSV formula injection (`=`, `+`, `-`, `@`). |
| T26 | PASS | `review_submission` ghi `audit_events` (`before_value`, `after_value`, `reason`) và `mastery_evidence` trong cùng giao dịch SQL. |
| T27 | PASS code / LIVE BLOCKED | Luồng giao bài -> học sinh làm bài -> giáo viên nhận xét đã nối hoàn chỉnh. |
| T28 | PASS code / LIVE BLOCKED | Hội thoại, tài liệu, lượt làm bài và lô di trú lưu trữ trên PostgreSQL. |
| T29 | PASS | Khóa lạc quan `save_document` phát hiện xung đột `revision` (HTTP 409) và giữ nguyên nội dung đang soạn (`tests/e2e/documents.spec.ts`). |
| T30 | PASS | `applyDocumentNodePatch` và `/api/ai/document-patch` cập nhật theo `nodeId` ổn định và từ chối bản vá nếu `revision` đã thay đổi (`tests/unit/core.test.ts`). |
| T31 | PASS | Kiểm thử in PDF Chromium (`tests/e2e/documents.spec.ts`) đạt chính xác 1, 2 và 10 trang A4; bảng 100 dòng giữ đủ 100 dòng và lặp tiêu đề `thead` trên mọi trang. |
| T32 | PASS | Xuất `.docx` tạo gói ZIP OOXML hợp lệ chứa `<m:oMath>`, `<m:f>`, `<m:rad>`, `<m:sSubSup>`, `<m:nary>`, `<m:m>`, `<m:acc>`, `<w:numPr>`, `<w:tbl>`, `<w:br>`. |
| T33 | PASS | `server/legacy.ts` (`/api/import/legacy` & `/api/import/legacy/rollback`) đối soát `preview`, ánh xạ UUID tất định, loại bỏ mật khẩu văn bản thuần cũ, gắn nhãn `legacy_unverified` và hỗ trợ hoàn tác theo `batchId`. |
| T34 | PASS | Mọi lỗi API/xung đột phiên bản đều hiển thị `role="alert"` và không xóa mất dữ liệu người dùng đang nhập. |
| T35 | PASS | Đã kiểm chứng định tuyến `/api/health`, `/api/session`, CSRF và giới hạn kích thước gói tin (`tests/integration/http.test.ts`). |
| T36 | PASS | Toàn bộ 22 kịch bản Playwright trên cả Desktop và Mobile (`360×780`) đều đạt, không tràn ngang (`scrollWidth <= innerWidth + 1`). |
| T37 | PARTIAL | Đã kiểm thử đồng thời (concurrency) cho khóa phiên bản tài liệu và hạn mức AI trên PostgreSQL; kiểm thử tải 40 học sinh đồng thời chờ môi trường Supabase live. |
| T38 | PASS | Thẻ `<script>` trong tài liệu và DOCX bị vô hiệu hóa hoàn toàn (`window.hacked === false`), `validateDocument` chặn `javascript:` và ảnh ngoài. |
| T39 | PASS code / LIVE BLOCKED | Signed URL 60 giây và xóa tệp theo đúng `owner_id` trong `/api/uploads/:id`. |
| T40 | PASS | `scripts/production-gate.ts` bảo vệ môi trường Production và cho phép triển khai bản Preview để kiểm tra. |
