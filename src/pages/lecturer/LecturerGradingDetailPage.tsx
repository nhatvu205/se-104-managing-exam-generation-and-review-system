import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { fetchLecturerGradingDetail, saveLecturerGradingDetail } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

type QuestionScore = {
  id: string;
  detailId: string;
  label: string;
  content: string;
  max: number;
  score: number;
  feedback: string;
};

export default function LecturerGradingDetailPage() {
  const lecturer = useLecturerIdentity();
  const { id } = useParams();
  const [record, setRecord] = useState<any | null>(null);
  const [rows, setRows] = useState<QuestionScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchLecturerGradingDetail(id);
      setRecord(data);
      setRows(
        (data?.details || []).map((item: any) => ({
          id: item.questionId,
          label: item.label,
          max: item.max || 1,
          score: item.score || 0,
          feedback: item.feedback || '',
          detailId: item.detailId,
          content: item.content || '',
        })),
      );
    } catch (e: any) {
      setError(e.message || 'Không tải được bài thi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const total = useMemo(() => rows.reduce((sum, row) => sum + Number(row.score || 0), 0), [rows]);
  const maxTotal = useMemo(() => rows.reduce((sum, row) => sum + row.max, 0), [rows]);

  const updateRow = (detailId: string, patch: Partial<QuestionScore>) => {
    setRows((prev) => prev.map((row) => (row.detailId === detailId ? { ...row, ...patch } : row)));
  };

  const onSave = async () => {
    if (!id) return;
    setSaving(true);
    setSaved(false);
    setSubmitError('');
    try {
      await saveLecturerGradingDetail({
        submissionId: id,
        rows: rows.map((row) => ({
          detailId: row.detailId,
          score: Number(row.score || 0),
          feedback: row.feedback || '',
        })),
      });
      setSaved(true);
    } catch (e: any) {
      setSubmitError(e.message || 'Không lưu được kết quả chấm');
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleLayout
      title={lecturer.title}
      roleBadge={lecturer.roleBadge}
      sidebarSubtitle="Portal giảng viên"
      navItems={withLecturerActive('/lecturer/grading')}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title">Chấm bài chi tiết</h1>
          <p className="page-subtitle">{record ? `${record.studentName} (${record.studentId})` : 'Không tìm thấy bài thi'}</p>
        </div>
        <div className="toolbar">
          <Link className="btn btn-secondary" to="/lecturer/grading">Quay lại danh sách</Link>
        </div>
      </header>

      {loading ? (
        <PageState kind="loading" title="Đang tải bài thi..." />
      ) : error ? (
        <PageState kind="error" title="Không tải được bài thi" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : !record ? (
        <section className="card">
          <div className="empty">Không tìm thấy bài thi theo mã yêu cầu.</div>
        </section>
      ) : (
        <>
          <section className="grid grid-3">
            <article className="kpi"><p className="kpi-label">Mã bài</p><p className="kpi-value">{record.id}</p></article>
            <article className="kpi"><p className="kpi-label">Đề thi</p><p className="kpi-value" style={{ fontSize: 18 }}>{record.examId}</p></article>
            <article className="kpi"><p className="kpi-label">Tổng điểm</p><p className="kpi-value">{total.toFixed(2)}/{maxTotal}</p></article>
          </section>

          <section className="card">
            <h2 className="section-title">Chấm theo câu</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Câu</th>
                    <th>Nội dung</th>
                    <th>Điểm tối đa</th>
                    <th>Điểm đạt</th>
                    <th>Nhận xét</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.detailId}>
                      <td data-label="Câu">{row.label}</td>
                      <td data-label="Nội dung">{row.content || row.id}</td>
                      <td data-label="Điểm tối đa">{row.max}</td>
                      <td data-label="Điểm đạt">
                        <input
                          className="input"
                          type="number"
                          min={0}
                          max={row.max}
                          step={0.25}
                          value={row.score}
                          onChange={(e) => updateRow(row.detailId, { score: Number(e.target.value) })}
                        />
                      </td>
                      <td data-label="Nhận xét">
                        <input className="input" value={row.feedback} onChange={(e) => updateRow(row.detailId, { feedback: e.target.value })} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {saved ? <div className="notice notice-success mt-16">Đã lưu kết quả chấm thi.</div> : null}
            {submitError ? <div className="field-error mt-16">{submitError}</div> : null}
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={onSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu kết quả'}</button>
            </div>
          </section>
        </>
      )}
    </RoleLayout>
  );
}
