# Hướng dẫn dùng bản mới sau khi cấu hình dịch vụ

Giáo viên chọn “Giáo viên · Chọn tài khoản Google”, chọn đúng tài khoản Google đang hoạt động rồi hệ thống hoàn tất OAuth và kết nối phiên đăng nhập. Google OAuth phải được cấu hình ở Supabase; giáo viên vẫn cần được chủ ứng dụng cấp quyền trong `teacher_access`. Tài khoản mới trống. Tạo lớp, cấp mã học sinh; mật khẩu ngẫu nhiên chỉ xuất hiện một lần. Giao riêng cho học sinh, không đưa lên nhóm công khai. Đặt lại mật khẩu sẽ yêu cầu đăng nhập/đổi lại; không có chức năng đọc mật khẩu cũ.

Học sinh đăng nhập bằng mã và mật khẩu; đổi mật khẩu được cấp trước khi học. Khi vào không gian học tập, hệ thống kiểm tra AI đã được cấu hình; Gemini API key chỉ được đọc ở máy chủ và được gọi khi học sinh gửi câu hỏi/lời giải, không gọi tính phí chỉ vì đăng nhập. Quản trị viên cần cấu hình `GEMINI_API_KEY`, model đã xác minh và hai biến giới hạn sử dụng trên Vercel. “Hỏi hướng dẫn” không chấm điểm. “Nộp lời giải” mới yêu cầu đánh giá; kết quả AI chưa được giáo viên xác minh có nhãn rõ ràng. Ảnh/PDF tối đa 10 MB; PDF không quá 20 trang. Nếu báo lỗi cấu hình hoặc chưa đọc được file, chưa có kết quả để kết luận.

Giáo viên chọn “Thẩm định nội dung”, kiểm tra đề/đáp án/lời giải độc lập rồi ghi căn cứ phê duyệt. Chỉ câu đã duyệt đúng hash nội dung mới được dùng trong “Tự học”. Câu hỏi chưa đủ không được tự điền đáp án mặc định. Điểm hiển thị là luyện tập trên toàn bộ câu của lượt đó, không phải điểm thi chính thức.

Giao bài chọn lớp và bài học. Học sinh mở Nhiệm vụ và nộp lượt làm; giáo viên xem lượt làm và gửi phản hồi. Hồ sơ tiến bộ chỉ ghi vùng cần củng cố đã được giáo viên thẩm định. Lưu ghi chú/tài liệu không đồng nghĩa đã khắc phục. Giáo viên xác nhận khắc phục phải dựa trên kiểm tra lại và ghi căn cứ.

Soạn tài liệu: sửa chữ, công thức LaTeX, bảng, hình PNG/JPEG, undo/redo, ngắt trang. Lưu có trạng thái và phiên bản; gặp xung đột phải tải/đối chiếu trước khi lưu, không ghi đè im lặng. Trước khi đóng trang hãy kiểm tra “Đã lưu”. Preview phân trang cần tạo lại sau khi sửa. Công thức/khối quá lớn phải tách hoặc thu nhỏ. DOCX xuất là Word Equation trong phạm vi hỗ trợ, không quảng bá MathType. Cấu trúc chưa hỗ trợ sẽ báo lỗi; nhập DOCX phức tạp nên chuyển thành PDF.

Dữ liệu cũ trên máy/browser vẫn được giữ; bản mới không tự sử dụng mật khẩu hoặc phiên localStorage cũ. Import legacy an toàn chưa có, không xóa dữ liệu gốc. Tạm giữ backup riêng có kiểm soát truy cập và liên hệ chủ ứng dụng trước khi di chuyển.
