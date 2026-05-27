import { useEffect, useMemo, useState } from 'react';
import AdminLayout, { PageHeader, Card, Badge, Input, Table, Pagination, Toast, PageState, Btn, tokens } from '../../layouts/AdminLayout';
import { fetchClasses } from '../../lib/supabaseData';

const PAGE_SIZE = 10;

export function ClassListPage({ onNavigate }) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

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
    return rows.filter((r) => [r.code, r.name, r.subjectName, r.lecturerName].join(' ').toLowerCase().includes(q));
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = [
    { key: 'code', label: 'Mã lớp' },
    { key: 'name', label: 'Tên lớp' },
    { key: 'subjectName', label: 'Môn học' },
    { key: 'lecturerName', label: 'Giảng viên' },
    { key: 'academicYearName', label: 'Năm học' },
    { key: 'studentCount', label: 'Sĩ số' },
    { key: 'status', label: 'Trạng thái', render: (v) => <Badge label={v === 'active' ? 'Đang hoạt động' : 'Không hoạt động'} color={v} /> },
  ];

  return (
    <AdminLayout activeKey="classes-list" breadcrumbs={['Dashboard', 'Lớp học']} onNavigate={onNavigate}>
      <PageHeader title="Quản lý Lớp học" subtitle={loading ? 'Đang tải dữ liệu...' : `${filtered.length} lớp học`} />

      {error ? (
        <PageState kind="error" title="Không tải được lớp học" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : (
        <Card>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${tokens.border}` }}>
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm lớp học..." />
          </div>

          <Table columns={columns} data={paginated} emptyMessage={loading ? 'Đang tải...' : 'Không có dữ liệu'} />

          <div style={{ padding: '14px 20px', borderTop: `1px solid ${tokens.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: tokens.textMuted }}>Trang {page}/{totalPages}</span>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </Card>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </AdminLayout>
  );
}
