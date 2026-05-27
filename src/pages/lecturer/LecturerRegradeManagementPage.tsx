import { useEffect, useMemo, useState } from 'react';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { fetchRegrades } from '../../lib/supabaseData';

export default function LecturerRegradeManagementPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchRegrades();
      setRows(data);
    } catch (e: any) {
      setError(e.message || 'Không tải được dữ liệu phúc khảo');
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
    return rows.filter((r) => [r.studentId, r.question, r.reason].join(' ').toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <RoleLayout
      title="Giảng viên: Nguyễn Văn A"
      roleBadge={<span className="badge badge-warning">Giảng viên</span>}
      sidebarSubtitle="Portal giảng viên"
      navItems={[
        { label: 'Tổng hợp điểm lớp', to: '/lecturer/grading-summary' },
        { label: 'Quản lý phúc khảo', to: '/lecturer/regrades', active: true },
        { label: 'Báo cáo năm', to: '/lecturer/year-report' },
      ]}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title">Quản lý phúc khảo</h1>
          <p className="page-subtitle">{loading ? 'Đang tải dữ liệu...' : `${filtered.length} yêu cầu`}</p>
        </div>
      </header>

      {error ? (
        <PageState kind="error" title="Không tải được dữ liệu" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : (
        <>
          <section className="card">
            <div className="form-grid two">
              <div className="field"><label>Tìm kiếm</label><input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Mã bài / câu hỏi / nhận xét" /></div>
            </div>
          </section>

          <section className="card">
            <h2 className="section-title">Danh sách yêu cầu phúc khảo</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Mã chi tiết</th><th>Mã bài</th><th>Câu hỏi</th><th>Điểm gốc</th><th>Lý do</th><th>Trạng thái</th></tr></thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.studentId}</td>
                      <td>{r.question}</td>
                      <td>{r.original}</td>
                      <td>{r.reason || '-'}</td>
                      <td><span className="badge badge-warning">{r.status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}</span></td>
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
