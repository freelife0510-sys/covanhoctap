# KẾ HOẠCH HOÀN THIỆN CỐ VẤN HỌC TẬP — BÀN GIAO CHO CODEX

Ngày lập: 27/10/2026. Phiên bản kế hoạch: 1.0.

Đích triển khai: https://covanhoctap.vercel.app — sử dụng đúng Vercel project đang sở hữu địa chỉ này.

Mã nguồn được thẩm tra: `math-diagnostic-ai (1)(1).rar`; thư mục làm việc dự kiến trên máy chủ sở hữu: `E:\Ma nguon app\New folder\math-diagnostic-ai (1)`.

## 1. Mục tiêu và điều kiện được gọi là hoàn thành

Hoàn thiện ứng dụng phục vụ giáo viên và học sinh THPT: tài khoản hoạt động trên nhiều thiết bị, dữ liệu lưu bền vững, tự học được chấm đúng theo đáp án đã thẩm định, AI nhận đúng nội dung và có ngữ cảnh, hồ sơ tiến bộ dựa trên bằng chứng, soạn và xuất tài liệu Toán A4 sử dụng được.

Không đồng nhất “build thành công” với “sản phẩm hoạt động đúng”. Không cam kết AI luôn chính xác; phải có cơ chế chưa xác minh, kiểm tra chéo, giáo viên sửa kết quả và truy nguyên thay đổi.

Chỉ công nhận hoàn thành khi:

- Các luồng thật đã vượt kiểm thử tích hợp và trình duyệt, có báo cáo bằng chứng.
- Hai thiết bị/vùng trình duyệt độc lập dùng cùng dữ liệu máy chủ thành công.
- Gemini được gọi bằng key của môi trường triển khai, model thực sự truy cập được, có phép thử chữ/ảnh/PDF/JSON.
- Không có dữ liệu demo, số người online cố định hoặc phản hồi mẫu bị trình bày như kết quả thật.
- Không có mật khẩu học sinh, Gemini key hoặc khóa quản trị cơ sở dữ liệu trong frontend, log hoặc gói tải về.
- Không còn lỗi nghiêm trọng đã nêu trong kế hoạch; mục chưa làm phải ghi BLOCKED/NOT IMPLEMENTED và chưa nghiệm thu toàn bộ.
- Preview đã qua nghiệm thu trước khi cập nhật production. Kế hoạch này tự nó không thực hiện triển khai.

## 2. Cơ sở kiểm tra và giới hạn của kết luận

Đã đọc các thành phần chính, chạy kiểm thử hàm và kiểm tra build trên bản nén. Sau khi cài lại dependencies phù hợp môi trường kiểm tra, TypeScript và Vite build thành công. Ba unit test có sẵn của bộ chấm cục bộ đều thất bại vì kỳ vọng cũ không còn khớp trạng thái `null` hiện tại. Đây không phải lý do bật lại logic đoán kết quả theo từ khóa.

Đã tái hiện: giáo viên mới tự nhận 5 học sinh và 8 bài nộp mẫu; tài khoản tự tạo đăng nhập được trong cùng vùng lưu trữ nhưng không được ở vùng lưu trữ sạch; xuất Word tạo HTML đuôi `.doc`, không tạo OMML; nhánh PDF không đọc được trả về tên file.

Chưa nghiệm thu trực tiếp Google OAuth, Gemini bằng key thật, toàn bộ giao diện hoặc bản đang chạy trên Vercel. Codex phải đối chiếu commit đang triển khai, không giả định nó trùng file nén.

## 3. Danh mục khắc phục bắt buộc

| ID | Vấn đề / vị trí hiện tại | Kết quả phải đạt |
|---|---|---|
| F01 | `storageService.ts`, `App.tsx`: localStorage là dữ liệu chính | Database/API dùng chung; localStorage chỉ chứa tùy chọn giao diện và bản nháp không nhạy cảm |
| F02 | Tạo giáo viên tự seed dữ liệu; `mockData.ts` | Tài khoản thật bắt đầu rỗng; demo tách namespace và có nhãn; không nhập demo vào thống kê thật |
| F03 | `LandingPage.tsx`: 1,240 người online cố định | Xóa chỉ số; chỉ thêm lại khi có đo lường và định nghĩa rõ |
| F04 | Mật khẩu, phiên đăng nhập kiểm tra ở client | Auth phía máy chủ; phân quyền theo người dùng và lớp; mật khẩu do hệ thống Auth quản lý |
| F05 | `/api/auth/google` thiếu ràng buộc audience; mở tài khoản đã lưu không xác minh lại | Thay bằng một luồng Auth thống nhất; tên/avatar đã lưu không cấp quyền truy cập |
| F06 | `geminiService.ts` gọi provider ở trình duyệt, key trong localStorage | Server-only Gemini adapter; không tồn tại bí mật AI trong browser |
| F07 | Danh sách model và fallback cố định | Discovery + allowlist + smoke test theo key/môi trường; phân biệt model không truy cập được với key/quota lỗi |
| F08 | Chat không gửi lịch sử | Conversation/message được lưu và kiểm tra quyền; prompt có lịch sử giới hạn và tham chiếu tài liệu |
| F09 | Fallback cục bộ luôn null nhưng có code cũ không tới được | Xóa code chết; trạng thái chưa xác minh rõ; test mới phản ánh hợp đồng thật |
| F10 | Bộ đếm thời gian giả lập tiến độ | Trạng thái theo sự kiện thật, không tuyên bố đã đọc/chấm khi chưa làm |
| F11 | `fileParser.ts`: PDF regex, DOCX mất cấu trúc, ảnh sai MIME | Đọc PDF thật; bảo toàn công thức/hình trong DOCX trong phạm vi hỗ trợ; MIME đúng; báo phần không đọc được |
| F12 | Gán chẩn đoán/gaps từ độ dài câu hỏi và truthiness | Phân biệt hỏi bài với nộp bài; chỉ cập nhật từ kết quả hợp lệ và bằng chứng |
| F13 | Khuyến nghị mẫu, lớp chưa có dữ liệu vẫn được khen | Nhãn “theo quy tắc” hoặc “AI”; trạng thái thiếu dữ liệu; mẫu số thống kê đúng |
| F14 | Bấm lưu tự sửa là xác nhận đã khắc phục | Lưu bản nháp khác với kiểm tra lại; chỉ xác nhận sau đánh giá mới hoặc giáo viên duyệt |
| F15 | 28 câu MC đều đáp án A; câu tam giác có 2 phương án đúng | Thẩm định toàn bộ 84 câu; sửa trùng đáp án; xáo phương án có ánh xạ đúng |
| F16 | Chấm trả lời ngắn bằng chuỗi, đáp án AI `0` bị `|| 10` đổi | Bộ chuẩn hóa có miền giá trị/độ chính xác; không dùng giá trị mặc định bịa ra |
| F17 | A4 chỉ là Viewer | Trình soạn thảo thật, sửa công thức/bảng/hình, lưu phiên bản, xem trước A4 |
| F18 | Nút DOCX/MathType nhưng xuất HTML `.doc` | DOCX OOXML thực, phương trình OMML; bảng/hình thực; ghi đúng khả năng MathType |
| F19 | Lịch sử chat/phiếu, bài AI phụ thuộc state; lưu lỗi không báo | Lưu bền vững, báo trạng thái lưu, retry/idempotency, xung đột phiên bản |
| F20 | Chưa có kiểm thử E2E, phân quyền và provider lỗi | CI và bộ nghiệm thu bên dưới; thử lỗi có kiểm soát, không mock trong production |
| F21 | Chưa kiểm kê hết nút/profile/giao bài/import-export | Kiểm kê route và handler; nối đủ luồng giao–nhận–nộp–chấm–phản hồi; không để nút trang trí |

P0: F01–F07, F11–F12, các lỗi đáp án gây chấm sai. P1: hoàn thiện các luồng còn lại, A4 và xuất tài liệu. P2: tối ưu hiệu năng, trải nghiệm và mở rộng kho nội dung sau khi đúng dữ liệu.

## 4. Kiến trúc đích và lựa chọn kỹ thuật

Giữ React + TypeScript + Vite. Không viết lại toàn bộ sang framework khác chỉ để sửa các vấn đề đã biết.

