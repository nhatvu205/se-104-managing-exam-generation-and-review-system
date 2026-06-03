import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { fetchLecturerExamPreview } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

export default function LecturerExamExportPage() {
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
      setError(e.message || 'Không tải được dữ liệu xuất đề');
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
          <h1 className="page-title">Xuất đề thi</h1>
          <p className="page-subtitle">{exam ? exam.title : 'Không tìm thấy đề thi'}</p>
        </div>
        <div className="toolbar">
          <Link className="btn btn-secondary" to={exam ? `/lecturer/exams/${exam.id}/preview` : '/lecturer/exams'}>Quay lại</Link>
          {exam ? <Link className="btn btn-secondary" to={`/lecturer/exams/${exam.id}/edit`}>Sửa đề thi</Link> : null}
        </div>
      </header>

      {loading ? (
        <PageState kind="loading" title="Đang tải dữ liệu..." />
      ) : error ? (
        <PageState kind="error" title="Không tải được dữ liệu" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : (
        <section className="card">
          {!exam ? (
          <div className="empty">Không tìm thấy đề thi để xuất.</div>
        ) : (
          <>
            <div className="form-grid two">
              <div className="field">
                <label>Tiêu đề</label>
                <input className="input" value={exam.title} readOnly />
              </div>
              <div className="field">
                <label>Môn học</label>
                <input className="input" value={`${exam.subjectCode} - ${exam.subjectName}`} readOnly />
              </div>
              <div className="field">
                <label>Trạng thái</label>
                <input className="input" value={exam.status || '-'} readOnly />
              </div>
            </div>

            <div className="table-wrap mt-16">
              <table>
                <thead>
                  <tr>
                    <th>Thứ tự</th>
                    <th>Nội dung</th>
                    <th>Loại</th>
                    <th>Đáp án / rubric</th>
                  </tr>
                </thead>
                <tbody>
                  {(exam.questions || []).map((question: any) => (
                    <tr key={question.id}>
                      <td>{question.order}</td>
                      <td>{question.content}</td>
                      <td>{question.questionType === 'TRAC_NGHIEM' ? 'Trắc nghiệm' : 'Tự luận'}</td>
                      <td>{question.questionType === 'TRAC_NGHIEM' ? (question.correctAnswer || '-') : (question.rubric || '-')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="actions">
              <button className="btn btn-primary" type="button" onClick={() => window.print()}>
                In đề thi
              </button>
            </div>
          </>
          )}
        </section>
      )}
    </RoleLayout>
  );
}
