import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { fetchLecturerOwnedClassById, fetchSemesters, fetchSubjects, saveLecturerClass } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

export default function LecturerClassFormPage() {
  const lecturer = useLecturerIdentity();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({
    code: '',
    subjectCode: '',
    semesterCode: '',
    studentCount: '0',
    room: '',
    schedule: '',
  });
  const [subjects, setSubjects] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetchSubjects(),
      fetchSemesters(),
      isEdit && id ? fetchLecturerOwnedClassById(id) : Promise.resolve(null),
    ])
      .then(([subjectRows, semesterRows, currentClass]) => {
        if (!mounted) return;
        setSubjects(subjectRows);
        setSemesters(semesterRows);
        setForm({
          code: currentClass?.code || '',
          subjectCode: currentClass?.subjectCode || subjectRows[0]?.code || '',
          semesterCode: currentClass?.semesterCode || semesterRows[0]?.code || '',
          studentCount: String(currentClass?.plannedStudentCount ?? currentClass?.studentCount ?? 0),
          room: currentClass?.room || '',
          schedule: currentClass?.schedule || '',
        });
        if (isEdit && !currentClass) {
          throw new Error('Không tìm thấy lớp học hoặc bạn không có quyền chỉnh sửa.');
        }
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e.message || 'Không tải được dữ liệu lớp học.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await saveLecturerClass({
        id: isEdit ? id : undefined,
        code: form.code,
        subjectCode: form.subjectCode,
        semesterCode: form.semesterCode,
        studentCount: Number(form.studentCount || 0),
        room: form.room,
        schedule: form.schedule,
      });
      navigate('/lecturer/classes');
    } catch (e: any) {
      setError(e.message || 'Không lưu được lớp học.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleLayout
      title={lecturer.title}
      roleBadge={lecturer.roleBadge}
      sidebarSubtitle="Portal giảng viên"
      navItems={withLecturerActive('/lecturer/classes')}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Chỉnh sửa lớp học' : 'Thêm lớp học'}</h1>
          <p className="page-subtitle">Giảng viên có thể tự quản lý các lớp mình phụ trách.</p>
        </div>
        <div className="toolbar">
          <Link className="btn btn-secondary" to="/lecturer/classes">Quay lại danh sách</Link>
        </div>
      </header>

      {loading ? (
        <PageState kind="loading" title="Đang tải lớp học..." />
      ) : error && (isEdit || (!subjects.length && !semesters.length)) ? (
        <PageState kind="error" title="Không tải được dữ liệu lớp học" description={error} action={<Btn variant="secondary" onClick={() => navigate('/lecturer/classes')}>Quay lại</Btn>} />
      ) : (
        <section className="card" style={{ maxWidth: 920 }}>
          <div className="form-grid two">
            <div className="field">
              <label>Mã lớp</label>
              <input className="input" value={form.code} onChange={(e) => setField('code', e.target.value)} disabled={isEdit} />
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
                {semesters.map((row) => <option key={row.code} value={row.code}>{row.code} - {row.name} · {row.academicYearName}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Chỉ tiêu / sĩ số kế hoạch</label>
              <input className="input" type="number" min={0} value={form.studentCount} onChange={(e) => setField('studentCount', e.target.value)} />
            </div>
            <div className="field">
              <label>Phòng học</label>
              <input className="input" value={form.room} onChange={(e) => setField('room', e.target.value)} />
            </div>
            <div className="field">
              <label>Lịch học</label>
              <input className="input" value={form.schedule} onChange={(e) => setField('schedule', e.target.value)} placeholder="VD: Thứ 2, tiết 1-3" />
            </div>
          </div>

          {error && !isEdit ? <div className="field-error mt-16">{error}</div> : null}

          <div className="actions">
            <Btn variant="secondary" onClick={() => navigate('/lecturer/classes')}>Hủy</Btn>
            <Btn variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu lớp học'}</Btn>
          </div>
        </section>
      )}
    </RoleLayout>
  );
}
