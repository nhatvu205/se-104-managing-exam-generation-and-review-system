import { useEffect, useMemo, useState } from 'react';
import AdminLayout, { Btn, PageState } from '../../layouts/AdminLayout';
import { fetchSubjects } from '../../lib/supabaseData';
import { downloadCsv } from '../../lib/csv';

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

  const exportCsv = () => {
    const lines = [
      'ma_mon,ten_mon,so_cau_hoi,so_de_thi,so_giang_vien_phu_trach',
      ...subjects.map((s) => [s.code, `"${String(s.name || '').replace(/"/g, '""')}"`, s.questionCount, s.examCount, s.lecturerCount].join(',')),
    ];
    downloadCsv(`bao-cao-nam-${new Date().toISOString().slice(0, 10)}.csv`, lines.join('\n'));
  };

  const exportPdf = () => {
    const win = window.open('', '_blank', 'width=1024,height=768');
    if (!win) return;
    const rows = subjects
      .map(
        (s) =>
          `<tr><td>${s.code}</td><td>${s.name}</td><td>${s.questionCount}</td><td>${s.examCount}</td><td>${s.lecturerCount}</td></tr>`,
      )
      .join('');
    win.document.write(`
      <html>
        <head>
          <title>Báo cáo năm</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Hệ thống ra đề và chấm thi</h1>
          <h2>Báo cáo năm</h2>
          <p>Tổng môn học: ${subjects.length} | Tổng đề thi: ${summary.totalExams} | Tổng câu hỏi: ${summary.totalQuestions}</p>
          <table>
            <thead><tr><th>Mã môn</th><th>Tên môn</th><th>Số câu hỏi</th><th>Số đề thi</th><th>Số GV phụ trách</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <AdminLayout activeKey="year-report-export" breadcrumbs={['Dashboard', 'Báo cáo năm']}>
      <header className="page-header">
        <div>
          <h1 className="page-title">Báo cáo năm – Xem & Xuất</h1>
          <p className="page-subtitle">{loading ? 'Đang tải dữ liệu...' : `${subjects.length} môn học`}</p>
        </div>
        <div className="toolbar">
          <button className="btn btn-primary" type="button" onClick={exportPdf}>Xuất PDF</button>
          <button className="btn btn-secondary" type="button" onClick={exportCsv}>Xuất CSV</button>
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
