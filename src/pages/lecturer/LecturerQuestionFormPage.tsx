import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { downloadCsv, parseCsv, readCsvFile } from '../../lib/csv';
import { fetchDifficultyLevels, fetchLecturerQuestionById, fetchSubjects, QUESTION_KIND_OPTIONS, saveLecturerQuestion } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

export default function LecturerQuestionFormPage() {
  const lecturer = useLecturerIdentity();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [subjects, setSubjects] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [subjectCode, setSubjectCode] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [questionType, setQuestionType] = useState<'TRAC_NGHIEM' | 'TU_LUAN'>('TU_LUAN');
  const [content, setContent] = useState('');
  const [choices, setChoices] = useState([
    { key: 'A', text: '' },
    { key: 'B', text: '' },
    { key: 'C', text: '' },
    { key: 'D', text: '' },
  ]);
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [rubric, setRubric] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  const load = async () => {
    if (isEdit && !lecturer.userId) return;
    setLoading(true);
    setError('');
    try {
      const [subjectData, levelData, currentQuestion] = await Promise.all([
        fetchSubjects(),
        fetchDifficultyLevels(),
        id ? fetchLecturerQuestionById(id) : Promise.resolve(null),
      ]);
      setSubjects(subjectData);
      setLevels(levelData);
      if (currentQuestion) {
        if (lecturer.userId && currentQuestion.authorId !== lecturer.userId) {
          throw new Error('Bạn chỉ có thể sửa câu hỏi do chính mình tạo.');
        }
        setSubjectCode(currentQuestion.subjectCode || subjectData[0]?.code || '');
        setDifficulty(currentQuestion.difficultyCode || levelData[0]?.code || '');
        setQuestionType(currentQuestion.questionType || 'TU_LUAN');
        setContent(currentQuestion.content || '');
        setRubric(currentQuestion.rubric || '');
        setChoices(
          currentQuestion.choices?.length
            ? currentQuestion.choices
            : [
                { key: 'A', text: '' },
                { key: 'B', text: '' },
                { key: 'C', text: '' },
                { key: 'D', text: '' },
              ],
        );
        setCorrectAnswer(currentQuestion.correctAnswer || 'A');
      } else if (subjectData[0]?.code) setSubjectCode(subjectData[0].code);
      if (!currentQuestion && levelData[0]?.code) setDifficulty(levelData[0].code);
    } catch (e: any) {
      setError(e.message || 'Không tải được dữ liệu biểu mẫu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id, lecturer.userId]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setSubmitError('');
    Promise.resolve()
      .then(async () => {
        await saveLecturerQuestion({
          id,
          subjectCode,
          levelCode: difficulty,
          content,
          questionType,
          choices,
          correctAnswer,
          rubric,
        });
      })
      .then(() => {
        setSaved(true);
        if (isEdit) {
          navigate('/lecturer/questions');
          return;
        }
        setContent('');
        setRubric('');
        setChoices([
          { key: 'A', text: '' },
          { key: 'B', text: '' },
          { key: 'C', text: '' },
          { key: 'D', text: '' },
        ]);
        setCorrectAnswer('A');
      })
      .catch((e: any) => setSubmitError(e.message || 'Không lưu được câu hỏi'))
      .finally(() => setSaving(false));
  };

  const importQuestions = async (file: File) => {
    const text = await readCsvFile(file);
    const { data } = parseCsv(text);
    for (const row of data) {
      if (!row.subject_code || !row.level_code || !row.content) continue;
      await saveLecturerQuestion({
        subjectCode: row.subject_code,
        levelCode: row.level_code,
        content: row.content,
        answer: row.answer,
        questionType: String(row.question_type || '').trim().toUpperCase() === 'TRAC_NGHIEM' ? 'TRAC_NGHIEM' : 'TU_LUAN',
        choices: [
          { key: 'A', text: row.option_a || '' },
          { key: 'B', text: row.option_b || '' },
          { key: 'C', text: row.option_c || '' },
          { key: 'D', text: row.option_d || '' },
        ].filter((item) => item.text),
        correctAnswer: row.correct_answer || '',
        rubric: row.rubric || row.answer || '',
        status: row.status || 'Đang dùng',
      });
    }
    setImportMessage(`Đã import ${data.length} câu hỏi từ CSV.`);
  };

  const onUpload =
    (handler: (file: File) => Promise<void>) =>
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setSaving(true);
      setImportMessage('');
      setSubmitError('');
      try {
        await handler(file);
      } catch (e: any) {
        setSubmitError(e.message || 'Import CSV thất bại.');
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
      navItems={withLecturerActive('/lecturer/questions/create')}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Sửa câu hỏi' : 'Tạo câu hỏi'}</h1>
          <p className="page-subtitle">{isEdit ? 'Cập nhật lại nội dung, loại câu hỏi và rubric/đáp án.' : 'Màn hình này chỉ dùng để tạo mới câu hỏi (khác với trang Ngân hàng câu hỏi dùng để tra cứu).'}</p>
        </div>
        <div className="toolbar">
          <Link className="btn btn-secondary" to="/lecturer/questions">Quay lại ngân hàng</Link>
          <button
            type="button"
            className="btn btn-tertiary"
            onClick={() =>
              downloadCsv(
                'template-questions.csv',
                'subject_code,level_code,question_type,content,option_a,option_b,option_c,option_d,correct_answer,rubric,answer,status\nSE104,NB,TRAC_NGHIEM,"Câu hỏi trắc nghiệm có dấu tiếng Việt","Lựa chọn A","Lựa chọn B","Lựa chọn C","Lựa chọn D",A,,"A","Đang dùng"\nSE104,VD,TU_LUAN,"Câu hỏi tự luận có dấu tiếng Việt",,,,,,"Rubric chấm chi tiết","Rubric chấm chi tiết","Đang dùng"\n',
              )
            }
          >
            Tải template câu hỏi
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
                <label>Môn học</label>
                <select className="select" value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)} required>
                  {subjects.map((subject) => (
                    <option key={subject.code} value={subject.code}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
                <p className="field-help">
                  Nếu chưa có môn học phù hợp, hãy vào <Link to="/lecturer/subjects">Danh sách môn học</Link> để thêm mới trước.
                </p>
              </div>
              <div className="field">
                <label>Độ khó</label>
                <select className="select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} required>
                  {levels.map((level) => (
                    <option key={level.code} value={level.code}>
                      {level.code} - {level.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Loại câu hỏi</label>
                <select className="select" value={questionType} onChange={(e) => setQuestionType(e.target.value as 'TRAC_NGHIEM' | 'TU_LUAN')} required>
                  {QUESTION_KIND_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid mt-16">
              <div className="field">
                <label>Nội dung câu hỏi</label>
                <textarea className="textarea" value={content} onChange={(e) => setContent(e.target.value)} required />
              </div>
              {questionType === 'TRAC_NGHIEM' ? (
                <div className="field">
                  <label>Lựa chọn & đáp án đúng</label>
                  <div className="form-grid" style={{ gap: 10 }}>
                    {choices.map((choice, index) => (
                      <div key={choice.key} style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: 10, alignItems: 'center' }}>
                        <label style={{ margin: 0 }}>Đáp án {choice.key}</label>
                        <input
                          className="input"
                          value={choice.text}
                          onChange={(e) =>
                            setChoices((prev) => prev.map((item, idx) => (idx === index ? { ...item, text: e.target.value } : item)))
                          }
                          required={index < 2}
                        />
                      </div>
                    ))}
                    <div className="field">
                      <label>Đáp án đúng</label>
                      <select className="select" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} required>
                        {choices.filter((item) => item.text.trim()).map((item) => (
                          <option key={item.key} value={item.key}>{item.key}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="field">
                  <label>Rubric chấm tự luận</label>
                  <textarea className="textarea" value={rubric} onChange={(e) => setRubric(e.target.value)} required />
                </div>
              )}
            </div>

            {saved ? <div className="notice notice-success mt-16">Đã lưu câu hỏi thành công.</div> : null}
            {submitError ? <div className="field-error mt-16">{submitError}</div> : null}
            {importMessage ? <div className="notice notice-success mt-16">{importMessage}</div> : null}

            <div className="actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : isEdit ? 'Cập nhật câu hỏi' : 'Lưu câu hỏi'}</button>
              <Link className="btn btn-secondary" to="/lecturer/questions">Hủy</Link>
            </div>
          </form>

          <section className="card">
            <h2 className="section-title">Import CSV câu hỏi</h2>
            <div className="form-grid">
              <div className="field">
                <label>Import câu hỏi</label>
                <input className="input" type="file" accept=".csv,text/csv" onChange={onUpload(importQuestions)} />
              </div>
            </div>
            <p className="field-help">CSV import phù hợp khi cần tạo nhiều câu hỏi một lần theo template tải từ web.</p>
          </section>
        </>
      )}
    </RoleLayout>
  );
}
