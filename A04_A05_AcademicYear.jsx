import { useState, useMemo } from "react";
import AdminLayout, { PageHeader, Card, Btn, Badge, Input, SearchInput, Table, Pagination, Modal, ConfirmDialog, Toast, tokens } from "../layouts/AdminLayout";
import { mockAcademicYears, STATUS_LABELS } from "../data/mockData";

const PAGE_SIZE = 6;

// ============================================================
// A04 — Quản lý Năm học – Danh sách
// ============================================================
export function AcademicYearListPage({ onNavigate }) {
  const [years, setYears] = useState(mockAcademicYears);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 4000); };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return !q ? years : years.filter(y => y.name.includes(q) || y.code.toLowerCase().includes(q));
  }, [years, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = (data, isEdit) => {
    if (isEdit) {
      setYears(prev => prev.map(y => y.id === data.id ? { ...y, ...data } : y));
      showToast("✔ Cập nhật năm học thành công");
    } else {
      setYears(prev => [...prev, { ...data, id: Date.now(), semesterCount: 0 }]);
      showToast("✔ Thêm năm học thành công");
    }
    setEditTarget(null); setShowCreate(false);
  };

  const handleDelete = () => {
    setYears(prev => prev.filter(y => y.id !== deleteTarget.id));
    showToast(`Đã xóa năm học "${deleteTarget.name}"`, "info");
  };

  const statusColor = (s) => ({ active: "active", closed: "closed", upcoming: "upcoming" }[s] || "default");

  const columns = [
    { key: "code", label: "Mã", render: v => <span style={{ fontFamily: "monospace", fontSize: 13, color: tokens.textMuted }}>{v}</span> },
    { key: "name", label: "Năm học", render: v => <span style={{ fontWeight: 600, color: tokens.textPrimary }}>{v}</span> },
    { key: "startDate", label: "Bắt đầu", render: v => <span style={{ fontSize: 13, color: tokens.textSecondary }}>{v}</span> },
    { key: "endDate", label: "Kết thúc", render: v => <span style={{ fontSize: 13, color: tokens.textSecondary }}>{v}</span> },
    { key: "semesterCount", label: "Số học kỳ", render: v => <span style={{ fontWeight: 600, color: tokens.textPrimary }}>{v}</span> },
    { key: "status", label: "Trạng thái", render: v => <Badge label={STATUS_LABELS[v] || v} color={statusColor(v)} /> },
    { key: "actions", label: "Thao tác", width: 120, render: (_, row) => (
      <div style={{ display: "flex", gap: 6 }}>
        <Btn size="sm" variant="secondary" onClick={() => setEditTarget(row)}>Sửa</Btn>
        <Btn size="sm" variant="ghost" onClick={() => setDeleteTarget(row)} style={{ color: "#DC2626" }}>Xóa</Btn>
      </div>
    )},
  ];

  return (
    <AdminLayout activeKey="years-list" breadcrumbs={["Dashboard", "Năm học", "Danh sách"]} onNavigate={onNavigate}>
      <PageHeader
        title="Quản lý Năm học"
        subtitle={`${years.length} năm học trong hệ thống`}
        actions={<Btn variant="primary" onClick={() => setShowCreate(true)}>+ Thêm năm học</Btn>}
      />

      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${tokens.border}` }}>
          <SearchInput value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm theo tên, mã năm học..." />
        </div>
        <Table columns={columns} data={paginated} emptyMessage="Chưa có năm học nào" />
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${tokens.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: tokens.textMuted }}>{filtered.length} kết quả</span>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>

      <AcademicYearFormModal
        open={showCreate || !!editTarget}
        onClose={() => { setShowCreate(false); setEditTarget(null); }}
        onSave={handleSave}
        initialData={editTarget}
        existingYears={years}
      />

      <ConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Xóa năm học"
        message={`Bạn có chắc muốn xóa năm học "${deleteTarget?.name}"? Tất cả học kỳ thuộc năm này cũng sẽ bị xóa.`}
        confirmLabel="Xóa năm học" confirmVariant="danger"
      />
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </AdminLayout>
  );
}

// ============================================================
// A05 — Modal Form Năm học (Thêm / Sửa)
// Tách thành Modal vì form ngắn — có thể tách ra page riêng nếu cần
// ============================================================
function AcademicYearFormModal({ open, onClose, onSave, initialData, existingYears = [] }) {
  const isEdit = !!initialData;
  const [form, setForm] = useState({ code: "", name: "", startDate: "", endDate: "", status: "upcoming" });
  const [errors, setErrors] = useState({});

  // Reset khi mở
  useMemo(() => {
    if (open) {
      setForm(initialData
        ? { code: initialData.code, name: initialData.name, startDate: initialData.startDate, endDate: initialData.endDate, status: initialData.status }
        : { code: "", name: "", startDate: "", endDate: "", status: "upcoming" });
      setErrors({});
    }
  }, [open, initialData]);

  const set = f => e => setForm(prev => ({ ...prev, [f]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Tên năm học không được trống";
    else if (!/^\d{4}–\d{4}$/.test(form.name)) e.name = "Định dạng phải là YYYY–YYYY (ví dụ: 2025–2026)";
    else {
      const [y1, y2] = form.name.split("–").map(Number);
      if (y2 !== y1 + 1) e.name = "Năm kết thúc phải bằng năm bắt đầu + 1";
      const dup = existingYears.find(y => y.name === form.name && (!isEdit || y.id !== initialData?.id));
      if (dup) e.name = "Năm học này đã tồn tại";
    }
    if (!form.startDate) e.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!form.endDate) e.endDate = "Vui lòng chọn ngày kết thúc";
    if (form.startDate && form.endDate && form.endDate <= form.startDate) e.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({ ...form, id: initialData?.id }, isEdit);
  };

  return (
    <Modal
      open={open} onClose={onClose}
      title={isEdit ? "Chỉnh sửa năm học" : "Thêm năm học mới"}
      footer={<>
        <Btn variant="secondary" onClick={onClose}>Hủy</Btn>
        <Btn variant="primary" onClick={handleSave}>{isEdit ? "Lưu thay đổi" : "Tạo năm học"}</Btn>
      </>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input label="Tên năm học" required value={form.name} onChange={set("name")}
          placeholder="2025–2026" error={errors.name}
          hint='Định dạng: YYYY–YYYY, ví dụ "2025–2026" (dấu em-dash –)' />
        <Input label="Ngày bắt đầu" required type="date" value={form.startDate} onChange={set("startDate")} error={errors.startDate} />
        <Input label="Ngày kết thúc" required type="date" value={form.endDate} onChange={set("endDate")} error={errors.endDate} />
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: tokens.textSecondary, display: "block", marginBottom: 6 }}>Trạng thái</label>
          <select value={form.status} onChange={set("status")} style={{ height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid #D1D5DB", background: "#fff", fontSize: 14, fontFamily: "inherit", width: "100%" }}>
            <option value="upcoming">Sắp tới</option>
            <option value="active">Đang hoạt động</option>
            <option value="closed">Đã kết thúc</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

// Export riêng cho trường hợp dùng như page độc lập
export function AcademicYearFormPage({ onNavigate, initialData = null }) {
  return (
    <AdminLayout activeKey="years-list" breadcrumbs={["Dashboard", "Năm học", initialData ? "Chỉnh sửa" : "Thêm mới"]} onNavigate={onNavigate}>
      <div style={{ maxWidth: 560 }}>
        <PageHeader title={initialData ? "Chỉnh sửa năm học" : "Thêm năm học mới"}
          actions={<Btn variant="secondary" onClick={() => onNavigate("years-list", "/admin/academic-years")}>← Quay lại</Btn>} />
        <p style={{ color: tokens.textMuted, fontSize: 14 }}>Sử dụng modal form (A05) — xem <code>AcademicYearFormModal</code> trong component này.</p>
      </div>
    </AdminLayout>
  );
}
