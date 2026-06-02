import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminLayout, { Btn, PageState, Toast } from '../../layouts/AdminLayout';
import { deleteSubject, fetchSubjectById, saveSubject } from '../../lib/supabaseData';

export default function AdminSubjectFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get('id') || '';
  const isEdit = !!subjectId;

  const [form, setForm] = useState({
    code: '',
    name: '',
    credits: '3',
    description: '',
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<any>(null);

  useEffect(() => {
    if (!isEdit) return;
    let mounted = true;
    setLoading(true);
    fetchSubjectById(subjectId)
      .then((row) => {
        if (!mounted) return;
        if (!row) throw new Error('Không tìm thấy môn học.');
        setForm({
          code: row.code || '',
          name: row.name || '',
          credits: String(row.credits || 3),
          description: row.description || '',
        });
      })
      .catch((e: any) => mounted && setError(e.message || 'Không tải được môn học'))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [isEdit, subjectId]);

  const setField = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      setToast({ message: 'Mã môn và tên môn là bắt buộc.', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      await saveSubject({
        id: isEdit ? subjectId : undefined,
        code: form.code,
        name: form.name,
        credits: Number(form.credits || 0),
        description: form.description,
      });
      setToast({ message: isEdit ? 'Đã cập nhật môn học.' : 'Đã tạo môn học.', type: 'success' });
      setTimeout(() => navigate('/admin/subjects'), 500);
    } catch (e: any) {
      setToast({ message: e.message || 'Không lưu được môn học.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    setSaving(true);
    try {
      await deleteSubject(subjectId);
      setToast({ message: 'Đã xóa môn học.', type: 'success' });
      setTimeout(() => navigate('/admin/subjects'), 500);
    } catch (e: any) {
      setToast({ message: e.message || 'Không xóa được môn học.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeKey="subjects-list" breadcrumbs={['Dashboard', 'Môn học', isEdit ? 'Chỉnh sửa' : 'Thêm mới']}>
      <header className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Chỉnh sửa môn học' : 'Thêm môn học'}</h1>
          <p className="page-subtitle">Quản lý trực tiếp thông tin môn học thay vì chỉ xem thống kê.</p>
        </div>
      </header>

      {error ? (
        <PageState kind="error" title="Không tải được dữ liệu môn học" description={error} action={<Btn variant="secondary" onClick={() => navigate('/admin/subjects')}>Quay lại</Btn>} />
      ) : loading ? (
        <PageState kind="loading" title="Đang tải môn học..." />
      ) : (
        <section className="card" style={{ maxWidth: 860 }}>
          <div className="form-grid two">
            <div className="field">
              <label>Mã môn học</label>
              <input className="input" value={form.code} onChange={(e) => setField('code', e.target.value)} disabled={isEdit} />
            </div>
            <div className="field">
              <label>Số tín chỉ</label>
              <input className="input" type="number" min={1} value={form.credits} onChange={(e) => setField('credits', e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Tên môn học</label>
              <input className="input" value={form.name} onChange={(e) => setField('name', e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Mô tả</label>
              <textarea className="textarea" value={form.description} onChange={(e) => setField('description', e.target.value)} />
            </div>
          </div>

          <div className="actions">
            <Btn variant="secondary" onClick={() => navigate('/admin/subjects')}>Hủy</Btn>
            {isEdit ? <Btn variant="danger" onClick={handleDelete} disabled={saving}>Xóa</Btn> : null}
            <Btn variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu môn học'}</Btn>
          </div>
        </section>
      )}

      {toast ? <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} /> : null}
    </AdminLayout>
  );
}
