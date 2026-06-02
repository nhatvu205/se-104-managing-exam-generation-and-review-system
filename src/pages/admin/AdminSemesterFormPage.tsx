import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminLayout, { Btn, PageState, Toast } from '../../layouts/AdminLayout';
import { deleteSemester, fetchSemesterById, saveSemester } from '../../lib/supabaseData';

export default function AdminSemesterFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const semesterId = searchParams.get('id') || '';
  const isEdit = !!semesterId;

  const [form, setForm] = useState({
    code: '',
    name: '',
    academicYearName: '',
    startDate: '',
    endDate: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<any>(null);

  useEffect(() => {
    if (!isEdit) return;
    let mounted = true;
    fetchSemesterById(semesterId)
      .then((row) => {
        if (!mounted) return;
        if (!row) throw new Error('Không tìm thấy học kỳ.');
        setForm({
          code: row.code || '',
          name: row.name || '',
          academicYearName: row.academicYearName || '',
          startDate: row.startDate || '',
          endDate: row.endDate || '',
          status: row.status || 'active',
        });
      })
      .catch((e: any) => mounted && setError(e.message || 'Không tải được học kỳ'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [isEdit, semesterId]);

  const setField = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSemester({
        id: isEdit ? semesterId : undefined,
        code: form.code,
        name: form.name,
        academicYearName: form.academicYearName,
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
      });
      setToast({ message: isEdit ? 'Đã cập nhật học kỳ.' : 'Đã tạo học kỳ.', type: 'success' });
      setTimeout(() => navigate('/admin/semesters'), 500);
    } catch (e: any) {
      setToast({ message: e.message || 'Không lưu được học kỳ.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    setSaving(true);
    try {
      await deleteSemester(semesterId);
      setToast({ message: 'Đã xóa học kỳ.', type: 'success' });
      setTimeout(() => navigate('/admin/semesters'), 500);
    } catch (e: any) {
      setToast({ message: e.message || 'Không xóa được học kỳ.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeKey="semesters-list" breadcrumbs={['Dashboard', 'Học kỳ', isEdit ? 'Chỉnh sửa' : 'Thêm mới']}>
      <header className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Chỉnh sửa học kỳ' : 'Thêm học kỳ'}</h1>
          <p className="page-subtitle">Có kiểm tra ràng buộc ngày bắt đầu và ngày kết thúc.</p>
        </div>
      </header>

      {error ? (
        <PageState kind="error" title="Không tải được dữ liệu học kỳ" description={error} action={<Btn variant="secondary" onClick={() => navigate('/admin/semesters')}>Quay lại</Btn>} />
      ) : loading ? (
        <PageState kind="loading" title="Đang tải học kỳ..." />
      ) : (
        <section className="card" style={{ maxWidth: 860 }}>
          <div className="form-grid two">
            <div className="field">
              <label>Mã học kỳ</label>
              <input className="input" value={form.code} onChange={(e) => setField('code', e.target.value)} disabled={isEdit} />
            </div>
            <div className="field">
              <label>Tên học kỳ</label>
              <input className="input" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="VD: Học kỳ 1" />
            </div>
            <div className="field">
              <label>Năm học</label>
              <input className="input" value={form.academicYearName} onChange={(e) => setField('academicYearName', e.target.value)} placeholder="VD: 2026-2027" />
            </div>
            <div className="field">
              <label>Trạng thái</label>
              <select className="select" value={form.status} onChange={(e) => setField('status', e.target.value)}>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
            <div className="field">
              <label>Ngày bắt đầu</label>
              <input className="input" type="date" value={form.startDate} onChange={(e) => setField('startDate', e.target.value)} />
            </div>
            <div className="field">
              <label>Ngày kết thúc</label>
              <input className="input" type="date" value={form.endDate} onChange={(e) => setField('endDate', e.target.value)} />
            </div>
          </div>
          <div className="actions">
            <Btn variant="secondary" onClick={() => navigate('/admin/semesters')}>Hủy</Btn>
            {isEdit ? <Btn variant="danger" onClick={handleDelete} disabled={saving}>Xóa</Btn> : null}
            <Btn variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu học kỳ'}</Btn>
          </div>
        </section>
      )}

      {toast ? <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} /> : null}
    </AdminLayout>
  );
}
