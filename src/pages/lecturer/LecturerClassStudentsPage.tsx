import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import { Btn, PageState } from '../../layouts/AdminLayout';
import { downloadCsvRows, downloadXlsx, readSpreadsheetFile } from '../../lib/csv';
import { fetchLecturerClassStudents, importLecturerClassStudents } from '../../lib/supabaseData';
import { withLecturerActive } from './lecturerNav';
import { useLecturerIdentity } from './useLecturerIdentity';

export default function LecturerClassStudentsPage() {
  const lecturer = useLecturerIdentity();
  const { id } = useParams();
  const [classInfo, setClassInfo] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [importError, setImportError] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [importing, setImporting] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchLecturerClassStudents(id);
      setClassInfo(data.classInfo);
      setStudents(data.students);
    } catch (e: any) {
      setError(e.message || 'Không tải được danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((student) =>
      [student.studentId, student.fullName, student.email, student.phone].join(' ').toLowerCase().includes(q),
    );
  }, [students, search]);

  const resolveValue = (row: Record<string, string>, keys: string[]) =>
    keys.find((key) => row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '')
      ? row[keys.find((key) => row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') as string]
      : '';

  const handleImport = async (file: File) => {
    if (!id) throw new Error('Thiếu mã lớp học.');
    const { data } = await readSpreadsheetFile(file);
    const normalizedRows = data.map((row) => ({
      classCode: resolveValue(row, ['classCode', 'ClassCode', 'ma_lop_hoc', 'MaLopHoc']),
      studentId: resolveValue(row, ['studentId', 'StudentId', 'ma_sinh_vien', 'MaSinhVien']),
      fullName: resolveValue(row, ['fullName', 'FullName', 'ho_ten', 'HoTen']),
      email: resolveValue(row, ['email', 'Email']),
      phone: resolveValue(row, ['phone', 'Phone', 'so_dien_thoai', 'SoDienThoai']),
      dateOfBirth: resolveValue(row, ['dateOfBirth', 'DateOfBirth', 'ngay_sinh', 'NgaySinh']),
      joinedAt: resolveValue(row, ['joinedAt', 'JoinedAt', 'ngay_tham_gia', 'NgayThamGia']),
      status: resolveValue(row, ['status', 'Status', 'trang_thai', 'TrangThai']),
      note: resolveValue(row, ['note', 'Note', 'ghi_chu', 'GhiChu']),
    }));
    const result = await importLecturerClassStudents(id, normalizedRows);
    setImportMessage(`Đã import ${result.successCount} sinh viên cho lớp ${result.classCode}.`);
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
      setImportError(e.message || 'Import danh sách sinh viên thất bại.');
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
          <h1 className="page-title">Danh sách sinh viên lớp học</h1>
          <p className="page-subtitle">
            {classInfo ? `${classInfo.code} · ${classInfo.subjectCode} - ${classInfo.subjectName}` : 'Không tìm thấy lớp học'}
          </p>
        </div>
        <div className="toolbar">
          {classInfo ? (
            <button
              type="button"
              className="btn btn-tertiary"
              onClick={() =>
                void downloadXlsx(
                  `template-sinh-vien-${classInfo.code}.xlsx`,
                  ['classCode', 'studentId', 'fullName', 'email', 'phone', 'dateOfBirth', 'joinedAt', 'status', 'note'],
                  [[classInfo.code, 'SV240999', 'Nguyễn Văn A', 'sv240999@uit.edu.vn', '0901999999', '2006-01-01', '2026-01-10', 'active', 'Sinh viên mẫu']],
                  'SinhVienLopHoc',
                )
              }
            >
              Tải template XLSX
            </button>
          ) : null}
          {classInfo ? (
            <button
              type="button"
              className="btn btn-tertiary"
              onClick={() =>
                downloadCsvRows(
                  `template-sinh-vien-${classInfo.code}.csv`,
                  ['classCode', 'studentId', 'fullName', 'email', 'phone', 'dateOfBirth', 'joinedAt', 'status', 'note'],
                  [[classInfo.code, 'SV240999', 'Nguyễn Văn A', 'sv240999@uit.edu.vn', '0901999999', '2006-01-01', '2026-01-10', 'active', 'Sinh viên mẫu']],
                )
              }
            >
              Tải template CSV
            </button>
          ) : null}
          <Link className="btn btn-secondary" to="/lecturer/classes">Quay lại lớp học</Link>
        </div>
      </header>

      {error ? (
        <PageState kind="error" title="Không tải được danh sách sinh viên" description={error} action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>} />
      ) : loading ? (
        <PageState kind="loading" title="Đang tải danh sách sinh viên..." />
      ) : !classInfo ? (
        <PageState kind="empty" title="Không tìm thấy lớp học" description="Lớp học không tồn tại hoặc bạn không có quyền xem." />
      ) : (
        <>
          <section className="grid grid-3">
            <article className="kpi"><p className="kpi-label">Mã lớp</p><p className="kpi-value">{classInfo.code}</p></article>
            <article className="kpi"><p className="kpi-label">Sinh viên hiện có</p><p className="kpi-value">{classInfo.studentCount}</p></article>
            <article className="kpi"><p className="kpi-label">Chỉ tiêu</p><p className="kpi-value">{classInfo.plannedStudentCount}</p></article>
          </section>

          <section className="card">
            <div className="form-grid two">
              <div className="field">
                <label>Tìm kiếm sinh viên</label>
                <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Mã SV / họ tên / email / SĐT" />
              </div>
              <div className="field">
                <label>Thông tin lớp học</label>
                <div className="input" style={{ minHeight: 42 }}>
                  {classInfo.semesterName || classInfo.semesterCode} · {classInfo.academicYearName || '-'} · {classInfo.room || 'Chưa có phòng'} · {classInfo.schedule || 'Chưa có lịch'}
                </div>
              </div>
            </div>
            <div className="field mt-16">
              <label>Import danh sách sinh viên cho lớp</label>
              <input className="input" type="file" accept=".xlsx,.csv,text/csv,.xml,.txt,.xls" onChange={onUpload} disabled={importing} />
              <p className="field-help">Hỗ trợ cả CSV và XLSX. Nếu sinh viên đã tồn tại trong lớp, hệ thống sẽ cập nhật thông tin.</p>
            </div>
            {importError ? <div className="field-error mt-16">{importError}</div> : null}
            {importMessage ? <div className="notice notice-success mt-16">{importMessage}</div> : null}
          </section>

          <section className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã sinh viên</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Ngày sinh</th>
                    <th>Ngày tham gia</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student) => (
                    <tr key={student.id}>
                      <td data-label="Mã sinh viên">{student.studentId}</td>
                      <td data-label="Họ tên">{student.fullName}</td>
                      <td data-label="Email">{student.email || '-'}</td>
                      <td data-label="Số điện thoại">{student.phone || '-'}</td>
                      <td data-label="Ngày sinh">{student.dateOfBirth || '-'}</td>
                      <td data-label="Ngày tham gia">{student.joinedAt || '-'}</td>
                      <td data-label="Trạng thái">
                        <span className={`badge ${student.status === 'active' ? 'badge-success' : student.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                          {student.status === 'active' ? 'Đang học' : student.status === 'pending' ? 'Chờ xác nhận' : 'Ngừng học'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: '#6b7280' }}>Không có sinh viên phù hợp trong lớp học này.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </RoleLayout>
  );
}
