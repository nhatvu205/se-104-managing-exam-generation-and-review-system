import { supabase } from './supabaseClient';

const TABLES = {
  users: ['NGUOIDUNG', 'nguoidung'],
  roles: ['VAITRO', 'vaitro'],
  subjects: ['MONHOC', 'monhoc'],
  questions: ['CAUHOI', 'cauhoi'],
  exams: ['DETHI', 'dethi'],
  examDetails: ['CHITIETDETHI', 'chitietdethi'],
  gradingDetails: ['CHITIETCHAMTHI', 'chitietchamthi'],
  submissions: ['BAITHI', 'baithi'],
  semesters: ['HOCKYNAMHOC', 'hockynamhoc'],
  classes: ['LOPHOC', 'lophoc'],
  params: ['THAMSO', 'thamso'],
} as const;

type Candidate = readonly string[];

type QueryResult<T> = {
  data: T;
  table: string;
};

function getClient() {
  if (!supabase) {
    throw new Error('Thiếu cấu hình Supabase. Vui lòng set VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
}

function isMissingRelation(error: any) {
  const code = error?.code;
  return code === '42P01' || code === 'PGRST205';
}

async function queryFirst<T>(candidates: Candidate, runner: (table: string) => Promise<{ data: T | null; error: any }>): Promise<QueryResult<T>> {
  let lastError: any;
  for (const table of candidates) {
    const { data, error } = await runner(table);
    if (!error) return { data: (data ?? []) as T, table };
    lastError = error;
    if (!isMissingRelation(error)) break;
  }
  throw new Error(lastError?.message || 'Không thể truy vấn dữ liệu từ Supabase.');
}

async function countRows(candidates: Candidate): Promise<number> {
  const client = getClient();
  const res = await queryFirst<{ count: number }>(candidates, async (table) => {
    const { count, error } = await client.from(table).select('*', { count: 'exact', head: true });
    return { data: { count: count || 0 }, error };
  });
  return res.data.count;
}

function normalizeRole(name: string | null | undefined): 'admin' | 'lecturer' | 'student' {
  const v = (name || '').toLowerCase();
  if (v.includes('admin')) return 'admin';
  if (v.includes('giảng') || v.includes('giang') || v.includes('lect')) return 'lecturer';
  return 'student';
}

function normalizeStatus(value: string | null | undefined): 'active' | 'inactive' {
  const v = (value || '').toLowerCase();
  if (['1', 'active', 'hoatdong', 'đang hoạt động', 'danghoatdong'].includes(v)) return 'active';
  return 'inactive';
}

function formatDate(value: string | null | undefined) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 10);
}

