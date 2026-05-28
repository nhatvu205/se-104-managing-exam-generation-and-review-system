import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { fetchLecturerQuestionBank, fetchSemesters, fetchSubjects, saveLecturerExam } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

export default function LecturerExamBuilderPage() {
  const lecturer = useLecturerIdentity();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [questionBank, setQuestionBank] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [semesterCode, setSemesterCode] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [subjectData, semesterData, questionData] = await Promise.all([fetchSubjects(), fetchSemesters(), fetchLecturerQuestionBank()]);
      setSubjects(subjectData);
      setSemesters(semesterData);
      setQuestionBank(questionData);
      if (subjectData[0]?.code) setSubjectCode(subjectData[0].code);
      if (semesterData[0]?.code) setSemesterCode(semesterData[0].code);
    } catch (e: any) {
      setError(e.message || 'Không tải được dữ liệu tạo đề');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const availableQuestions = useMemo(() => questionBank.filter((q) => q.subjectCode === subjectCode), [questionBank, subjectCode]);

  const onToggleQuestion = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setSubmitError('');
    saveLecturerExam({
      title,
      subjectCode,
      semesterCode,
      durationMinutes,
      questionIds: selectedIds,
    })
      .then(() => {
        setSaved(true);
        setTitle('');
        setSelectedIds([]);
      })
      .catch((e: any) => setSubmitError(e.message || 'Không tạo được đề thi'))
      .finally(() => setSaving(false));
  };

  return (
    <RoleLayout
      title={lecturer.title}
      roleBadge={lecturer.roleBadge}
      sidebarSubtitle="Portal giảng viên"
      navItems={withLecturerActive('/lecturer/exams/create')}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title">Tạo đề thi</h1>
          <p className="page-subtitle">Thiết lập thông tin đề và chọn câu hỏi.</p>
        </div>
        <div className="toolbar">
          <Link className="btn btn-secondary" to="/lecturer/exams">Quay lại danh sách đề</Link>
        </div>
      </header>

      {loading ? (
        <PageState kind="loading" title="Đang tải biểu mẫu..." />
      ) : error ? (
        <PageState kind="error" title="Không tải được dữ liệu" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : (
        <form className="card" onSubmit={onSubmit}>
          <div className="form-grid two">
            <div className="field">
              <label>Tiêu đề đề thi</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="field">
              <label>Môn học</label>
              <select className="select" value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)} required>
                {subjects.map((subject) => (
                  <option key={subject.code} value={subject.code}>
                    {subject.code} - {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid two mt-16">
            <div className="field">
              <label>Học kỳ</label>
              <select className="select" value={semesterCode} onChange={(e) => setSemesterCode(e.target.value)} required>
                {semesters.map((semester) => (
                  <option key={semester.code} value={semester.code}>
                    {semester.name} - {semester.academicYearName}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Thời lượng (phút)</label>
              <input
                className="input"
                type="number"
                min={15}
                step={5}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="field mt-16">
            <label>Số câu đã chọn</label>
            <input className="input" value={`${selectedIds.length} câu`} readOnly />
          </div>

          <div className="table-wrap mt-16">
            <table>
              <thead>
                <tr>
                  <th>Chọn</th>
                  <th>Mã câu hỏi</th>
                  <th>Nội dung</th>
                  <th>Độ khó</th>
                </tr>
              </thead>
              <tbody>
                {availableQuestions.map((question) => (
                  <tr key={question.id}>
                    <td data-label="Chọn">
                      <input type="checkbox" checked={selectedIds.includes(question.id)} onChange={() => onToggleQuestion(question.id)} />
                    </td>
                    <td data-label="Mã">{question.code}</td>
                    <td data-label="Nội dung">{question.content}</td>
                    <td data-label="Độ khó">{question.difficulty || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {saved ? <div className="notice notice-success mt-16">Đã lưu đề thi thành công.</div> : null}
          {submitError ? <div className="field-error mt-16">{submitError}</div> : null}

          <div className="actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu đề thi'}</button>
            <Link className="btn btn-secondary" to="/lecturer/exams">Hủy</Link>
          </div>
        </form>
      )}
    </RoleLayout>
  );
}
