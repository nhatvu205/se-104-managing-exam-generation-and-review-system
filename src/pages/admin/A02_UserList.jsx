import { useEffect, useMemo, useState } from 'react';
import AdminLayout, { PageHeader, Card, Btn, Badge, SearchInput, Table, Pagination, ConfirmDialog, Toast, PageState, tokens } from '../../layouts/AdminLayout';
import { fetchUsers, deleteUser } from '../../lib/supabaseData';

const PAGE_SIZE = 10;

const ROLE_LABELS = {
  admin: 'Admin',
  lecturer: 'Giảng viên',
  student: 'Sinh viên',
};

const STATUS_LABELS = {
  active: 'Đang hoạt động',
  inactive: 'Đã khóa',
};

export default function UserListPage({ onNavigate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (e) {
      setError(e.message || 'Không tải được danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch = !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = !roleFilter || u.role === roleFilter;
      const matchStatus = !statusFilter || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      setToast({ message: `Đã xóa người dùng ${deleteTarget.fullName}`, type: 'success' });
      loadUsers();
    } catch (e) {
      setToast({ message: e.message || 'Xóa thất bại', type: 'error' });
    }
  };

  const columns = [
    {
      key: 'fullName',
      label: 'Họ và tên',
      render: (v, row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{v}</div>
          <div style={{ fontSize: 12, color: tokens.textMuted }}>{row.email}</div>
        </div>
      ),
    },
    { key: 'phone', label: 'SĐT' },
    { key: 'role', label: 'Vai trò', render: (v) => <Badge label={ROLE_LABELS[v] || v} color={v} /> },
    { key: 'status', label: 'Trạng thái', render: (v) => <Badge label={STATUS_LABELS[v] || v} color={v} /> },
    { key: 'createdAt', label: 'Ngày tạo' },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn size="sm" variant="secondary" onClick={() => onNavigate('users-edit', `/admin/users/${row.id}/edit`)}>Sửa</Btn>
          <Btn size="sm" variant="ghost" style={{ color: '#DC2626' }} onClick={() => setDeleteTarget(row)}>Xóa</Btn>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout activeKey="users-list" breadcrumbs={['Dashboard', 'Người dùng', 'Danh sách']} onNavigate={onNavigate}>
      <PageHeader
        title="Quản lý Người dùng"
        subtitle={loading ? 'Đang tải...' : `${filtered.length} người dùng`}
        actions={<Btn variant="primary" onClick={() => onNavigate('users-create', '/admin/users/create')}>+ Thêm người dùng</Btn>}
      />

      {error ? (
        <PageState kind="error" title="Không tải được danh sách người dùng" description={error} action={<Btn variant="secondary" onClick={loadUsers}>Thử lại</Btn>} />
      ) : (
        <Card>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${tokens.border}`, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <SearchInput value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm theo tên/email" />

            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="select" style={{ maxWidth: 180 }}>
              <option value="">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="lecturer">Giảng viên</option>
              <option value="student">Sinh viên</option>
            </select>

            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="select" style={{ maxWidth: 180 }}>
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã khóa</option>
            </select>
          </div>

          <Table columns={columns} data={paginated} emptyMessage={loading ? 'Đang tải dữ liệu...' : 'Không có dữ liệu'} />

          <div style={{ padding: '14px 20px', borderTop: `1px solid ${tokens.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: tokens.textMuted }}>Trang {page}/{totalPages}</span>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa người dùng"
        message={`Bạn có chắc muốn xóa ${deleteTarget?.fullName || ''}?`}
        confirmLabel="Xóa"
        confirmVariant="danger"
      />

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </AdminLayout>
  );
}
