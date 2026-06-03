import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { claimLecturerGradingSubmission, fetchLecturerGradingQueue } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

export default function LecturerGradingPage() {
  const lecturer = useLecturerIdentity();
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openingId, setOpeningId] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchLecturerGradingQueue();
      setRows(data);
    } catch (e: any) {
      setError(e.message || 'Không tải được danh sách chấm thi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((item) => {
      const matchQuery = !q || [item.id, item.submissionCode, item.submissionName, item.examTitle].join(' ').toLowerCase().includes(q);
      const matchStatus = !status || item.status === status;
      return matchQuery && matchStatus;
    });
  }, [query, rows, status]);

  const stats = useMemo(() => {
    return {
      ungraded: rows.filter((item) => item.status === 'ungraded').length,
      grading: rows.filter((item) => item.status === 'grading').length,
      graded: rows.filter((item) => item.status === 'graded').length,
    };
  }, [rows]);

  const handleOpen = async (item: any) => {
    setOpeningId(item.id);
    setError('');
    try {
      await claimLecturerGradingSubmission(item.id);
      navigate(`/lecturer/grading/${item.id}`);
    } catch (e: any) {
      setError(e.message || 'Không thể mở bài thi để chấm.');
      await load();
    } finally {
      setOpeningId('');
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
          <h1 className="page-title">Chấm thi</h1>
          <p className="page-subtitle">{loading ? 'Đang tải dữ liệu...' : `${filtered.length} bài trong danh sách`}</p>
        </div>
      </header>

      <section className="grid grid-3">
        <article className="kpi"><p className="kpi-label">Chưa chấm</p><p className="kpi-value">{stats.ungraded}</p></article>
        <article className="kpi"><p className="kpi-label">Đang chấm</p><p className="kpi-value">{stats.grading}</p></article>
        <article className="kpi"><p className="kpi-label">Đã chấm</p><p className="kpi-value">{stats.graded}</p></article>
      </section>

      {error ? (
        <PageState kind="error" title="Không tải được danh sách chấm thi" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : (
        <>
          <section className="card">
            <div className="form-grid two">
              <div className="field">
                <label>Tìm kiếm</label>
                <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Mã bài / đề thi" />
              </div>
              <div className="field">
                <label>Trạng thái</label>
                <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Tất cả</option>
                  <option value="ungraded">Chưa chấm</option>
                  <option value="grading">Đang chấm</option>
                  <option value="graded">Đã chấm</option>
                </select>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã bài</th>
                    <th>Thông tin bài</th>
                    <th>Đề thi</th>
                    <th>Người chấm</th>
                    <th>Điểm</th>
                    <th>Trạng thái</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Mã bài">{item.id}</td>
                      <td data-label="Thông tin bài">
                        {item.submissionName}
                        <div style={{ color: '#6b7280', fontSize: 12 }}>{item.submissionCode}</div>
                      </td>
                      <td data-label="Đề thi">{item.examTitle}</td>
                      <td data-label="Người chấm">
                        {item.graderId ? (
                          <div>
                            <div>{item.graderName || item.graderId}</div>
                            {item.isMine ? <div style={{ color: '#2563eb', fontSize: 12 }}>Bạn đang chấm bài này</div> : null}
                          </div>
                        ) : (
                          <span style={{ color: '#6b7280' }}>Chưa có</span>
                        )}
                      </td>
                      <td data-label="Điểm">{item.total > 0 ? item.total : '-'}</td>
                      <td data-label="Trạng thái">
                        <span className={`badge ${item.status === 'graded' ? 'badge-success' : item.status === 'grading' ? 'badge-info' : 'badge-warning'}`}>
                          {item.status === 'graded' ? 'Đã chấm' : item.status === 'grading' ? 'Đang chấm' : 'Chưa chấm'}
                        </span>
                      </td>
                      <td data-label="Tác vụ">
                        {item.isClaimed && !item.isMine ? (
                          <button type="button" className="btn btn-secondary" disabled>Đã có người nhận</button>
                        ) : (
                          <button type="button" className="btn btn-secondary" onClick={() => void handleOpen(item)} disabled={openingId === item.id}>
                            {openingId === item.id ? 'Đang mở...' : item.isMine ? 'Tiếp tục chấm' : 'Nhận chấm'}
                          </button>
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
