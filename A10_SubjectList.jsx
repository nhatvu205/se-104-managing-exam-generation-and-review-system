import { useState, useMemo } from "react";
import AdminLayout, { PageHeader, Card, Btn, Input, SearchInput, Table, Pagination, Modal, ConfirmDialog, Toast, tokens } from "../layouts/AdminLayout";
import { mockSubjects } from "../data/mockData";

const PAGE_SIZE = 6;

// ============================================================
// A10 — Quản lý Môn học – Danh sách
// (A11 Form được đóng gói trong Modal bên dưới)
// ============================================================
export default function SubjectListPage({ onNavigate }) {
  const [subjects, setSubjects] = useState(mockSubjects);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 4000); };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return !q ? subjects : subjects.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
  }, [subjects, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = (data, isEdit) => {
    if (isEdit) {
      setSubjects(prev => prev.map(s => s.id === data.id ? { ...s, ...data } : s));
      showToast("✔ Cập nhật môn học thành công");
    } else {
      setSubjects(prev => [...prev, { ...data, id: Date.now(), questionCount: 0, examCount: 0, lecturerCount: 0 }]);
      showToast("✔ Thêm môn học thành công");
    }
    setEditTarget(null); setShowCreate(false);
  };

  const handleDelete = () => {
    setSubjects(prev => prev.filter(s => s.id !== deleteTarget.id));
    showToast(`Đã xóa môn "${deleteTarget.name}"`, "info");
  };

  const columns = [
    { key: "code", label: "Mã môn", render: v => (
      <span style={{ fontFamily: "monospace", fontSize: 12, background: tokens.bgSecondary, color: tokens.textMuted, padding: "3px 8px", borderRadius: 4, whiteSpace: "nowrap" }}>{v}</span>
    )},
    { key: "name", label: "Tên môn học", render: (v, row) => (
      <div>
        <div style={{ fontWeight: 500, color: tokens.textPrimary, marginBottom: 2 }}>{v}</div>
        <div style={{ fontSize: 12, color: tokens.textMuted, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.description}</div>
      </div>
    )},
    { key: "questionCount", label: "Câu hỏi", render: v => <MetricBadge value={v} label="câu" color="#2563EB" /> },
    { key: "examCount", label: "Đề thi", render: v => <MetricBadge value={v} label="đề" color="#16A34A" /> },
    { key: "lecturerCount", label: "Giảng viên", render: v => <MetricBadge value={v} label="GV" color="#9333EA" /> },
    { key: "actions", label: "", width: 120, render: (_, row) => (
      <div style={{ display: "flex", gap: 6 }}>
        <Btn size="sm" variant="secondary" onClick={() => setEditTarget(row)}>Sửa</Btn>
        <Btn size="sm" variant="ghost" onClick={() => setDeleteTarget(row)} style={{ color: "#DC2626" }}
          disabled={row.examCount > 0 || row.questionCount > 0}
          title={row.examCount > 0 || row.questionCount > 0 ? "Không thể xóa môn đang có đề thi / câu hỏi" : "Xóa"}
        >Xóa</Btn>
      </div>
    )},
  ];

  return (
    <AdminLayout activeKey="subjects-list" breadcrumbs={["Dashboard", "Môn học", "Danh sách"]} onNavigate={onNavigate}>
      <PageHeader
        title="Quản lý Môn học"
        subtitle={`${subjects.length} môn học trong hệ thống`}
        actions={<Btn variant="primary" onClick={() => setShowCreate(true)}>+ Thêm môn học</Btn>}
      />

      {/* Summary stats row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Tổng câu hỏi", value: subjects.reduce((s, x) => s + x.questionCount, 0), color: "#2563EB" },
          { label: "Tổng đề thi", value: subjects.reduce((s, x) => s + x.examCount, 0), color: "#16A34A" },
          { label: "Giảng viên tham gia", value: subjects.reduce((s, x) => s + x.lecturerCount, 0), color: "#9333EA" },
        ].map(item => (
          <div key={item.label} style={{
            padding: "14px 20px", background: "#fff", borderRadius: 10,
            border: `1px solid ${tokens.border}`, flex: 1, display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.color }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: tokens.textMuted }}>{item.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: tokens.textPrimary }}>{item.value.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${tokens.border}` }}>
          <SearchInput value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm theo tên hoặc mã môn học..." />
        </div>

        <Table columns={columns} data={paginated} emptyMessage="Không tìm thấy môn học nào" />

        <div style={{ padding: "14px 20px", borderTop: `1px solid ${tokens.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: tokens.textMuted }}>
            Hiển thị {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} kết quả
          </span>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>

      <SubjectFormModal
        open={showCreate || !!editTarget}
        onClose={() => { setShowCreate(false); setEditTarget(null); }}
        onSave={handleSave}
        initialData={editTarget}
        existingSubjects={subjects}
      />

      <ConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Xóa môn học"
        message={`Bạn có chắc muốn xóa môn học "${deleteTarget?.name}" (${deleteTarget?.code})?`}
        confirmLabel="Xóa môn học" confirmVariant="danger"
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
// A11 — Modal Form Môn học (Thêm / Sửa)
// ============================================================
function SubjectFormModal({ open, onClose, onSave, initialData, existingSubjects = [] }) {
  const isEdit = !!initialData;
  const empty = { code: "", name: "", description: "" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useMemo(() => {
    if (open) {
      setForm(initialData ? { code: initialData.code, name: initialData.name, description: initialData.description || "" } : empty);
      setErrors({});
    }
  }, [open, initialData]);

  const set = f => e => setForm(prev => ({ ...prev, [f]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.code.trim()) e.code = "Mã môn không được trống";
    else if (!/^[A-Z0-9]+$/.test(form.code.trim())) e.code = "Mã môn chỉ gồm chữ in hoa và số";
    else {
      const dup = existingSubjects.find(s => s.code === form.code.trim() && (!isEdit || s.id !== initialData?.id));
      if (dup) e.code = "Mã môn này đã tồn tại";
    }
    if (!form.name.trim()) e.name = "Tên môn học không được trống";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({ ...form, code: form.code.trim().toUpperCase(), id: initialData?.id }, isEdit);
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Chỉnh sửa môn học" : "Thêm môn học mới"}
      footer={<><Btn variant="secondary" onClick={onClose}>Hủy</Btn><Btn variant="primary" onClick={handleSave}>{isEdit ? "Lưu thay đổi" : "Tạo môn học"}</Btn></>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input label="Mã môn học" required value={form.code} onChange={set("code")} placeholder="VD: MATH101" error={errors.code}
          hint="Chỉ dùng chữ in hoa và số, không dấu cách" disabled={isEdit} />
        <Input label="Tên môn học" required value={form.name} onChange={set("name")} placeholder="VD: Toán cao cấp A1" error={errors.name} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: tokens.textSecondary }}>Mô tả</label>
          <textarea value={form.description} onChange={set("description")} placeholder="Mô tả ngắn về môn học..."
            rows={3} style={{
              padding: "10px 12px", borderRadius: 8, border: "1px solid #D1D5DB",
              fontSize: 14, fontFamily: "inherit", color: tokens.textPrimary, resize: "vertical",
              lineHeight: 1.5, outline: "none",
            }}
            onFocus={e => e.target.style.borderColor = "#2563EB"}
            onBlur={e => e.target.style.borderColor = "#D1D5DB"}
          />
          <span style={{ fontSize: 12, color: tokens.textMuted, textAlign: "right" }}>{form.description.length}/200</span>
        </div>

        {isEdit && (
          <div style={{ padding: "12px 14px", background: tokens.bgSecondary, borderRadius: 8, fontSize: 13, color: tokens.textMuted }}>
            ℹ Mã môn học không thể thay đổi sau khi tạo. Để thay đổi mã, vui lòng tạo môn học mới.
          </div>
        )}
      </div>
    </Modal>
  );
}

function MetricBadge({ value, label, color }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ fontWeight: 700, fontSize: 15, color: tokens.textPrimary }}>{value.toLocaleString()}</span>
      <span style={{ fontSize: 11, color, fontWeight: 500 }}>{label}</span>
    </div>
  );
}
