import { useState, useMemo } from "react";
import AdminLayout, { PageHeader, Card, Btn, Badge, Input, Select, SearchInput, Table, Pagination, Modal, ConfirmDialog, Toast, tokens } from "../layouts/AdminLayout";
import { mockClasses, mockSubjects, mockUsers, mockSemesters, STATUS_LABELS } from "../data/mockData";

const PAGE_SIZE = 6;

// ============================================================
// A08 — Quản lý Lớp học – Danh sách
// ============================================================
export function ClassListPage({ onNavigate }) {
  const [classes, setClasses] = useState(mockClasses);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 4000); };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return classes.filter(c => {
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.lecturerName.toLowerCase().includes(q);
      const matchSubject = !subjectFilter || c.subjectId === Number(subjectFilter);
      const matchSemester = !semesterFilter || c.semesterId === Number(semesterFilter);
      return matchSearch && matchSubject && matchSemester;
    });
  }, [classes, search, subjectFilter, semesterFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = (data, isEdit) => {
    if (isEdit) {
      setClasses(prev => prev.map(c => c.id === data.id ? { ...c, ...data } : c));
      showToast("✔ Cập nhật lớp học thành công");
    } else {
      setClasses(prev => [...prev, { ...data, id: Date.now(), studentCount: 0 }]);
      showToast("✔ Thêm lớp học thành công");
    }
    setEditTarget(null); setShowCreate(false);
  };

  const handleDelete = () => {
    setClasses(prev => prev.filter(c => c.id !== deleteTarget.id));
    showToast(`Đã xóa lớp "${deleteTarget.name}"`, "info");
  };

  const columns = [
    { key: "code", label: "Mã lớp", render: v => <span style={{ fontFamily: "monospace", fontSize: 12, color: tokens.textMuted, background: tokens.bgSecondary, padding: "2px 8px", borderRadius: 4 }}>{v}</span> },
    { key: "name", label: "Tên lớp học", render: (v, row) => (
      <div>
        <div style={{ fontWeight: 500, color: tokens.textPrimary, fontSize: 14 }}>{v}</div>
        <div style={{ fontSize: 12, color: tokens.textMuted }}>{row.subjectName}</div>
      </div>
    )},
    { key: "lecturerName", label: "Giảng viên", render: (v, row) => (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: tokens.accentSoft, color: tokens.accentPrimary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
          {v.charAt(0)}
        </div>
        <span style={{ fontSize: 13 }}>{v}</span>
      </div>
    )},
    { key: "semesterName", label: "Học kỳ", render: v => <span style={{ fontSize: 13, color: tokens.textSecondary }}>{v}</span> },
    { key: "studentCount", label: "Sĩ số", render: v => (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontWeight: 600, color: tokens.textPrimary }}>{v}</span>
        <span style={{ fontSize: 11, color: tokens.textMuted }}>SV</span>
      </div>
    )},
    { key: "status", label: "Trạng thái", render: v => <Badge label={STATUS_LABELS[v] || v} color={v} /> },
    { key: "actions", label: "", width: 110, render: (_, row) => (
      <div style={{ display: "flex", gap: 6 }}>
        <Btn size="sm" variant="secondary" onClick={() => setEditTarget(row)}>Sửa</Btn>
        <Btn size="sm" variant="ghost" onClick={() => setDeleteTarget(row)} style={{ color: "#DC2626" }}>Xóa</Btn>
      </div>
    )},
  ];

  return (
    <AdminLayout activeKey="classes-list" breadcrumbs={["Dashboard", "Lớp học", "Danh sách"]} onNavigate={onNavigate}>
      <PageHeader
        title="Quản lý Lớp học"
        subtitle={`${classes.length} lớp học trong hệ thống`}
        actions={<Btn variant="primary" onClick={() => setShowCreate(true)}>+ Thêm lớp học</Btn>}
      />

      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${tokens.border}`, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <SearchInput value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm theo tên lớp, mã, giảng viên..." />
          <select value={subjectFilter} onChange={e => { setSubjectFilter(e.target.value); setPage(1); }} style={filterSelectStyle}>
            <option value="">Tất cả môn học</option>
            {mockSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={semesterFilter} onChange={e => { setSemesterFilter(e.target.value); setPage(1); }} style={filterSelectStyle}>
            <option value="">Tất cả học kỳ</option>
            {mockSemesters.map(s => <option key={s.id} value={s.id}>{s.name} {s.academicYearName}</option>)}
          </select>
          {(search || subjectFilter || semesterFilter) && (
            <Btn variant="ghost" size="sm" onClick={() => { setSearch(""); setSubjectFilter(""); setSemesterFilter(""); setPage(1); }}>Xóa bộ lọc</Btn>
          )}
        </div>

        <Table columns={columns} data={paginated} emptyMessage="Không tìm thấy lớp học nào" />

        <div style={{ padding: "14px 20px", borderTop: `1px solid ${tokens.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: tokens.textMuted }}>
            Hiển thị {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} kết quả
          </span>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>

      <ClassFormModal
        open={showCreate || !!editTarget}
        onClose={() => { setShowCreate(false); setEditTarget(null); }}
        onSave={handleSave}
        initialData={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Xóa lớp học"
        message={`Bạn có chắc muốn xóa lớp "${deleteTarget?.name}"? Dữ liệu đề thi và kết quả liên quan có thể bị ảnh hưởng.`}
        confirmLabel="Xóa lớp học" confirmVariant="danger"
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
// A09 — Modal Form Lớp học (Thêm / Sửa)
// ============================================================
function ClassFormModal({ open, onClose, onSave, initialData }) {
  const isEdit = !!initialData;
  const empty = { code: "", name: "", subjectId: "", subjectName: "", lecturerId: "", lecturerName: "", semesterId: "", semesterName: "", studentCount: 0, status: "upcoming" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useMemo(() => {
    if (open) {
      setForm(initialData ? {
        code: initialData.code, name: initialData.name,
        subjectId: String(initialData.subjectId), subjectName: initialData.subjectName,
        lecturerId: String(initialData.lecturerId), lecturerName: initialData.lecturerName,
        semesterId: String(initialData.semesterId), semesterName: initialData.semesterName,
        studentCount: initialData.studentCount, status: initialData.status,
      } : empty);
      setErrors({});
    }
  }, [open, initialData]);

  const set = f => e => {
    const val = e.target.value;
    const updates = { [f]: val };
    // Auto-fill names
    if (f === "subjectId") {
      const s = mockSubjects.find(s => s.id === Number(val));
      if (s) updates.subjectName = s.name;
    }
    if (f === "lecturerId") {
      const u = mockUsers.find(u => u.id === Number(val));
      if (u) updates.lecturerName = u.fullName;
    }
    if (f === "semesterId") {
      const s = mockSemesters.find(s => s.id === Number(val));
      if (s) updates.semesterName = `${s.name} ${s.academicYearName}`;
    }
    setForm(prev => ({ ...prev, ...updates }));
  };

  const validate = () => {
    const e = {};
    if (!form.code.trim()) e.code = "Mã lớp không được trống";
    if (!form.name.trim()) e.name = "Tên lớp không được trống";
    if (!form.subjectId) e.subjectId = "Vui lòng chọn môn học";
    if (!form.lecturerId) e.lecturerId = "Vui lòng chọn giảng viên";
    if (!form.semesterId) e.semesterId = "Vui lòng chọn học kỳ";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({ ...form, id: initialData?.id, subjectId: Number(form.subjectId), lecturerId: Number(form.lecturerId), semesterId: Number(form.semesterId) }, isEdit);
  };

  const lecturers = mockUsers.filter(u => u.role === "lecturer");

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Chỉnh sửa lớp học" : "Thêm lớp học mới"}
      footer={<><Btn variant="secondary" onClick={onClose}>Hủy</Btn><Btn variant="primary" onClick={handleSave}>{isEdit ? "Lưu thay đổi" : "Tạo lớp học"}</Btn></>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Mã lớp" required value={form.code} onChange={set("code")} placeholder="MATH101-01" error={errors.code} />
          <Select label="Trạng thái" value={form.status} onChange={set("status")} options={[
            { value: "upcoming", label: "Sắp tới" },
            { value: "active", label: "Đang hoạt động" },
            { value: "closed", label: "Đã kết thúc" },
          ]} />
        </div>
        <Input label="Tên lớp học" required value={form.name} onChange={set("name")} placeholder="Toán cao cấp A1 - Nhóm 01" error={errors.name} />
        <Select label="Môn học" required value={form.subjectId} onChange={set("subjectId")} placeholder="-- Chọn môn học --" error={errors.subjectId}
          options={mockSubjects.map(s => ({ value: String(s.id), label: `${s.code} — ${s.name}` }))} />
        <Select label="Giảng viên phụ trách" required value={form.lecturerId} onChange={set("lecturerId")} placeholder="-- Chọn giảng viên --" error={errors.lecturerId}
          options={lecturers.map(u => ({ value: String(u.id), label: u.fullName }))} />
        <Select label="Học kỳ / Năm học" required value={form.semesterId} onChange={set("semesterId")} placeholder="-- Chọn học kỳ --" error={errors.semesterId}
          options={mockSemesters.map(s => ({ value: String(s.id), label: `${s.name} — ${s.academicYearName}` }))} />
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
