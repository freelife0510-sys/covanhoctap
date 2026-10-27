# Tiến độ — chưa nghiệm thu toàn bộ

Baseline: `aad90c2cdcca012a735febe01fc5661cad1818a2`. Nhánh: `feat/production-readiness`.
Bản sao Git đã được xác minh: `/workspace/backups/covanhoctap-baseline.bundle` (ngoài repo).
Chủ sở hữu chọn sửa bản GitHub/cloud rồi tự đồng bộ về máy Windows. Không truy cập/sửa ổ E:.

| Chặng | Trạng thái | Đã làm / điều kiện còn lại |
|---|---|---|
| S0 | PARTIAL | Baseline, backup, nhánh riêng; repo Git đọc được. GitHub API bị mạng 403; chưa đối chiếu commit đang deploy trên Vercel |
| S1 | IMPLEMENTED, LIVE BLOCKED | BFF HttpOnly/PKCE/Auth; schema/RLS/ownership; tạo/reset học sinh; lớp, hồ sơ, chuyển lớp. SQL được test trên Postgres cục bộ; thiếu Supabase thật |
| S2 | IMPLEMENTED CORE, LIVE BLOCKED | SDK chỉ server, model allowlist/discovery script, runtime schema, lịch sử, quota/idempotency. Chưa Gemini thật; chưa AI sửa đoạn tài liệu/sinh câu chấm tự học |
| S3 | PARTIAL | Direct private upload, bytes/MIME/hash/page/pixel checks, signed download/delete; DOCX import cơ bản. Chưa Storage thật, OCR/complex conversion worker/TTL cleanup |
| S4 | PARTIAL | Server answer-key grading, numeric parser, question hash approval, shuffle/snapshot/attempts. 84 câu chờ thẩm định toán học, chưa mở bank chưa duyệt |
| S5 | PARTIAL, LIVE BLOCKED | Giao/nhận/nộp/chấm/feedback API+UI; teacher review audit, evidence, thống kê chỉ verified. Chưa hai thiết bị thật; chưa thích ứng/re-test tự động |
| S6 | PARTIAL | Tiptap editor, autosave/revision, measured preview, DOCX OOXML/OMML, import hạn chế, print 1/2/10 trang và bảng preview 100 dòng được test. Chưa AI patch theo node ID; Word desktop/chế độ tài liệu phức tạp chưa nghiệm thu |
| S7 | PARTIAL | TypeScript strict, Biome, unit/HTTP/SQL/Playwright, CI, artifact scan, lazy loading. Chưa tải 40 học sinh, accessibility audit đầy đủ và live security review |
| S8 | BLOCKED | Chưa xác định/link project Vercel, chưa Preview/production mới. Production gate chặn thiếu env/SHA nghiệm thu. Không thay production trước gate |

## Theo F01–F21

| ID | Trạng thái mã / gate |
|---|---|
| F01 | DB/API thay localStorage nguồn chính; live DB/cross-device BLOCKED |
| F02 | Xóa seed/demo khỏi runtime; UI trống đã thử bằng mock; live tạo teacher BLOCKED |
| F03 | Đã bỏ chỉ số online giả |
| F04 | Server Auth, RLS, cookie; live Auth BLOCKED |
| F05 | Google qua Supabase PKCE và teacher allowlist; live OAuth BLOCKED |
| F06 | Không còn SDK/key Gemini ở frontend; artifact scan đạt |
| F07 | Discovery + script chữ/JSON/PNG/PDF; model thực LIVE BLOCKED |
| F08 | DB conversation/messages + recent history/file refs; live context BLOCKED |
| F09 | Bỏ heuristic đoán đúng/sai và code fallback; verdict có schema |
| F10 | Không timer giả giai đoạn; UI chỉ báo upload/wait/save thực |
| F11 | PDF thật, MIME bytes, DOCX phạm vi giới hạn; complex/OLE báo lỗi; live file BLOCKED |
| F12 | Intent rõ, schema strict, chỉ bài nộp tạo evaluation; mastery chỉ teacher review |
| F13 | Thống kê trên verified verdict, rỗng báo chưa đủ dữ liệu; chưa toàn bộ analytics |
| F14 | Student không ghi resolved; teacher review có lý do/audit; tự động retest NOT IMPLEMENTED |
| F15 | Sửa câu tam giác, 84 câu structurally valid; mathematical review PENDING |
| F16 | Server numeric parser + giữ 0, không default đáp án bịa |
| F17 | Editor/preview/revision có mã và test cục bộ; AI patch/node-ID workflow NOT IMPLEMENTED |
| F18 | DOCX thật/OMML, bỏ nhãn MathType; Word desktop BLOCKED |
| F19 | DB messages/docs/attempts + idempotency/revision; live persistence BLOCKED |
| F20 | CI và bộ test có thật; acceptance vẫn PARTIAL/BLOCKED theo bảng T01–T40 |
| F21 | Nối các màn hình mới theo ROUTES.md; legacy import, AI exam generation và các mục ghi trên chưa hoàn thiện |

## Điểm dừng thực tế

Bản này là nhánh triển khai để review, **không phải sản phẩm đã hoàn thiện/đủ production**. Chưa có bí mật/quyền dịch vụ cần thiết để chạy luồng thật. Các mục NOT IMPLEMENTED được giữ rõ, không gộp thành “chỉ thiếu key”. Sau khi cấu hình dịch vụ, ưu tiên kiểm thử Auth/DB/Storage thực và sửa vấn đề phát hiện trước khi mở rộng các luồng còn thiếu. Không dùng dữ liệu học sinh thật cho đến khi quyền và lưu trữ đạt gate.
