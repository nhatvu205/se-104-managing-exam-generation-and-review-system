import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout, { PageHeader, Card, Btn, Input, Select, Toast, tokens } from '../../layouts/AdminLayout';
import { fetchRoleOptions, fetchUsers, saveUser } from '../../lib/supabaseData';

const EMPTY = {
  fullName: '',
  email: '',
  roleId: '',
  phone: '',
  status: 'active',
  password: '',
  confirmPassword: '',
};

export default function UserFormPage({ onNavigate }) {
  const { id } = useParams();
  const isEdit = !!id;
  const [form, setForm] = useState(EMPTY);
  const [roleOptions, setRoleOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [roles, users] = await Promise.all([fetchRoleOptions(), isEdit ? fetchUsers() : Promise.resolve([])]);
        setRoleOptions(roles);
        if (isEdit) {
          const current = users.find((u) => String(u.id) === String(id));
          if (current) {
            setForm({
              fullName: current.fullName || '',
              email: current.email || '',
              roleId: current.roleId || roles[0]?.value || '',
              phone: current.phone || '',
              status: current.status || 'active',
              password: '',
              confirmPassword: '',
            });
          }
        } else if (roles[0]) {
          setForm((prev) => ({ ...prev, roleId: roles[0].value }));
        }
      } catch (e) {
        setToast({ message: e.message || 'Không tải được dữ liệu form', type: 'error' });
      }
    })();
  }, [id, isEdit]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ tên';
    if (!form.email.trim()) e.email = 'Vui lòng nhập email';
    if (!/^\S+@\S+\.\S+$/.test(form.email || '')) e.email = 'Email không hợp lệ';
    if (!form.roleId) e.roleId = 'Vui lòng chọn vai trò';
    if (!isEdit && !form.password) e.password = 'Vui lòng nhập mật khẩu';
    if ((form.password || form.confirmPassword) && form.password !== form.confirmPassword) e.confirmPassword = 'Mật khẩu xác nhận không khớp';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      await saveUser({
        id,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        roleId: form.roleId,
        status: form.status,
        password: form.password,
      });
      setToast({ message: isEdit ? 'Cập nhật người dùng thành công' : 'Tạo người dùng thành công', type: 'success' });
      setTimeout(() => onNavigate('users-list', '/admin/users'), 600);
    } catch (err) {
      setToast({ message: err.message || 'Lưu thất bại', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const roleSelectOptions = useMemo(() => roleOptions.map((r) => ({ value: r.value, label: r.label })), [roleOptions]);

  return (
    <AdminLayout activeKey="users-list" breadcrumbs={['Dashboard', 'Người dùng', isEdit ? 'Chỉnh sửa' : 'Thêm mới']} onNavigate={onNavigate}>
      <PageHeader
        title={isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        subtitle={isEdit ? 'Cập nhật thông tin người dùng' : 'Tạo tài khoản mới trong hệ thống'}
        actions={<Btn variant="secondary" onClick={() => onNavigate('users-list', '/admin/users')}>← Quay lại</Btn>}
      />

      <div style={{ maxWidth: 760 }}>
        <Card style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Thông tin cơ bản</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="Họ và tên" required value={form.fullName} onChange={set('fullName')} error={errors.fullName} style={{ gridColumn: '1 / -1' }} />
            <Input label="Email" required value={form.email} onChange={set('email')} error={errors.email} disabled={isEdit} />
            <Input label="Số điện thoại" value={form.phone} onChange={set('phone')} />
            <Select label="Vai trò" required value={form.roleId} onChange={set('roleId')} options={roleSelectOptions} error={errors.roleId} />
            <Select
              label="Trạng thái"
              value={form.status}
              onChange={set('status')}
              options={[{ value: 'pending', label: 'Chờ duyệt' }, { value: 'active', label: 'Đang hoạt động' }, { value: 'inactive', label: 'Đã khóa' }]}
            />
          </div>
        </Card>

        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>{isEdit ? 'Đổi mật khẩu (tùy chọn)' : 'Mật khẩu'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label={isEdit ? 'Mật khẩu mới' : 'Mật khẩu'} type="password" value={form.password} onChange={set('password')} error={errors.password} />
            <Input label="Xác nhận mật khẩu" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
          </div>

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Btn variant="secondary" onClick={() => onNavigate('users-list', '/admin/users')}>Hủy</Btn>
            <Btn variant="primary" onClick={handleSave} disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</Btn>
          </div>
        </Card>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </AdminLayout>
  );
}
