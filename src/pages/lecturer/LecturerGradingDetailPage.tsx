import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { claimLecturerGradingSubmission, fetchLecturerGradingDetail, saveLecturerGradingDetail } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

type QuestionScore = {
  id: string;
  detailId: string;
  label: string;
  content: string;
  questionType: 'TRAC_NGHIEM' | 'TU_LUAN';
  choices: Array<{ key: string; text: string }>;
  correctAnswer: string;
  rubric: string;
  studentAnswer: string;
  autoScore: number | null;
  autoGraded: boolean;
  max: number;
  score: number;
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
      await claimLecturerGradingSubmission(id);
      const data = await fetchLecturerGradingDetail(id);
      setRecord(data);
      setRows(
        (data?.details || []).map((item: any) => ({
          id: item.questionId,
          label: item.label,
          max: item.max || 1,
          score: item.score || 0,
          detailId: item.detailId,
          content: item.content || '',
          questionType: item.questionType || 'TU_LUAN',
          choices: item.choices || [],
          correctAnswer: item.correctAnswer || '',
          rubric: item.rubric || '',
          studentAnswer: item.studentAnswer || '',
          autoScore: item.autoScore ?? null,
          autoGraded: !!item.autoGraded,
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
          questionId: row.id,
          maxScore: row.max,
          score: Number(row.score || 0),
          questionType: row.questionType,
          studentAnswer: row.studentAnswer || '',
          correctAnswer: row.correctAnswer || '',
        })),
      });
      setSaved(true);
      await load();
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
          <p className="page-subtitle">{record ? `${record.submissionName} (${record.submissionCode})` : 'Không tìm thấy bài thi'}</p>
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
            <div style={{ display: 'grid', gap: 16 }}>
              {rows.map((row) => (
                <article key={row.detailId} className="card" style={{ padding: 16, border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <strong>{row.label}</strong>
                      <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
                        {row.questionType === 'TRAC_NGHIEM' ? 'Trắc nghiệm' : 'Tự luận'} · Điểm tối đa: {row.max}
                      </div>
                    </div>
                    <div style={{ minWidth: 160 }}>
                      <label style={{ display: 'block', marginBottom: 6 }}>Điểm đạt</label>
                      <input
                        className="input"
                        type="number"
                        min={0}
                        max={row.max}
                        step={0.25}
                        value={row.questionType === 'TRAC_NGHIEM' ? row.autoScore ?? row.score : row.score}
                        onChange={(e) => updateRow(row.detailId, { score: Number(e.target.value) })}
                        disabled={row.questionType === 'TRAC_NGHIEM'}
                      />
                      {row.questionType === 'TRAC_NGHIEM' ? <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>Tự chấm theo đáp án đúng</div> : null}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>Nội dung câu hỏi</div>
                      <div>{row.content || row.id}</div>
                      {row.questionType === 'TRAC_NGHIEM' ? (
                        <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                          {row.choices.map((choice) => (
                            <li key={choice.key}>{choice.key}. {choice.text}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>

                    <div className="form-grid two">
                      <div className="field">
                        <label>Bài làm</label>
                        <div className="input" style={{ minHeight: 90, whiteSpace: 'pre-wrap' }}>{row.studentAnswer || '-'}</div>
                      </div>
                      <div className="field">
                        <label>{row.questionType === 'TRAC_NGHIEM' ? 'Đáp án đúng' : 'Rubric chấm'}</label>
                        <div className="input" style={{ minHeight: 90, whiteSpace: 'pre-wrap' }}>
                          {row.questionType === 'TRAC_NGHIEM' ? (row.correctAnswer || '-') : (row.rubric || '-')}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
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
