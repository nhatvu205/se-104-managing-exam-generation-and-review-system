import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { fetchLecturerExamList } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

export default function LecturerExamListPage() {
  const lecturer = useLecturerIdentity();
  const [rows, setRows] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchLecturerExamList();
      setRows(data);
    } catch (e: any) {
      setError(e.message || 'Không tải được danh sách đề thi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((exam) => {
      const matchQuery = !q || [exam.id, exam.title, exam.subjectCode].join(' ').toLowerCase().includes(q);
      const matchStatus = !status || exam.status === status;
      return matchQuery && matchStatus;
    });
  }, [query, rows, status]);

  return (
    <RoleLayout
      title={lecturer.title}
      roleBadge={lecturer.roleBadge}
      sidebarSubtitle="Portal giảng viên"
      navItems={withLecturerActive('/lecturer/exams')}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title">Đề thi của tôi</h1>
          <p className="page-subtitle">{loading ? 'Đang tải dữ liệu...' : `${filtered.length} đề thi`}</p>
        </div>
        <div className="toolbar">
          <Link className="btn btn-primary" to="/lecturer/exams/create">Tạo đề thi</Link>
        </div>
      </header>

      {error ? (
        <PageState kind="error" title="Không tải được đề thi" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : (
        <>
          <section className="card">
            <div className="form-grid two">
              <div className="field">
                <label>Tìm kiếm</label>
                <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Mã đề / tiêu đề / môn học" />
              </div>
              <div className="field">
                <label>Trạng thái</label>
                <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Tất cả</option>
                  <option value="Đang dùng">Đang dùng</option>
                  <option value="Ngừng dùng">Ngừng dùng</option>
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
                    <th>Số câu</th>
                    <th>Thời lượng</th>
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
                      <td data-label="Số câu">{exam.questionCount}</td>
                      <td data-label="Thời lượng">{exam.durationMinutes} phút</td>
                      <td data-label="Trạng thái">
                        <span className={`badge ${String(exam.status || '').toLowerCase().includes('đang') ? 'badge-success' : 'badge-warning'}`}>{exam.status || '-'}</span>
                      </td>
                      <td data-label="Tác vụ">
                        <div className="toolbar">
                          <Link className="btn btn-secondary" to={`/lecturer/exams/${exam.id}/preview`}>Xem</Link>
                          <Link className="btn btn-tertiary" to={`/lecturer/exams/${exam.id}/export`}>In/PDF</Link>
                        </div>
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
