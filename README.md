# MathDiagnostic AI - Hệ thống Đánh giá Thích ứng & Chẩn đoán Vùng trũng Kiến thức Toán THPT

Hệ thống sư phạm chẩn đoán năng lực Toán THPT theo chuẩn Chương trình Giáo dục Phổ thông 2018 (GDPT 2018), áp dụng phương pháp gợi mở Socratic và tích hợp Google Gemini AI.

---

## 🚀 Hướng dẫn Cài đặt & Chạy trên máy cá nhân

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản 18, 20 hoặc 22 trở lên.
- **npm** (đi kèm Node.js) hoặc **bun** / **pnpm** / **yarn**.

### 2. Cài đặt các thư viện phụ thuộc
Mở terminal tại thư mục chứa source code và chạy:
```bash
npm install
```

### 3. Khởi chạy máy chủ phát triển (Development Server)
```bash
npm run dev
```
Trình duyệt sẽ tự động mở hoặc bạn có thể truy cập vào:
`http://localhost:3000` hoặc `http://localhost:5173` theo hiển thị trên terminal.

### 4. Cấu hình Google Gemini API Key (Tùy chọn)
- Nếu có API Key từ Google AI Studio, bạn có thể nhập trực tiếp qua nút **"Cấu hình AI"** trên thanh Navbar của ứng dụng (lưu an toàn trên trình duyệt qua `localStorage`).
- Hoặc tạo file `.env` từ `.env.example`:
  ```bash
  cp .env.example .env
  ```
  Sau đó điền key:
  ```env
  GEMINI_API_KEY="AIzaSy..."
  ```
- *Lưu ý*: Nếu chưa có API Key, hệ thống vẫn hoạt động đầy đủ 100% nhờ bộ động cơ sư phạm Fallback Heuristic tích hợp sẵn.

---

## 📁 Cấu trúc thư mục

```
├── index.html                 # HTML Entry point
├── package.json               # Danh sách thư viện và scripts
├── tsconfig.json              # Cấu hình TypeScript
├── vite.config.ts             # Cấu hình Vite & Tailwind CSS
├── src/
│   ├── main.tsx               # Khởi tạo React App
│   ├── App.tsx                # Quản lý State toàn cục & Điều hướng vai trò
│   ├── index.css              # Tailwind CSS & Font chữ tiếng Việt & Style in ấn A4
│   ├── types/
│   │   └── index.ts           # Toàn bộ TypeScript interfaces & Schema
│   ├── data/
│   │   └── mockData.ts        # Dữ liệu khởi tạo & 3 bài toán mẫu Demo
│   ├── services/
│   │   └── geminiService.ts   # Tích hợp Google Gemini 2.5 Flash & Fallback Engine
│   ├── utils/
│   │   ├── mathEvaluation.ts  # Bộ quy tắc thẩm định toán học sư phạm
│   │   └── mathEvaluation.test.ts # Unit tests kiểm thử logic
│   └── components/
│       ├── Navbar.tsx         # Thanh điều hướng & Chuyển đổi Học sinh / Giáo viên
│       ├── StudentWorkspace.tsx # Không gian làm bài của học sinh
│       ├── TeacherDashboard.tsx # Bảng quản trị & Bản đồ nhiệt lỗi sai của giáo viên
│       ├── A4DiagnosticSheet.tsx # Khung hiển thị Tờ phiếu A4 chuẩn sư phạm (In/PDF)
│       └── MathRenderer.tsx   # Hiển thị công thức Toán học KaTeX/LaTeX
```

---

## ✨ Tính năng nổi bật
1. **Phân quyền Học sinh (Student Workspace)**:
   - Nhập đề bài & lời giải hoặc đính kèm ảnh chữ viết tay.
   - Nhận phản hồi trên mô phỏng "Tờ giấy A4 chuẩn sư phạm" ($210 \times 297\text{ mm}$), có nút in Print A4.
   - Không cho đáp số sẵn khi làm sai mà đưa ra câu hỏi gợi mở Socratic để học sinh tự sửa.
   - Tự động sinh 2 bài tập tương đồng (khi cần củng cố) hoặc 2 bài tập nâng cao (khi làm đúng).
   - Bảo mật tuyệt đối kết quả cá nhân, không hiển thị thống kê lớp ở màn hình học sinh.
2. **Phân quyền Giáo viên (Teacher Management Dashboard)**:
   - Theo dõi nhiều lớp học với các chỉ số KPI: Tỷ lệ làm đúng, Tỷ lệ tự sửa lỗi.
   - **Bản đồ nhiệt vùng trũng kiến thức (Error Heatmap)**: Phân bổ trực quan các nhóm lỗi sai phổ biến.
   - **Khuyến nghị Sư phạm tự động từ AI**: Đề xuất kế hoạch can thiệp cho tiết dạy sắp tới.
   - Sổ theo dõi chi tiết bài nộp của học sinh kèm chức năng xem lại tờ phiếu A4.
