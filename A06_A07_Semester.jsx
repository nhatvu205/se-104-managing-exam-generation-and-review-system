import { useState, useMemo } from "react";
import AdminLayout, { PageHeader, Card, Btn, Badge, Input, Select, SearchInput, Table, Pagination, Modal, ConfirmDialog, Toast, tokens } from "../layouts/AdminLayout";
import { mockSemesters, mockAcademicYears, STATUS_LABELS } from "../data/mockData";

const PAGE_SIZE = 6;

// ============================================================
// A06 — Quản lý Học kỳ – Danh sách
// ============================================================
export function SemesterListPage({ onNavigate }) {
  const [semesters, setSemesters] = useState(mockSemesters);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 4000); };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return semesters.filter(s => {
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
      const matchYear = !yearFilter || s.academicYearId === Number(yearFilter);
      return matchSearch && matchYear;
    });
  }, [semesters, search, yearFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = (data, isEdit) => {
    if (isEdit) {
      setSemesters(prev => prev.map(s => s.id === data.id ? { ...s, ...data } : s));
      showToast("✔ Cập nhật học kỳ thành công");
    } else {
      const year = mockAcademicYears.find(y => y.id === Number(data.academicYearId));
      setSemesters(prev => [...prev, { ...data, id: Date.now(), classCount: 0, examCount: 0, academicYearName: year?.name || "" }]);
      showToast("✔ Thêm học kỳ thành công");
    }
    setEditTarget(null); setShowCreate(false);
  };

  const handleDelete = () => {
    setSemesters(prev => prev.filter(s => s.id !== deleteTarget.id));
    showToast(`Đã xóa học kỳ "${deleteTarget.name}"`, "info");
  };

  // Tổng lớp + đề của năm đang lọc
  const summaryStats = useMemo(() => ({
    total: filtered.length,
    totalClasses: filtered.reduce((s, x) => s + x.classCount, 0),
    totalExams: filtered.reduce((s, x) => s + x.examCount, 0),
  }), [filtered]);

  const columns = [
    { key: "code", label: "Mã HK", render: v => <span style={{ fontFamily: "monospace", fontSize: 12, color: tokens.textMuted }}>{v}</span> },
    { key: "name", label: "Học kỳ", render: v => <span style={{ fontWeight: 600, color: tokens.textPrimary }}>{v}</span> },
    { key: "academicYearName", label: "Năm học", render: v => <span style={{ fontSize: 13, color: tokens.textSecondary }}>{v}</span> },
    { key: "startDate", label: "Bắt đầu", render: v => <span style={{ fontSize: 13 }}>{v}</span> },
    { key: "endDate", label: "Kết thúc", render: v => <span style={{ fontSize: 13 }}>{v}</span> },
    { key: "classCount", label: "Số lớp", render: v => <span style={{ fontWeight: 600 }}>{v}</span> },
    { key: "examCount", label: "Số đề thi", render: v => <span style={{ fontWeight: 600 }}>{v}</span> },
    { key: "status", label: "Trạng thái", render: v => <Badge label={STATUS_LABELS[v] || v} color={v} /> },
    { key: "actions", label: "", width: 110, render: (_, row) => (
      <div style={{ display: "flex", gap: 6 }}>
        <Btn size="sm" variant="secondary" onClick={() => setEditTarget(row)}>Sửa</Btn>
        <Btn size="sm" variant="ghost" onClick={() => setDeleteTarget(row)} style={{ color: "#DC2626" }}>Xóa</Btn>
      </div>
    )},
  ];

  return (
    <AdminLayout activeKey="semesters-list" breadcrumbs={["Dashboard", "Năm học", "Học kỳ"]} onNavigate={onNavigate}>
      <PageHeader
        title="Quản lý Học kỳ"
        subtitle="Danh sách học kỳ theo năm học"
        actions={<Btn variant="primary" onClick={() => setShowCreate(true)}>+ Thêm học kỳ</Btn>}
      />

      {/* Summary mini-cards */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Học kỳ", value: summaryStats.total },
          { label: "Tổng lớp học", value: summaryStats.totalClasses },
          { label: "Tổng đề thi", value: summaryStats.totalExams },
        ].map(s => (
          <div key={s.label} style={{ padding: "12px 20px", background: "#fff", borderRadius: 10, border: `1px solid ${tokens.border}`, flex: 1 }}>
            <div style={{ fontSize: 12, color: tokens.textMuted }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: tokens.textPrimary, marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${tokens.border}`, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <SearchInput value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm theo mã, tên học kỳ..." />
          <select value={yearFilter} onChange={e => { setYearFilter(e.target.value); setPage(1); }} style={filterSelectStyle}>
            <option value="">Tất cả năm học</option>
            {mockAcademicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
          </select>
          {(search || yearFilter) && (
            <Btn variant="ghost" size="sm" onClick={() => { setSearch(""); setYearFilter(""); setPage(1); }}>Xóa bộ lọc</Btn>
          )}
        </div>
        <Table columns={columns} data={paginated} emptyMessage="Chưa có học kỳ nào" />
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${tokens.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: tokens.textMuted }}>{filtered.length} kết quả</span>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>

      <SemesterFormModal
        open={showCreate || !!editTarget}
        onClose={() => { setShowCreate(false); setEditTarget(null); }}
        onSave={handleSave}
        initialData={editTarget}
        semesters={semesters}
      />

      <ConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Xóa học kỳ"
        message={`Bạn có chắc muốn xóa học kỳ "${deleteTarget?.name} (${deleteTarget?.academicYearName})"?`}
        confirmLabel="Xóa học kỳ" confirmVariant="danger"
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
// A07 — Modal Form Học kỳ (Thêm / Sửa)
// Quy định: tối đa 3 học kỳ/năm (HK1, HK2, HKH)
// ============================================================
function SemesterFormModal({ open, onClose, onSave, initialData, semesters = [] }) {
  const isEdit = !!initialData;
  const empty = { name: "", academicYearId: "", startDate: "", endDate: "", status: "upcoming" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useMemo(() => {
    if (open) {
      setForm(initialData ? {
        name: initialData.name, academicYearId: String(initialData.academicYearId),
        startDate: initialData.startDate, endDate: initialData.endDate, status: initialData.status,
      } : empty);
      setErrors({});
    }
  }, [open, initialData]);

  const set = f => e => setForm(prev => ({ ...prev, [f]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name) e.name = "Vui lòng chọn học kỳ";
    if (!form.academicYearId) e.academicYearId = "Vui lòng chọn năm học";
    if (!form.startDate) e.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!form.endDate) e.endDate = "Vui lòng chọn ngày kết thúc";
    if (form.startDate && form.endDate && form.endDate <= form.startDate) e.endDate = "Ngày kết thúc phải sau ngày bắt đầu";

    // Kiểm tra tối đa 3 học kỳ/năm
    if (form.name && form.academicYearId) {
      const sameYear = semesters.filter(s => s.academicYearId === Number(form.academicYearId) && (!isEdit || s.id !== initialData?.id));
      if (sameYear.length >= 3) e.name = "Năm học này đã có tối đa 3 học kỳ";
      const dup = sameYear.find(s => s.name === form.name);
      if (dup) e.name = `${form.name} đã tồn tại trong năm học này`;
    }
    return e;
  };

  const handleSave = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({ ...form, id: initialData?.id, academicYearId: Number(form.academicYearId) }, isEdit);
  };

  const yearOptions = mockAcademicYears.map(y => ({ value: String(y.id), label: y.name }));
  const semesterOptions = [
    { value: "Học kỳ 1", label: "Học kỳ 1 (HK1)" },
    { value: "Học kỳ 2", label: "Học kỳ 2 (HK2)" },
    { value: "Học kỳ Hè", label: "Học kỳ Hè (HKH)" },
  ];

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Chỉnh sửa học kỳ" : "Thêm học kỳ mới"}
      footer={<><Btn variant="secondary" onClick={onClose}>Hủy</Btn><Btn variant="primary" onClick={handleSave}>{isEdit ? "Lưu thay đổi" : "Tạo học kỳ"}</Btn></>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Select label="Năm học" required value={form.academicYearId} onChange={set("academicYearId")} placeholder="-- Chọn năm học --" error={errors.academicYearId} options={yearOptions} />
        <Select label="Học kỳ" required value={form.name} onChange={set("name")} placeholder="-- Chọn học kỳ --" error={errors.name} options={semesterOptions} />

        {/* Quy định */}
        <div style={{ padding: "10px 14px", background: tokens.accentSoft, borderRadius: 8, fontSize: 12, color: tokens.accentPrimary }}>
          ℹ Tối đa 3 học kỳ mỗi năm học: HK1, HK2 và Học kỳ Hè
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Ngày bắt đầu" required type="date" value={form.startDate} onChange={set("startDate")} error={errors.startDate} />
          <Input label="Ngày kết thúc" required type="date" value={form.endDate} onChange={set("endDate")} error={errors.endDate} />
        </div>

        <Select label="Trạng thái" value={form.status} onChange={set("status")} options={[
          { value: "upcoming", label: "Sắp tới" },
          { value: "active", label: "Đang hoạt động" },
          { value: "closed", label: "Đã kết thúc" },
        ]} />
      </div>
    </Modal>
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
