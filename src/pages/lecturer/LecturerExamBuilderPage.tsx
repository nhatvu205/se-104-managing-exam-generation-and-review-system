import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { downloadCsv, parseCsv, readCsvFile } from '../../lib/csv';
import { EXAM_STATUS_OPTIONS, fetchLecturerExamById, fetchLecturerQuestionBank, fetchSemesters, fetchSubjects, saveLecturerExam } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

export default function LecturerExamBuilderPage() {
  const lecturer = useLecturerIdentity();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [subjects, setSubjects] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [questionBank, setQuestionBank] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [semesterCode, setSemesterCode] = useState('');
  const [status, setStatus] = useState('Đang dùng');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [subjectData, semesterData, questionData, currentExam] = await Promise.all([
        fetchSubjects(),
        fetchSemesters(),
        fetchLecturerQuestionBank(),
        id ? fetchLecturerExamById(id) : Promise.resolve(null),
      ]);
      setSubjects(subjectData);
      setSemesters(semesterData);
      setQuestionBank(questionData);
      if (currentExam) {
        setTitle(currentExam.title || '');
        setSubjectCode(currentExam.subjectCode || subjectData[0]?.code || '');
        setSemesterCode(currentExam.semesterCode || semesterData[0]?.code || '');
        setDurationMinutes(Number(currentExam.durationMinutes || 60));
        setSelectedIds(currentExam.questionIds || []);
        setStatus(currentExam.status || 'Đang dùng');
      } else {
        if (subjectData[0]?.code) setSubjectCode(subjectData[0].code);
        if (semesterData[0]?.code) setSemesterCode(semesterData[0].code);
      }
    } catch (e: any) {
      setError(e.message || 'Không tải được dữ liệu tạo đề');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

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
        status,
        id,
      })
      .then(() => {
        setSaved(true);
        if (isEdit) {
          navigate('/lecturer/exams');
          return;
        }
        setTitle('');
        setSelectedIds([]);
        setStatus('Đang dùng');
      })
      .catch((e: any) => setSubmitError(e.message || 'Không tạo được đề thi'))
      .finally(() => setSaving(false));
  };

  const importExams = async (file: File) => {
    const text = await readCsvFile(file);
    const { data } = parseCsv(text);
    for (const row of data) {
      if (!row.title || !row.subject_code || !row.semester_code || !row.question_ids) continue;
      await saveLecturerExam({
        title: row.title,
        subjectCode: row.subject_code,
        semesterCode: row.semester_code,
        durationMinutes: Number(row.duration_minutes || 60),
        questionIds: row.question_ids.split(';').map((item) => item.trim()).filter(Boolean),
        status: row.status || 'Đang dùng',
      });
    }
    setImportMessage(`Đã import ${data.length} đề thi từ CSV.`);
  };

  const onUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setImportMessage('');
    setSubmitError('');
    try {
      await importExams(file);
    } catch (e: any) {
      setSubmitError(e.message || 'Import đề thi thất bại.');
    } finally {
      setSaving(false);
      event.target.value = '';
    }
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
          <h1 className="page-title">{isEdit ? 'Sửa đề thi' : 'Tạo đề thi'}</h1>
          <p className="page-subtitle">{isEdit ? 'Cập nhật cấu hình đề thi, trạng thái và danh sách câu hỏi.' : 'Thiết lập thông tin đề và chọn câu hỏi.'}</p>
        </div>
        <div className="toolbar">
          <Link className="btn btn-secondary" to="/lecturer/exams">Quay lại danh sách đề</Link>
          <button
            type="button"
            className="btn btn-tertiary"
            onClick={() =>
              downloadCsv(
                'template-exams.csv',
                'title,subject_code,semester_code,duration_minutes,question_ids,status\n"Đề giữa kỳ SE104 có dấu tiếng Việt",SE104,HK1_2026_2027,60,CH00001;CH00002;CH00003,Đang dùng\n',
              )
            }
          >
            Tải template đề thi
          </button>
        </div>
      </header>

      {loading ? (
        <PageState kind="loading" title="Đang tải biểu mẫu..." />
      ) : error ? (
        <PageState kind="error" title="Không tải được dữ liệu" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : (
        <>
          <form className="card" onSubmit={onSubmit}>
            <div className="form-grid two">
              <div className="field">
                <label>Tiêu đề đề thi</label>
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="field">
                <label>Môn học</label>
                <select
                  className="select"
                  value={subjectCode}
                  onChange={(e) => {
                    const nextSubject = e.target.value;
                    setSubjectCode(nextSubject);
                    setSelectedIds((prev) => prev.filter((questionId) => questionBank.some((item) => item.id === questionId && item.subjectCode === nextSubject)));
                  }}
                  required
                >
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
              <div className="field">
                <label>Trạng thái</label>
                <select className="select" value={status} onChange={(e) => setStatus(e.target.value)} required>
                  {EXAM_STATUS_OPTIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
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
                    <th>Loại</th>
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
                      <td data-label="Loại">{question.questionType === 'TRAC_NGHIEM' ? 'Trắc nghiệm' : 'Tự luận'}</td>
                      <td data-label="Độ khó">{question.difficulty || '-'}</td>
                    </tr>
                  ))}
                  {!availableQuestions.length ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#6b7280' }}>
                        Chưa có câu hỏi nào cho môn học đang chọn. Hãy đổi môn học hoặc tạo câu hỏi trước.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {saved ? <div className="notice notice-success mt-16">Đã lưu đề thi thành công.</div> : null}
            {submitError ? <div className="field-error mt-16">{submitError}</div> : null}
            {importMessage ? <div className="notice notice-success mt-16">{importMessage}</div> : null}

            <div className="actions">
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Đang lưu...' : isEdit ? 'Cập nhật đề thi' : 'Lưu đề thi'}</button>
              <Link className="btn btn-secondary" to="/lecturer/exams">Hủy</Link>
            </div>
          </form>

          <section className="card">
            <h2 className="section-title">Import đề thi từ CSV</h2>
            <div className="field">
              <label>File CSV</label>
              <input className="input" type="file" accept=".csv,text/csv" onChange={onUpload} />
            </div>
            <p className="field-help">Mỗi dòng là 1 đề thi. Cột `question_ids` dùng dấu `;` để ngăn cách danh sách mã câu hỏi.</p>
          </section>
        </>
      )}
    </RoleLayout>
  );
}