Luồng chính: trình duyệt → API cùng origin trên Vercel → Supabase Auth/Postgres/Storage hoặc Gemini. Frontend không gọi Gemini trực tiếp. Không coi filesystem tạm của Function là nơi lưu dữ liệu.

| Thành phần | Quyết định triển khai |
|---|---|
| Frontend | Giữ giao diện tiếng Việt và component đang dùng; tách logic khỏi component lớn |
| API | Vercel Functions Node.js; schema validation, auth, authorization, error mapping dùng chung |
| Dữ liệu | Supabase Postgres, migration SQL có version, RLS và quyền SQL được kiểm thử |
| Danh tính | Supabase Auth; Google cho giáo viên; mã học sinh + mật khẩu qua endpoint đăng nhập |
| File | Supabase Storage bucket private; URL ký ngắn hạn sau kiểm tra quyền |
| AI | `@google/genai` phía server; pin bản SDK đã thử; một adapter dùng chung cho chat/chấm/sinh bài |
| A4 | Tiptap editor + công thức có LaTeX gốc; bước phân trang có đánh giá kỹ thuật riêng ở mục 11 |
| DOCX | Bộ sinh OOXML thực và chuyển công thức sang OMML; kiểm tra file bằng giải nén và mở Word |
| Kiểm thử | Unit/integration + Playwright E2E + kiểm tra quyền DB + live provider smoke test riêng |

Không tự giả định dịch vụ mới là miễn phí. Codex ghi các yêu cầu tài khoản, hạn mức và gói dịch vụ vào `SETUP_REQUIRED.md`; không tự mua gói. Supabase là lựa chọn kiến trúc cho kế hoạch này, có thể thay bằng backend tương đương nếu repo đã có hạ tầng thực đáp ứng các tiêu chí; phải ghi ADR giải thích và giữ nguyên hợp đồng API.

### 4.1 Cấu trúc mã dự kiến

```text
api/                    # routes Vercel; route động phải kiểm tra tương thích deploy
server/auth/            # session, roles, enrollment authorization
server/ai/              # provider, models, prompt versions, validators
server/repositories/    # DB access, transactions
server/grading/         # deterministic graders, rubric scoring
server/files/           # upload policy, document extraction, export
shared/contracts/       # request/response schemas, domain types
src/services/apiClient.ts
src/features/{advisor,selfStudy,teacher,documents}/
supabase/migrations/
tests/{unit,integration,e2e,fixtures}/
scripts/{check-env,verify-ai,verify-curriculum}/
docs/{ACCEPTANCE,DEPLOYMENT,ROLLBACK,SETUP_REQUIRED,PROGRESS}.md
```

Đây là cấu trúc đích, không bắt buộc đổi tên mọi component ngay. Di chuyển từng luồng sau khi có test bảo vệ. Bảo đảm số lượng Function và route phù hợp gói Vercel; có thể dùng router chung nếu cần, không để file server dùng chung vô tình trở thành endpoint.

## 5. Dữ liệu và xác thực nhiều người dùng

### 5.1 Bảng và ràng buộc tối thiểu

| Bảng | Trường/chức năng quan trọng |
|---|---|
| profiles | `user_id` tham chiếu Auth, tên, role do server gán; không lưu mật khẩu |
| teacher_access | Danh sách giáo viên được chủ ứng dụng cấp quyền; đăng nhập Google không tự trở thành giáo viên được phép quản lý |
| classes | UUID, teacher_id, tên, khối, năm học, archived_at |
| student_accounts | user_id, student_code chuẩn hóa UNIQUE toàn hệ thống, forced_password_change; mapping định danh đăng nhập không public |
| enrollments | class_id, student_id, trạng thái; UNIQUE cặp; kiểm tra giáo viên sở hữu lớp |
| conversations/messages | Chủ sở hữu, người tham gia được phép, nội dung, role do server quyết định, attachment refs, thời điểm |
| submissions | student_id, class_id, task_id tùy chọn, đề/bài làm gốc, attachment refs, revision, trạng thái xử lý |
| evaluations | submission_id, nguồn kiểm tra, verdict, lỗi và bằng chứng, rubric, model, prompt/schema version; không cho học sinh ghi |
| questions/question_versions | Nội dung công khai, dạng, khối/chương/bài, trạng thái draft/reviewed/published, người duyệt |
| answer_keys | Đáp án/rubric/lời giải tách quyền đọc; không gửi xuống client trước khi được phép xem |
| attempts/attempt_answers | Phiên bản đề, thứ tự phương án, đáp án người học, thời gian server; kết quả do server tính |
| assignments | Người giao, lớp/người nhận, bộ câu hỏi có version, hạn nộp, chế độ luyện tập/kiểm tra |
| mastery_evidence | Kỹ năng, nguồn bằng chứng, lượt thử, trạng thái; tránh lưu “vùng trũng” chỉ như chuỗi cộng dồn |
| documents/document_versions | JSON tài liệu, author/owner, schema version, revision, lịch sử thay đổi |
| attachments | Đường dẫn Storage private, owner, MIME, bytes, hash, trạng thái extraction, hạn lưu |
| ai_requests/usage_counters | requestId/idempotency, trạng thái, model, usage, error code; quota nguyên tử |
| audit_events/import_batches | Dấu vết thao tác quản trị/chấm lại/nhập dữ liệu; không chứa key hoặc mật khẩu |

UUID cho dữ liệu mới, thời gian lưu UTC và hiển thị `Asia/Ho_Chi_Minh`. Không tạo ID bằng vài chữ số cuối của timestamp. Khóa ngoại, uniqueness và transaction phải bảo vệ được yêu cầu đồng thời.

### 5.2 Auth đề xuất: API quản lý phiên cùng origin

1. Giáo viên: OAuth Google qua Supabase Auth, PKCE/state và redirect allowlist. Callback kiểm tra danh tính, đối chiếu `teacher_access`, tạo profile rỗng. Dùng `user.id/sub` ổn định làm định danh, không tạo ID từ email đã thay ký tự.
2. Học sinh: giáo viên có quyền tạo tài khoản qua server. Dùng Supabase Admin Auth ở đúng endpoint cấp tài khoản; mật khẩu ngẫu nhiên đủ mạnh, chỉ hiển thị khi cấp/reset và bắt buộc đổi lần đầu.
3. Để giữ UX “mã + mật khẩu”, server ánh xạ mã sang identity Auth nội bộ. Có thể dùng địa chỉ kỹ thuật tạo từ UUID thuộc namespace do ứng dụng quản lý, không dùng email thật của học sinh nếu không cần. Không dùng luồng gửi email xác nhận/reset cho identity kỹ thuật; reset qua giáo viên có quyền. Nếu nhà cung cấp không cho cấu hình này, giải quyết luồng Auth thực trước khi nghiệm thu, không quay lại password plaintext.
4. `/api/auth/student-login` nhận mã/mật khẩu, áp dụng rate limit, gọi Auth bằng identity tương ứng, trả thông báo chung khi sai để hạn chế dò tài khoản. Không so sánh mật khẩu trong JS phía client.
5. Phiên do BFF quản lý bằng cookie Secure/HttpOnly/SameSite phù hợp; refresh, hết hạn, revoke và logout phải có test. Đây là thiết kế BFF có chủ ý: không giả định browser Supabase client vẫn refresh được cookie HttpOnly. Browser gọi `/api/session`, không tự giải mã localStorage để cấp quyền.
6. Mọi API bảo vệ kiểm tra phiên đã được Auth xác minh; không chỉ tin dữ liệu cookie đã parse hoặc `getSession` chưa xác thực. Cookie mutation có kiểm tra Origin/CSRF. Trang và response chứa phiên/dữ liệu người dùng không được cache công khai.
7. Truy vấn thông thường dùng Supabase client gắn JWT của người đang đăng nhập để RLS có hiệu lực. Khóa đặc quyền chỉ dùng cho việc quản trị có kiểm tra quyền server. Cấm biến mọi truy vấn thành service-role vì sẽ vô hiệu lớp bảo vệ RLS.
8. Không có chế độ đăng nhập lại chỉ bằng email/avatar đã lưu. Có thể lưu gợi ý tài khoản nhưng phải dựa vào phiên hợp lệ hoặc xác thực lại.

