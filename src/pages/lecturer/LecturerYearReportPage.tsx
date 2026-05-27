import { useEffect, useMemo, useState } from 'react';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { fetchSubjects } from '../../lib/supabaseData';

export default function LecturerYearReportPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchSubjects();
      setSubjects(data);
    } catch (e: any) {
      setError(e.message || 'Không tải được báo cáo năm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const summary = useMemo(() => {
    return {
      totalExams: subjects.reduce((s, x) => s + Number(x.examCount || 0), 0),
      totalQuestions: subjects.reduce((s, x) => s + Number(x.questionCount || 0), 0),
      totalSubjects: subjects.length,
    };
  }, [subjects]);

  return (
    <RoleLayout
      title="Giảng viên: Nguyễn Văn A"
      roleBadge={<span className="badge badge-info">Bộ môn Công nghệ phần mềm</span>}
      sidebarSubtitle="Portal giảng viên"
      navItems={[
        { label: 'Dashboard', to: '/lecturer/year-report' },
        { label: 'Tổng hợp điểm lớp', to: '/lecturer/grading-summary' },
        { label: 'Quản lý phúc khảo', to: '/lecturer/regrades' },
        { label: 'Báo cáo năm', to: '/lecturer/year-report', active: true },
      ]}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title">Báo cáo năm – Xem</h1>
          <p className="page-subtitle">{loading ? 'Đang tải dữ liệu...' : `${subjects.length} môn học`}</p>
        </div>
      </header>

      {error ? (
        <PageState kind="error" title="Không tải được báo cáo" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : (
        <>
          <section className="grid grid-3">
            <article className="kpi"><p className="kpi-label">Số môn học</p><p className="kpi-value">{summary.totalSubjects}</p></article>
            <article className="kpi"><p className="kpi-label">Số đề thi</p><p className="kpi-value">{summary.totalExams}</p></article>
            <article className="kpi"><p className="kpi-label">Số câu hỏi</p><p className="kpi-value">{summary.totalQuestions}</p></article>
          </section>

          <section className="card">
            <h2 className="section-title">Chi tiết theo môn học</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Mã môn</th><th>Tên môn</th><th>Đề thi</th><th>Câu hỏi</th><th>Giảng viên</th></tr></thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.id}>
                      <td>{s.code}</td>
                      <td>{s.name}</td>
                      <td>{s.examCount}</td>
                      <td>{s.questionCount}</td>
                      <td>{s.lecturerCount}</td>
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
