import { useEffect, useMemo, useState } from 'react';
import AdminLayout, { PageHeader, Card, Badge, ConfirmDialog, Input, Table, Pagination, Toast, PageState, Btn, tokens } from '../../layouts/AdminLayout';
import { deleteClass, fetchClasses } from '../../lib/supabaseData';

const PAGE_SIZE = 10;

export function ClassListPage({ onNavigate }) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchClasses();
      setRows(data);
    } catch (e) {
      setError(e.message || 'Không tải được lớp học');
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
    return rows.filter((r) => [r.code, r.subjectName, r.lecturerName].join(' ').toLowerCase().includes(q));
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteClass(deleteTarget.id);
      setToast({ message: `Đã xóa lớp ${deleteTarget.code}`, type: 'success' });
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setToast({ message: e.message || 'Không xóa được lớp học', type: 'error' });
    }
  };

  const columns = [
    { key: 'code', label: 'Mã lớp' },
    { key: 'subjectName', label: 'Môn học' },
    { key: 'lecturerName', label: 'Giảng viên' },
    { key: 'academicYearName', label: 'Năm học' },
    {
      key: 'studentCount',
      label: 'Sĩ số',
      render: (_, row) => (
        <div>
          <strong>{row.studentCount || 0}</strong>
          <div style={{ fontSize: 12, color: tokens.textMuted }}>Chỉ tiêu: {row.plannedStudentCount || 0}</div>
        </div>
      ),
    },
    { key: 'status', label: 'Trạng thái', render: (v) => <Badge label={v === 'active' ? 'Đang hoạt động' : 'Không hoạt động'} color={v} /> },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn size="sm" variant="secondary" onClick={() => onNavigate('classes-form', `/admin/classes/form?id=${row.id}`)}>Sửa</Btn>
          <Btn size="sm" variant="danger" onClick={() => setDeleteTarget(row)}>Xóa</Btn>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout activeKey="classes-list" breadcrumbs={['Dashboard', 'Lớp học']} onNavigate={onNavigate}>
      <PageHeader
        title="Quản lý Lớp học"
        subtitle={loading ? 'Đang tải dữ liệu...' : `${filtered.length} lớp học`}
        actions={<Btn variant="primary" onClick={() => onNavigate('classes-form', '/admin/classes/form')}>+ Thêm lớp học</Btn>}
      />

      {error ? (
        <PageState kind="error" title="Không tải được lớp học" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : (
        <Card>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${tokens.border}` }}>
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm theo mã lớp / môn học / giảng viên..." />
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
        title="Xóa lớp học"
        message={`Bạn có chắc muốn xóa lớp ${deleteTarget?.code || ''}?`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          void handleDelete();
        }}
        confirmLabel="Xóa"
      />
    </AdminLayout>
  );
}
