import { useState } from "react";
import AdminLayout, { PageHeader, Card, Btn, Input, Select, Toast, tokens } from "../layouts/AdminLayout";

// ============================================================
// A03 — Quản lý Người dùng – Thêm / Sửa
// Props: mode = "create" | "edit", initialData (nếu edit)
// ============================================================

const defaultForm = { fullName: "", email: "", role: "", phone: "", status: "active", password: "", confirmPassword: "" };

function PasswordStrengthBar({ password }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
  const levels = [
    { label: "Rất yếu", color: "#DC2626" },
    { label: "Yếu", color: "#D97706" },
    { label: "Trung bình", color: "#EAB308" },
    { label: "Mạnh", color: "#16A34A" },
    { label: "Rất mạnh", color: "#15803D" },
  ];
  const lv = levels[score] || levels[0];
  if (!password) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i < score ? lv.color : tokens.border, transition: "background 0.2s" }} />
        ))}
      </div>
      <span style={{ fontSize: 12, color: lv.color, fontWeight: 500 }}>{lv.label}</span>
    </div>
  );
}

export default function UserFormPage({ onNavigate, mode = "create", initialData = null }) {
  const [form, setForm] = useState(initialData ? { ...defaultForm, ...initialData, password: "", confirmPassword: "" } : defaultForm);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Họ tên không được để trống";
    if (!form.email.trim()) e.email = "Email không được để trống";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Email không hợp lệ";
    if (!form.role) e.role = "Vui lòng chọn vai trò";
    if (mode === "create") {
      if (!form.password) e.password = "Mật khẩu không được để trống";
      else if (form.password.length < 8) e.password = "Mật khẩu phải tối thiểu 8 ký tự";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // simulate API
    setLoading(false);
    showToast(mode === "create" ? "✔ Tạo người dùng thành công" : "✔ Cập nhật thông tin thành công");
    if (mode === "create") setForm(defaultForm);
  };

  return (
    <AdminLayout
      activeKey="users-create"
      breadcrumbs={["Dashboard", "Người dùng", mode === "create" ? "Thêm người dùng" : "Chỉnh sửa"]}
      onNavigate={onNavigate}
    >
      <PageHeader
        title={mode === "create" ? "Thêm người dùng mới" : "Chỉnh sửa người dùng"}
        subtitle={mode === "create" ? "Tạo tài khoản cho Admin hoặc Giảng viên" : "Cập nhật thông tin tài khoản"}
        actions={
          <Btn variant="secondary" onClick={() => onNavigate("users-list", "/admin/users")}>
            ← Quay lại danh sách
          </Btn>
        }
      />

      <div style={{ maxWidth: 720 }}>
        {/* Basic info */}
        <Card style={{ padding: 28, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: 15, fontWeight: 600, color: tokens.textPrimary }}>Thông tin cơ bản</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Input label="Họ và tên" required value={form.fullName} onChange={set("fullName")} placeholder="Nguyễn Văn An" error={errors.fullName} style={{ gridColumn: "1 / -1" }} />
            <Input label="Email" required type="email" value={form.email} onChange={set("email")} placeholder="example@edu.vn" error={errors.email} disabled={mode === "edit"} hint={mode === "edit" ? "Email không thể thay đổi sau khi tạo" : ""} />
            <Input label="Số điện thoại" type="tel" value={form.phone} onChange={set("phone")} placeholder="0901234567" error={errors.phone} />
            <Select label="Vai trò" required value={form.role} onChange={set("role")} placeholder="-- Chọn vai trò --" error={errors.role}
              options={[{ value: "admin", label: "Admin" }, { value: "lecturer", label: "Giảng viên" }]}
            />
            <Select label="Trạng thái" value={form.status} onChange={set("status")}
              options={[{ value: "active", label: "Đang hoạt động" }, { value: "inactive", label: "Đã khóa" }]}
            />
          </div>
        </Card>

        {/* Password */}
        <Card style={{ padding: 28, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 4px 0", fontSize: 15, fontWeight: 600, color: tokens.textPrimary }}>
            {mode === "create" ? "Mật khẩu" : "Đổi mật khẩu"}
          </h3>
          {mode === "edit" && (
            <p style={{ fontSize: 13, color: tokens.textMuted, margin: "0 0 16px 0" }}>
              Để trống nếu không muốn thay đổi mật khẩu
            </p>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: mode === "create" ? 16 : 0 }}>
            <div>
              <Input
                label={mode === "create" ? "Mật khẩu" : "Mật khẩu mới"}
                required={mode === "create"}
                type="password" value={form.password} onChange={set("password")}
                placeholder="Tối thiểu 8 ký tự" error={errors.password}
              />
              <PasswordStrengthBar password={form.password} />
            </div>
            <Input
              label="Xác nhận mật khẩu"
              required={mode === "create"}
              type="password" value={form.confirmPassword} onChange={set("confirmPassword")}
              placeholder="Nhập lại mật khẩu" error={errors.confirmPassword}
            />
          </div>

          {/* Password rules */}
          <div style={{ marginTop: 16, padding: "12px 14px", background: tokens.bgSecondary, borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: tokens.textMuted, fontWeight: 500, marginBottom: 8 }}>Yêu cầu mật khẩu:</div>
            {[
              ["Tối thiểu 8 ký tự", /.{8,}/.test(form.password)],
              ["Có chữ hoa", /[A-Z]/.test(form.password)],
              ["Có số", /[0-9]/.test(form.password)],
              ["Có ký tự đặc biệt", /[^A-Za-z0-9]/.test(form.password)],
            ].map(([text, ok]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: ok && form.password ? "#16A34A" : tokens.textMuted, marginBottom: 4 }}>
                <span>{ok && form.password ? "✔" : "○"}</span> {text}
              </div>
            ))}
          </div>
        </Card>

        {/* Footer actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn variant="secondary" onClick={() => onNavigate("users-list", "/admin/users")}>Hủy</Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang lưu..." : mode === "create" ? "Tạo người dùng" : "Lưu thay đổi"}
          </Btn>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </AdminLayout>
  );
}
