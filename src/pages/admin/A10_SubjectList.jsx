import { useEffect, useMemo, useState } from 'react';
import AdminLayout, { PageHeader, Card, Btn, ConfirmDialog, SearchInput, Table, Pagination, Toast, PageState, tokens } from '../../layouts/AdminLayout';
import { deleteSubject, fetchSubjects } from '../../lib/supabaseData';

const PAGE_SIZE = 10;

export default function SubjectListPage({ onNavigate }) {
  const [subjects, setSubjects] = useState([]);
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
      const data = await fetchSubjects();
      setSubjects(data);
    } catch (e) {
      setError(e.message || 'Không tải được môn học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
  }, [search, subjects]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSubject(deleteTarget.id);
      setToast({ message: `Đã xóa môn học ${deleteTarget.code}`, type: 'success' });
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setToast({ message: e.message || 'Không xóa được môn học', type: 'error' });
    }
  };

  const columns = [
    { key: 'code', label: 'Mã môn' },
    { key: 'name', label: 'Tên môn học' },
    { key: 'questionCount', label: 'Số câu hỏi' },
    { key: 'examCount', label: 'Số đề thi' },
    { key: 'lecturerCount', label: 'Số giảng viên' },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn size="sm" variant="secondary" onClick={() => onNavigate('subjects-form', `/admin/subjects/form?id=${row.id}`)}>Sửa</Btn>
          <Btn size="sm" variant="danger" disabled={row.examCount > 0 || row.questionCount > 0} onClick={() => setDeleteTarget(row)}>Xóa</Btn>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout activeKey="subjects-list" breadcrumbs={['Dashboard', 'Môn học']} onNavigate={onNavigate}>
      <PageHeader
        title="Quản lý Môn học"
        subtitle={loading ? 'Đang tải dữ liệu...' : `${filtered.length} môn học`}
        actions={<Btn variant="primary" onClick={() => onNavigate('subjects-form', '/admin/subjects/form')}>+ Thêm môn học</Btn>}
      />

      {error ? (
        <PageState kind="error" title="Không tải được môn học" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : (
        <Card>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${tokens.border}` }}>
            <SearchInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên hoặc mã môn học..."
            />
          </div>

          <Table columns={columns} data={paginated} emptyMessage={loading ? 'Đang tải dữ liệu...' : 'Không có dữ liệu'} />

          <div style={{ padding: '14px 20px', borderTop: `1px solid ${tokens.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: tokens.textMuted }}>Trang {page}/{totalPages}</span>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </Card>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa môn học"
        message={`Bạn có chắc muốn xóa môn học ${deleteTarget?.code || ''}?`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          void handleDelete();
        }}
        confirmLabel="Xóa"
      />
    </AdminLayout>
  );
}
