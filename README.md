# 🚀 GitHub Trending Hub & AI Digest Bot

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.10-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/HeroUI-3.2.1-purple?style=for-the-badge" alt="HeroUI" />
  <img src="https://img.shields.io/badge/Gemini_2.5_Flash-AI-4285F4?style=for-the-badge&logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Telegram_Bot-node--telegram--bot--api-blue?style=for-the-badge&logo=telegram" alt="Telegram Bot" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
</p>

> **GitHub Trending Hub & AI Digest Bot** là nền tảng web hiện đại kết hợp với Telegram Bot thông minh. Hệ thống tự động cào dữ liệu xu hướng từ GitHub Trending, đọc file **README.md** của dự án và sử dụng **Google Gemini 2.5 Flash** để phân tích, tóm tắt 3 ý Tiếng Việt chuyên sâu, hỗ trợ so sánh đối đầu 2 dự án và gửi bản tin tự động qua Telegram.

---

## ✨ Tính Năng Nổi Bật

### 🎨 1. Giao Diện Web Đỉnh Cao (HeroUI & Dark Glassmorphism)

- Giao diện UI/UX thiết kế theo phong cách Dark Mode cao cấp với hiệu ứng Glassmorphism & Micro-animations.
- Hiển thị danh sách Repositories & Developers xu hướng theo thời gian (**Hôm nay, Tần này, Tháng này**).
- Lọc theo từng ngôn ngữ lập trình phổ biến (JavaScript, TypeScript, Python, Rust, Go, C++, ...).
- Tính năng **Bookmarks** lưu các dự án yêu thích trực tiếp vào LocalStorage.

### 🤖 2. Phân Tích Chuyên Sâu Gemini 2.5 Flash

- Tự động cào file `README.md` từ GitHub.
- Gemini 2.5 Flash xuất ra tóm tắt JSON 3 phần Tiếng Việt:
  1. 🎯 **Mục đích cốt lõi** dự án giải quyết.
  2. 🚀 **Điểm nổi bật kỹ thuật** & kiến trúc.
  3. 💡 **Đối tượng / Trường hợp ứng dụng** phù hợp.

### ⚔️ 3. So Sánh 2 Repositories Bằng AI (AI Repo Comparison)

- Chọn 2 dự án bất kỳ trên Web UI và bấm **"So sánh với AI"**.
- Gemini 2.5 Flash đọc đồng thời 2 README.md và xuất ra bảng so sánh 4 khía cạnh: _Kiến trúc, Hiệu năng, Độ dễ sử dụng, và Kết luận khuyên dùng_.

### 🔍 4. Tìm Kiếm Thông Minh Theo Ý Định (AI Semantic Search)

- Chuyển đổi giữa chế độ tìm từ khóa chuẩn và **✨ AI Search**.
- Gõ câu hỏi tiếng Việt tự nhiên (VD: _"các dự án AI assistant tự host bằng Python"_ hoặc _"thư viện UI đẹp cho React"_), Gemini AI sẽ tự động phân tích ý định và xếp hạng các Repo phù hợp nhất.

### 📥 5. Xuất Báo Cáo (Export Markdown & PDF)

- Tải bản tin tổng hợp dự án dạng file **Markdown (`.md`)** với 1 cú click.
- Hỗ trợ xem và in báo cáo chuẩn định dạng **PDF**.

### 🔔 6. Telegram Bot Theo Chủ Đề (Topic Subscriptions)

- Tích hợp thư viện chuẩn `node-telegram-bot-api` chạy tự động qua `src/instrumentation.ts` của Next.js.
- Đăng ký nhận bản tin theo ngôn ngữ riêng: `/subscribe python`, `/subscribe rust`, `/topics`, `/trending`.
- Lưu trữ dữ liệu Chat ID & Preferences trên **MongoDB Atlas**.

### 🛡️ 7. Chuẩn Chất Lượng Code & CI/CD

