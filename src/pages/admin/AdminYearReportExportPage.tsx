import { useEffect, useState } from 'react';
import AdminLayout, { Btn, PageState } from '../../layouts/AdminLayout';
import { fetchYearReportData } from '../../lib/supabaseData';
import { downloadCsv, downloadDoc } from '../../lib/csv';
import YearReportCharts from '../../components/YearReportCharts';

export default function AdminYearReportExportPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalExams: 0, totalSubmissions: 0, totalQuestions: 0, gradedCount: 0 });
  const [options, setOptions] = useState<any>({ academicYears: [], semesters: [], subjects: [], exams: [], classes: [] });
  const [filters, setFilters] = useState({
    academicYear: '',
    semesterCode: '',
    subjectCode: '',
    examId: '',
    classId: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (nextFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchYearReportData(nextFilters);
      setRows(data.rows);
      setSummary(data.summary);
      setOptions(data.filterOptions);
    } catch (e: any) {
      setError(e.message || 'Không tải được dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const applyFilter = (key: string, value: string) => {
    // Reset dependent filters when a parent filter changes
    let next = { ...filters, [key]: value };
    if (key === 'academicYear') next = { ...next, semesterCode: '', subjectCode: '', examId: '', classId: '' };
    else if (key === 'semesterCode') next = { ...next, subjectCode: '', examId: '', classId: '' };
    else if (key === 'subjectCode') next = { ...next, examId: '', classId: '' };
    setFilters(next);
    void load(next);
  };

  const exportCsv = () => {
    const lines = [
      'nam_hoc,hoc_ky,mon_hoc,de_thi,lop_hoc,so_cau,so_bai_thi,da_cham,dang_cham,chua_cham,diem_trung_binh',
      ...rows.map((row) =>
        [
          `"${row.academicYear || ''}"`,
          `"${row.semesterName || ''}"`,
          `${row.subjectCode}`,
          `"${String(row.title || '').replace(/"/g, '""')}"`,
          `"${String(row.classDisplay || '-').replace(/"/g, '""')}"`,
          row.questionCount,
          row.submissionCount,
          row.gradedCount,
          row.gradingCount,
          row.ungradedCount,
          row.averageScore,
        ].join(','),
      ),
    ];
    downloadCsv(`bao-cao-nam-${new Date().toISOString().slice(0, 10)}.csv`, lines.join('\n'));
  };

  const exportDoc = () => {
    const body = rows
      .map(
        (row) =>
          `<tr><td>${row.academicYear}</td><td>${row.semesterName}</td><td>${row.subjectCode} - ${row.subjectName}</td><td>${row.title}</td><td>${row.classDisplay}</td><td>${row.questionCount}</td><td>${row.submissionCount}</td><td>${row.gradedCount}</td><td>${row.gradingCount}</td><td>${row.ungradedCount}</td><td>${row.averageScore}</td></tr>`,
      )
      .join('');
    downloadDoc(
      `bao-cao-nam-${new Date().toISOString().slice(0, 10)}.doc`,
      'Báo cáo năm',
      `
        <h1>Hệ thống ra đề và chấm thi</h1>
        <h2>Báo cáo năm</h2>
        <p>Tổng đề thi: ${summary.totalExams} | Tổng bài thi: ${summary.totalSubmissions} | Tổng câu hỏi: ${summary.totalQuestions} | Đã chấm: ${summary.gradedCount}</p>
        <table>
          <thead>
            <tr>
              <th>Năm học</th><th>Học kỳ</th><th>Môn học</th><th>Đề thi</th><th>Lớp</th><th>Số câu</th><th>Số bài thi</th><th>Đã chấm</th><th>Đang chấm</th><th>Chưa chấm</th><th>Điểm TB</th>
            </tr>
          </thead>
          <tbody>${body}</tbody>
        </table>
      `,
    );
  };

  return (
    <AdminLayout activeKey="year-report-export" breadcrumbs={['Dashboard', 'Báo cáo năm']}>
      <header className="page-header">
        <div>
          <h1 className="page-title">Báo cáo năm – Xem & Xuất</h1>
          <p className="page-subtitle">{loading ? 'Đang tải dữ liệu...' : `${rows.length} dòng báo cáo`}</p>
        </div>
        <div className="toolbar">
          <button className="btn btn-primary" type="button" onClick={exportDoc}>Xuất DOC</button>
          <button className="btn btn-secondary" type="button" onClick={exportCsv}>Xuất CSV</button>
        </div>
      </header>

      {error ? (
        <PageState kind="error" title="Không tải được dữ liệu báo cáo" description={error} action={<Btn variant="secondary" onClick={() => load()}>Thử lại</Btn>} />
      ) : loading ? (
        <PageState kind="loading" title="Đang tải báo cáo" description="Hệ thống đang tổng hợp dữ liệu..." />
      ) : (
        <>
          <section className="card">
            <div className="form-grid three">
              <div className="field">
                <label>Năm học</label>
                <select className="select" value={filters.academicYear} onChange={(e) => applyFilter('academicYear', e.target.value)}>
                  <option value="">Tất cả năm học</option>
                  {options.academicYears.map((item: string) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Học kỳ</label>
                <select className="select" value={filters.semesterCode} onChange={(e) => applyFilter('semesterCode', e.target.value)}>
                  <option value="">Tất cả học kỳ</option>
                  {options.semesters.map((item: any) => <option key={item.code} value={item.code}>{item.name} - {item.academicYear}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Môn học</label>
                <select className="select" value={filters.subjectCode} onChange={(e) => applyFilter('subjectCode', e.target.value)}>
                  <option value="">Tất cả môn học</option>
                  {options.subjects.map((item: any) => <option key={item.code} value={item.code}>{item.code} - {item.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Đề thi</label>
                <select className="select" value={filters.examId} onChange={(e) => applyFilter('examId', e.target.value)}>
                  <option value="">Tất cả đề thi</option>
                  {options.exams.map((item: any) => <option key={item.id} value={item.id}>{item.id} - {item.title}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Lớp</label>
                <select className="select" value={filters.classId} onChange={(e) => applyFilter('classId', e.target.value)}>
                  <option value="">Tất cả lớp</option>
                  {options.classes.map((item: any) => <option key={item.id} value={item.id}>{item.id}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="grid grid-4">
            <article className="kpi"><p className="kpi-label">Số đề thi</p><p className="kpi-value">{summary.totalExams}</p></article>
            <article className="kpi"><p className="kpi-label">Số bài thi</p><p className="kpi-value">{summary.totalSubmissions}</p></article>
            <article className="kpi"><p className="kpi-label">Số câu hỏi</p><p className="kpi-value">{summary.totalQuestions}</p></article>
            <article className="kpi"><p className="kpi-label">Đã chấm</p><p className="kpi-value">{summary.gradedCount}</p></article>
          </section>

          <YearReportCharts rows={rows} />

          <section className="card">
            <h2 className="section-title">Chi tiết báo cáo</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Năm học</th>
                    <th>Học kỳ</th>
                    <th>Môn học</th>
                    <th>Đề thi</th>
                    <th>Lớp</th>
                    <th>Số câu</th>
                    <th>Số bài thi</th>
                    <th>Đã chấm</th>
                    <th>Đang chấm</th>
                    <th>Chưa chấm</th>
                    <th>Điểm TB</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.academicYear || '-'}</td>
                      <td>{row.semesterName || '-'}</td>
                      <td>{row.subjectCode} - {row.subjectName}</td>
                      <td>{row.title}</td>
                      <td>{row.classDisplay}</td>
                      <td>{row.questionCount}</td>
                      <td>{row.submissionCount}</td>
                      <td>{row.gradedCount}</td>
                      <td>{row.gradingCount}</td>
                      <td>{row.ungradedCount}</td>
                      <td>{row.averageScore}</td>
                    </tr>
                  ))}
                  {!rows.length ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: 'center', color: '#6b7280' }}>Không có dữ liệu phù hợp với bộ lọc hiện tại.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </AdminLayout>
  );
}
