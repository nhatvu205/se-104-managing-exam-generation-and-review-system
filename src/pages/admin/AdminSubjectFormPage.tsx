import { useEffect, useState } from 'react';
import AdminLayout, { Btn, PageState } from '../../layouts/AdminLayout';
import { fetchSubjects } from '../../lib/supabaseData';

export default function AdminSubjectFormPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchSubjects();
      setSubjects(data);
      if (data[0]) setSelected(data[0].id);
    } catch (e: any) {
      setError(e.message || 'Không tải được môn học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const current = subjects.find((s) => String(s.id) === String(selected));

  return (
    <AdminLayout activeKey="subjects-list" breadcrumbs={['Dashboard', 'Môn học', 'Thêm/Sửa']}>
      <header className="page-header">
        <div>
          <h1 className="page-title">Quản lý Môn học – Thêm/Sửa</h1>
          <p className="page-subtitle">Thêm và cập nhật thông tin môn học.</p>
        </div>
      </header>

      {error ? (
        <PageState kind="error" title="Không tải được dữ liệu môn học" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : loading ? (
        <PageState kind="loading" title="Đang tải môn học" description="Vui lòng chờ trong giây lát..." />
      ) : (
        <>
          <section className="card">
            <div className="form-grid two">
              <div className="field">
                <label htmlFor="subject-select">Chọn môn học</label>
                <select id="subject-select" className="select" value={selected} onChange={(e) => setSelected(e.target.value)}>
                  {subjects.map((s) => <option value={s.id} key={s.id}>{s.code} - {s.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Mã môn</label>
                <input className="input" value={current?.code || ''} readOnly />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>Tên môn học</label>
                <input className="input" value={current?.name || ''} readOnly />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>Mô tả</label>
                <textarea className="textarea" value={current?.description || ''} readOnly />
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="section-title">Thống kê môn học</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Số câu hỏi</th><th>Số đề thi</th><th>Số giảng viên</th></tr></thead>
                <tbody>
                  <tr>
                    <td>{current?.questionCount ?? 0}</td>
                    <td>{current?.examCount ?? 0}</td>
                    <td>{current?.lecturerCount ?? 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </AdminLayout>
  );
}