- **Linting & Formatting:** ESLint + Prettier (`pnpm format`, `pnpm lint`).
- **Git Hooks:** Husky + lint-staged tự động kiểm tra code trước mỗi lượt `git commit`.
- **Automated CI:** GitHub Actions workflow (`.github/workflows/ci.yml`) tự động lint & build sản phẩm.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Thành phần       | Công nghệ                                                  |
| :--------------- | :--------------------------------------------------------- |
| **Framework**    | Next.js 16.2 (App Router & Turbopack)                      |
| **UI Library**   | HeroUI (v3), TailwindCSS (v4), Framer Motion, Lucide Icons |
| **AI Engine**    | Google Gemini 2.5 Flash (`@google/genai`)                  |
| **Telegram Bot** | `node-telegram-bot-api`                                    |
| **Database**     | MongoDB Atlas (với Mongoose ODM)                           |
| **Scraper**      | Cheerio & Axios                                            |
| **Code Quality** | ESLint, Prettier, Husky, lint-staged, GitHub Actions       |

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dưới Local

### 1. Requirements

- Node.js `>= 20.0.0`
- Package Manager: `pnpm` (`npm i -g pnpm`)

### 2. Clone Repository & Install

```bash
git clone https://github.com/knguyen1411b/github-trending.git
cd github-trending
pnpm install
```

### 3. Cấu hình File `.env.local`

Tạo file `.env.local` tại thư mục gốc với nội dung:

```env
# MongoDB Connection String (Atlas hoặc Local)
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/github-trending?retryWrites=true&w=majority"

# Google Gemini API Key (Lấy miễn phí tại https://aistudio.google.com/)
GEMINI_API_KEY="your_gemini_api_key_here"

# Telegram Bot Token (Lấy từ @BotFather trên Telegram)
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"

# Vercel Cron Secret (Bảo mật /api/cron/telegram)
CRON_SECRET="your_cron_secret_key_here"
```

### 4. Chạy Máy Chủ Development

```bash
pnpm dev
```

👉 Mở trình duyệt tại **`http://localhost:3000`**.  
_Lưu ý: Tiến trình Next.js sẽ tự động khởi chạy cả Web App và Telegram Bot listener song song!_

---

## 📲 Danh Sách Lệnh Telegram Bot (@my_gh_trending_ai_bot)

| Câu lệnh                  | Mô tả                                                                                  |
| :------------------------ | :------------------------------------------------------------------------------------- |
| `/start`                  | Đăng ký tài khoản Telegram với MongoDB Atlas & nhận thông điệp chào mừng               |
| `/subscribe <ngôn ngữ>`   | Đăng ký theo dõi chủ đề/ngôn ngữ riêng (Ví dụ: `/subscribe python`, `/subscribe rust`) |
| `/topics`                 | Hòm thư xem danh sách các chủ đề/ngôn ngữ bạn đang đăng ký                             |
| `/trending [ngôn ngữ]`    | Lấy ngay Top 3 Repositories hot nhất trong ngày kèm tóm tắt AI Gemini                  |
| `/unsubscribe [ngôn ngữ]` | Bỏ đăng ký 1 ngôn ngữ hoặc hủy nhận thông báo hoàn toàn                                |
| `/help`                   | Xem danh sách trợ giúp các câu lệnh                                                    |

---

## ⚙️ Scripts Hỗ Trợ

```bash
pnpm dev            # Chạy máy chủ Development (Web + Bot)
pnpm build          # Biên dịch sản phẩm cho Production
pnpm start          # Chạy máy chủ Production
pnpm lint           # Kiểm tra lỗi ESLint
pnpm format         # Tự động format toàn bộ codebase bằng Prettier
pnpm format:check   # Kiểm tra xem code đã tuân thủ Prettier chưa
```

---

## ☁️ Deploy Lên Vercel & Cấu Hình Cron

1. Push mã nguồn lên GitHub.
2. Import dự án vào **Vercel**.
3. Thêm các biến môi trường trong **Environment Variables** (`MONGODB_URI`, `GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `CRON_SECRET`).
4. Kích hoạt Cron Job hàng ngày bằng cách gọi endpoint:
   ```text
   https://your-domain.vercel.app/api/cron/telegram?secret=your_cron_secret_key_here
   ```

---

## 📝 License

Dự án được phân phối dưới giấy phép **MIT License**.
