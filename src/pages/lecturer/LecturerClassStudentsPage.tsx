import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { fetchLecturerClassStudents } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

export default function LecturerClassStudentsPage() {
  const lecturer = useLecturerIdentity();
  const { id } = useParams();
  const [classInfo, setClassInfo] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchLecturerClassStudents(id);
      setClassInfo(data.classInfo);
      setStudents(data.students);
    } catch (e: any) {
      setError(e.message || 'Không tải được danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((student) =>
      [student.studentId, student.fullName, student.email, student.phone].join(' ').toLowerCase().includes(q),
    );
  }, [students, search]);

  return (
    <RoleLayout
      title={lecturer.title}
      roleBadge={lecturer.roleBadge}
      sidebarSubtitle="Portal giảng viên"
      navItems={withLecturerActive('/lecturer/classes')}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title">Danh sách sinh viên lớp học</h1>
          <p className="page-subtitle">
            {classInfo ? `${classInfo.code} · ${classInfo.subjectCode} - ${classInfo.subjectName}` : 'Không tìm thấy lớp học'}
          </p>
        </div>
        <div className="toolbar">
          <Link className="btn btn-secondary" to="/lecturer/classes">Quay lại lớp học</Link>
        </div>
      </header>

      {error ? (
        <PageState kind="error" title="Không tải được danh sách sinh viên" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : loading ? (
        <PageState kind="loading" title="Đang tải danh sách sinh viên..." />
      ) : !classInfo ? (
        <PageState kind="empty" title="Không tìm thấy lớp học" description="Lớp học không tồn tại hoặc bạn không có quyền xem." />
      ) : (
        <>
          <section className="grid grid-3">
            <article className="kpi"><p className="kpi-label">Mã lớp</p><p className="kpi-value">{classInfo.code}</p></article>
            <article className="kpi"><p className="kpi-label">Sinh viên hiện có</p><p className="kpi-value">{classInfo.studentCount}</p></article>
            <article className="kpi"><p className="kpi-label">Chỉ tiêu</p><p className="kpi-value">{classInfo.plannedStudentCount}</p></article>
          </section>

          <section className="card">
            <div className="form-grid two">
              <div className="field">
                <label>Tìm kiếm sinh viên</label>
                <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Mã SV / họ tên / email / SĐT" />
              </div>
              <div className="field">
                <label>Thông tin lớp học</label>
                <div className="input" style={{ minHeight: 42 }}>
                  {classInfo.semesterName || classInfo.semesterCode} · {classInfo.academicYearName || '-'} · {classInfo.room || 'Chưa có phòng'} · {classInfo.schedule || 'Chưa có lịch'}
                </div>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã sinh viên</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Ngày sinh</th>
                    <th>Ngày tham gia</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student) => (
                    <tr key={student.id}>
                      <td data-label="Mã sinh viên">{student.studentId}</td>
                      <td data-label="Họ tên">{student.fullName}</td>
                      <td data-label="Email">{student.email || '-'}</td>
                      <td data-label="Số điện thoại">{student.phone || '-'}</td>
                      <td data-label="Ngày sinh">{student.dateOfBirth || '-'}</td>
                      <td data-label="Ngày tham gia">{student.joinedAt || '-'}</td>
                      <td data-label="Trạng thái">
                        <span className={`badge ${student.status === 'active' ? 'badge-success' : student.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                          {student.status === 'active' ? 'Đang học' : student.status === 'pending' ? 'Chờ xác nhận' : 'Ngừng học'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: '#6b7280' }}>Không có sinh viên phù hợp trong lớp học này.</td>
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
