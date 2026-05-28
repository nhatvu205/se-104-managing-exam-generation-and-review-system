# Hệ thống ra đề và chấm thi

**Webapp:** https://se-104-managing-exam-generation-and.vercel.app/

## 1) Mục tiêu hệ thống
Webapp hỗ trợ quản lý vòng đời ra đề và chấm thi với 2 vai trò chính:
- **Admin**: quản trị người dùng, môn học, lớp học, học kỳ/năm học, tham số hệ thống.
- **Lecturer (Giảng viên)**: tạo câu hỏi, quản lý đề thi, tra cứu đề, chấm thi, theo dõi phúc khảo và báo cáo.

---

## 2) Tóm tắt architecture

### Frontend
- **Stack:** React 18 + Vite + TypeScript + React Router v6.
- **Styling:** CSS design system tập trung tại `src/styles/design-system.css`.
- **Routing/Auth guard:** `src/App.tsx` kiểm tra session + role trước khi vào route.

### Backend/Data
- **BaaS:** Supabase (Postgres + Auth + RLS + Edge Functions).
- **Client:** `src/lib/supabaseClient.ts`.
- **Data access layer:** `src/lib/supabaseData.ts` (map schema, query, save/update).
- **Edge Function dùng cho tạo user auth:** `admin-create-user`.

### Tổ chức source chính
- `src/pages/admin/*` → màn hình admin
- `src/pages/lecturer/*` → màn hình giảng viên
- `src/pages/shared/*` → login/register/change-password/error
- `src/components/*`, `src/layouts/*` → layout/UI dùng chung

---

## 3) Luồng sử dụng chính

### Admin
1. Đăng nhập
2. Quản lý user (tạo/sửa/xóa)
3. Quản lý năm học, học kỳ, môn học, lớp học
4. Cấu hình quy định hệ thống và xem báo cáo

### Lecturer
1. Đăng nhập
2. Tạo câu hỏi / xem ngân hàng câu hỏi
3. Tạo đề thi / quản lý đề thi / xem trước & export
4. Tra cứu đề thi
5. Chấm thi chi tiết, theo dõi tổng hợp điểm, xử lý phúc khảo, xem báo cáo năm

---

## 4) Setup local

```bash
npm install
cp .env.example .env
npm run dev
```

### Environment variables
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 5) Routes chính
- `/shared/login` (entry đăng nhập)
- `/admin/*`
- `/lecturer/*`
- `/shared/register`, `/shared/change-password`, `/shared/error`

---

## 6) Triển khai & vận hành

### Build
```bash
npm run build
npm run preview
```

### Vercel
- Dùng `vercel.json` để rewrite SPA route.
- Set env trên Vercel giống local (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

### Supabase Edge Function (để Admin tạo user đăng nhập được)
```bash
supabase functions deploy admin-create-user
supabase secrets set SUPABASE_URL=...
supabase secrets set SUPABASE_ANON_KEY=...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 7) Ghi chú vận hành
- App đang thiết kế theo mô hình **role-based**: chỉ cho phép truy cập route đúng vai trò.
- Nếu gặp lỗi insert/update do RLS, cần kiểm tra policy các bảng liên quan trên Supabase.
- Khuyến nghị luôn có ít nhất 1 tài khoản admin để quản trị vòng đời user.