### 5.3 Ma trận quyền

| Tài nguyên | Học sinh | Giáo viên |
|---|---|---|
| Hồ sơ | Đọc hồ sơ mình, sửa trường cho phép | Đọc học sinh trong lớp mình, thao tác cấp/reset theo quyền |
| Lớp | Đọc thông tin tối thiểu lớp đang tham gia | CRUD lớp mình; không đọc lớp giáo viên khác |
| Bài nộp | Tạo/xem bài mình; không đổi owner/kết quả | Xem lớp mình, duyệt/sửa đánh giá có lý do và audit |
| Đáp án | Chỉ được nhận đúng thời điểm theo chế độ bài | Quản lý nội dung mình có quyền; không dùng endpoint học sinh để lộ đáp án |
| Điểm/gaps | Chỉ đọc kết quả được cấp | Không chỉnh trực tiếp aggregate tùy ý; sửa bằng nghiệp vụ chấm lại |
| Tài liệu/file | Đúng chủ sở hữu/người được chia sẻ | Quyền theo lớp/chia sẻ cụ thể, không đọc toàn hệ thống |

RLS phải đi kèm column grants/view hoặc API kiểm soát trường. “Chỉ sửa hàng của mình” chưa đủ nếu học sinh vẫn sửa được `score`, `role`, `teacher_id`. Schema request không nhận các trường này ở endpoint học sinh.

### 5.4 Di chuyển dữ liệu cũ

- Tạo chức năng xuất backup local trước khi migration. Không xóa localStorage trước khi import đối soát thành công.
- Import chỉ sau đăng nhập giáo viên thật; không tin teacherId, điểm, quyền và mật khẩu trong JSON cũ.
- Xem trước số lớp/học sinh/bài nộp; phân loại demo/legacy/real. Dữ liệu chưa rõ nguồn gắn `legacy_unverified`, không vào thống kê đáng tin cậy.
- Thay UUID và lập mapping ID cũ, chuẩn hóa mã, phát hiện trùng, giữ bản gốc phục vụ đối soát. Không merge người chỉ vì trùng tên.
- Tài khoản cũ được cấp/reset mật khẩu mới; không nhập mật khẩu plaintext thành dữ liệu hồ sơ.
- Import batch idempotent, có summary thành công/thất bại và rollback có phạm vi. File nhập chỉ được tạo dữ liệu thuộc giáo viên hiện tại, không ghi đè dữ liệu giáo viên khác.
- Đồng bộ dùng cập nhật từng bản ghi và optimistic concurrency, không ghi đè toàn bộ mảng lớp/học sinh từ state cũ. Refresh/poll khi quay lại màn hình; mục tiêu cập nhật giữa hai thiết bị trong 10 giây ở điều kiện thử đã nêu. Realtime chỉ bổ sung nếu cần.

## 6. Gemini API: gọi đúng, biết lỗi, không lộ key

### 6.1 Cấu hình môi trường

Các tên dưới đây là hợp đồng đề xuất của ứng dụng; Codex tạo `.env.example` chỉ chứa placeholder và kiểm tra thiếu biến khi chạy.

```dotenv
APP_ORIGIN=https://covanhoctap.vercel.app
SUPABASE_URL=<project-url>
SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SECRET_KEY=<server-admin-key-do-nha-cung-cap-cap>
GEMINI_API_KEY=<key-duoc-chu-ung-dung-nhap-trong-Vercel>
GEMINI_PRIMARY_MODEL=<model-id-da-discover-va-smoke-test>
GEMINI_FALLBACK_MODELS=<danh-sach-da-kiem-tra-phan-cach-boi-dau-phay>
AI_REQUEST_TIMEOUT_MS=90000
AI_MAX_OUTPUT_TOKENS=<gioi-han-da-thu-cho-model>
AI_DAILY_REQUEST_LIMIT_PER_USER=<han-muc-chu-app-chon>
AI_GLOBAL_DAILY_TOKEN_LIMIT=<ngan-sach-chu-app-chon>
UPLOAD_MAX_BYTES=10485760
UPLOAD_MAX_PDF_PAGES=20
```

Các giới hạn tệp/thời gian trên là mặc định sản phẩm đề xuất, không phải khẳng định hạn mức của provider. Điều chỉnh theo tài khoản/model/plan Vercel thực tế. Đồng bộ timeout ứng dụng ngắn hơn maxDuration Function, chừa thời gian lưu lỗi và trả response.

Google client ID/secret của OAuth cấu hình ở provider Auth; không đưa Google client secret xuống client. Vercel dùng Development/Preview/Production riêng; Preview dùng DB/key kiểm thử riêng. Không đặt Gemini key, admin secret trong biến có tiền tố `VITE_`; không commit `.env`, không chụp/log key.

Với code cũ từng lưu key trong browser: xóa cách dùng đó trong bản mới, thông báo người dùng gỡ key cũ; nếu key đã bị công khai thì chủ sở hữu thu hồi/đổi key. Không thu thập key cá nhân cũ lên server khi chưa có nhu cầu rõ ràng. Bản đích mặc định sử dụng key do chủ ứng dụng quản lý, học sinh không phải nhập key.

### 6.2 Kiểm tra key và model

Không suy đoán model hợp lệ chỉ từ tên trông có vẻ mới. Cũng không kết luận tên model cũ là “bịa” nếu chưa kiểm tra API hiện hành.

`scripts/verify-ai` phải:

1. Đọc key server, không in key hoặc Authorization header.
2. Gọi danh sách model bằng SDK/API chính thức với chính key và endpoint đang dùng; phân trang đầy đủ; ghi metadata năng lực có sẵn.
3. Đối chiếu `GEMINI_PRIMARY_MODEL`/fallback với kết quả, tài liệu và phương thức gọi của phiên bản SDK đã pin. Model xuất hiện trong danh sách chưa đồng nghĩa tài khoản có quota hoặc mọi modality đều dùng được.
4. Gửi yêu cầu tối thiểu: văn bản, JSON có schema, ảnh có chữ/toán và PDF mẫu. Kiểm tra nội dung nhận về và schema, không chỉ HTTP 200. Dùng dữ liệu kiểm thử không có thông tin học sinh.
5. Ghi báo cáo: thời điểm, môi trường, model cấu hình/model thực dùng, loại bài thử, latency, token usage nếu có, mã lỗi đã che bí mật. Không công khai danh sách model/quota chi tiết cho khách chưa đăng nhập.
6. Nếu lỗi: báo rõ BLOCKED; yêu cầu chủ app cấu hình key/quyền/billing/quota ở dịch vụ. Không tự tạo key giả, không đổi giao diện sang “AI đã kết nối”.

Giữ `generateContent` nếu bản SDK/API đã thử hỗ trợ ổn; nếu cần đổi sang API mới thì cô lập trong adapter và viết test hợp đồng. Không trộn ví dụ của các phiên bản khác nhau. Không cần đổi primitive API chỉ vì tài liệu có ví dụ mới.

### 6.3 Luồng request phía server

1. Auth → kiểm tra role/enrollment/quyền conversation/file.
2. Validate schema/độ dài; reserve quota nguyên tử; nhận idempotency key.
3. Lưu message/bài nộp trạng thái `processing`, không gán đúng/sai trước.
4. Lấy nội dung file từ Storage thuộc quyền; dựng prompt theo nhiệm vụ, lịch sử có ngân sách token, rubric và nội dung học được cung cấp.
5. Gọi provider theo deadline. Model dùng do server chọn từ allowlist, không nhận model tùy ý của client.
6. Validate JSON và ngữ nghĩa, chuẩn hóa verdict. Nếu không đủ bằng chứng → inconclusive. Không lấy `Boolean(value)` để chuyển chuỗi `"false"` thành true.
7. Ghi evaluation + usage + message + tài liệu trong transaction phù hợp; unique request ngăn tạo hai bài nộp khi retry.
8. Trả dữ liệu, model thực dùng và provenance ở mức người dùng cần biết. Nếu đã xử lý nhưng lưu lỗi, báo đúng trạng thái và cho retry idempotent.

### 6.4 Lỗi và retry

