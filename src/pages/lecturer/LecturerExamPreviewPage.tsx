import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { fetchLecturerExamPreview } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

export default function LecturerExamPreviewPage() {
  const lecturer = useLecturerIdentity();
  const { id } = useParams();
  const [exam, setExam] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchLecturerExamPreview(id);
      setExam(data);
    } catch (e: any) {
      setError(e.message || 'Không tải được đề thi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  return (
    <RoleLayout
      title={lecturer.title}
      roleBadge={lecturer.roleBadge}
      sidebarSubtitle="Portal giảng viên"
      navItems={withLecturerActive('/lecturer/exams')}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title">Xem trước đề thi</h1>
          <p className="page-subtitle">{exam ? exam.title : 'Không tìm thấy đề thi'}</p>
        </div>
        <div className="toolbar">
          <Link className="btn btn-secondary" to="/lecturer/exams">Quay lại</Link>
          {exam ? <Link className="btn btn-secondary" to={`/lecturer/exams/${exam.id}/edit`}>Sửa đề thi</Link> : null}
          {exam ? <Link className="btn btn-primary" to={`/lecturer/exams/${exam.id}/export`}>Xuất DOC</Link> : null}
        </div>
      </header>

      {loading ? (
        <PageState kind="loading" title="Đang tải đề thi..." />
      ) : error ? (
        <PageState kind="error" title="Không tải được đề thi" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : !exam ? (
        <section className="card">
          <div className="empty">Không tìm thấy đề thi theo mã yêu cầu.</div>
        </section>
      ) : (
        <>
          <section className="grid grid-3">
            <article className="kpi"><p className="kpi-label">Mã đề</p><p className="kpi-value">{exam.id}</p></article>
            <article className="kpi"><p className="kpi-label">Thời lượng</p><p className="kpi-value">{exam.durationMinutes} phút</p></article>
            <article className="kpi"><p className="kpi-label">Số câu</p><p className="kpi-value">{exam.questionCount}</p></article>
            <article className="kpi"><p className="kpi-label">Trạng thái</p><p className="kpi-value" style={{ fontSize: 18 }}>{exam.status}</p></article>
          </section>

          <section className="card">
            <h2 className="section-title">Danh sách câu hỏi mẫu</h2>
            <ol style={{ paddingLeft: 20, margin: 0, display: 'grid', gap: 16 }}>
              {(exam.questions || []).map((question: any) => (
                <li key={question.id}>
                  <strong>Câu {question.order}:</strong> {question.content}
                  <div style={{ marginTop: 6, color: '#4b5563', fontSize: 14 }}>
                    Loại: {question.questionType === 'TRAC_NGHIEM' ? 'Trắc nghiệm' : 'Tự luận'} · Điểm tối đa: {question.maxScore}
                  </div>
                  {question.questionType === 'TRAC_NGHIEM' ? (
                    <>
                      <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                        {(question.choices || []).map((choice: any) => (
                          <li key={choice.key}>{choice.key}. {choice.text}</li>
                        ))}
                      </ul>
                      <div style={{ marginTop: 6 }}><strong>Đáp án đúng:</strong> {question.correctAnswer || '-'}</div>
                    </>
                  ) : (
                    <div style={{ marginTop: 6 }}><strong>Rubric:</strong> {question.rubric || question.guide || '-'}</div>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </RoleLayout>
  );
}
