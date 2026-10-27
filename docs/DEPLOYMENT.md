# GitHub → Vercel

1. Giữ nguyên production hiện tại. Dùng branch `feat/production-readiness` và project Vercel đang sở hữu domain hiện hữu. Bản sửa có kiến trúc mới và chưa đủ nghiệm thu để thay production.
2. Trong project hiện hữu kiểm tra Git repository, Root Directory (root repo), Production Branch `main`, Node 24.x, Framework Vite, install `npm ci`, build `npm run build`, output `dist`.
3. Cấu hình Supabase/Google/Gemini cho Preview riêng theo SETUP_REQUIRED. Áp dụng migration vào DB thử nghiệm đã backup. Không sao chép toàn bộ dữ liệu localStorage thành dữ liệu đã tin cậy.
4. Push nhánh. Vercel tự build Preview nếu Git integration/quyền đã bật. Không coi push thành công là deploy thành công. Ghi URL Preview thật và deployment ID từ Vercel; không tự đoán URL.
5. Kiểm tra Function `/api/health`, `/api/session`, CSRF, login, hai browser độc lập, class/enrollment, giao/nhận/nộp/chấm/phản hồi, AI đủ modality, private file, DOCX, mobile. Build server cục bộ bằng esbuild chỉ chứng minh biên dịch, không chứng minh Vercel runtime.
6. Chạy `npm run verify:ai` trong môi trường tin cậy với đúng key/model. Không dùng quota production cho test tải tùy tiện. Lưu evidence không có secrets/dữ liệu thật.
7. Hoàn tất T01–T40, đặc biệt các mục NOT IMPLEMENTED. Cấu hình Production env riêng, backup DB và xác nhận domain. Chỉ khi Preview cùng commit đã được nghiệm thu mới đặt `PRODUCTION_ACCEPTANCE_SHA` trong Production và promote/merge theo quy trình.
8. Redeploy/review Vercel build, Functions, domain; kiểm tra trực tiếp `https://covanhoctap.vercel.app`. Không ghi PASS nếu chỉ frontend build đạt.

`vercel.json` tách `/api/*` và `/assets/*` khỏi SPA fallback, Function deadline 60s. Phải xác nhận plan thật hỗ trợ cấu hình và callback preview origin. Không tự nâng gói.
