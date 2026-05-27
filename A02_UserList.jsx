import { useState, useMemo } from "react";
import AdminLayout, { PageHeader, Card, Btn, Badge, SearchInput, Table, Pagination, ConfirmDialog, Toast, tokens } from "../layouts/AdminLayout";
import { mockUsers, ROLE_LABELS, STATUS_LABELS } from "../data/mockData";

const PAGE_SIZE = 6;

export default function UserListPage({ onNavigate }) {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = !roleFilter || u.role === roleFilter;
      const matchStatus = !statusFilter || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = () => {
    setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
    showToast(`Đã xóa người dùng "${deleteTarget.fullName}"`, "success");
  };

  const handleToggleStatus = (user) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u));
    showToast(`Đã ${user.status === "active" ? "khóa" : "mở khóa"} tài khoản "${user.fullName}"`, "info");
  };

  const columns = [
    { key: "fullName", label: "Họ và tên", render: (v, row) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: row.role === "admin" ? "#EDE9FE" : tokens.accentSoft,
          color: row.role === "admin" ? "#7C3AED" : tokens.accentPrimary,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700,
        }}>{v.charAt(0)}</div>
        <div>
          <div style={{ fontWeight: 500, color: tokens.textPrimary, fontSize: 14 }}>{v}</div>
          <div style={{ fontSize: 12, color: tokens.textMuted }}>{row.email}</div>
        </div>
      </div>
    )},
    { key: "phone", label: "Số điện thoại", render: v => <span style={{ fontSize: 13, color: tokens.textSecondary }}>{v}</span> },
    { key: "role", label: "Vai trò", render: v => <Badge label={ROLE_LABELS[v] || v} color={v} /> },
    { key: "status", label: "Trạng thái", render: v => <Badge label={STATUS_LABELS[v] || v} color={v} /> },
    { key: "createdAt", label: "Ngày tạo", render: v => <span style={{ fontSize: 13, color: tokens.textMuted }}>{v}</span> },
    { key: "actions", label: "Thao tác", width: 140, render: (_, row) => (
      <div style={{ display: "flex", gap: 6 }}>
        <Btn size="sm" variant="secondary" onClick={() => onNavigate("users-create", `/admin/users/${row.id}/edit`)}>Sửa</Btn>
        <Btn size="sm" variant="ghost" onClick={() => handleToggleStatus(row)}
          style={{ color: row.status === "active" ? "#DC2626" : "#16A34A" }}>
          {row.status === "active" ? "Khóa" : "Mở"}
        </Btn>
        <Btn size="sm" variant="ghost" onClick={() => setDeleteTarget(row)} style={{ color: "#DC2626" }}>Xóa</Btn>
      </div>
    )},
  ];

  return (
    <AdminLayout activeKey="users-list" breadcrumbs={["Dashboard", "Người dùng", "Danh sách"]} onNavigate={onNavigate}>
      <PageHeader
        title="Quản lý Người dùng"
        subtitle={`${filtered.length} người dùng trong hệ thống`}
        actions={
          <Btn variant="primary" onClick={() => onNavigate("users-create", "/admin/users/create")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Thêm người dùng
          </Btn>
        }
      />

      <Card>
        {/* Filters */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${tokens.border}`, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <SearchInput value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm theo tên, email..." />

          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} style={filterSelectStyle}>
            <option value="">Tất cả vai trò</option>
            <option value="admin">Admin</option>
            <option value="lecturer">Giảng viên</option>
          </select>

          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={filterSelectStyle}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã khóa</option>
          </select>

          {(search || roleFilter || statusFilter) && (
            <Btn variant="ghost" size="sm" onClick={() => { setSearch(""); setRoleFilter(""); setStatusFilter(""); setPage(1); }}>
              Xóa bộ lọc
            </Btn>
          )}
        </div>

        {/* Table */}
        <Table columns={columns} data={paginated} emptyMessage="Không tìm thấy người dùng nào" />

        {/* Pagination */}
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${tokens.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: tokens.textMuted }}>
            Hiển thị {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} kết quả
          </span>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa người dùng"
        message={`Bạn có chắc muốn xóa người dùng "${deleteTarget?.fullName}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa người dùng"
        confirmVariant="danger"
      />

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </AdminLayout>
  );
}

const filterSelectStyle = {
  height: 38, padding: "0 30px 0 10px", borderRadius: 8,
  border: "1px solid #D1D5DB", background: "#fff",
  fontSize: 13, cursor: "pointer", fontFamily: "inherit",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
};
