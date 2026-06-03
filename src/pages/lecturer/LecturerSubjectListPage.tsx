import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { deleteSubject, fetchSubjects } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

export default function LecturerSubjectListPage() {
  const lecturer = useLecturerIdentity();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setSubjects(await fetchSubjects());
    } catch (e: any) {
      setError(e.message || 'Không tải được môn học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter((subject) => [subject.code, subject.name].join(' ').toLowerCase().includes(q));
  }, [search, subjects]);

  const handleDelete = async (subject: any) => {
    if (!window.confirm(`Bạn có chắc muốn xóa môn học ${subject.code}?`)) return;
    try {
      await deleteSubject(subject.id);
      await load();
    } catch (e: any) {
      setError(e.message || 'Không xóa được môn học');
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
          <h1 className="page-title">Danh sách môn học</h1>
          <p className="page-subtitle">{loading ? 'Đang tải dữ liệu...' : `${filtered.length} môn học`}</p>
        </div>
        <div className="toolbar">
          <Link className="btn btn-primary" to="/lecturer/subjects/form">Thêm môn học</Link>
        </div>
      </header>

      {error ? (
        <PageState kind="error" title="Không tải được môn học" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : (
        <>
          <section className="card">
            <div className="field">
              <label>Tìm kiếm</label>
              <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Mã môn / tên môn" />
            </div>
          </section>

          <section className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã môn</th>
                    <th>Tên môn</th>
                    <th>Số tín chỉ</th>
                    <th>Số câu hỏi</th>
                    <th>Số đề thi</th>
                    <th>Tác vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((subject) => (
                    <tr key={subject.id}>
                      <td data-label="Mã môn">{subject.code}</td>
                      <td data-label="Tên môn">{subject.name}</td>
                      <td data-label="Số tín chỉ">{subject.credits || 0}</td>
                      <td data-label="Số câu hỏi">{subject.questionCount || 0}</td>
                      <td data-label="Số đề thi">{subject.examCount || 0}</td>
                      <td data-label="Tác vụ">
                        <div className="toolbar">
                          <Link className="btn btn-secondary" to={`/lecturer/subjects/form?id=${subject.id}`}>Sửa</Link>
                          <button
                            type="button"
                            className="btn btn-tertiary"
                            style={{ color: '#dc2626' }}
                            disabled={(subject.questionCount || 0) > 0 || (subject.examCount || 0) > 0}
                            onClick={() => void handleDelete(subject)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: '#6b7280' }}>Không có môn học phù hợp.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </RoleLayout>
  );
}
