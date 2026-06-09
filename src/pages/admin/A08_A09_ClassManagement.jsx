import { useEffect, useMemo, useState } from 'react';
import AdminLayout, { PageHeader, Card, Badge, ConfirmDialog, Input, Table, Pagination, Toast, PageState, Btn, tokens } from '../../layouts/AdminLayout';
import { downloadCsvRows, downloadXlsx, readSpreadsheetFile } from '../../lib/csv';
import { deleteClass, fetchClasses, saveClass } from '../../lib/supabaseData';

const PAGE_SIZE = 10;

export function ClassListPage({ onNavigate }) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [importError, setImportError] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [importing, setImporting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchClasses();
      setRows(data);
    } catch (e) {
      setError(e.message || 'Không tải được lớp học');
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
    return rows.filter((r) => [r.code, r.subjectName, r.lecturerName].join(' ').toLowerCase().includes(q));
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteClass(deleteTarget.id);
      setToast({ message: `Đã xóa lớp ${deleteTarget.code}`, type: 'success' });
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setToast({ message: e.message || 'Không xóa được lớp học', type: 'error' });
    }
  };

  const resolveValue = (row, keys) => {
    const key = keys.find((item) => row[item] !== undefined && row[item] !== null && String(row[item]).trim() !== '');
    return key ? row[key] : '';
  };

  const handleImport = async (file) => {
    const { data } = await readSpreadsheetFile(file);
    let successCount = 0;
    for (const row of data) {
      const code = resolveValue(row, ['code', 'Code', 'ma_lop_hoc', 'MaLopHoc']);
      const subjectCode = resolveValue(row, ['subjectCode', 'SubjectCode', 'ma_mon_hoc', 'MaMonHoc']);
      const semesterCode = resolveValue(row, ['semesterCode', 'SemesterCode', 'ma_hoc_ky_nam_hoc', 'MaHocKyNamHoc']);
      const lecturerId = resolveValue(row, ['lecturerId', 'LecturerId', 'ma_giang_vien', 'MaGiangVien']);
      if (!code || !subjectCode || !semesterCode || !lecturerId) continue;

      await saveClass({
        code,
        name: resolveValue(row, ['name', 'Name', 'ten_lop_hoc', 'TenLopHoc']) || code,
        subjectCode,
        semesterCode,
        lecturerId,
        studentCount: Number(resolveValue(row, ['studentCount', 'StudentCount', 'si_so', 'SiSo']) || 0),
        room: resolveValue(row, ['room', 'Room', 'phong_hoc', 'PhongHoc']),
        schedule: resolveValue(row, ['schedule', 'Schedule', 'lich_hoc', 'LichHoc']),
      });
      successCount += 1;
    }
    setImportMessage(`Đã import ${successCount} lớp học từ file Excel.`);
    await load();
  };

  const onUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError('');
    setImportMessage('');
    try {
      await handleImport(file);
    } catch (e) {
      setImportError(e.message || 'Import file Excel thất bại.');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const columns = [
    { key: 'code', label: 'Mã lớp' },
    { key: 'subjectName', label: 'Môn học' },
    { key: 'lecturerName', label: 'Giảng viên' },
    { key: 'academicYearName', label: 'Năm học' },
    {
      key: 'studentCount',
      label: 'Sĩ số',
      render: (_, row) => (
        <div>
          <strong>{row.studentCount || 0}</strong>
          <div style={{ fontSize: 12, color: tokens.textMuted }}>Chỉ tiêu: {row.plannedStudentCount || 0}</div>
        </div>
      ),
    },
    { key: 'status', label: 'Trạng thái', render: (v) => <Badge label={v === 'active' ? 'Đang hoạt động' : 'Không hoạt động'} color={v} /> },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn size="sm" variant="secondary" onClick={() => onNavigate('classes-form', `/admin/classes/form?id=${row.id}`)}>Sửa</Btn>
          <Btn size="sm" variant="danger" onClick={() => setDeleteTarget(row)}>Xóa</Btn>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout activeKey="classes-list" breadcrumbs={['Dashboard', 'Lớp học']} onNavigate={onNavigate}>
      <PageHeader
        title="Quản lý Lớp học"
        subtitle={loading ? 'Đang tải dữ liệu...' : `${filtered.length} lớp học`}
        actions={(
          <div className="toolbar">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                void downloadXlsx(
                  'template-lop-hoc-admin.xlsx',
                  ['code', 'name', 'subjectCode', 'semesterCode', 'lecturerId', 'studentCount', 'room', 'schedule'],
                  [['SE999_1', 'Lớp SE999_1', 'SE104', 'HKNH_2026_HK1', 'ND1779957873275', 45, 'E3.1', 'Thứ 2, tiết 1-3']],
                  'LopHoc',
                )
              }
            >
              Tải template XLSX
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                downloadCsvRows(
                  'template-lop-hoc-admin.csv',
                  ['code', 'name', 'subjectCode', 'semesterCode', 'lecturerId', 'studentCount', 'room', 'schedule'],
                  [['SE999_1', 'Lớp SE999_1', 'SE104', 'HKNH_2026_HK1', 'ND1779957873275', 45, 'E3.1', 'Thứ 2, tiết 1-3']],
                )
              }
            >
              Tải template CSV
            </button>
            <Btn variant="primary" onClick={() => onNavigate('classes-form', '/admin/classes/form')}>+ Thêm lớp học</Btn>
          </div>
        )}
      />

      {error ? (
        <PageState kind="error" title="Không tải được lớp học" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : (
        <Card>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${tokens.border}` }}>
            <div className="form-grid two">
              <div className="field">
                <label>Tìm kiếm</label>
                <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm theo mã lớp / môn học / giảng viên..." />
              </div>
              <div className="field">
                <label>Import file CSV/XLSX</label>
                <input className="input" type="file" accept=".xlsx,.csv,text/csv,.xml,.txt,.xls" onChange={onUpload} disabled={importing} />
                <p className="field-help">Hỗ trợ cả CSV và XLSX, đồng thời vẫn tương thích với XML Spreadsheet 2003 / text-like XLS cũ.</p>
              </div>
            </div>
            {importError ? <div className="field-error mt-16">{importError}</div> : null}
            {importMessage ? <div className="notice notice-success mt-16">{importMessage}</div> : null}
          </div>

          <Table columns={columns} data={paginated} emptyMessage={loading ? 'Đang tải...' : 'Không có dữ liệu'} />

          <div style={{ padding: '14px 20px', borderTop: `1px solid ${tokens.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: tokens.textMuted }}>Trang {page}/{totalPages}</span>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </Card>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa lớp học"
        message={`Bạn có chắc muốn xóa lớp ${deleteTarget?.code || ''}?`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          void handleDelete();
        }}
        confirmLabel="Xóa"
      />
    </AdminLayout>
  );
}
