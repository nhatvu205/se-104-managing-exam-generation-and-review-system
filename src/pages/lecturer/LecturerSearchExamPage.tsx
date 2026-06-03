import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { fetchAllExamList } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

export default function LecturerSearchExamPage() {
  const lecturer = useLecturerIdentity();
  const [rows, setRows] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAllExamList();
      setRows(data);
    } catch (e: any) {
      setError(e.message || 'Không tải được dữ liệu tra cứu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const subjectOptions = useMemo(() => {
    return Array.from(new Set(rows.map((item) => `${item.subjectCode}|${item.subjectName}`))).map((item) => {
      const [code, name] = item.split('|');
      return { code, name };
    });
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((item) => {
      const matchQuery = !q || [item.id, item.title, item.semester].join(' ').toLowerCase().includes(q);
      const matchSubject = !subjectCode || item.subjectCode === subjectCode;
      return matchQuery && matchSubject;
    });
  }, [query, rows, subjectCode]);

  return (
    <RoleLayout
      title={lecturer.title}
      roleBadge={lecturer.roleBadge}
      sidebarSubtitle="Portal giảng viên"
      navItems={withLecturerActive('/lecturer/search')}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title">Tra cứu đề thi</h1>
          <p className="page-subtitle">{loading ? 'Đang tải dữ liệu...' : `Tổng ${filtered.length} kết quả`}</p>
        </div>
      </header>

      {error ? (
        <PageState kind="error" title="Không tải được dữ liệu" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : (
        <>
          <section className="card">
            <div className="form-grid two">
              <div className="field">
                <label>Từ khóa</label>
                <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Mã đề / tiêu đề / học kỳ" />
              </div>
              <div className="field">
                <label>Môn học</label>
                <select className="select" value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)}>
                  <option value="">Tất cả</option>
                  {subjectOptions.map((subject) => (
                    <option key={subject.code} value={subject.code}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã đề</th>
                    <th>Tiêu đề</th>
                    <th>Môn</th>
                    <th>Học kỳ</th>
                    <th>Trạng thái</th>
                    <th>Tác vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((exam) => (
                    <tr key={exam.id}>
                      <td data-label="Mã đề">{exam.id}</td>
                      <td data-label="Tiêu đề">{exam.title}</td>
                      <td data-label="Môn">{exam.subjectCode}</td>
                      <td data-label="Học kỳ">{exam.semester}</td>
                      <td data-label="Trạng thái">
                        <span className={`badge ${String(exam.status || '').toLowerCase().includes('đang') ? 'badge-success' : 'badge-warning'}`}>{exam.status || '-'}</span>
                      </td>
                      <td data-label="Tác vụ">
                        <Link className="btn btn-secondary" to={`/lecturer/exams/${exam.id}/preview`}>Mở</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </RoleLayout>
  );
}
