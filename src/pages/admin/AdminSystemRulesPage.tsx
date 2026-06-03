import { useEffect, useState } from 'react';
import AdminLayout, { Btn, PageState, Toast } from '../../layouts/AdminLayout';
import { fetchSystemParams, saveSystemParamEntries } from '../../lib/supabaseData';

export default function AdminSystemRulesPage() {
  const [params, setParams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchSystemParams();
      setParams(rows);
    } catch (e: any) {
      setError(e.message || 'Không tải được tham số hệ thống');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateRow = (id: string, key: string, value: string) => {
    setParams((prev) => prev.map((row) => (row.MaThamSo === id ? { ...row, [key]: value } : row)));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await saveSystemParamEntries(params);
      setToast({ message: 'Đã lưu quy định hệ thống.', type: 'success' });
      await load();
    } catch (e: any) {
      setToast({ message: e.message || 'Không lưu được quy định hệ thống.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeKey="system-rules" breadcrumbs={['Dashboard', 'Quy định hệ thống']}>
      <header className="page-header">
        <div>
          <h1 className="page-title">Quy định hệ thống</h1>
          <p className="page-subtitle">Cập nhật tham số vận hành hệ thống.</p>
        </div>
      </header>

      {error ? (
        <PageState kind="error" title="Không tải được tham số hệ thống" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : loading ? (
        <PageState kind="loading" title="Đang tải tham số..." />
      ) : (
        <>
          <section className="card">
            <h2 className="section-title">Danh sách tham số chi tiết</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Tên tham số</th>
                    <th>Giá trị</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {params.map((row) => (
                    <tr key={row.MaThamSo}>
                      <td data-label="Mã">{row.MaThamSo}</td>
                      <td data-label="Tên tham số">
                        <input className="input" value={row.TenThamSo || ''} onChange={(e) => updateRow(row.MaThamSo, 'TenThamSo', e.target.value)} />
                      </td>
                      <td data-label="Giá trị">
                        <input className="input" value={row.GiaTri ?? ''} onChange={(e) => updateRow(row.MaThamSo, 'GiaTri', e.target.value)} />
                      </td>
                      <td data-label="Thao tác"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="actions">
              <Btn variant="primary" onClick={handleSaveAll} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu toàn bộ'}</Btn>
            </div>
          </section>
        </>
      )}

      {toast ? <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} /> : null}
    </AdminLayout>
  );
}
