import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { createSubject, fetchDifficultyLevels, fetchSubjects, saveLecturerQuestion } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

export default function LecturerQuestionFormPage() {
  const lecturer = useLecturerIdentity();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [subjectCode, setSubjectCode] = useState('');
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [customSubjectCode, setCustomSubjectCode] = useState('');
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [customSubjectCredits, setCustomSubjectCredits] = useState(3);
  const [difficulty, setDifficulty] = useState('');
  const [content, setContent] = useState('');
  const [answerGuide, setAnswerGuide] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [subjectData, levelData] = await Promise.all([fetchSubjects(), fetchDifficultyLevels()]);
      setSubjects(subjectData);
      setLevels(levelData);
      if (subjectData[0]?.code) setSubjectCode(subjectData[0].code);
      if (!subjectData.length) setIsCustomSubject(true);
      if (levelData[0]?.code) setDifficulty(levelData[0].code);
    } catch (e: any) {
      setError(e.message || 'Không tải được dữ liệu biểu mẫu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isCustomSubject && (!customSubjectCode.trim() || !customSubjectName.trim())) {
      setSubmitError('Vui lòng nhập đầy đủ mã môn và tên môn khi thêm môn học mới.');
      return;
    }
    setSaving(true);
    setSaved(false);
    setSubmitError('');
    Promise.resolve()
      .then(async () => {
        let targetSubjectCode = subjectCode;
        if (isCustomSubject) {
          await createSubject({
            code: customSubjectCode.trim(),
            name: customSubjectName.trim(),
            credits: customSubjectCredits,
          });
          targetSubjectCode = customSubjectCode.trim();
        }
        await saveLecturerQuestion({
          subjectCode: targetSubjectCode,
          levelCode: difficulty,
          content,
          answer: answerGuide,
        });
      })
      .then(() => {
        setSaved(true);
        setContent('');
        setAnswerGuide('');
        if (isCustomSubject) {
          setIsCustomSubject(false);
          setCustomSubjectCode('');
          setCustomSubjectName('');
          void load();
        }
      })
      .catch((e: any) => setSubmitError(e.message || 'Không lưu được câu hỏi'))
      .finally(() => setSaving(false));
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
          <h1 className="page-title">Tạo câu hỏi</h1>
          <p className="page-subtitle">Màn hình này chỉ dùng để tạo mới câu hỏi (khác với trang Ngân hàng câu hỏi dùng để tra cứu).</p>
        </div>
        <div className="toolbar">
          <Link className="btn btn-secondary" to="/lecturer/questions">Quay lại ngân hàng</Link>
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
              <label>Môn học</label>
              <select
                className="select"
                value={isCustomSubject || !subjects.length ? '__custom__' : subjectCode}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '__custom__') {
                    setIsCustomSubject(true);
                  } else {
                    setIsCustomSubject(false);
                    setSubjectCode(value);
                  }
                }}
                required
              >
                {subjects.map((subject) => (
                  <option key={subject.code} value={subject.code}>
                    {subject.code} - {subject.name}
                  </option>
                ))}
                <option value="__custom__">+ Thêm môn học mới</option>
              </select>
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
          </div>

          {isCustomSubject ? (
            <div className="form-grid two mt-16">
              <div className="field">
                <label>Mã môn học mới</label>
                <input className="input" value={customSubjectCode} onChange={(e) => setCustomSubjectCode(e.target.value)} placeholder="VD: SE500" required />
              </div>
              <div className="field">
                <label>Tên môn học mới</label>
                <input className="input" value={customSubjectName} onChange={(e) => setCustomSubjectName(e.target.value)} placeholder="VD: Chuyên đề kiểm thử nâng cao" required />
              </div>
              <div className="field">
                <label>Số tín chỉ</label>
                <input className="input" type="number" min={1} value={customSubjectCredits} onChange={(e) => setCustomSubjectCredits(Number(e.target.value))} />
              </div>
            </div>
          ) : null}

          <div className="form-grid mt-16">
            <div className="field">
              <label>Nội dung câu hỏi</label>
              <textarea className="textarea" value={content} onChange={(e) => setContent(e.target.value)} required />
            </div>
            <div className="field">
              <label>Đáp án / rubric</label>
              <textarea className="textarea" value={answerGuide} onChange={(e) => setAnswerGuide(e.target.value)} required />
            </div>
          </div>

          {saved ? <div className="notice notice-success mt-16">Đã lưu câu hỏi thành công.</div> : null}
          {submitError ? <div className="field-error mt-16">{submitError}</div> : null}

          <div className="actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu câu hỏi'}</button>
            <Link className="btn btn-secondary" to="/lecturer/questions">Hủy</Link>
          </div>
        </form>
      )}
    </RoleLayout>
  );
}
