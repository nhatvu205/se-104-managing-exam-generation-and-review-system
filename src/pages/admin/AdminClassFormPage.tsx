import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminLayout, { Btn, PageState, Toast } from '../../layouts/AdminLayout';
import { deleteClass, fetchClassById, fetchLecturerOptions, fetchSemesters, fetchSubjects, saveClass } from '../../lib/supabaseData';

export default function AdminClassFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('id') || '';
  const isEdit = !!classId;

  const [form, setForm] = useState({
    code: '',
    name: '',
    semesterCode: '',
    subjectCode: '',
    lecturerId: '',
    studentCount: '0',
    room: '',
    schedule: '',
  });
  const [subjects, setSubjects] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([fetchSubjects(), fetchSemesters(), fetchLecturerOptions(), isEdit ? fetchClassById(classId) : Promise.resolve(null)])
      .then(([subjectRows, semesterRows, lecturerRows, currentClass]) => {
        if (!mounted) return;
        setSubjects(subjectRows);
        setSemesters(semesterRows);
        setLecturers(lecturerRows);
        setForm((prev) => ({
          ...prev,
          subjectCode: currentClass?.subjectCode || subjectRows[0]?.code || '',
          semesterCode: currentClass?.semesterCode || semesterRows[0]?.code || '',
          lecturerId: currentClass?.lecturerId || lecturerRows[0]?.value || '',
          code: currentClass?.code || '',
          name: currentClass?.name || '',
          studentCount: String(currentClass?.studentCount || 0),
          room: currentClass?.room || '',
          schedule: currentClass?.schedule || '',
        }));
      })
      .catch((e: any) => mounted && setError(e.message || 'Không tải được dữ liệu lớp học'))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [classId, isEdit]);

  const setField = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveClass({
        id: isEdit ? classId : undefined,
        code: form.code,
        name: form.name,
        semesterCode: form.semesterCode,
        subjectCode: form.subjectCode,
        lecturerId: form.lecturerId,
        studentCount: Number(form.studentCount || 0),
        room: form.room,
        schedule: form.schedule,
      });
      setToast({ message: isEdit ? 'Đã cập nhật lớp học.' : 'Đã tạo lớp học.', type: 'success' });
      setTimeout(() => navigate('/admin/classes'), 500);
    } catch (e: any) {
      setToast({ message: e.message || 'Không lưu được lớp học.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    setSaving(true);
    try {
      await deleteClass(classId);
      setToast({ message: 'Đã xóa lớp học.', type: 'success' });
      setTimeout(() => navigate('/admin/classes'), 500);
    } catch (e: any) {
      setToast({ message: e.message || 'Không xóa được lớp học.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeKey="classes-list" breadcrumbs={['Dashboard', 'Lớp học', isEdit ? 'Chỉnh sửa' : 'Thêm mới']}>
      <header className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Chỉnh sửa lớp học' : 'Thêm lớp học'}</h1>
          <p className="page-subtitle">Bao gồm môn học, học kỳ, giảng viên, phòng học và lịch học.</p>
        </div>
      </header>

      {error ? (
        <PageState kind="error" title="Không tải được dữ liệu lớp học" description={error} action={<Btn variant="secondary" onClick={() => navigate('/admin/classes')}>Quay lại</Btn>} />
      ) : loading ? (
        <PageState kind="loading" title="Đang tải lớp học..." />
      ) : (
        <section className="card" style={{ maxWidth: 980 }}>
          <div className="form-grid two">
            <div className="field">
              <label>Mã lớp</label>
              <input className="input" value={form.code} onChange={(e) => setField('code', e.target.value)} disabled={isEdit} />
            </div>
            <div className="field">
              <label>Tên lớp</label>
              <input className="input" value={form.name} onChange={(e) => setField('name', e.target.value)} />
            </div>
            <div className="field">
              <label>Môn học</label>
              <select className="select" value={form.subjectCode} onChange={(e) => setField('subjectCode', e.target.value)}>
                {subjects.map((row) => <option key={row.code} value={row.code}>{row.code} - {row.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Học kỳ</label>
              <select className="select" value={form.semesterCode} onChange={(e) => setField('semesterCode', e.target.value)}>
                {semesters.map((row) => <option key={row.code} value={row.code}>{row.code} - {row.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Giảng viên</label>
              <select className="select" value={form.lecturerId} onChange={(e) => setField('lecturerId', e.target.value)}>
                {lecturers.map((row) => <option key={row.value} value={row.value}>{row.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Sĩ số</label>
              <input className="input" type="number" min={0} value={form.studentCount} onChange={(e) => setField('studentCount', e.target.value)} />
            </div>
            <div className="field">
              <label>Phòng học</label>
              <input className="input" value={form.room} onChange={(e) => setField('room', e.target.value)} />
            </div>
            <div className="field">
              <label>Lịch học</label>
              <input className="input" value={form.schedule} onChange={(e) => setField('schedule', e.target.value)} />
            </div>
          </div>
          <div className="actions">
            <Btn variant="secondary" onClick={() => navigate('/admin/classes')}>Hủy</Btn>
            {isEdit ? <Btn variant="danger" onClick={handleDelete} disabled={saving}>Xóa</Btn> : null}
            <Btn variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu lớp học'}</Btn>
          </div>
        </section>
      )}

      {toast ? <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} /> : null}
    </AdminLayout>
  );
}
