import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { Btn, ConfirmDialog, PageState, Toast } from '../../layouts/AdminLayout';
import { downloadExcelXml, readSpreadsheetFile } from '../../lib/csv';
import { deleteLecturerClass, fetchLecturerClasses, saveLecturerClass } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

export default function LecturerClassListPage() {
  const lecturer = useLecturerIdentity();
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [importError, setImportError] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [toast, setToast] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [importing, setImporting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setRows(await fetchLecturerClasses());
    } catch (e: any) {
      setError(e.message || 'Không tải được danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.code, row.name, row.subjectCode, row.subjectName, row.semesterName, row.academicYearName]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [rows, search]);

  const totalStudents = useMemo(
    () => filtered.reduce((sum, row) => sum + Number(row.studentCount || 0), 0),
    [filtered],
  );

  const resolveValue = (row: Record<string, string>, keys: string[]) =>
    keys.find((key) => row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '')
      ? row[keys.find((key) => row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') as string]
      : '';

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLecturerClass(deleteTarget.id);
      setToast({ message: `Đã xóa lớp ${deleteTarget.code}.`, type: 'success' });
      setDeleteTarget(null);
      await load();
    } catch (e: any) {
      setToast({ message: e.message || 'Không xóa được lớp học.', type: 'error' });
    }
  };

  const handleImport = async (file: File) => {
    const { data } = await readSpreadsheetFile(file);
    let successCount = 0;
    for (const row of data) {
      const code = resolveValue(row, ['code', 'Code', 'ma_lop_hoc', 'MaLopHoc']);
      const subjectCode = resolveValue(row, ['subjectCode', 'SubjectCode', 'ma_mon_hoc', 'MaMonHoc']);
      const semesterCode = resolveValue(row, ['semesterCode', 'SemesterCode', 'ma_hoc_ky_nam_hoc', 'MaHocKyNamHoc']);
      if (!code || !subjectCode || !semesterCode) continue;

      await saveLecturerClass({
        code,
        subjectCode,
        semesterCode,
        studentCount: Number(resolveValue(row, ['studentCount', 'StudentCount', 'si_so', 'SiSo']) || 0),
        room: resolveValue(row, ['room', 'Room', 'phong_hoc', 'PhongHoc']),
        schedule: resolveValue(row, ['schedule', 'Schedule', 'lich_hoc', 'LichHoc']),
      });
      successCount += 1;
    }

    setImportMessage(`Đã import ${successCount} lớp học từ file Excel.`);
    await load();
  };

  const onUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError('');
    setImportMessage('');
    try {
      await handleImport(file);
    } catch (e: any) {
      setImportError(e.message || 'Import file Excel thất bại.');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  return (
    <RoleLayout
      title={lecturer.title}
      roleBadge={lecturer.roleBadge}
      sidebarSubtitle="Portal giảng viên"
      navItems={withLecturerActive('/lecturer/classes')}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title">Quản lý lớp học</h1>
          <p className="page-subtitle">{loading ? 'Đang tải dữ liệu...' : `${filtered.length} lớp học bạn đang phụ trách`}</p>
        </div>
        <div className="toolbar">
          <Link className="btn btn-tertiary" to="/lecturer/classes/create">+ Thêm lớp học</Link>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              downloadExcelXml(
                'template-lop-hoc.xml',
                ['code', 'subjectCode', 'semesterCode', 'studentCount', 'room', 'schedule'],
                [['SE999_1', 'SE104', 'HKNH_2026_HK1', 45, 'E3.1', 'Thứ 2, tiết 1-3']],
                'LopHoc',
              )
            }
          >
            Tải template Excel
          </button>
        </div>
      </header>

      <section className="grid grid-3">
        <article className="kpi"><p className="kpi-label">Tổng lớp học</p><p className="kpi-value">{filtered.length}</p></article>
        <article className="kpi"><p className="kpi-label">Tổng sinh viên</p><p className="kpi-value">{totalStudents}</p></article>
        <article className="kpi"><p className="kpi-label">Lớp có dữ liệu SV</p><p className="kpi-value">{filtered.filter((row) => (row.studentCount || 0) > 0).length}</p></article>
      </section>

      {error ? (
        <PageState kind="error" title="Không tải được lớp học" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : (
        <>
          <section className="card">
            <div className="form-grid two">
              <div className="field">
                <label>Tìm kiếm</label>
                <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Mã lớp / môn học / học kỳ" />
              </div>
              <div className="field">
                <label>Import file Excel</label>
                <input className="input" type="file" accept=".xml,.csv,.txt,.xls" onChange={onUpload} disabled={importing} />
                <p className="field-help">Hỗ trợ file CSV xuất từ Excel hoặc Excel XML 2003 theo template tải từ hệ thống.</p>
              </div>
            </div>
            {importError ? <div className="field-error mt-16">{importError}</div> : null}
            {importMessage ? <div className="notice notice-success mt-16">{importMessage}</div> : null}
          </section>

          <section className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã lớp</th>
                    <th>Môn học</th>
                    <th>Học kỳ</th>
                    <th>Phòng</th>
                    <th>Lịch học</th>
                    <th>Sinh viên</th>
                    <th>Tác vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id}>
                      <td data-label="Mã lớp">
                        <strong>{row.code}</strong>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>{row.name}</div>
                      </td>
                      <td data-label="Môn học">{row.subjectCode} - {row.subjectName}</td>
                      <td data-label="Học kỳ">
                        {row.semesterName || row.semesterCode}
                        <div style={{ color: '#6b7280', fontSize: 12 }}>{row.academicYearName || '-'}</div>
                      </td>
                      <td data-label="Phòng">{row.room || '-'}</td>
                      <td data-label="Lịch học">{row.schedule || '-'}</td>
                      <td data-label="Sinh viên">
                        <strong>{row.studentCount || 0}</strong>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>Chỉ tiêu: {row.plannedStudentCount || 0}</div>
                      </td>
                      <td data-label="Tác vụ">
                        <div className="toolbar">
                          <Link className="btn btn-tertiary" to={`/lecturer/classes/${row.id}/edit`}>Sửa</Link>
                          <Link className="btn btn-secondary" to={`/lecturer/classes/${row.id}/students`}>Xem danh sách SV</Link>
                          <button type="button" className="btn btn-danger" onClick={() => setDeleteTarget(row)}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: '#6b7280' }}>Không có lớp học phù hợp.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
      {toast ? <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} /> : null}
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
    </RoleLayout>
  );
}
