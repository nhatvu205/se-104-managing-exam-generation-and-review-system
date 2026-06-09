import { type ChangeEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { downloadCsv, parseCsv, readCsvFile } from '../../lib/csv';
import { fetchSubjectById, saveSubject } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

export default function LecturerSubjectFormPage() {
  const lecturer = useLecturerIdentity();
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
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    let mounted = true;
    void fetchSubjectById(subjectId)
      .then((subject) => {
        if (!mounted) return;
        if (!subject) throw new Error('Không tìm thấy môn học.');
        setForm({
          code: subject.code || '',
          name: subject.name || '',
          credits: String(subject.credits || 3),
          description: subject.description || '',
        });
      })
      .catch((e: any) => mounted && setError(e.message || 'Không tải được môn học'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [isEdit, subjectId]);

  const importSubjects = async (file: File) => {
    const text = await readCsvFile(file);
    const { data } = parseCsv(text);
    let successCount = 0;
    for (const row of data) {
      if (!row.code || !row.name) continue;
      await saveSubject({
        code: row.code,
        name: row.name,
        credits: Number(row.credits || 3),
        description: row.description || '',
      });
      successCount += 1;
    }
    setMessage(`Đã import ${successCount} môn học từ CSV.`);
  };

  const onUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await importSubjects(file);
    } catch (e: any) {
      setError(e.message || 'Import môn học thất bại.');
    } finally {
      setSaving(false);
      event.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      setError('Mã môn và tên môn là bắt buộc.');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await saveSubject({
        id: isEdit ? subjectId : undefined,
        code: form.code,
        name: form.name,
        credits: Number(form.credits || 3),
        description: form.description,
      });
      navigate('/lecturer/subjects');
    } catch (e: any) {
      setError(e.message || 'Không lưu được môn học.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleLayout
      title={lecturer.title}
      roleBadge={lecturer.roleBadge}
      sidebarSubtitle="Portal giảng viên"
      navItems={withLecturerActive('/lecturer/subjects')}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Sửa môn học' : 'Thêm môn học'}</h1>
          <p className="page-subtitle">Quản lý môn học dùng chung cho việc tạo câu hỏi, đề thi và chấm thi.</p>
        </div>
        <div className="toolbar">
          <Link className="btn btn-secondary" to="/lecturer/subjects">Quay lại danh sách</Link>
          {!isEdit ? (
            <button
              type="button"
              className="btn btn-tertiary"
              onClick={() =>
                downloadCsv(
                  'template-subjects.csv',
                  'code,name,credits,description\nSE500,"Chuyên đề kiểm thử nâng cao",3,"Mô tả môn học có dấu tiếng Việt"\n',
                )
              }
            >
              Tải template môn học
            </button>
          ) : null}
        </div>
      </header>

      {loading ? (
        <PageState kind="loading" title="Đang tải môn học..." />
      ) : error && isEdit ? (
        <PageState kind="error" title="Không tải được môn học" description={error} action={<Btn variant="secondary" onClick={() => navigate('/lecturer/subjects')}>Quay lại</Btn>} />
      ) : (
        <>
          <section className="card" style={{ maxWidth: 860 }}>
            <div className="form-grid two">
              <div className="field">
                <label>Mã môn học</label>
                <input className="input" value={form.code} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))} disabled={isEdit} />
              </div>
              <div className="field">
                <label>Số tín chỉ</label>
                <input className="input" type="number" min={1} value={form.credits} onChange={(e) => setForm((prev) => ({ ...prev, credits: e.target.value }))} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>Tên môn học</label>
                <input className="input" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>Mô tả</label>
                <textarea className="textarea" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
              </div>
            </div>
            {error && !isEdit ? <div className="field-error mt-16">{error}</div> : null}
            {message ? <div className="notice notice-success mt-16">{message}</div> : null}
            <div className="actions">
              <Btn variant="secondary" onClick={() => navigate('/lecturer/subjects')}>Hủy</Btn>
              <Btn variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu môn học'}</Btn>
            </div>
          </section>

          {!isEdit ? (
            <section className="card">
              <h2 className="section-title">Import môn học từ CSV</h2>
              <div className="field">
                <label>File CSV</label>
                <input className="input" type="file" accept=".csv,text/csv" onChange={onUpload} />
              </div>
            </section>
          ) : null}
        </>
      )}
    </RoleLayout>
  );
}
