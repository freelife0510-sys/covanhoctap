# Cố Vấn Học Tập — React/Vite + API + Supabase

Đang triển khai kế hoạch [S0–S8](docs/IMPLEMENTATION_PLAN.md). **Chưa nghiệm thu production**; xem [tiến độ](docs/PROGRESS.md), [nghiệm thu](docs/ACCEPTANCE.md) và [cấu hình cần thiết](docs/SETUP_REQUIRED.md). Không dùng dữ liệu demo hay chấm phỏng đoán để thay chức năng chưa cấu hình.

## Chạy phát triển

Node theo `.nvmrc` (đã kiểm tra Node 24.19.0), npm 11.9.0. Dùng checkout hiện có.

```sh
npm ci
cp .env.example .env.local
# Cấu hình dịch vụ riêng; không commit .env.local.
npm run dev
```

Vite dev phục vụ cả `/api/*` qua middleware Node. Trên Vercel, handler tương ứng là `api/[...path].ts`. Thiếu Supabase hoặc Gemini sẽ trả lỗi cấu hình rõ ràng, không đăng nhập giả hoặc trả lời mẫu.

## Kiểm thử

```sh
npm run typecheck
npm run lint
npm run test:unit
npm run test:integration
npm run test:curriculum
npm run build
npm run build:server
npm run scan:build
npm run test:e2e
```

Postgres integration cần `TEST_DATABASE_URL` trỏ đến **database thử nghiệm kết thúc bằng `_test`**, sẽ xóa/tạo lại schema của database đó. Không dùng database có dữ liệu thật. Không có biến này, test DB được ghi SKIPPED, không phải PASS. Fixture mô phỏng metadata Auth/Storage để kiểm tra SQL/RLS; không thay cho kiểm thử dịch vụ Supabase thật.

Playwright tự dùng Chromium hệ thống nếu có; nếu chưa có, chạy `npx playwright install chromium`. Test UI giả lập API được ghi rõ “UI contract mock”; không chứng minh live auth hay đồng bộ hai thiết bị.

`npm run verify:ai` gọi thật provider (có thể tốn quota), discovery và kiểm tra chữ/JSON/PNG/PDF với dữ liệu tổng hợp. Kết quả lưu dưới `/tmp/covanhoctap-evidence`, không commit key hoặc telemetry chứa bài học sinh.

## Lưu trữ và quyền

Phiên BFF dùng cookie HttpOnly; Google qua Supabase PKCE; học sinh đăng nhập mã + mật khẩu ở server. Tài khoản giáo viên cần được cấp trong `teacher_access`. Không có seed tự động. Mật khẩu học sinh do Auth quản lý, chỉ hiển thị một lần khi cấp/reset. Mã học sinh duy nhất toàn hệ thống.

Ngân hàng 84 câu nằm ở server. Câu chưa được giáo viên duyệt không được dùng để chấm. Không tuyên bố bao phủ toàn bộ SGK; báo cáo cấu trúc và trạng thái từng câu ở `docs/CURRICULUM_REVIEW.csv`.

DOCX xuất là OOXML/OMML thật, không phải HTML đổi đuôi. Trình soạn Tiptap hỗ trợ văn bản, bảng, hình PNG/JPEG, công thức LaTeX, ngắt trang và revision. Các cấu trúc ngoài phạm vi báo lỗi. Phân trang được kiểm tra trong phạm vi báo cáo; chưa nghiệm thu Microsoft Word hoặc toàn bộ kế hoạch; xem báo cáo giới hạn.

## GitHub → Vercel

Dùng đúng project đang sở hữu `covanhoctap.vercel.app`. Đẩy nhánh tính năng để tạo Preview **nếu Git integration đã bật**; không mặc định mọi push đều deploy. Xem [triển khai](docs/DEPLOYMENT.md) và [rollback](docs/ROLLBACK.md). Không merge production trước khi cấu hình dịch vụ và gate live đạt.