| Nhóm lỗi | Hành vi |
|---|---|
| Key không hợp lệ/thiếu quyền, 401/403 hoặc lỗi key trong payload | Không chạy vòng fallback model; báo cấu hình AI lỗi, giữ bài nộp chưa chấm |
| Model/phương thức không hỗ trợ, 404 | Thử model dự phòng đã xác minh cùng năng lực; ghi model thực dùng; không thay đổi âm thầm yêu cầu bài toán |
| 429/quota | Tôn trọng Retry-After nếu có; retry có giới hạn khi phù hợp; quota cứng thì dừng, không xoay model để né hạn mức |
| Network/5xx | Backoff có jitter trong deadline; tối đa số lần cấu hình, mặc định 2 retries; hết hạn trả trạng thái có thể thử lại |
| 400 schema/input | Sửa dữ liệu/schema; không lặp lại request sai vô hạn |
| JSON sai, thiếu trường, không có text, bị chặn hoặc cắt output | Trạng thái `invalid_response`/`inconclusive`; tối đa một bước sửa cấu trúc có ngân sách; không bịa đáp án mặc định |
| Timeout/hủy | Abort phía server/provider khi SDK hỗ trợ; không hiển thị thành công; idempotency chống yêu cầu lặp |

Rate limit phải dùng DB/Redis bền vững hoặc transaction tương đương, không dùng Map trong RAM Function. Reserve quota trước khi gọi, reconcile sau khi có usage; không tự hoàn quota cho request hủy nếu provider đã tính phí. Log requestId và lỗi đã lọc; không lưu toàn bộ bài làm vào telemetry mặc định.

### 6.5 Hợp đồng đánh giá

```ts
type Verdict = 'correct' | 'incorrect' | 'inconclusive' | 'not_applicable';
type AssessmentSource = 'answer_key' | 'symbolic_check' | 'ai' | 'teacher';
type ReviewState = 'unreviewed' | 'verified' | 'overridden';
// Runtime schema bắt buộc, không chỉ interface TypeScript.
interface Evaluation {
  submissionId: string;
  intent: 'ask_guidance' | 'submit_solution' | 'request_exercises';
  verdict: Verdict;
  source: AssessmentSource;
  reviewState: ReviewState;
  errorEvidence: Array<{category: string; excerpt: string; explanation: string}>;
  hints: string[];
  detailedSolution?: string;
  modelUsed?: string;
  promptVersion: string;
  schemaVersion: string;
}
```

`inconclusive` = đã yêu cầu chấm nhưng chưa kết luận; `not_applicable` = đang hỏi hướng dẫn, không phải bài làm để chấm. Hỏi đề không được tính là làm đúng. `source=ai` không tự đồng nghĩa `verified`. Không dùng điểm tự tin do model tự khai làm bằng chứng xác minh.

Phản hồi gợi mở cho học sinh sai; lời giải đầy đủ mở theo chế độ học hoặc yêu cầu rõ ràng. Giữ riêng câu hỏi Socratic và phần lời giải để tránh prompt tự mâu thuẫn. Kết quả AI có thể được học sinh báo lỗi và giáo viên duyệt lại.

### 6.6 Hội thoại và tiến độ

- Lưu chat, file và tài liệu gắn conversation vào DB. Reload/đổi thiết bị vẫn xem được nội dung được phép.
- Server nạp recent messages + tóm tắt cũ có nguồn tham chiếu và tài liệu đang chọn; không cho client giả message role `system`.
- Tin “giải tiếp bài trên” phải nhận đúng bài; conversation của người khác trả 403/404.
- Trạng thái UI phản ánh `uploading`, `reading_file`, `waiting_for_model`, `validating`, `saving`, `done` khi thực sự xảy ra. Không giả phần trăm hoặc dùng timer để khẳng định đã hoàn thành giai đoạn.
- Tệp và câu hỏi là dữ liệu không tin cậy; chỉ dẫn nằm trong chúng không có quyền đổi system prompt, gọi URL bất kỳ, đọc dữ liệu khác hoặc tiết lộ key.

## 7. Tiếp nhận ảnh, PDF, DOCX

### 7.1 Đường đi tệp

Browser xin signed upload URL → tải thẳng lên Storage private → báo hoàn tất → server xác minh object/size/MIME/ownership → đọc hoặc gửi provider → gắn attachmentId vào bài nộp.

Không chuyển PDF/ảnh lớn thành base64 trong request API thông thường. Vercel có giới hạn payload; giới hạn tệp sản phẩm không được đồng nhất với giới hạn body của Function. Không nhận URL tùy ý do người dùng gửi để server tải về. Signed download chỉ được cấp sau auth, hết hạn ngắn; không log URL có token.

Kiểm tra bytes/MIME thật ngoài extension, kích thước ảnh sau giải mã, số trang, tệp hỏng/có mật khẩu, zip bomb, nội dung HTML/SVG có script. Không chạy macro hoặc JavaScript từ tài liệu. Có thời hạn lưu, xóa file provider tạm khi không cần, chính sách xóa bài kèm file theo quyền.

### 7.2 PDF

- Dùng bộ đọc PDF đúng chuẩn để trích xuất text và xác định trang; nếu scan hoặc công thức/hình có ý nghĩa, gửi PDF thật cho model hỗ trợ tài liệu hoặc render trang rồi dùng vision.
- Khi dùng Files API, lưu URI provider server-side, theo dõi trạng thái xử lý và giới hạn hiện hành; không coi tên file là nội dung.
- Cho chọn trang khi vượt giới hạn; cho xem nội dung/ảnh đã nhận. OCR không rõ thì yêu cầu xác nhận công thức trước chấm.
- Không đọc được thì trả `FILE_EXTRACTION_FAILED` cùng hướng xử lý; không tiếp tục với placeholder rồi đưa lời giải có vẻ hợp lệ.

### 7.3 DOCX

- Đọc OOXML paragraph/table/relationship/image, giữ thứ tự; OMML chuyển sang cấu trúc toán/LaTeX có kiểm chứng. Không chỉ ghép `m:t`.
- Bộ chuyển phải hỗ trợ tối thiểu phân số, căn, số mũ/chỉ số, ngoặc, tích phân, tổng, vectơ, ma trận. Có fixture cho mỗi loại.
- Đối tượng MathType cũ/OLE hoặc cấu trúc chưa hỗ trợ: nhận diện, báo rõ, dùng bản render PDF qua worker chuyển đổi đã kiểm thử hoặc đề nghị người dùng cung cấp PDF. Không bỏ qua rồi báo đọc đầy đủ.
- Vercel không mặc nhiên có LibreOffice. Nếu chọn worker chuyển đổi, phải triển khai thật, kiểm tra auth, private storage, timeout, chi phí và xóa tệp; không đưa một lệnh local vào code rồi coi production đã hỗ trợ.

### 7.4 Ảnh

Giữ MIME chính xác PNG/JPEG/WebP; chuyển định dạng thật nếu cần. Sửa hướng ảnh, giới hạn độ phân giải hợp lý nhưng không làm mất ký hiệu toán. Hiển thị ảnh đã nhận; cho chụp/tải lại khi mờ. Không đưa ảnh base64 vào localStorage.

## 8. Chấm tự học và ngân hàng bài tập

### 8.1 Kiểm định toàn bộ nội dung hiện có

Lập `curriculum-review.csv/md`: id, chương/bài, đề, đáp án, lý do đúng, lỗi phát hiện, người/nguồn kiểm tra, trạng thái. Kiểm tra toàn bộ 84 câu, bao gồm từng ý đúng–sai; việc mới tìm ra một lỗi không chứng minh các câu khác đều đúng.

Sửa chắc chắn câu `10-c3-b1-mc1`: A=7 và B=√49 cùng đúng. Giữ một đáp án đúng, thay phương án nhiễu. Kiểm tra ngôn ngữ đề, đơn vị, khoảng xác định, cách làm tròn, số nghiệm, đáp án tương đương. Những đề hỏi “vượt qua ngưỡng sau bao nhiêu năm” phải làm rõ thời gian liên tục hay số năm nguyên trước khi chọn làm tròn.

