import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { fetchLecturerQuestionBank } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

export default function LecturerQuestionBankPage() {
  const lecturer = useLecturerIdentity();
  const [rows, setRows] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchLecturerQuestionBank();
      setRows(data);
    } catch (e: any) {
      setError(e.message || 'Không tải được ngân hàng câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const subjects = useMemo(() => {
    return Array.from(new Set(rows.map((q) => `${q.subjectCode}|${q.subjectName}`))).map((item) => {
      const [code, name] = item.split('|');
      return { code, name };
    });
  }, [rows]);

  const authors = useMemo(() => {
    return Array.from(new Set(rows.map((q) => `${q.authorId}|${q.authorName}`))).map((item) => {
      const [id, name] = item.split('|');
      return { id, name };
    });
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((item) => {
      const matchQuery = !q || [item.code, item.content, item.subjectCode, item.subjectName].join(' ').toLowerCase().includes(q);
      const matchSubject = !subject || item.subjectCode === subject;
      const matchAuthor = !author || item.authorId === author;
      return matchQuery && matchSubject && matchAuthor;
    });
  }, [author, query, rows, subject]);

  return (
    <RoleLayout
      title={lecturer.title}
      roleBadge={lecturer.roleBadge}
      sidebarSubtitle="Portal giảng viên"
      navItems={withLecturerActive('/lecturer/questions')}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title">Ngân hàng câu hỏi</h1>
          <p className="page-subtitle">{loading ? 'Đang tải dữ liệu...' : `${filtered.length} câu hỏi`}</p>
        </div>
        <div className="toolbar">
          <Link className="btn btn-primary" to="/lecturer/questions/create">Tạo câu hỏi</Link>
        </div>
      </header>

      {error ? (
        <PageState kind="error" title="Không tải được câu hỏi" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : (
        <>
          <section className="card">
            <div className="form-grid three">
              <div className="field">
                <label>Tìm kiếm</label>
                <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Mã câu hỏi / nội dung" />
              </div>
              <div className="field">
                <label>Môn học</label>
                <select className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="">Tất cả</option>
                  {subjects.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Giảng viên</label>
                <select className="select" value={author} onChange={(e) => setAuthor(e.target.value)}>
                  <option value="">Tất cả</option>
                  {authors.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Nội dung</th>
                    <th>Môn học</th>
                    <th>Giảng viên</th>
                    <th>Loại</th>
                    <th>Độ khó</th>
                    <th>Trạng thái</th>
                    <th>Cập nhật</th>
                    <th>Tác vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Mã">{item.code}</td>
                      <td data-label="Nội dung">{item.content}</td>
                      <td data-label="Môn học">{item.subjectCode}</td>
                      <td data-label="Giảng viên">{item.authorName || item.authorId || '-'}</td>
                      <td data-label="Loại">{item.questionType === 'TRAC_NGHIEM' ? 'Trắc nghiệm' : 'Tự luận'}</td>
                      <td data-label="Độ khó">{item.difficulty || '-'}</td>
                      <td data-label="Trạng thái">
                        <span className={`badge ${String(item.status || '').toLowerCase().includes('đang') ? 'badge-success' : 'badge-warning'}`}>{item.status || '-'}</span>
                      </td>
                      <td data-label="Cập nhật">{item.updatedAt}</td>
                      <td data-label="Tác vụ">
                        {item.authorId === lecturer.userId ? (
                          <Link className="btn btn-secondary" to={`/lecturer/questions/${item.id}/edit`}>Sửa</Link>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: 13 }}>Chỉ người tạo mới sửa</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </RoleLayout>
  );
}
