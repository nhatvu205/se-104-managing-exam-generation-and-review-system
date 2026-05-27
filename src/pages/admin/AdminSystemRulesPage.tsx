import { useEffect, useMemo, useState } from 'react';
import AdminLayout, { Btn, PageState } from '../../layouts/AdminLayout';
import { fetchSystemParams, saveSystemParams } from '../../lib/supabaseData';

export default function AdminSystemRulesPage() {
  const [params, setParams] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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

  const byName = useMemo(() => {
    const map: Record<string, any> = {};
    params.forEach((p) => {
      map[p.TenThamSo] = p;
    });
    return map;
  }, [params]);

  const updateParam = (ten: string, value: string) => {
    setParams((prev) => {
      const idx = prev.findIndex((p) => p.TenThamSo === ten);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], GiaTri: value };
      return next;
    });
  };

  const get = (ten: string, fallback = '') => byName[ten]?.GiaTri ?? fallback;

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await saveSystemParams(params.map((p) => ({ MaThamSo: p.MaThamSo, GiaTri: p.GiaTri })));
      setMessage('Đã lưu quy định hệ thống');
    } catch (e: any) {
      setMessage(e.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeKey="system-rules" breadcrumbs={['Dashboard', 'Quy định hệ thống']}>
      <header className="page-header">
        <div>
          <h1 className="page-title">Cài đặt Quy định hệ thống</h1>
          <p className="page-subtitle">Thiết lập các thông số vận hành hệ thống.</p>
        </div>
      </header>

      {error ? (
        <PageState kind="error" title="Không tải được tham số hệ thống" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : loading ? (
        <PageState kind="loading" title="Đang tải tham số" description="Vui lòng đợi trong giây lát..." />
      ) : (
        <form className="grid" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <section className="card">
            <h2 className="section-title">Tham số chính</h2>
            <div className="form-grid two">
              <div className="field"><label>Số câu tối đa / đề</label><input className="input" value={get('SoCauToiDaMoiDe', '60')} onChange={(e) => updateParam('SoCauToiDaMoiDe', e.target.value)} /></div>
              <div className="field"><label>Thời lượng thi (phút)</label><input className="input" value={get('ThoiLuongThiMacDinh', '90')} onChange={(e) => updateParam('ThoiLuongThiMacDinh', e.target.value)} /></div>
              <div className="field"><label>Thang điểm</label><input className="input" value={get('ThangDiem', '10')} onChange={(e) => updateParam('ThangDiem', e.target.value)} /></div>
              <div className="field"><label>Số môn tối đa / giảng viên</label><input className="input" value={get('SoMonToiDaMoiGiangVien', '3')} onChange={(e) => updateParam('SoMonToiDaMoiGiangVien', e.target.value)} /></div>
            </div>
          </section>

          <section className="card">
            <h2 className="section-title">Danh sách tham số chi tiết</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Mã</th><th>Tên tham số</th><th>Giá trị</th><th>Nhóm</th></tr></thead>
                <tbody>
                  {params.map((p) => (
                    <tr key={p.MaThamSo}>
                      <td>{p.MaThamSo}</td>
                      <td>{p.TenThamSo}</td>
                      <td><input className="input" value={p.GiaTri ?? ''} onChange={(e) => updateParam(p.TenThamSo, e.target.value)} /></td>
                      <td>{p.NhomThamSo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="actions">
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu quy định'}</button>
            </div>
            {message ? <p className="field-help" role="status" aria-live="polite">{message}</p> : null}
          </section>
        </form>
      )}
    </AdminLayout>
  );
}