24 chương/28 bài hiện tại là phạm vi nội dung đang có, không đủ bằng chứng tuyên bố bao phủ mọi bài trong SGK. Tạo ma trận chương–bài–yêu cầu cần đạt–dạng câu; ghi “chưa có nội dung” ở ô thiếu. Mở rộng dựa trên chương trình/tài liệu được phép sử dụng; không tự điền câu mẫu vô nghĩa để đạt số lượng.

### 8.2 Chấm và điểm

- Mỗi phương án có ID ổn định độc lập nhãn A/B/C/D. Xáo trộn theo attempt seed, lưu mapping và question_version trên server. Cùng attempt reload không đổi thứ tự; đối chiếu đúng option ID.
- Chấm theo answer key đã duyệt ở server; client không gửi `isCorrect` hay `score` làm nguồn sự thật. Chế độ kiểm tra không bundle đáp án xuống frontend.
- Số: chuẩn hóa Unicode, khoảng trắng, dấu thập phân; phân biệt dấu phân cách nghìn; hỗ trợ phân số bằng parser an toàn. Không dùng `eval`.
- Độ chính xác gắn câu hỏi: so sánh số với tolerance phù hợp hoặc quy tắc làm tròn cụ thể; câu đếm nguyên không dùng tolerance rộng. Phần trăm/đơn vị được chấp nhận chỉ khi schema cho phép.
- Biểu thức/tập nghiệm cần parser chuyên biệt và miền xác định; chưa hỗ trợ thì yêu cầu dạng nhập rõ hoặc gửi giáo viên, không so sánh chuỗi tùy tiện rồi kết luận sai.
- Câu đúng–sai: tách chế độ luyện từng ý và chế độ chấm theo rubric kỳ thi. Nếu quảng bá theo kỳ thi hiện hành, Codex phải kiểm tra văn bản chính thức tại thời điểm triển khai, lưu rubric version; không mặc định tổng đúng/tổng câu × 10 là điểm thi chuẩn.
- Phân biệt “điểm luyện trên các câu đã làm” và “điểm bài kiểm tra đủ câu”. Chỉ làm 1/10 câu đúng không được báo đã hoàn thành bài 10 điểm.
- Sửa `qData.correctValue || 10`: dùng schema bắt buộc, chấp nhận số 0 hợp lệ; thiếu đáp án là lỗi tạo bài, không mặc định A/10.
- Đo thời gian từ phiên thật; bỏ `durationMinutes: 10` cố định. Không để bấm lưu nhiều lần tạo lịch sử trùng.

### 8.3 Sinh bài AI

Truyền đúng khối/chương/bài/kỹ năng/mức độ/dạng/rubric. Validate số phương án, đáp án, duy nhất đáp án đúng, đơn vị và lời giải. Kiểm tra độc lập trong miền có thể kiểm chứng; bài AI chưa duyệt gắn nhãn và không tự vào ngân hàng kiểm tra chính thức. Lưu câu hỏi cùng đáp án/version để reload không mất. Một lượt yêu cầu không tạo nhiều câu trùng khi retry.

### 8.4 Thích ứng có bằng chứng

Định nghĩa quy tắc minh bạch: lỗi ở kỹ năng nào → bài bổ trợ cùng kỹ năng và độ khó phù hợp → bài kiểm tra lại tương đương → cập nhật bằng chứng. Không gọi mọi bài sinh thêm là “đánh giá thích ứng”. Khi dữ liệu quá ít, hiển thị “chưa đủ dữ liệu”. Gợi ý không mặc định bài tối ưu hóa cho mọi câu trả lời ngắn.

## 9. Hồ sơ, giao bài, tiến bộ và dashboard giáo viên

- Hoàn thiện tạo/sửa/đóng lớp, thêm/chuyển học sinh, giao nhiệm vụ, xem nhiệm vụ trên tài khoản học sinh, nộp bài, chấm, trả phản hồi và lưu lịch sử. Xóa lớp ưu tiên archive, không làm mất bài nộp vô tình.
- Tách “đã gửi tự sửa”, “đã kiểm tra lại” và “đã khắc phục”. Lưu ghi chú không thay verdict hoặc hasResolvedMistake.
- Mỗi lần khắc phục liên kết lỗi gốc và kết quả mới/giáo viên duyệt; chỉ ra tiêu chí. Không xóa cả nhóm kỹ năng vì đúng một câu, cũng không cộng gaps mãi mà không thể đóng.
- Dashboard thống kê theo khoảng thời gian, lớp và nguồn đánh giá. Không trộn demo/legacy chưa xác minh, hỏi bài, inconclusive vào mẫu số đúng/sai.
- Hiển thị số bài đủ điều kiện tính tỷ lệ; chưa có bài thì “Chưa có dữ liệu”, không báo lớp tốt và không trình bày 0% như kết luận năng lực.
- Tỷ lệ khắc phục có tử/mẫu rõ; chỉ tính lỗi đủ điều kiện và lần kiểm tra tương ứng. Hiển thị riêng AI sơ bộ và kết quả đã duyệt.
- Khuyến nghị theo quy tắc gắn đúng nhãn; nếu dùng Gemini phân tích lớp, gửi dữ liệu tổng hợp tối thiểu, gắn thời điểm và số bài làm căn cứ, không gửi tên/mật khẩu không cần thiết.
- Giáo viên sửa đánh giá phải ghi lý do; aggregates được tính lại từ nguồn đúng. Không dùng mảng client làm cơ sở duy nhất.
- CSV tài khoản chỉ xuất thông tin được phép; mật khẩu chỉ ở lần cấp/reset, không đọc lại mật khẩu cũ. Chống CSV formula injection ở tên/ghi chú bắt đầu bằng `=`, `+`, `-`, `@`.

## 10. Hợp đồng API và tính bền vững

Routes là hợp đồng logic; Codex có thể gộp handler theo giới hạn Vercel nhưng giữ kiểm tra quyền từng action.

| Route logic | Quyền / kết quả |
|---|---|
| `GET /api/session` | Phiên hiện tại đã xác minh, profile tối thiểu |
| `GET /api/auth/google/start`, callback | OAuth chính thức; kiểm tra redirect/state |
| `POST /api/auth/student-login`, logout, password-change | Rate limit, cookie session, không log password |
| `POST /api/students`, password-reset | Giáo viên sở hữu lớp; không cho học sinh gọi |
| `/api/classes`, `/api/enrollments`, `/api/assignments` | CRUD theo role/ownership, validation |
| `POST /api/uploads/authorize`, complete | Signed upload private, hậu kiểm tệp |
| `/api/conversations`, `/api/messages` | Ownership, lịch sử, schema, idempotency |
| `POST /api/ai/chat`, evaluate, exercises | Quota, model allowlist, adapter thật |
| `POST /api/attempts`, answers, submit | Server grading; submit không nhận điểm từ client |
| `/api/documents`, versions | Draft/revision; 409 khi xung đột |
| `POST /api/exports/docx` | Tài liệu có quyền, trả file thật hoặc link riêng tư |
| `GET /api/analytics/class` | Giáo viên có quyền, aggregates có nguồn và mẫu số |
| `GET /api/health` | Chỉ health tối thiểu, không lộ key/quota/tài khoản |
| `POST /api/admin/ai-diagnostics` | Quản trị được cấp riêng; rate limit; smoke test có chi phí |

Response lỗi thống nhất `{error:{code,message,retryable,requestId}}`; không trả stack trace/provider raw payload có bí mật. HTTP 401/403/404/409/413/422/429/502/503/504 đúng ý nghĩa. Lưu timestamp phía server. Mutation có idempotency hoặc optimistic concurrency phù hợp.

Tác vụ AI/PDF vượt deadline không được chạy bằng promise bỏ quên sau khi Function trả response. Ban đầu giới hạn đầu vào để xử lý trong deadline; nếu cần job dài thì bổ sung queue/worker bền vững, trạng thái DB và retry có kiểm soát, rồi kiểm thử triển khai thật.

## 11. Trình soạn thảo Toán A4 và xuất tài liệu

### 11.1 Phạm vi bắt buộc

Màn hình rộng: trái chat, phải editor; màn hình hẹp: chuyển tab thuận tiện. Giáo viên sửa trực tiếp nội dung, định dạng, bảng, công thức, hình; undo/redo, autosave, zoom, ngắt trang chủ động. Học sinh chỉ sửa bản thuộc quyền mình; sửa phiếu không làm thay đổi kết quả chấm gốc.

