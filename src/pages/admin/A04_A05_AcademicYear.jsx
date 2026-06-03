import { useEffect, useMemo, useState } from 'react';
import AdminLayout, { PageHeader, Card, Btn, Badge, ConfirmDialog, Modal, Table, Pagination, Input, Select, Toast, PageState, tokens } from '../../layouts/AdminLayout';
import { deleteAcademicYear, fetchAcademicYears, saveAcademicYear, updateAcademicYear } from '../../lib/supabaseData';

const PAGE_SIZE = 10;

export function AcademicYearListPage({ onNavigate }) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ namHoc: '', trangThai: 'active', ngayBatDau: '', ngayKetThuc: '' });

  const setEditField = (key) => (e) => setEditForm((prev) => ({ ...prev, [key]: e.target.value }));

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAcademicYears();
      setRows(data);
    } catch (e) {
      setError(e.message || 'Không tải được năm học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => (r.name || '').toLowerCase().includes(q) || (r.code || '').toLowerCase().includes(q));
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAcademicYear(deleteTarget.code);
      setToast({ message: `Đã xóa năm học ${deleteTarget.name}`, type: 'success' });
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setToast({ message: e.message || 'Không xóa được năm học', type: 'error' });
    }
  };

  const handleEdit = async () => {
    if (!editTarget || !editForm.namHoc.trim()) return;
    try {
      await updateAcademicYear({
        originalNamHoc: editTarget.code,
        namHoc: editForm.namHoc.trim(),
        trangThai: editForm.trangThai,
        ngayBatDau: editForm.ngayBatDau,
        ngayKetThuc: editForm.ngayKetThuc,
      });
      setToast({ message: 'Đã cập nhật năm học.', type: 'success' });
      setEditTarget(null);
      await load();
    } catch (e) {
      setToast({ message: e.message || 'Không cập nhật được năm học', type: 'error' });
    }
  };

  const columns = [
    { key: 'code', label: 'Mã/Năm học' },
    { key: 'name', label: 'Năm học' },
    { key: 'semesterCount', label: 'Số học kỳ' },
    { key: 'startDate', label: 'Bắt đầu' },
    { key: 'endDate', label: 'Kết thúc' },
    { key: 'status', label: 'Trạng thái', render: (v) => <Badge label={v === 'active' ? 'Đang hoạt động' : 'Không hoạt động'} color={v} /> },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn size="sm" variant="secondary" onClick={() => { setEditTarget(row); setEditForm({ namHoc: row.name || '', trangThai: row.status || 'active', ngayBatDau: row.startDate || '', ngayKetThuc: row.endDate || '' }); }}>Sửa</Btn>
          <Btn size="sm" variant="danger" onClick={() => setDeleteTarget(row)}>Xóa</Btn>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout activeKey="years-list" breadcrumbs={['Dashboard', 'Năm học']} onNavigate={onNavigate}>
      <PageHeader
        title="Quản lý Năm học"
        subtitle={loading ? 'Đang tải dữ liệu...' : `${filtered.length} năm học`}
        actions={<Btn variant="primary" onClick={() => onNavigate('years-create', '/admin/academic-years/create')}>+ Thêm năm học</Btn>}
      />

      {error ? (
        <PageState kind="error" title="Không tải được năm học" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : (
        <Card>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${tokens.border}` }}>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo năm học..." />
          </div>
          <Table columns={columns} data={paginated} emptyMessage={loading ? 'Đang tải...' : 'Không có dữ liệu'} />
          <div style={{ padding: '14px 20px', borderTop: `1px solid ${tokens.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: tokens.textMuted }}>Trang {page}/{totalPages}</span>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </Card>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa năm học"
        message={`Bạn có chắc muốn xóa toàn bộ học kỳ thuộc năm học ${deleteTarget?.name || ''}?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirmLabel="Xóa"
      />
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Sửa năm học"
        footer={(
          <>
            <Btn variant="secondary" onClick={() => setEditTarget(null)}>Hủy</Btn>
            <Btn variant="primary" onClick={handleEdit} disabled={!editForm.namHoc.trim()}>Lưu</Btn>
          </>
        )}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="edit-namHoc">Tên năm học <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input id="edit-namHoc" className="input" value={editForm.namHoc} onChange={setEditField('namHoc')} placeholder="VD: 2025-2026" />
          </div>
          <div className="field">
            <label htmlFor="edit-ngayBatDau">Ngày bắt đầu</label>
            <input id="edit-ngayBatDau" className="input" type="date" value={editForm.ngayBatDau} onChange={setEditField('ngayBatDau')} />
          </div>
          <div className="field">
            <label htmlFor="edit-ngayKetThuc">Ngày kết thúc</label>
            <input id="edit-ngayKetThuc" className="input" type="date" value={editForm.ngayKetThuc} onChange={setEditField('ngayKetThuc')} />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="edit-trangThai">Trạng thái</label>
            <select id="edit-trangThai" className="select" value={editForm.trangThai} onChange={setEditField('trangThai')}>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
          <p className="field-help" style={{ gridColumn: '1 / -1', marginTop: 0 }}>
            Thay đổi sẽ áp dụng cho tất cả học kỳ thuộc năm học này.
          </p>
        </div>
      </Modal>
    </AdminLayout>
  );
}

export function AcademicYearFormPage({ onNavigate }) {
  const [form, setForm] = useState({
    namHoc: '',
    tenHocKy: 'HK1',
    ngayBatDau: '',
    ngayKetThuc: '',
    trangThai: 'active',
  });
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveAcademicYear(form);
      setToast({ message: 'Đã thêm học kỳ/năm học thành công', type: 'success' });
      setTimeout(() => onNavigate('years-list', '/admin/academic-years'), 700);
    } catch (e) {
      setToast({ message: e.message || 'Không thể lưu dữ liệu', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeKey="years-list" breadcrumbs={['Dashboard', 'Năm học', 'Thêm mới']} onNavigate={onNavigate}>
      <PageHeader
        title="Thêm năm học / học kỳ"
        subtitle="Điền thông tin năm học và học kỳ."
        actions={<Btn variant="secondary" onClick={() => onNavigate('years-list', '/admin/academic-years')}>← Quay lại</Btn>}
      />

      <Card style={{ maxWidth: 760 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="Năm học" required placeholder="VD: 2026-2027" value={form.namHoc} onChange={set('namHoc')} />
          <Select
            label="Học kỳ"
            value={form.tenHocKy}
            onChange={set('tenHocKy')}
            options={[{ value: 'HK1', label: 'HK1' }, { value: 'HK2', label: 'HK2' }, { value: 'HK hè', label: 'HK hè' }]}
          />
          <Input label="Ngày bắt đầu" required type="date" value={form.ngayBatDau} onChange={set('ngayBatDau')} />
          <Input label="Ngày kết thúc" required type="date" value={form.ngayKetThuc} onChange={set('ngayKetThuc')} />
          <Select
            label="Trạng thái"
            value={form.trangThai}
            onChange={set('trangThai')}
            options={[{ value: 'active', label: 'Đang hoạt động' }, { value: 'inactive', label: 'Không hoạt động' }]}
          />
        </div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn variant="secondary" onClick={() => onNavigate('years-list', '/admin/academic-years')}>Hủy</Btn>
          <Btn variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</Btn>
        </div>
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </AdminLayout>
  );
}