export async function fetchDashboardData() {
  const [totalExams, totalGradedSubmissions, totalUsers, totalClasses] = await Promise.all([
    countRows(TABLES.exams),
    countRows(TABLES.submissions),
    countRows(TABLES.users),
    countRows(TABLES.classes),
  ]);

  const client = getClient();
  const usersResult = await queryFirst<any[]>(TABLES.users, (table) => client.from(table).select('MaVaiTro'));
  const rolesResult = await queryFirst<any[]>(TABLES.roles, (table) => client.from(table).select('MaVaiTro,TenVaiTro'));
  const roleMap = new Map((rolesResult.data || []).map((r: any) => [r.MaVaiTro, r.TenVaiTro]));

  const roleCounts = (usersResult.data || []).reduce((acc: Record<string, number>, row: any) => {
    const role = normalizeRole(roleMap.get(row.MaVaiTro));
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  const examsResult = await queryFirst<any[]>(TABLES.exams, (table) =>
    client.from(table).select('NgaySoan').order('NgaySoan', { ascending: true }),
  );

  const examsByMonthMap: Record<string, number> = {};
  (examsResult.data || []).forEach((item: any) => {
    const dt = item.NgaySoan ? new Date(item.NgaySoan) : null;
    if (!dt || Number.isNaN(dt.getTime())) return;
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    examsByMonthMap[month] = (examsByMonthMap[month] || 0) + 1;
  });

  const examsByMonth = Object.entries(examsByMonthMap).map(([month, count]) => ({ month, count }));

  return {
    currentYear: new Date().getFullYear().toString(),
    totalExams,
    totalGradedSubmissions,
    totalUsers,
    totalClasses,
    usersByRole: [
      { role: 'Admin', count: roleCounts.admin || 0 },
      { role: 'Giảng viên', count: roleCounts.lecturer || 0 },
      { role: 'Sinh viên', count: roleCounts.student || 0 },
    ],
    examsByMonth,
    recentActivities: [],
  };
}

export async function fetchUsers() {
  const client = getClient();
  const usersResult = await queryFirst<any[]>(TABLES.users, (table) => client.from(table).select('*').order('NgayTao', { ascending: false }));
  const rolesResult = await queryFirst<any[]>(TABLES.roles, (table) => client.from(table).select('MaVaiTro,TenVaiTro'));
  const roleMap = new Map((rolesResult.data || []).map((r: any) => [r.MaVaiTro, r.TenVaiTro]));

  return (usersResult.data || []).map((u: any) => ({
    id: u.MaNguoiDung,
    fullName: u.HoTen || '',
    email: u.Email || '',
    phone: u.SoDienThoai || '',
    role: normalizeRole(roleMap.get(u.MaVaiTro)),
    status: normalizeStatus(u.TrangThai),
    createdAt: formatDate(u.NgayTao),
    roleId: u.MaVaiTro,
    username: u.TenDangNhap,
  }));
}

export async function fetchRoleOptions() {
  const client = getClient();
  const rolesResult = await queryFirst<any[]>(TABLES.roles, (table) => client.from(table).select('MaVaiTro,TenVaiTro'));
  return (rolesResult.data || []).map((r: any) => ({ value: r.MaVaiTro, label: r.TenVaiTro || r.MaVaiTro }));
}

export async function saveUser(payload: {
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  roleId: string;
  status: string;
  password?: string;
}) {
  const client = getClient();
  const now = new Date().toISOString();

  const base = {
    HoTen: payload.fullName,
    Email: payload.email,
    SoDienThoai: payload.phone || null,
    MaVaiTro: payload.roleId,
    TrangThai: payload.status,
  } as any;

  if (payload.id) {
    const updateResult = await queryFirst<any[]>(TABLES.users, async (table) =>
      client.from(table).update(base).eq('MaNguoiDung', payload.id).select('MaNguoiDung'),
    );
    return updateResult.data;
  }

  const userId = `ND${Date.now()}`;
  const username = payload.email.split('@')[0];
  const insertData = {
    MaNguoiDung: userId,
    ...base,
    TenDangNhap: username,
    MatKhau: payload.password || '12345678',
    NgayTao: now,
  };

  const insertResult = await queryFirst<any[]>(TABLES.users, async (table) => client.from(table).insert(insertData).select('MaNguoiDung'));
  return insertResult.data;
}

export async function deleteUser(userId: string) {
  const client = getClient();
  await queryFirst<any[]>(TABLES.users, (table) => client.from(table).delete().eq('MaNguoiDung', userId).select('MaNguoiDung'));
}

export async function fetchSubjects() {
  const client = getClient();

  const [subjectsRes, questionsRes, examsRes, classesRes] = await Promise.all([
    queryFirst<any[]>(TABLES.subjects, (table) => client.from(table).select('*').order('MaMonHoc', { ascending: true })),
    queryFirst<any[]>(TABLES.questions, (table) => client.from(table).select('MaMonHoc')),
    queryFirst<any[]>(TABLES.exams, (table) => client.from(table).select('MaMonHoc')),
    queryFirst<any[]>(TABLES.classes, (table) => client.from(table).select('MaMonHoc,MaGiangVien')),
  ]);

  const questionCount: Record<string, number> = {};
  const examCount: Record<string, number> = {};
  const lecturerSet: Record<string, Set<string>> = {};

  (questionsRes.data || []).forEach((r: any) => {
    const key = r.MaMonHoc;
    questionCount[key] = (questionCount[key] || 0) + 1;
  });

  (examsRes.data || []).forEach((r: any) => {
    const key = r.MaMonHoc;
    examCount[key] = (examCount[key] || 0) + 1;
  });

  (classesRes.data || []).forEach((r: any) => {
    const key = r.MaMonHoc;
    if (!lecturerSet[key]) lecturerSet[key] = new Set();
    if (r.MaGiangVien) lecturerSet[key].add(r.MaGiangVien);
  });

  return (subjectsRes.data || []).map((s: any) => ({
    id: s.MaMonHoc,
    code: s.MaMonHoc,
    name: s.TenMonHoc || '',
    description: s.MoTa || '',
    credits: s.SoTinChi,
    questionCount: questionCount[s.MaMonHoc] || 0,
    examCount: examCount[s.MaMonHoc] || 0,
    lecturerCount: lecturerSet[s.MaMonHoc]?.size || 0,
  }));
}

export async function fetchSemesters() {
  const client = getClient();
  const result = await queryFirst<any[]>(TABLES.semesters, (table) => client.from(table).select('*').order('NgayBatDau', { ascending: false }));

  return (result.data || []).map((r: any) => ({
    id: r.MaHocKyNamHoc,
    code: r.MaHocKyNamHoc,
    name: r.TenHocKy || '',
    academicYearName: r.NamHoc || '',
    startDate: formatDate(r.NgayBatDau),
    endDate: formatDate(r.NgayKetThuc),
    status: normalizeStatus(r.TrangThai),
  }));
}

export async function fetchAcademicYears() {
  const semesters = await fetchSemesters();
  const grouped: Record<string, { name: string; code: string; semesterCount: number; status: 'active' | 'inactive'; startDate: string; endDate: string }> = {};

  semesters.forEach((s) => {
    const key = s.academicYearName || 'N/A';
    if (!grouped[key]) {
      grouped[key] = {
        name: key,
        code: key,
        semesterCount: 0,
        status: 'inactive',
        startDate: s.startDate,
        endDate: s.endDate,
      };
    }
    grouped[key].semesterCount += 1;
    if (s.status === 'active') grouped[key].status = 'active';
    if (!grouped[key].startDate || (s.startDate && s.startDate < grouped[key].startDate)) grouped[key].startDate = s.startDate;
    if (!grouped[key].endDate || (s.endDate && s.endDate > grouped[key].endDate)) grouped[key].endDate = s.endDate;
  });

  return Object.values(grouped).map((v, idx) => ({
    id: `${v.code}-${idx}`,
    ...v,
  }));
}

export async function fetchClasses() {
  const client = getClient();

  const [classesRes, subjectsRes, usersRes, semRes] = await Promise.all([
    queryFirst<any[]>(TABLES.classes, (table) => client.from(table).select('*')),
    queryFirst<any[]>(TABLES.subjects, (table) => client.from(table).select('MaMonHoc,TenMonHoc')),
    queryFirst<any[]>(TABLES.users, (table) => client.from(table).select('MaNguoiDung,HoTen')),
    queryFirst<any[]>(TABLES.semesters, (table) => client.from(table).select('MaHocKyNamHoc,TenHocKy,NamHoc')),
  ]);

  const subjectMap = new Map((subjectsRes.data || []).map((s: any) => [s.MaMonHoc, s.TenMonHoc]));
  const userMap = new Map((usersRes.data || []).map((u: any) => [u.MaNguoiDung, u.HoTen]));
  const semMap = new Map((semRes.data || []).map((s: any) => [s.MaHocKyNamHoc, s]));

  return (classesRes.data || []).map((c: any) => {
    const sem = semMap.get(c.MaHocKyNamHoc);
    return {
      id: c.MaLopHoc,
      code: c.MaLopHoc,
      name: c.TenLopHoc || c.MaLopHoc,
      subjectName: subjectMap.get(c.MaMonHoc) || c.MaMonHoc,
      lecturerName: userMap.get(c.MaGiangVien) || c.MaGiangVien,
      semesterName: sem?.TenHocKy || '',
      academicYearName: sem?.NamHoc || '',
      studentCount: c.SiSo || 0,
      status: 'active',
    };
  });
}

export async function fetchLecturerSummary() {
  const client = getClient();
  const [subRes, detailRes] = await Promise.all([
    queryFirst<any[]>(TABLES.submissions, (table) => client.from(table).select('MaBaiThi,MaSinhVien,TongDiem,XepLoai').order('MaBaiThi', { ascending: false }).limit(50)),
    queryFirst<any[]>(TABLES.gradingDetails, (table) => client.from(table).select('MaBaiThi,DiemDat')),
  ]);

  const detailMap: Record<string, number[]> = {};
  (detailRes.data || []).forEach((d: any) => {
    if (!detailMap[d.MaBaiThi]) detailMap[d.MaBaiThi] = [];
    detailMap[d.MaBaiThi].push(Number(d.DiemDat || 0));
  });

  return (subRes.data || []).map((b: any) => {
    const scores = detailMap[b.MaBaiThi] || [];
    return {
      id: b.MaBaiThi,
      studentId: b.MaSinhVien,
      fullName: b.MaSinhVien,
      scores,
      total: Number(b.TongDiem || 0),
      grade: b.XepLoai || '',
    };
  });
}

export async function fetchRegrades() {
  const client = getClient();
  const result = await queryFirst<any[]>(TABLES.gradingDetails, (table) => client.from(table).select('*').limit(50));
  return (result.data || []).map((r: any) => ({
    id: r.MaChiTietCham,
    studentId: r.MaBaiThi,
    fullName: r.MaBaiThi,
    question: r.MaCauHoi,
    original: Number(r.DiemDat || 0),
    revised: Number(r.DiemDat || 0),
    reason: r.NhanXet || '',
    status: 'pending',
  }));
}

export async function fetchSystemParams() {
  const client = getClient();
  const result = await queryFirst<any[]>(TABLES.params, (table) => client.from(table).select('*'));
  return result.data || [];
}

export async function saveSystemParams(rows: Array<{ MaThamSo: string; GiaTri: string | number }>) {
  const client = getClient();
  const payload = rows.map((r) => ({ MaThamSo: r.MaThamSo, GiaTri: String(r.GiaTri) }));
  await queryFirst<any[]>(TABLES.params, (table) =>
    client.from(table).upsert(payload, { onConflict: 'MaThamSo' }).select('MaThamSo'),
  );
}

export async function saveAcademicYear(payload: {
  namHoc: string;
  tenHocKy: string;
  ngayBatDau?: string;
  ngayKetThuc?: string;
  trangThai?: string;
}) {
  const client = getClient();
  const id = `HKNH_${Date.now()}`;
  const row = {
    MaHocKyNamHoc: id,
    TenHocKy: payload.tenHocKy || 'HK1',
    NamHoc: payload.namHoc,
    NgayBatDau: payload.ngayBatDau || null,
    NgayKetThuc: payload.ngayKetThuc || null,
    TrangThai: payload.trangThai || 'active',
  };
  await queryFirst<any[]>(TABLES.semesters, (table) => client.from(table).insert(row).select('MaHocKyNamHoc'));
}