Tài liệu JSON có schema version, node ID ổn định: heading, paragraph, list, table, mathInline/mathBlock (LaTeX gốc), figure (asset ID và mô tả), pageBreak. Không dùng HTML tùy ý của AI làm tài liệu nguồn. Sanitize paste/import và URL ảnh; không chấp nhận script/event handler.

AI đề xuất sửa đoạn bằng node ID + document revision; hiển thị phần thay đổi, giáo viên chấp nhận hoặc hủy. Nếu tài liệu đã đổi, không ghi đè thầm lặng; merge có kiểm soát hoặc yêu cầu tạo lại đề xuất. Autosave có trạng thái lưu/lỗi và khôi phục sau reload.

### 11.2 Cổng lựa chọn bộ phân trang

Làm spike với một phiếu 1 trang, một tài liệu 10 trang, bảng dài, hình lớn, công thức cao và bảng KHBD hai cột. Đánh giá đồng thời editor, PDF, DOCX, license và chi phí.

- Nhánh mặc định không phụ thuộc dịch vụ trả phí mới: Tiptap core cho editor, lớp hiển thị khổ A4 và ngắt trang chủ động; một bản preview phân trang riêng dùng bộ bố trí trang đã kiểm thử. Preview phải thực sự chia trang. Nếu editor chỉ chảy liên tục thì ghi rõ “soạn thảo” và “xem trước phân trang”, không giả vạch trang là pagination thật.
- Nếu cần chia trang ngay lúc gõ như Word: tích hợp bộ pagination đã đánh giá tương thích, hoặc Tiptap Pages khi có giấy phép phù hợp. Pages có giới hạn khối quá cao và yêu cầu bộ bảng tương thích; không chỉ cài extension rồi coi xong.
- Codex ghi lựa chọn vào ADR. Không tự mua license; phần không phụ thuộc vẫn thực hiện. Nếu chưa đạt phân trang thật, tiêu chí A4 còn OPEN, không nghiệm thu hoàn tất.

### 11.3 In/PDF

Khổ A4 210×297 mm, lề mặc định cấu hình được, font tiếng Việt và công thức ổn định. Chỉ in tài liệu, không in navbar/chat/nút. Dùng print surface riêng theo cùng document model; không `window.print()` cả dashboard.

Chờ font và ảnh tải xong; xử lý bảng qua trang, header lặp, khối không chia được và hình quá cao. Có giới hạn để tránh vòng lặp bố trí trang. Kiểm tra 1, 2, 10 trang và nội dung sát cuối trang. Nếu có “Tải PDF” thì phải trả file PDF thật; nếu dùng trình duyệt thì ghi “In/Lưu PDF”. Không hứa DOCX và PDF có ngắt trang giống hệt trên mọi phiên bản Word.

### 11.4 DOCX thật

- Tạo gói ZIP OOXML có `[Content_Types].xml`, `word/document.xml`, relationships và media; extension `.docx`, MIME đúng. Không đổi tên HTML thành DOCX.
- Map document nodes thành paragraph/table/list/image/page break; LaTeX → AST/MathML → OMML với bộ chuyển có test và giấy phép phù hợp. Không giả định KaTeX MathML trong HTML là phương trình Word.
- Giữ công thức dưới dạng Word Equation chỉnh sửa được trong tập cú pháp hỗ trợ. Công thức ngoài tập hỗ trợ phải báo trước; không âm thầm chụp ảnh rồi vẫn ghi “mọi công thức chỉnh sửa được”.
- Không dùng nhãn “MathType” trừ khi đã kiểm chứng đúng đối tượng/khả năng tương thích cần thiết; mặc định nhãn “DOCX — công thức Word chỉnh sửa được”.
- Bảng biến thiên có cấu trúc bảng/dấu/mũi tên/giá trị xác định; không chỉ chép Markdown dấu `|`.
- Đồ thị/hình hình học dựng bằng dữ liệu và công cụ hình học/đồ thị xác định, SVG/PNG rõ; không để ảnh AI tự sinh làm bằng chứng chính xác hình học. Nếu chưa có bộ dựng đồ thị tự động thì hỗ trợ chèn hình và ghi rõ phạm vi, không tuyên bố đã tự vẽ mọi dạng.
- Kiểm tra giải nén XML, render, mở Microsoft Word và sửa ít nhất một phân số, tích phân, ma trận. Nếu không có Word trong môi trường tự động thì đánh dấu kiểm tra Word chờ thầy nghiệm thu, không giả lập đã kiểm tra.

## 12. Kế hoạch triển khai theo chặng và điểm dừng nghiệm thu

| Chặng | Công việc / tệp trọng tâm | Đầu ra và điều kiện qua |
|---|---|---|
| S0 — Baseline | Đọc AGENTS.md, git status, package/lock, Vercel linkage; kiểm kê mọi màn hình/nút; tái hiện lỗi | Baseline + danh sách lỗi + backup; không sửa bản production trực tiếp |
| S1 — Dữ liệu/Auth | SQL migrations, policies, server/auth, storageService/App, login modals | Hai thiết bị chung dữ liệu; các phép thử trái quyền bị chặn; account mới rỗng |
| S2 — AI gateway | geminiService chuyển thành API client; server AI adapter, model checks, quota/errors/history | Live smoke test chữ/JSON/ảnh/PDF; test key sai/quota/timeout; không lộ key |
| S3 — Tệp và lưu trữ | fileParser, private uploads, extractor, attachment lifecycle | PDF scan/text, DOCX math/image, PNG/JPEG chạy đúng hoặc báo giới hạn chính xác |
| S4 — Tự học và chẩn đoán | mathEvaluation, SelfStudyModule, curriculum, grading, attempts | Toàn bộ ngân hàng được thẩm định; test đáp án 0/format/tolerance; chưa xác minh không bị gán đúng/sai |
| S5 — Giáo viên và tiến bộ | TeacherDashboard, StudentProfileModal, assignments, analytics | Giao–nhận–nộp–chấm–tự sửa–kiểm tra lại khép kín; số liệu nguồn thật |
| S6 — Editor và xuất | A4DocumentViewer, wordExport, document storage, print layout | Soạn/sửa/lưu thật; DOCX thật; preview A4 và kiểm tra bảng/công thức qua trang |
| S7 — Gia cố | Component split, loading/errors/accessibility, full CI, load checks | Không còn P0/P1; không có fake production response; evidence đầy đủ |
| S8 — Preview/Production | Vercel config/env/migrations, smoke, backup/rollback | Preview đạt; triển khai đúng project khi được giao quyền; hậu kiểm domain hiện hữu |

S2 và S3 có thể chuẩn bị song song về mã sau khi hợp đồng S1 ổn; S4/S5 dùng dữ liệu thật; S6 có thể làm prototype sớm nhưng không nghiệm thu khi chưa lưu được. Codex cập nhật `PROGRESS.md` sau mỗi chặng: DONE/IN PROGRESS/BLOCKED, tests, blockers, commit, bước tiếp theo. Không ghi DONE cho một mock test khi yêu cầu là live provider.

## 13. Ma trận kiểm thử bắt buộc

