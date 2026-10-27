# Báo cáo nghiệm thu — CHƯA HOÀN TẤT

Môi trường: cloud Linux, Node 24.19.0/npm 11.9.0, PostgreSQL 17 Docker cục bộ, Chromium hệ thống. Dữ liệu kiểm thử tổng hợp. Chưa có URL deployment mới hoặc live Supabase/Gemini. Test UI ghi rõ mock API; fixture DB mô phỏng auth.uid và bucket metadata, không phải Supabase Auth/Storage thật.

| Test | Trạng thái | Bằng chứng / giới hạn |
|---|---|---|
| T01 | PASS local | npm ci, TypeScript strict, Biome, Vite build và biên dịch Function bằng esbuild; chưa Vercel build |
| T02 | PARTIAL | UI contract mock workspace trống; không còn seed production; chưa tạo teacher qua Google thật |
| T03 | BLOCKED | Thiếu project Auth/DB thật; chưa chứng minh hai thiết bị |
| T04 | BLOCKED | Như T03; có polling 8 giây |
| T05 | PARTIAL | PostgreSQL RLS chặn dữ liệu người khác; signed Storage chưa live |
| T06 | PARTIAL | SQL teacher A không đọc lớp/student B; chưa toàn bộ endpoint live |
| T07 | PASS local | Runtime schema strict chặn role/score/owner; DB không cấp mutation trực tiếp |
| T08 | PARTIAL | HttpOnly/refresh/revoke code và mốc thu hồi; cần kiểm thử GoTrue/Google thật |
| T09 | PARTIAL | Known-pattern frontend artifact scan + canary build; không phải security audit toàn diện |
| T10 | BLOCKED | verify:ai xác nhận SETUP_REQUIRED; không có key/model đã chạy |
| T11 | PARTIAL | Unit phân loại credential/quota/model/timeout; chưa thử lỗi provider thật |
| T12 | PASS local | Schema từ chối field lạ/string boolean, verdict không hợp lệ và thiếu bằng chứng |
| T13 | PASS local | ask_guidance được chuẩn hóa not_applicable; chưa kết nối model thật |
| T14 | BLOCKED live | Source nạp recent history/chi tiết và attachment refs cùng owner; chưa test provider |
| T15 | PARTIAL | PDF bytes/page parser và giữ đúng MIME; chưa AI live chữ/ảnh/PDF |
| T16 | PARTIAL | PDF hỏng/quá trang trả lỗi; DOCX unknown/OLE trả giới hạn rõ |
| T17 | BLOCKED live | Signed direct Storage + hậu kiểm bytes/hash có code; chưa Storage thật |
| T18 | PARTIAL | Browser DOCX roundtrip phân số/căn/chỉ số/bảng; phạm vi hình/OMML phức tạp còn hạn chế |
| T19 | NOT ACCEPTED | 84 câu qua kiểm tra cấu trúc, 0 lỗi; từng câu vẫn PENDING_TEACHER_REVIEW; sửa câu tam giác có đáp án tương đương |
| T20 | PARTIAL | Shuffle ổn định và snapshot/hash phê duyệt; chưa attempt live reload |
| T21 | PASS local | Unit 0, thập phân dấu phẩy, phân số, Unicode, tolerance/unit và từ chối mã thực thi |
| T22 | PARTIAL | Server dùng mẫu số toàn bộ câu, answered riêng; chưa luồng Auth thật |
| T23 | PARTIAL | SQL submit idempotent, reserve quota concurrency; chưa provider tính phí thật |
| T24 | PARTIAL | Học sinh không có quyền ghi resolved; giáo viên cần lý do/căn cứ; chưa re-test thích ứng tự động |
| T25 | PARTIAL | Empty UI không khen; thống kê chỉ dùng reviewState verified và verdict đúng/sai |
| T26 | PASS local SQL | Review ghi before/after audit và mastery evidence trong transaction; chưa API live |
| T27 | BLOCKED live | API giao/nộp/feedback đã nối; chưa hai thiết bị Auth/DB thật |
| T28 | PARTIAL | Source dùng DB messages/documents/attempts; mock UI lưu/load; chưa đổi thiết bị thật |
| T29 | PASS local | SQL race chỉ một revision thắng; UI mock 409 giữ bản sửa |
| T30 | PARTIAL | Editor chữ/math/bảng/hình/undo cơ bản; chưa AI đề xuất patch theo node ID |
| T31 | PARTIAL | Chromium PDF đúng 1/2/10 trang ngắt chủ động; preview bảng 100 dòng giữ đủ dòng/lặp header; chưa đầy đủ spike hình cao/KHBD trên mọi browser |
| T32 | PARTIAL | ZIP OOXML/OMML thật, fraction/root/script/integral/sum/vector/matrix XML; Word desktop chưa kiểm tra |
| T33 | NOT IMPLEMENTED | Import legacy có mapping/đối soát/rollback chưa triển khai; không tự nhập dữ liệu cũ |
| T34 | PARTIAL | UI mock lưu lỗi/revision conflict không báo thành công; chưa outage/quota DB thật |
| T35 | BLOCKED | Chưa Vercel Preview; routing config và local Function compile không thay nghiệm thu deploy |
| T36 | PARTIAL | Playwright desktop và 360px; sửa overflow input ẩn; chưa audit accessibility đầy đủ |
| T37 | NOT RUN | Có SQL concurrency quota/revision; chưa tải 40 học sinh toàn luồng |
| T38 | PARTIAL | DOCX text script không thực thi; JSON node/src validation, KaTeX trust=false; chưa audit prompt injection live |
| T39 | BLOCKED live | Signed download 60s, delete owner có code; chưa kiểm tra Storage thật/TTL cleanup tự động |
| T40 | BLOCKED | Chưa deploy production/rollback thật |

Không thay đổi tiêu chuẩn để gọi PARTIAL/BLOCKED là PASS. CI không tự promote. Log chỉ requestId/code/status, không bài học sinh/key. HTML report Playwright và trace cục bộ nằm trong playwright-report/test-results, bị Git ignore. Chạy lại toàn bộ check sau cấu hình dịch vụ; không dùng kết quả mock để nghiệm thu live.
