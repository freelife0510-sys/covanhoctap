# Tiến độ

Baseline: aad90c2cdcca012a735febe01fc5661cad1818a2. Branch: feat/production-readiness.
Bản sao Git đã được xác minh tại /workspace/backups/covanhoctap-baseline.bundle (ngoài repo).
Mã cloud khác bản RAR được mô tả trong kế hoạch: 3 unit test cũ đạt nhưng typecheck lỗi.
Không sửa trên ổ E:; chủ sở hữu đã chọn sửa bản GitHub và tự đồng bộ.

| Chặng | Trạng thái | Bằng chứng / điều kiện còn thiếu |
|---|---|---|
| S0 | IN PROGRESS | Repo sạch ban đầu; chưa có Vercel linkage, không có backend Supabase |
| S1 | NOT IMPLEMENTED | Chưa có Supabase env để kiểm tra DB/Auth thật |
| S2 | NOT IMPLEMENTED | Chưa có Gemini key/model đã kiểm tra |
| S3 | NOT IMPLEMENTED | PDF regex; DOCX mất cấu trúc |
| S4 | NOT IMPLEMENTED | Đáp án client, chấm chuỗi, heuristic phỏng đoán |
| S5 | NOT IMPLEMENTED | Dữ liệu trình duyệt và demo |
| S6 | NOT IMPLEMENTED | Xuất HTML .doc; chưa có editor |
| S7 | NOT IMPLEMENTED | Chưa có CI/E2E |
| S8 | BLOCKED | Chưa xác minh project Vercel sở hữu domain; không promote trước nghiệm thu |

Các F01–F21 và T01–T40 là các gate trong IMPLEMENTATION_PLAN.md; chưa nghiệm thu toàn bộ.