| Test | Kịch bản | Kết quả mong đợi |
|---|---|---|
| T01 | Checkout sạch, `npm ci`, typecheck, build | Reproducible từ lockfile; không dùng node_modules Windows trong CI Linux |
| T02 | Giáo viên mới | 0 học sinh/0 bài thật, không có seed tự động |
| T03 | Máy A giáo viên cấp tài khoản, máy B học sinh đăng nhập | Thành công không cần chép localStorage |
| T04 | Máy B nộp bài, A xem | Cùng bản ghi máy chủ, trong ngưỡng đồng bộ đã đặt |
| T05 | Học sinh đổi studentId/classId/documentId của người khác | API/DB/Storage từ chối; không lộ dữ liệu |
| T06 | Giáo viên A truy cập lớp giáo viên B | Bị từ chối kể cả sửa request trực tiếp |
| T07 | Client sửa role/score/verdict/teacherId | Bị schema/permission chặn |
| T08 | Hết phiên/logout/reset mật khẩu | Không tiếp tục truy cập bằng dữ liệu tài khoản đã lưu |
| T09 | Scan build và Network/Storage browser | Không có Gemini key/admin secret/password plaintext |
| T10 | Key hợp lệ + model đã kiểm tra | Nội dung thật, modelUsed/usage phù hợp |
| T11 | Key sai/403/model lỗi/429/5xx/timeout | Phân loại đúng; không trả lời mẫu giả là AI thật |
| T12 | JSON hỏng/thiếu field/`isCorrect:"false"` | Không bị chấm đúng do truthiness; inconclusive hoặc lỗi schema |
| T13 | Chỉ hỏi đề; chưa có lời giải | not_applicable, không tăng điểm/gaps |
| T14 | Tin nhắn “giải tiếp bài trên” | Đúng conversation và đề trước |
| T15 | PDF text, PDF scan, ảnh PNG/JPEG | AI nhận nội dung/hình thật; MIME đúng |
| T16 | PDF hỏng/mật khẩu/quá trang, DOCX không hỗ trợ | Báo rõ; không dùng tên tệp thay nội dung |
| T17 | Upload 10 MB theo giới hạn đề xuất | Đi thẳng Storage; request Function chỉ metadata; hậu kiểm bytes |
| T18 | DOCX có phân số, căn, số mũ, bảng và hình | Không mất cấu trúc âm thầm; unknown nodes được báo |
| T19 | 84 câu hiện có, từng ý Đ/S | Bảng review đầy đủ; không trùng phương án đúng ngoài chủ ý |
| T20 | Shuffle rồi reload/submit | Mapping đúng, thứ tự ổn định theo attempt |
| T21 | Đáp án 0; 2/2.0/2,0; phân số; làm tròn; đơn vị | Theo schema từng câu; không dùng default 10/A |
| T22 | 1 câu đúng trong bài 10 câu | Không ghi hoàn thành 10/10; phân biệt điểm luyện |
| T23 | Bấm lưu/submit hai lần, mạng retry | Không trùng attempt/submission/charge nội bộ |
| T24 | Lưu tự sửa nhưng chưa được kiểm tra | Chưa xác nhận đã khắc phục |
| T25 | Dashboard rỗng/chỉ inconclusive/demo | Không khen lớp tốt; không tính sai mẫu số |
| T26 | Giáo viên sửa đánh giá AI | Lưu audit; thống kê cập nhật đúng |
| T27 | Giao bài từ A, nhận/nộp từ B, giáo viên phản hồi | Luồng đầy đủ trên DB |
| T28 | Chat/bài AI/tài liệu reload, đổi thiết bị | Khôi phục đúng nội dung theo quyền |
| T29 | Hai tab sửa cùng tài liệu | Phát hiện revision conflict, không ghi đè im lặng |
| T30 | Editor sửa chữ/công thức/bảng/hình, undo, AI sửa đoạn | Nội dung đúng và lưu; không sửa nhầm đoạn khác |
| T31 | Preview/in 1–10 trang, bảng dài, ảnh cao | Không mất/cắt nội dung, không in UI; không vòng lặp |
| T32 | DOCX giải nén và mở Word | OOXML/OMML thật, không còn Markdown bảng, sửa được công thức đã hỗ trợ |
| T33 | Import JSON cũ trùng ID/trái owner/demo | Preview, mapping, chặn trái quyền, import lặp không nhân đôi |
| T34 | DB mất kết nối hoặc quota lưu hết | Báo lưu thất bại, giữ bản nháp phù hợp, không báo thành công |
| T35 | Tải trang trực tiếp/deep link/API trên Preview | Routing đúng, API không bị rewrite thành index.html |
| T36 | Mobile 360px/desktop, bàn phím/nhãn input | Không che nút gửi/lưu; công thức cuộn được, thao tác được |
| T37 | Lớp thử 40 học sinh / yêu cầu đồng thời có kiểm soát | Không thất lạc bài; quota đúng; ghi latency/error, không mặc định cần gọi AI thật 40 lần |
| T38 | Prompt injection trong tệp; XSS/CSV injection | Không đổi quyền, không chạy script, không lộ bí mật |
| T39 | URL file của người khác/hết hạn/xóa bài | Không còn quyền truy cập; cleanup đúng |
| T40 | Hậu kiểm domain production sau deploy | Đăng nhập, bài nộp, AI, export còn chạy; có rollback thử nghiệm |

Unit/integration mock dùng kiểm tra lỗi và logic; live smoke dùng xác minh kết nối thực. Báo cáo ghi rõ loại test. Dùng dữ liệu kiểm thử tổng hợp, không phát tán thông tin học sinh.

Bộ toán mẫu tối thiểu cần lời giải tham chiếu do giáo viên thẩm định: căn có nghiệm ngoại lai, đạo hàm phân thức sai dấu, bài đúng, bài thiếu đề/thiếu bước, bài hình cần hình, xác suất thiếu giả thiết, số thập phân/phân số tương đương, bài nhiều nghiệm. Sai toán nghiêm trọng trong bộ nghiệm thu phải xử lý hoặc trả inconclusive; không chỉ giảm tiêu chuẩn để test xanh.

## 14. Build, CI và triển khai đúng Vercel project

### 14.1 Dọn môi trường và CI

- Kiểm tra và pin Node/dependencies tương thích; README hiện phải cập nhật cùng `engines`. Không tự nâng tất cả gói major.
- Không commit node_modules, dist, `.env`, file RAR hoặc toàn bộ thư mục skill_giao_duc vào bundle nếu runtime không dùng. Giữ nguồn liên quan và giấy phép cần thiết.
- Cập nhật lockfile có chủ ý; máy/CI dùng `npm ci`. Bản build đã thử trước đây sau cài dependencies theo range không thay cho kiểm thử lockfile sạch.
- Thêm scripts rõ ràng: `typecheck`, `lint`, `test:unit`, `test:integration`, `test:e2e`, `test:curriculum`, `build`, `verify:ai`. Script lint hiện chỉ tsc thì đổi tên hoặc thêm lint thật.
- Chạy build frontend không đồng nghĩa đã biên dịch/triển khai Function: kiểm tra Vercel build và gọi API trên Preview.
- Các kiểm thử cần bí mật chỉ chạy trong môi trường tin cậy; không đưa secret vào PR từ nguồn không tin cậy. CI không auto-promote production khi chưa đạt gate.

### 14.2 Thiết lập dịch vụ

Chủ ứng dụng cung cấp/thiết lập trực tiếp trong các dashboard phù hợp: quyền project Vercel hiện hữu, Supabase project và Auth/Storage, Google OAuth, Gemini key có quyền/quota. Không gửi key qua chat hoặc dán vào tài liệu này.

Codex chuẩn bị đầy đủ migrations, `.env.example`, validate scripts và hướng dẫn; phần thiếu credentials ghi BLOCKED với đúng tên biến và bước cấu hình. Không vì chưa có key mà dừng mọi phần có thể lập trình/kiểm thử độc lập; cũng không báo kết nối thật đã xong.

### 14.3 Preview

1. Xác định Vercel team/project hiện đang sở hữu `covanhoctap.vercel.app`; kiểm tra repo, branch, root directory và domain. Không tạo project mới rồi khẳng định đã cập nhật domain cũ.
2. Tạo branch triển khai, backup, baseline tag. Cài dependencies sạch và chạy CI.
3. Tạo DB/schema và Storage/Auth môi trường thử; apply migrations có version, seed chỉ test data được gắn nhãn.
4. Khai báo env Preview, origin chính xác và OAuth redirect allowlist. Không dùng wildcard rộng để chữa lỗi redirect.
5. Build Vite `dist`, triển khai Function Node; bảo đảm SPA rewrite không nuốt `/api/*` và assets.
6. Smoke login + cross-device + AI chữ/ảnh/PDF + DOCX; kiểm tra log không có bí mật. Lưu evidence, commit và deployment URL.
7. Kiểm tra hạn mức/timeout theo plan thực tế; nếu request dài vượt giới hạn, giảm input hoặc chuyển queue/worker đã triển khai, không chỉ tăng timeout client.

### 14.4 Production và rollback

