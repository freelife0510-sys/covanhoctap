# Rollback và giữ dữ liệu

Baseline Git trước sửa: `aad90c2cdcca012a735febe01fc5661cad1818a2`. Bản bundle cục bộ đã được xác minh; không phải backup database hoặc bằng chứng commit đó là deployment đang chạy.

Trước production: ghi deployment tốt hiện tại từ Vercel, export/backup database bằng công cụ nhà cung cấp, sao lưu private storage theo chính sách và xuất legacy trên browser gốc. Thử phục hồi vào project thử nghiệm. Không xóa localStorage cũ của người dùng.

Nếu lỗi quyền, mất dữ liệu hoặc chấm sai nghiêm trọng: ngừng phát hành, dùng Vercel rollback/promote deployment tốt đã ghi nhận. Không tự coi baseline Git là bản production tốt. Kiểm tra auth/API/domain sau rollback. Frontend rollback không rollback database.

Migration mới là additive cho project mới; chưa có migration chuyển đổi từ database production cũ. Không drop schema/cột thật để chữa lỗi. Test fixture database chỉ chạy với tên kết thúc `_test` và sẽ xóa schema, tuyệt đối không dùng thông tin production.

Mật khẩu cấp/reset chỉ hiển thị một lần; không có danh sách mật khẩu để khôi phục. Dữ liệu legacy có plaintext phải được bảo vệ riêng và reset qua Auth; chức năng import legacy an toàn hiện chưa hoàn thiện, không đưa backup cũ vào kho dữ liệu thật một cách thủ công không đối soát.
