import { useEffect, useState } from 'react';
import AdminLayout, { Btn, ConfirmDialog, PageState, Toast } from '../../layouts/AdminLayout';
import { deleteSystemParam, fetchSystemParams, saveSystemParamEntries } from '../../lib/supabaseData';

const EMPTY_FORM = {
  MaThamSo: '',
  TenThamSo: '',
  GiaTri: '',
  KieuDuLieu: 'TEXT',
  NhomThamSo: '',
  MoTa: '',
};

export default function AdminSystemRulesPage() {
  const [params, setParams] = useState<any[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

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

  const setField = (key: string, value: string) => setForm((prev: any) => ({ ...prev, [key]: value }));

  const updateRow = (id: string, key: string, value: string) => {
    setParams((prev) => prev.map((row) => (row.MaThamSo === id ? { ...row, [key]: value } : row)));
  };

  const handleCreate = async () => {
    if (!form.MaThamSo.trim() || !form.TenThamSo.trim()) {
      setToast({ message: 'Mã tham số và Tên tham số là bắt buộc.', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      await saveSystemParamEntries([form]);
      setForm(EMPTY_FORM);
      setToast({ message: 'Đã tạo tham số mới.', type: 'success' });
      await load();
    } catch (e: any) {
      setToast({ message: e.message || 'Không tạo được tham số.', type: 'error' });
    } finally {
      setSaving(false);
    }
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteSystemParam(deleteTarget.MaThamSo);
      setToast({ message: `Đã xóa tham số ${deleteTarget.MaThamSo}.`, type: 'success' });
      setDeleteTarget(null);
      await load();
    } catch (e: any) {
      setToast({ message: e.message || 'Không xóa được tham số.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeKey="system-rules" breadcrumbs={['Dashboard', 'Quy định hệ thống']}>
      <header className="page-header">
        <div>
          <h1 className="page-title">Quy định hệ thống</h1>
          <p className="page-subtitle">Tạo mới và cập nhật danh sách tham số vận hành hệ thống.</p>
        </div>
      </header>

      {error ? (
        <PageState kind="error" title="Không tải được tham số hệ thống" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : loading ? (
        <PageState kind="loading" title="Đang tải tham số..." />
      ) : (
        <>
          <section className="card">
            <h2 className="section-title">Tạo tham số mới</h2>
            <div className="form-grid two">
              <div className="field">
                <label>Mã tham số</label>
                <input className="input" value={form.MaThamSo} onChange={(e) => setField('MaThamSo', e.target.value)} placeholder="VD: MAX_CAU_HOI_DE" />
              </div>
              <div className="field">
                <label>Tên tham số</label>
                <input className="input" value={form.TenThamSo} onChange={(e) => setField('TenThamSo', e.target.value)} placeholder="VD: Số câu tối đa / đề" />
              </div>
              <div className="field">
                <label>Giá trị</label>
                <input className="input" value={form.GiaTri} onChange={(e) => setField('GiaTri', e.target.value)} />
              </div>
              <div className="field">
                <label>Kiểu dữ liệu</label>
                <select className="select" value={form.KieuDuLieu} onChange={(e) => setField('KieuDuLieu', e.target.value)}>
                  <option value="TEXT">TEXT</option>
                  <option value="INT">INT</option>
                  <option value="FLOAT">FLOAT</option>
                  <option value="BOOLEAN">BOOLEAN</option>
                </select>
              </div>
              <div className="field">
                <label>Nhóm tham số</label>
                <input className="input" value={form.NhomThamSo} onChange={(e) => setField('NhomThamSo', e.target.value)} placeholder="VD: DeThi" />
              </div>
              <div className="field">
                <label>Mô tả</label>
                <input className="input" value={form.MoTa} onChange={(e) => setField('MoTa', e.target.value)} />
              </div>
            </div>
            <div className="actions">
              <Btn variant="primary" onClick={handleCreate} disabled={saving}>{saving ? 'Đang lưu...' : 'Tạo tham số'}</Btn>
            </div>
          </section>

          <section className="card">
            <h2 className="section-title">Danh sách tham số chi tiết</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Tên tham số</th>
                    <th>Giá trị</th>
                    <th>Kiểu dữ liệu</th>
                    <th>Nhóm</th>
                    <th>Mô tả</th>
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
                      <td data-label="Kiểu dữ liệu">
                        <select className="select" value={row.KieuDuLieu || 'TEXT'} onChange={(e) => updateRow(row.MaThamSo, 'KieuDuLieu', e.target.value)}>
                          <option value="TEXT">TEXT</option>
                          <option value="INT">INT</option>
                          <option value="FLOAT">FLOAT</option>
                          <option value="BOOLEAN">BOOLEAN</option>
                        </select>
                      </td>
                      <td data-label="Nhóm">
                        <input className="input" value={row.NhomThamSo || ''} onChange={(e) => updateRow(row.MaThamSo, 'NhomThamSo', e.target.value)} />
                      </td>
                      <td data-label="Mô tả">
                        <input className="input" value={row.MoTa || ''} onChange={(e) => updateRow(row.MaThamSo, 'MoTa', e.target.value)} />
                      </td>
                      <td data-label="Thao tác">
                        <Btn size="sm" variant="danger" onClick={() => setDeleteTarget(row)}>Xóa</Btn>
                      </td>
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa tham số"
        message={`Bạn có chắc muốn xóa tham số ${deleteTarget?.MaThamSo || ''}?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirmLabel="Xóa"
      />

      {toast ? <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} /> : null}
    </AdminLayout>
  );
}
