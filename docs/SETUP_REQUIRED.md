# Cấu hình bên ngoài còn thiếu

Không gửi khóa vào chat, commit, VITE_* hoặc localStorage. Phiên cloud chưa có bất kỳ biến dịch vụ bên dưới; không chứng minh các biến trong Vercel hiện có hay không. Chưa có Vercel project linkage/quyền API. Chưa mua hoặc tạo dịch vụ trả phí.

## Supabase

1. Chủ ứng dụng chọn/tạo project **thử nghiệm** và project production riêng theo nhu cầu. Kiểm tra hạn mức/chi phí trực tiếp với nhà cung cấp trước khi tạo/nâng gói.
2. Áp dụng lần lượt các migration SQL trong `supabase/migrations` vào project mới. Không chạy fixture test SQL vào project thật. Backup database hiện hữu trước khi thay schema; các migration chưa được thẩm tra với schema production cũ.
3. Bucket `attachments` private, giới hạn 10 MB. Không thêm policy đọc/ghi public. Backend cấp signed upload sau khi xác thực, hậu kiểm magic bytes/pages/pixels/hash. Signed download 60 giây và xóa theo owner.
4. Bật Google provider trong Supabase Auth với Google OAuth client/secret ở dashboard provider; cấu hình Google authorized redirect tới callback Supabase do dashboard cấp. Cấu hình Supabase redirect allowlist chính xác `https://<preview-host>/api/auth/google/callback` và production `https://covanhoctap.vercel.app/api/auth/google/callback`. Không wildcard rộng. `APP_ORIGIN` phải đúng origin của từng deployment.
5. Giáo viên đăng nhập Google lần đầu tạo Auth user nhưng bị từ chối nếu chưa được cấp quyền. Chủ project xác minh đúng user UUID trong Auth và thêm vào `teacher_access`; đăng nhập lại để tạo profile trống. Không tự cấp quyền theo email frontend.
6. Học sinh dùng identity kỹ thuật UUID@students.invalid, Admin Auth tạo với email_confirm=true; không dùng gửi email/reset qua identity này. Kiểm tra provider cho phép identity kỹ thuật. Giáo viên cấp/reset mật khẩu ngẫu nhiên; học sinh đổi mật khẩu sau lần đăng nhập đầu.

## Biến server

| Tên | Nơi cấu hình | Tính chất |
|---|---|---|
| APP_ORIGIN | .env.local/Vercel theo scope | Origin đầy đủ, public, không dấu / cuối |
| SUPABASE_URL | .env.local/Vercel theo scope | URL project tương ứng |
| SUPABASE_PUBLISHABLE_KEY | .env.local/Vercel theo scope | Publishable key; phiên BFF gắn JWT khi đọc, RLS kiểm tra quyền |
| SUPABASE_SECRET_KEY | kho bí mật Vercel/server | Khóa Admin thật; không nằm trong frontend |
| GEMINI_API_KEY | kho bí mật Vercel/server | Key thật có quyền/quota; không VITE_* |
| GEMINI_PRIMARY_MODEL | server | Model đã được discovery + kiểm tra đúng modality |
| GEMINI_FALLBACK_MODELS | server, tùy chọn | Chỉ model đã kiểm tra; chỉ chuyển model khi lỗi 404 |
| AI_REQUEST_TIMEOUT_MS | server | 1000–45000; phải ngắn hơn Function 60s |
| AI_MAX_OUTPUT_TOKENS | server | 256–32768; mặc định 8192 |
| AI_DAILY_REQUEST_LIMIT_PER_USER | server | Chủ app chọn số nguyên dương, không tự đặt ngân sách thay chủ app |
| AI_GLOBAL_DAILY_TOKEN_LIMIT | server | Chủ app chọn ngân sách. Mỗi request giữ chỗ 200000 tokens; lỗi có thể đã tính phí nên giữ dự phòng cho tới đối soát |
| PRODUCTION_ACCEPTANCE_SHA | Vercel Production | SHA 40 ký tự của đúng Preview đã nghiệm thu; không phải bí mật. Chỉ đặt sau khi gate live đạt |

`UPLOAD_MAX_BYTES/PAGES` trong .env.example ghi mặc định sản phẩm 10 MB/20 trang; code hiện áp dụng cố định các giới hạn đó, không tuyên bố tự điều chỉnh khi sửa biến.

## Vercel/GitHub

Project đích phải đang sở hữu `covanhoctap.vercel.app` và được kết nối đúng `freelife0510-sys/covanhoctap`, root repo, branch production main. Người sở hữu kiểm tra trong Vercel dashboard; không tạo project mới để thay domain.

GitHub API từ phiên này bị proxy mạng 403 (CONNECT), khác với Git clone/push qua HTTPS proxy. Chưa đọc được deployment/check status qua API. Muốn tự theo dõi cần cho phép `api.github.com` trong network settings; muốn điều khiển Vercel bằng API cần thêm `api.vercel.com` và cơ chế đăng nhập có quyền project. Không yêu cầu token cá nhân chỉ vì GitHub CLI bị từ chối.

Chỉ đẩy nhánh tính năng. Git integration của project quyết định có tự tạo Preview hay không. Merge main bị chặn về mặt quy trình cho tới khi nghiệm thu. `prebuild` còn chặn build production thiếu biến hoặc SHA nghiệm thu không trùng commit, giữ nguyên deployment đang hoạt động.

## Các bước chưa nghiệm thu

Supabase Auth/Google thật; Storage thật; RLS qua Supabase Data API; hai browser độc lập cùng backend; model/AI chữ/ảnh/PDF thật; 84 câu đã được giáo viên duyệt; Word desktop; phân trang tự động; import legacy có đối soát; live Preview và production. Xem ACCEPTANCE/PROGRESS trước khi sử dụng dữ liệu học sinh thật.
