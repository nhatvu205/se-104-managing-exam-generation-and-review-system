import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { fetchLecturerClasses } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

export default function LecturerClassListPage() {
  const lecturer = useLecturerIdentity();
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setRows(await fetchLecturerClasses());
    } catch (e: any) {
      setError(e.message || 'Không tải được danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.code, row.name, row.subjectCode, row.subjectName, row.semesterName, row.academicYearName]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [rows, search]);

  const totalStudents = useMemo(
    () => filtered.reduce((sum, row) => sum + Number(row.studentCount || 0), 0),
    [filtered],
  );

  return (
    <RoleLayout
      title={lecturer.title}
      roleBadge={lecturer.roleBadge}
      sidebarSubtitle="Portal giảng viên"
      navItems={withLecturerActive('/lecturer/classes')}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title">Quản lý lớp học</h1>
          <p className="page-subtitle">{loading ? 'Đang tải dữ liệu...' : `${filtered.length} lớp học bạn đang phụ trách`}</p>
        </div>
      </header>

      <section className="grid grid-3">
        <article className="kpi"><p className="kpi-label">Tổng lớp học</p><p className="kpi-value">{filtered.length}</p></article>
        <article className="kpi"><p className="kpi-label">Tổng sinh viên</p><p className="kpi-value">{totalStudents}</p></article>
        <article className="kpi"><p className="kpi-label">Lớp có dữ liệu SV</p><p className="kpi-value">{filtered.filter((row) => (row.studentCount || 0) > 0).length}</p></article>
      </section>

      {error ? (
        <PageState kind="error" title="Không tải được lớp học" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : (
        <>
          <section className="card">
            <div className="field">
              <label>Tìm kiếm</label>
              <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Mã lớp / môn học / học kỳ" />
            </div>
          </section>

          <section className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã lớp</th>
                    <th>Môn học</th>
                    <th>Học kỳ</th>
                    <th>Phòng</th>
                    <th>Lịch học</th>
                    <th>Sinh viên</th>
                    <th>Tác vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id}>
                      <td data-label="Mã lớp">
                        <strong>{row.code}</strong>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>{row.name}</div>
                      </td>
                      <td data-label="Môn học">{row.subjectCode} - {row.subjectName}</td>
                      <td data-label="Học kỳ">
                        {row.semesterName || row.semesterCode}
                        <div style={{ color: '#6b7280', fontSize: 12 }}>{row.academicYearName || '-'}</div>
                      </td>
                      <td data-label="Phòng">{row.room || '-'}</td>
                      <td data-label="Lịch học">{row.schedule || '-'}</td>
                      <td data-label="Sinh viên">
                        <strong>{row.studentCount || 0}</strong>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>Chỉ tiêu: {row.plannedStudentCount || 0}</div>
                      </td>
                      <td data-label="Tác vụ">
                        <div className="toolbar">
                          <Link className="btn btn-secondary" to={`/lecturer/classes/${row.id}/students`}>Xem danh sách SV</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: '#6b7280' }}>Không có lớp học phù hợp.</td>
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