1. Chỉ cập nhật production khi người dùng giao quyền triển khai và các gate bắt buộc đạt. Bản kế hoạch hiện tại dành cho Codex thực thi sau này, không tự cấp quyền thay đổi tài khoản/dịch vụ trả phí.
2. Backup DB, export local legacy cần di chuyển; migration theo expand–migrate–contract, không drop cột/dữ liệu đang dùng trong cùng lần deploy.
3. Production env riêng, OAuth callback đúng domain, bucket private/policies đã thử. Redeploy sau khi thay env theo cơ chế Vercel.
4. Promote đúng deployment đã thử, kiểm tra trực tiếp `https://covanhoctap.vercel.app` và API trên domain này.
5. Nếu lỗi auth, mất dữ liệu, lộ quyền hoặc chấm sai nghiêm trọng: tắt chức năng liên quan bằng feature flag server, rollback deployment về bản tốt đã xác định. Rollback frontend không tự rollback DB; giữ migration tương thích, chỉ rollback DB theo runbook và backup đã thử.
6. Theo dõi error rate/latency/usage/quota trong giai đoạn đầu, không log bài làm đầy đủ. Có nút báo lỗi và requestId để tra cứu.

## 15. Hồ sơ bàn giao Codex phải tạo

1. Mã nguồn hoàn chỉnh và lockfile; không chứa secrets.
2. SQL migrations + policies + test phân quyền; hướng dẫn Auth/Storage.
3. `.env.example`, `SETUP_REQUIRED.md`: biến nào cần ở đâu, public/server-only, cách kiểm tra; không có giá trị thật.
4. `ACCEPTANCE.md`: T01–T40, PASS/FAIL/BLOCKED, bằng chứng, ngày thử, môi trường; phân biệt local/mock/live/production.
5. `CURRICULUM_REVIEW.md` hoặc CSV cho từng câu/ý, lỗi sửa và phạm vi còn thiếu.
6. `DEPLOYMENT.md`, `ROLLBACK.md`, backup/migration/import runbook.
7. `PROGRESS.md`: trạng thái từng F/S, commit, việc còn lại.
8. Hướng dẫn giáo viên/học sinh: đăng nhập, giao/nộp bài, đọc nhãn AI/chưa xác minh, tự sửa, soạn/in/xuất Word, khôi phục tài khoản.
9. Báo cáo cuối: đã sửa gì, kiểm thử gì, live API kết quả ra sao, URL/commit/deployment, chi phí/hạn mức được cấu hình, giới hạn còn lại. Không dùng kết luận “hoàn toàn chạy ổn” nếu còn gate quan trọng chưa kiểm tra.

## 16. Prompt giao việc — sao chép cho Codex

```text
Bạn là kỹ sư phụ trách hoàn thiện app Cố vấn học tập Toán THPT của tôi.
Hãy đọc toàn bộ KE_HOACH_HOAN_THIEN_COVANHOCTAP_CODEX.md và AGENTS.md của repo,
đối chiếu với mã nguồn hiện tại, rồi thực hiện lần lượt các chặng S0–S8.
Thư mục dự kiến: E:\Ma nguon app\New folder\math-diagnostic-ai (1).
Đích cuối cùng là Vercel project đang sở hữu https://covanhoctap.vercel.app.

Giữ React/Vite hiện có và giao diện tiếng Việt. Sửa thật ở dữ liệu, backend,
xác thực, phân quyền, Gemini API, nội dung Toán, A4 và xuất DOCX; không chỉ sửa nhãn.
Không dùng dữ liệu mẫu/response mock/fallback viết sẵn để giả chức năng đã hoạt động.
Không gán đúng/sai hay đã khắc phục khi chưa có bằng chứng.

Trước tiên lập baseline và checklist F01–F21, T01–T40; tạo branch và backup,
giữ nguyên thay đổi chưa commit của tôi. Tìm bản triển khai hiện tại trước khi
chọn Vercel project. Dùng migrations có version, dữ liệu chung nhiều thiết bị,
Gemini key server-only và model được discovery + live smoke test.
Không đưa key vào VITE_*, localStorage, code, log, tài liệu hoặc báo cáo.

Chủ động hoàn thành những phần đã có đủ điều kiện; chỉ hỏi khi thiếu thông tin
không thể suy ra hoặc cần quyền/chi phí mới. Nếu thiếu dịch vụ hoặc biến môi trường,
ghi chính xác vào SETUP_REQUIRED.md và tiếp tục phần độc lập. Không tạo bí mật giả.
Không tự mua dịch vụ, không xóa dữ liệu thật. Chuẩn bị Preview và bằng chứng nghiệm thu
trước khi đề nghị tôi cho cập nhật production nếu chưa có chỉ thị triển khai riêng.

Sau từng chặng cập nhật PROGRESS.md và commit phù hợp. Chạy typecheck, lint,
unit/integration/E2E, kiểm tra quyền DB, nội dung Toán và file Word/PDF.
Tách kết quả mock test với live API test. Dùng tài khoản kiểm thử độc lập để chứng minh
máy giáo viên và máy học sinh dùng chung dữ liệu, không chép localStorage.

Chỉ kết luận hoàn thành khi các gate bắt buộc đạt. Báo cáo cuối phải có commit,
test evidence, URL Preview/Production nếu đã được phép triển khai, model thực dùng,
trạng thái API và mọi giới hạn còn lại. Nếu bị chặn, ghi BLOCKED và bước xử lý cụ thể,
không thay bằng giao diện giả hoặc tuyên bố build thành công là đã chạy đúng.
```

## 17. Nguồn kỹ thuật và cách sử dụng

Các nguồn được kiểm tra ngày 27/10/2026. Đây là tài liệu thiết kế đề xuất kết hợp bằng chứng mã nguồn; không phải mọi cấu hình bên dưới đã được chạy trên tài khoản của thầy. Codex kiểm tra lại phiên bản SDK, model và hạn mức tại thời điểm thực thi.

- Google Gemini — API keys: https://ai.google.dev/gemini-api/docs/api-key — key phải được bảo vệ; dùng backend cho lời gọi từ ứng dụng client.
- Google Gemini — Models API: https://ai.google.dev/api/models — lấy danh sách/metadata model thay vì đoán tên; cần smoke test quyền và năng lực thực tế.
- Google Gemini — Structured outputs: https://ai.google.dev/gemini-api/docs/structured-output — output có schema vẫn cần kiểm tra giá trị/ngữ nghĩa trong ứng dụng.
- Google Gemini — Document understanding: https://ai.google.dev/gemini-api/docs/document-processing — PDF có thể được xử lý với nội dung hình/biểu đồ, không chỉ tên tệp.
- Supabase Auth: https://supabase.com/docs/guides/auth — nền tảng Auth và liên kết phân quyền dữ liệu.
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security — RLS theo người dùng; khóa đặc quyền có thể bỏ qua RLS.
- Supabase server-side Auth: https://supabase.com/docs/guides/auth/server-side — tham khảo session/cookie/PKCE; triển khai BFF phải kiểm tra refresh cookie tương thích.
- Vercel Vite: https://vercel.com/docs/frameworks/frontend/vite — triển khai frontend và API.
- Vercel environment variables: https://vercel.com/docs/environment-variables — phân tách cấu hình theo môi trường.
- Vercel Function limits: https://vercel.com/docs/functions/limitations — tài liệu hiện nêu giới hạn request/response payload 4.5 MB; duration phụ thuộc cấu hình/gói, cần đối chiếu project thật.
- Tiptap Pages limitations: https://tiptap.dev/docs/pages/core-concepts/limitations — giới hạn khối quá cao, bảng và in; phải làm spike trước khi chọn.
- Tiptap DOCX export: https://tiptap.dev/docs/conversion/export/docx/editor-extension — đánh giá xuất DOCX và cấu hình trang, không suy ra ngắt trang màn hình sẽ giống Word.
- Thư viện docx: https://docx.js.org/ — một lựa chọn sinh OOXML; vẫn cần tự kiểm chứng chuyển công thức và bố cục.

Không sao chép mã nguồn hoặc nhúng trái phép soandethi.com. Mục tiêu là xây dựng trải nghiệm soạn A4 tương tự về chức năng trên nền tảng của thầy, với dữ liệu và khả năng kiểm soát riêng.
