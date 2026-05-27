import { useEffect, useMemo, useState } from 'react';
import AdminLayout, { Btn, PageState } from '../../layouts/AdminLayout';
import { fetchSubjects } from '../../lib/supabaseData';

export default function AdminYearReportExportPage() {
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
      setError(e.message || 'Không tải được dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const summary = useMemo(() => {
    const totalExams = subjects.reduce((s, x) => s + Number(x.examCount || 0), 0);
    const totalQuestions = subjects.reduce((s, x) => s + Number(x.questionCount || 0), 0);
    return { totalExams, totalQuestions };
  }, [subjects]);

  return (
    <AdminLayout activeKey="year-report-export" breadcrumbs={['Dashboard', 'Báo cáo năm']}>
      <header className="page-header">
        <div>
          <h1 className="page-title">Báo cáo năm – Xem & Xuất</h1>
          <p className="page-subtitle">{loading ? 'Đang tải dữ liệu...' : `${subjects.length} môn học`}</p>
        </div>
        <div className="toolbar">
          <button className="btn btn-primary" type="button">Xuất PDF</button>
          <button className="btn btn-secondary" type="button">Xuất CSV</button>
        </div>
      </header>

      {error ? (
        <PageState kind="error" title="Không tải được dữ liệu báo cáo" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : loading ? (
        <PageState kind="loading" title="Đang tải báo cáo" description="Hệ thống đang tổng hợp dữ liệu..." />
      ) : (
        <>
          <section className="grid grid-3">
            <article className="kpi"><p className="kpi-label">Tổng môn học</p><p className="kpi-value">{subjects.length}</p></article>
            <article className="kpi"><p className="kpi-label">Tổng đề thi</p><p className="kpi-value">{summary.totalExams}</p></article>
            <article className="kpi"><p className="kpi-label">Tổng câu hỏi</p><p className="kpi-value">{summary.totalQuestions}</p></article>
          </section>

          <section className="card">
            <h2 className="section-title">Chi tiết theo môn học</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Mã môn</th><th>Tên môn</th><th>Số câu hỏi</th><th>Số đề thi</th><th>Số GV phụ trách</th></tr></thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.id}>
                      <td>{s.code}</td>
                      <td>{s.name}</td>
                      <td>{s.questionCount}</td>
                      <td>{s.examCount}</td>
                      <td>{s.lecturerCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </AdminLayout>
  );
}
