import { useEffect, useMemo, useState } from 'react';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { fetchLecturerSummary } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

export default function LecturerGradingSummaryPage() {
  const lecturer = useLecturerIdentity();
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchLecturerSummary();
      setRows(data);
    } catch (e: any) {
      setError(e.message || 'Không tải được dữ liệu chấm thi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => [r.studentId, r.fullName].join(' ').toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <RoleLayout
      title={lecturer.title}
      roleBadge={lecturer.roleBadge}
      sidebarSubtitle="Portal giảng viên"
      navItems={withLecturerActive('/lecturer/grading-summary')}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title">Kết quả chấm thi – Tổng hợp lớp</h1>
          <p className="page-subtitle">{loading ? 'Đang tải dữ liệu...' : `${filtered.length} bài thi`}</p>
        </div>
      </header>

      {error ? (
        <PageState kind="error" title="Không tải được dữ liệu" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : (
        <>
          <section className="card">
            <div className="form-grid two">
              <div className="field"><label>Tìm theo mã người học</label><input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="VD: SV0001" /></div>
            </div>
          </section>

          <section className="card">
            <h2 className="section-title">Bảng điểm tổng hợp</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Mã bài</th><th>Mã người học</th><th>Điểm từng câu</th><th>Tổng điểm</th><th>Xếp loại</th></tr></thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.studentId}</td>
                      <td>{r.scores.slice(0, 4).join(' | ') || '-'}</td>
                      <td><strong>{r.total}</strong></td>
                      <td><span className="badge badge-info">{r.grade || '-'}</span></td>
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
