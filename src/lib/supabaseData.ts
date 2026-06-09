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
  levels: ['MUCDO', 'mucdo'],
  publicUserDirectory: ['NGUOIDUNG_CONGKHAI', 'nguoidung_congkhai'],
  students: ['SINHVIEN', 'sinhvien'],
  classStudents: ['SINHVIEN_LOPHOC', 'sinhvien_lophoc'],
} as const;

const DEFAULT_ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Quản trị viên' },
  { value: 'GV', label: 'Giảng viên' },
];

const DEFAULT_LEVEL_OPTIONS = [
  { code: 'NB', name: 'Nhận biết' },
  { code: 'TH', name: 'Thông hiểu' },
  { code: 'VD', name: 'Vận dụng' },
  { code: 'VDC', name: 'Vận dụng cao' },
];

const DEFAULT_FACULTY = 'Khoa Công nghệ phần mềm';

export type AppRole = 'admin' | 'lecturer';
export type QuestionKind = 'TRAC_NGHIEM' | 'TU_LUAN';

export const QUESTION_KIND_OPTIONS = [
  { value: 'TRAC_NGHIEM', label: 'Trắc nghiệm' },
  { value: 'TU_LUAN', label: 'Tự luận' },
] as const;

export const EXAM_STATUS_OPTIONS = ['Đang dùng', 'Ngừng dùng'] as const;

type Candidate = readonly string[];

type QueryResult<T> = {
  data: T;
  table: string;
};

type RunnerResponse<T> = PromiseLike<{ data: T | null; error: any }> | { data: T | null; error: any };

type CurrentUserProfile = {
  userId: string | null;
  fullName: string;
  email: string;
  faculty: string;
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

async function queryFirst<T>(candidates: Candidate, runner: (table: string) => RunnerResponse<T>): Promise<QueryResult<T>> {
  let lastError: any;
  for (const table of candidates) {
    const { data, error } = await runner(table);
    if (!error) return { data: (data ?? []) as T, table };
    lastError = error;
    if (!isMissingRelation(error)) break;
  }
  throw new Error(lastError?.message || 'Không thể truy vấn dữ liệu từ Supabase.');
}

async function queryFirstSafe<T>(candidates: Candidate, runner: (table: string) => RunnerResponse<T>, fallback: T): Promise<QueryResult<T>> {
  try {
    return await queryFirst<T>(candidates, runner);
  } catch {
    return { data: fallback, table: candidates[0] };
  }
}

async function countRows(candidates: Candidate): Promise<number> {
  const client = getClient();
  const res = await queryFirst<{ count: number }>(candidates, async (table) => {
    const { count, error } = await client.from(table).select('*', { count: 'exact', head: true });
    return { data: { count: count || 0 }, error };
  });
  return res.data.count;
}

function normalizeRole(name: string | null | undefined): AppRole | null {
  const v = (name || '').toLowerCase();
  if (['admin', 'ad', 'qtv'].includes(v)) return 'admin';
  if (['gv', 'lecturer', 'giangvien', 'giảngviên'].includes(v)) return 'lecturer';
  if (v.includes('admin')) return 'admin';
  if (v.includes('giảng') || v.includes('giang') || v.includes('lect')) return 'lecturer';
  return null;
}

function normalizeStatus(value: string | null | undefined): 'active' | 'inactive' | 'pending' {
  const v = (value || '').toLowerCase();
  if (['pending', 'cho_duyet', 'chờ duyệt', 'cho duyet'].includes(v)) return 'pending';
  if (['1', 'active', 'hoatdong', 'đang hoạt động', 'danghoatdong', 'đang mở', 'dang mo'].includes(v)) return 'active';
  return 'inactive';
}

function formatDate(value: string | null | undefined) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 10);
}

function toDateTimeValue(value: string | null | undefined) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function normalizeQuestionKind(value: string | null | undefined): QuestionKind {
  const raw = String(value || '').trim().toUpperCase();
  if (raw === 'TRAC_NGHIEM') return 'TRAC_NGHIEM';
  return 'TU_LUAN';
}

function parseChoices(value: any): Array<{ key: string; text: string }> {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => ({
      key: String(item?.key || item?.label || ''),
      text: String(item?.text || item?.value || ''),
    })).filter((item) => item.key && item.text);
  }
  if (typeof value === 'string') {
    try {
      return parseChoices(JSON.parse(value));
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeExamStatus(value: string | null | undefined) {
  const raw = String(value || '').trim();
  return EXAM_STATUS_OPTIONS.includes(raw as any) ? raw : 'Đang dùng';
}

function autoGradeMcq(answer: string | null | undefined, correct: string | null | undefined, maxScore: number) {
  const normalizedAnswer = String(answer || '').trim().toUpperCase();
  const normalizedCorrect = String(correct || '').trim().toUpperCase();
  if (!normalizedAnswer || !normalizedCorrect) return 0;
  return normalizedAnswer === normalizedCorrect ? maxScore : 0;
}

function getField(row: any, keys: string[]) {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null && row?.[key] !== '') return row[key];
  }
  return undefined;
}

function toAppError(error: any) {
  const message = error?.message || 'Không thể truy vấn dữ liệu từ Supabase.';
  if (/row-level security policy/i.test(message)) {
    return new Error('Bạn chưa có quyền ghi dữ liệu trên Supabase (RLS). Hãy thêm policy INSERT/UPDATE/DELETE hoặc tắt RLS cho bảng liên quan.');
  }
  if (/auth_user_id/i.test(message) && /column/i.test(message)) {
    return new Error('Bảng NGUOIDUNG chưa có cột auth_user_id. Hãy chạy SQL ALTER TABLE để thêm cột liên kết auth.users.');
  }
  return new Error(message);
}

function validateDateRange(startDate?: string | null, endDate?: string | null) {
  if (!startDate || !endDate) {
    throw new Error('Ngày bắt đầu và ngày kết thúc là bắt buộc.');
  }
  if (startDate > endDate) {
    throw new Error('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
  }
}

async function resolveCurrentDbUserId() {
  const client = getClient();
  const { data: authData } = await client.auth.getUser();
  const authUserId = authData?.user?.id;
  const email = authData?.user?.email?.toLowerCase();
  if (!authUserId && !email) return null;

  const usersResult = await queryFirst<any[]>(TABLES.users, (table) => client.from(table).select('*'));
  const users = usersResult.data || [];
  const byAuthId = users.find((u: any) => String(getField(u, ['auth_user_id'])) === String(authUserId));
  const byEmail = users.find((u: any) => String(getField(u, ['Email', 'email']) || '').toLowerCase() === email);
  const row = byAuthId || byEmail;
  return row ? String(getField(row, ['MaNguoiDung', 'maNguoiDung']) || '') : null;
}

export async function fetchCurrentUserProfile(): Promise<CurrentUserProfile> {
  const client = getClient();
  const { data: authData } = await client.auth.getUser();
  const authUserId = authData?.user?.id || null;
  const email = authData?.user?.email?.toLowerCase() || '';

  if (!authUserId && !email) {
    return {
      userId: null,
      fullName: 'Giảng viên',
      email: '',
      faculty: 'Chưa cập nhật khoa',
    };
  }

  const usersResult = await queryFirst<any[]>(TABLES.users, (table) => client.from(table).select('*'));
  const users = usersResult.data || [];
  const byAuthId = users.find((u: any) => String(getField(u, ['auth_user_id'])) === String(authUserId));
  const byEmail = users.find((u: any) => String(getField(u, ['Email', 'email']) || '').toLowerCase() === email);
  const row = byAuthId || byEmail;

  return {
    userId: row ? String(getField(row, ['MaNguoiDung', 'maNguoiDung']) || '') : null,
    fullName: String(getField(row, ['HoTen', 'hoten']) || 'Giảng viên'),
    email: String(getField(row, ['Email', 'email']) || email || ''),
    faculty: String(getField(row, ['Khoa', 'khoa', 'BoMon', 'bomon', 'DonVi', 'donvi']) || 'Chưa cập nhật khoa'),
  };
}

async function createAuthUserByEdgeFunction(payload: {
  userId?: string;
  fullName: string;
  email: string;
  roleId: string;
  password?: string;
}) {
  const client = getClient();
  const { data, error } = await client.functions.invoke('admin-create-user', {
    body: {
      userId: payload.userId,
      fullName: payload.fullName,
      email: payload.email,
      roleId: payload.roleId,
      password: payload.password || '12345678',
    },
  });

  if (error) {
    const msg = error.message || '';
    if (msg.includes('Failed to send a request to the Edge Function') || msg.includes('FunctionsHttpError')) {
      throw new Error('Chưa gọi được Edge Function admin-create-user. Hãy deploy function này trên Supabase trước khi thêm người dùng.');
    }
    throw new Error(msg || 'Không tạo được tài khoản đăng nhập cho người dùng mới.');
  }

  const authUserId = data?.userId || data?.id || data?.user?.id;
  if (!authUserId) {
    throw new Error('Edge Function admin-create-user không trả về userId hợp lệ.');
  }

  return String(authUserId);
}

export async function fetchDashboardData() {
  const [totalExams, totalGradedSubmissions, totalClasses] = await Promise.all([
    countRows(TABLES.exams),
    countRows(TABLES.submissions),
    countRows(TABLES.classes),
  ]);

  const client = getClient();
  const usersResult = await queryFirst<any[]>(TABLES.users, (table) => client.from(table).select('MaVaiTro'));
  const rolesResult = await queryFirst<any[]>(TABLES.roles, (table) => client.from(table).select('*'));
  const roleMap = new Map((rolesResult.data || []).map((r: any) => [getField(r, ['MaVaiTro', 'maVaiTro', 'mavaitro']), getField(r, ['TenVaiTro', 'tenVaiTro', 'tenvaitro'])]));

  const roleCounts = (usersResult.data || []).reduce((acc: Record<string, number>, row: any) => {
    const role = normalizeRole(roleMap.get(row.MaVaiTro));
    if (!role) return acc;
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});
  const totalUsers = (roleCounts.admin || 0) + (roleCounts.lecturer || 0);

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
    ],
    examsByMonth,
    recentActivities: [],
  };
}

export async function fetchUsers() {
  const client = getClient();
  const usersResult = await queryFirst<any[]>(TABLES.users, (table) => client.from(table).select('*').order('NgayTao', { ascending: false }));
  const rolesResult = await queryFirst<any[]>(TABLES.roles, (table) => client.from(table).select('*'));
  const roleMap = new Map((rolesResult.data || []).map((r: any) => [getField(r, ['MaVaiTro', 'maVaiTro', 'mavaitro']), getField(r, ['TenVaiTro', 'tenVaiTro', 'tenvaitro'])]));

  return (usersResult.data || [])
    .map((u: any) => {
      const role = normalizeRole(roleMap.get(u.MaVaiTro) || u.MaVaiTro);
      return {
        id: u.MaNguoiDung,
        fullName: u.HoTen || '',
        email: u.Email || '',
        phone: u.SoDienThoai || '',
        role,
        status: normalizeStatus(u.TrangThai),
        createdAt: formatDate(u.NgayTao),
        roleId: u.MaVaiTro,
        username: u.TenDangNhap,
      };
    })
    .filter((u) => !!u.role);
}

export async function fetchRoleOptions() {
  const client = getClient();
  const rolesResult = await queryFirst<any[]>(TABLES.roles, (table) => client.from(table).select('*'));
  const options = (rolesResult.data || [])
    .map((r: any) => {
      const value = getField(r, ['MaVaiTro', 'maVaiTro', 'mavaitro']);
      if (!value) return null;
      if (!normalizeRole(String(value))) return null;
      const label = getField(r, ['TenVaiTro', 'tenVaiTro', 'tenvaitro']) || value;
      return { value, label };
    })
    .filter(Boolean) as Array<{ value: string; label: string }>;

  return options.length > 0 ? options : DEFAULT_ROLE_OPTIONS;
}

export async function fetchCurrentUserRole(authUserId: string, email?: string | null): Promise<AppRole | null> {
  const client = getClient();
  const usersResult = await queryFirst<any[]>(TABLES.users, (table) => client.from(table).select('*'));
  const users = usersResult.data || [];

  const byAuthId = users.find((u: any) => String(getField(u, ['auth_user_id'])) === String(authUserId));
  const byEmail = users.find((u: any) => {
    const rowEmail = String(getField(u, ['Email', 'email']) || '').toLowerCase();
    return !!email && rowEmail === email.toLowerCase();
  });
  const matchedUser = byAuthId || byEmail;
  if (!matchedUser) return null;
  if (normalizeStatus(getField(matchedUser, ['TrangThai', 'trangthai'])) !== 'active') return null;

  const roleId = getField(matchedUser, ['MaVaiTro', 'maVaiTro', 'mavaitro']);
  if (!roleId) return null;
  return normalizeRole(String(roleId));
}

export async function fetchCurrentUserAccountStatus(authUserId: string, email?: string | null): Promise<'active' | 'pending' | 'inactive' | 'missing'> {
  const client = getClient();
  const usersResult = await queryFirst<any[]>(TABLES.users, (table) => client.from(table).select('*'));
  const users = usersResult.data || [];

  const byAuthId = users.find((u: any) => String(getField(u, ['auth_user_id'])) === String(authUserId));
  const byEmail = users.find((u: any) => {
    const rowEmail = String(getField(u, ['Email', 'email']) || '').toLowerCase();
    return !!email && rowEmail === email.toLowerCase();
  });
  const matchedUser = byAuthId || byEmail;
  if (!matchedUser) return 'missing';
  return normalizeStatus(getField(matchedUser, ['TrangThai', 'trangthai']));
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
  const normalizedEmail = payload.email.trim().toLowerCase();
  const existingEmailRes = await queryFirstSafe<any[]>(
    TABLES.users,
    (table) => client.from(table).select('MaNguoiDung,Email').ilike('Email', normalizedEmail),
    [],
  );
  const duplicateEmail = (existingEmailRes.data || []).find((row: any) => String(row.MaNguoiDung) !== String(payload.id || ''));
  if (duplicateEmail) {
    throw new Error('Email này đã tồn tại trong hệ thống.');
  }

  const base = {
    HoTen: payload.fullName,
    Email: normalizedEmail,
    SoDienThoai: payload.phone || null,
    MaVaiTro: payload.roleId,
    TrangThai: payload.status,
    Khoa: payload.roleId === 'GV' ? DEFAULT_FACULTY : null,
  } as any;

  if (payload.id) {
    try {
      const currentUserRes = await queryFirst<any[]>(TABLES.users, (table) =>
        client.from(table).select('MaNguoiDung,auth_user_id').eq('MaNguoiDung', payload.id).limit(1),
      );
      const currentUser = (currentUserRes.data || [])[0];
      const needsAuthProvision = payload.status === 'active' && !currentUser?.auth_user_id;
      const updateBase = { ...base } as any;

      if (needsAuthProvision) {
        if (!String(payload.password || '').trim()) {
          throw new Error('Cần nhập mật khẩu khi kích hoạt tài khoản chưa có quyền đăng nhập.');
        }
        const authUserId = await createAuthUserByEdgeFunction({
          userId: payload.id,
          fullName: payload.fullName,
          email: payload.email,
          roleId: payload.roleId,
          password: payload.password,
        });
        updateBase.auth_user_id = authUserId;
        updateBase.TenDangNhap = payload.email.split('@')[0];
      }

      const updateResult = await queryFirst<any[]>(TABLES.users, async (table) =>
        client.from(table).update(updateBase).eq('MaNguoiDung', payload.id).select('MaNguoiDung'),
      );
      return updateResult.data;
    } catch (error: any) {
      throw toAppError(error);
    }
  }

  const userId = `ND${Date.now()}`;
  const username = payload.email.split('@')[0];
  const insertData = {
    MaNguoiDung: userId,
    ...base,
    TenDangNhap: username,
    NgayTao: now,
    auth_user_id: null,
  };

  if (payload.status === 'active') {
    if (!String(payload.password || '').trim()) {
      throw new Error('Cần nhập mật khẩu khi tạo tài khoản đang hoạt động.');
    }
    insertData.auth_user_id = await createAuthUserByEdgeFunction(payload);
  }

  let insertResult;
  try {
    insertResult = await queryFirst<any[]>(TABLES.users, async (table) => client.from(table).insert(insertData).select('MaNguoiDung'));
  } catch (error: any) {
    throw toAppError(error);
  }
  return insertResult.data;
}

export async function submitRegistrationRequest(payload: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}) {
  const client = getClient();
  const { data, error } = await client.functions.invoke('submit-registration-request', {
    body: {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone || '',
      password: payload.password,
    },
  });

  if (error) {
    throw new Error(error.message || 'Không gửi được yêu cầu đăng ký.');
  }

  if (data?.error) {
    throw new Error(String(data.error));
  }

  return data;
}

export async function approvePendingUser(payload: {
  userId: string;
  fullName: string;
  email: string;
  roleId: string;
  phone?: string;
  password?: string;
}) {
  const client = getClient();
  const currentUserRes = await queryFirst<any[]>(TABLES.users, (table) =>
    client.from(table).select('MaNguoiDung,auth_user_id').eq('MaNguoiDung', payload.userId).limit(1),
  );
  const currentUser = (currentUserRes.data || [])[0];
  if (!currentUser?.auth_user_id && !String(payload.password || '').trim()) {
    throw new Error('Tài khoản này chưa có quyền đăng nhập. Hãy đặt mật khẩu trước khi duyệt kích hoạt.');
  }
  const authUserId = currentUser?.auth_user_id || await createAuthUserByEdgeFunction({
    userId: payload.userId,
    fullName: payload.fullName,
    email: payload.email,
    roleId: payload.roleId,
    password: payload.password,
  });

  const username = payload.email.split('@')[0];
  try {
    await queryFirst<any[]>(TABLES.users, (table) =>
      client
        .from(table)
        .update({
          HoTen: payload.fullName,
          Email: payload.email,
          SoDienThoai: payload.phone || null,
          MaVaiTro: payload.roleId,
          TrangThai: 'active',
          TenDangNhap: username,
          auth_user_id: authUserId,
        })
        .eq('MaNguoiDung', payload.userId)
        .select('MaNguoiDung'),
    );
  } catch (error: any) {
    throw toAppError(error);
  }
}

export async function deleteUser(userId: string) {
  const client = getClient();
  const [classesRes, questionsRes, examsRes, gradedRes] = await Promise.all([
    queryFirstSafe<any[]>(TABLES.classes, (table) =>
      client.from(table).select('MaLopHoc').eq('MaGiangVien', userId), []
    ),
    queryFirstSafe<any[]>(TABLES.questions, (table) =>
      client.from(table).select('MaCauHoi').eq('MaNguoiSoan', userId).limit(3), []
    ),
    queryFirstSafe<any[]>(TABLES.exams, (table) =>
      client.from(table).select('MaDeThi').eq('MaNguoiSoan', userId).limit(3), []
    ),
    queryFirstSafe<any[]>(TABLES.submissions, (table) =>
      client.from(table).select('MaBaiThi').eq('MaNguoiCham', userId).limit(3), []
    ),
  ]);
  const reasons: string[] = [];
  const assignedClasses = classesRes.data || [];
  if (assignedClasses.length > 0) {
    const preview = assignedClasses.slice(0, 3).map((r: any) => r.MaLopHoc).join(', ') + (assignedClasses.length > 3 ? '...' : '');
    reasons.push(`đang phụ trách ${assignedClasses.length} lớp học (${preview})`);
  }
  if ((questionsRes.data || []).length > 0) reasons.push('đã soạn câu hỏi');
  if ((examsRes.data || []).length > 0) reasons.push('đã soạn đề thi');
  if ((gradedRes.data || []).length > 0) reasons.push('đã chấm bài thi');
  if (reasons.length > 0) {
    throw new Error(`Không thể xóa người dùng này vì ${reasons.join(', ')}. Hãy chuyển trạng thái sang ngừng hoạt động thay vì xóa.`);
  }
  try {
    await queryFirst<any[]>(TABLES.users, (table) => client.from(table).delete().eq('MaNguoiDung', userId).select('MaNguoiDung'));
  } catch (error: any) {
    throw toAppError(error);
  }
}

export async function fetchSubjects() {
  const client = getClient();

  const [subjectsRes, questionsRes, examsRes, classesRes] = await Promise.all([
    queryFirst<any[]>(TABLES.subjects, (table) => client.from(table).select('*').order('MaMonHoc', { ascending: true })),
    queryFirstSafe<any[]>(TABLES.questions, (table) => client.from(table).select('MaMonHoc'), []),
    queryFirstSafe<any[]>(TABLES.exams, (table) => client.from(table).select('MaMonHoc'), []),
    queryFirstSafe<any[]>(TABLES.classes, (table) => client.from(table).select('MaMonHoc,MaGiangVien'), []),
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

export async function fetchYearReportData(filters?: {
  academicYear?: string;
  semesterCode?: string;
  subjectCode?: string;
  examId?: string;
  classId?: string;
}) {
  const client = getClient();
  const currentUserId = await resolveCurrentDbUserId();
  const role = await fetchCurrentUserRole(
    (await client.auth.getUser()).data.user?.id || '',
    (await client.auth.getUser()).data.user?.email || '',
  );

  const [examsRes, submissionsRes, detailsRes, subjectsRes, semestersRes, classesRes] = await Promise.all([
    queryFirst<any[]>(TABLES.exams, (table) => client.from(table).select('*').order('NgaySoan', { ascending: false })),
    queryFirst<any[]>(TABLES.submissions, (table) => client.from(table).select('*').order('GioNop', { ascending: false })),
    queryFirst<any[]>(TABLES.examDetails, (table) => client.from(table).select('MaDeThi,MaCauHoi')),
    queryFirst<any[]>(TABLES.subjects, (table) => client.from(table).select('MaMonHoc,TenMonHoc,Khoa')),
    queryFirst<any[]>(TABLES.semesters, (table) => client.from(table).select('MaHocKyNamHoc,TenHocKy,NamHoc')),
    queryFirstSafe<any[]>(TABLES.classes, (table) => client.from(table).select('MaLopHoc,MaMonHoc,MaHocKyNamHoc,MaGiangVien'), []),
  ]);

  const subjectMap = new Map((subjectsRes.data || []).map((row: any) => [row.MaMonHoc, row]));
  const semesterMap = new Map((semestersRes.data || []).map((row: any) => [row.MaHocKyNamHoc, row]));
  const detailCountMap: Record<string, number> = {};
  (detailsRes.data || []).forEach((row: any) => {
    detailCountMap[row.MaDeThi] = (detailCountMap[row.MaDeThi] || 0) + 1;
  });

  const classRows = (classesRes.data || []).map((row: any) => ({
    id: row.MaLopHoc,
    subjectCode: row.MaMonHoc,
    semesterCode: row.MaHocKyNamHoc,
    lecturerId: row.MaGiangVien,
  }));

  let exams = (examsRes.data || []).map((row: any) => {
    const semester = semesterMap.get(row.MaHocKyNamHoc);
    const subject = subjectMap.get(row.MaMonHoc);
    const relatedClasses = classRows.filter((item) => item.subjectCode === row.MaMonHoc && item.semesterCode === row.MaHocKyNamHoc);
    return {
      id: row.MaDeThi,
      title: row.GhiChu || row.MaDeThi,
      subjectCode: row.MaMonHoc || '',
      subjectName: subject?.TenMonHoc || row.MaMonHoc || '',
      faculty: subject?.Khoa || '',
      semesterCode: row.MaHocKyNamHoc || '',
      semesterName: semester?.TenHocKy || '',
      academicYear: semester?.NamHoc || '',
      questionCount: detailCountMap[row.MaDeThi] || 0,
      classIds: relatedClasses.map((item) => item.id),
      authorId: row.MaNguoiSoan || '',
      status: row.TrangThai || '',
    };
  });

  if (role === 'lecturer' && currentUserId) {
    const profile = await fetchCurrentUserProfile();
    exams = exams.filter((row) => row.authorId === currentUserId || row.faculty === profile.faculty);
  }

  const filteredExams = exams.filter((row) => {
    if (filters?.academicYear && row.academicYear !== filters.academicYear) return false;
    if (filters?.semesterCode && row.semesterCode !== filters.semesterCode) return false;
    if (filters?.subjectCode && row.subjectCode !== filters.subjectCode) return false;
    if (filters?.examId && row.id !== filters.examId) return false;
    if (filters?.classId && !row.classIds.includes(filters.classId)) return false;
    return true;
  });

  const examIdSet = new Set(filteredExams.map((row) => row.id));
  const filteredSubmissions = (submissionsRes.data || []).filter((row: any) => examIdSet.has(row.MaDeThi));

  const rows = filteredExams.map((row) => {
    const matchedSubmissions = filteredSubmissions.filter((item: any) => item.MaDeThi === row.id);
    const graded = matchedSubmissions.filter((item: any) => String(item.TrangThai || '').includes('Đã chấm')).length;
    const grading = matchedSubmissions.filter((item: any) => String(item.TrangThai || '').includes('Đang chấm')).length;
    const ungraded = matchedSubmissions.filter((item: any) => !item.TrangThai || String(item.TrangThai || '').includes('Chưa chấm')).length;
    const gradedScores = matchedSubmissions
      .map((item: any) => Number(item.TongDiem))
      .filter((value: number) => !Number.isNaN(value) && value > 0);
    return {
      ...row,
      submissionCount: matchedSubmissions.length,
      gradedCount: graded,
      gradingCount: grading,
      ungradedCount: ungraded,
      averageScore: gradedScores.length ? Number((gradedScores.reduce((sum, item) => sum + item, 0) / gradedScores.length).toFixed(2)) : 0,
      classDisplay: row.classIds.join(', ') || '-',
    };
  });

  // Cascade filter options: each level narrows based on selected filters above it
  const examsForYear = filters?.academicYear
    ? exams.filter((row) => row.academicYear === filters.academicYear)
    : exams;
  const examsForSemester = filters?.semesterCode
    ? examsForYear.filter((row) => row.semesterCode === filters.semesterCode)
    : examsForYear;
  const examsForSubject = filters?.subjectCode
    ? examsForSemester.filter((row) => row.subjectCode === filters.subjectCode)
    : examsForSemester;

  const filterOptions = {
    academicYears: Array.from(new Set(exams.map((row) => row.academicYear).filter(Boolean))),
    semesters: Array.from(new Map(examsForYear.map((row) => [row.semesterCode, { code: row.semesterCode, name: row.semesterName, academicYear: row.academicYear }])).values()),
    subjects: Array.from(new Map(examsForSemester.map((row) => [row.subjectCode, { code: row.subjectCode, name: row.subjectName }])).values()),
    exams: examsForSubject.map((row) => ({ id: row.id, title: row.title })),
    classes: Array.from(new Map(
      classRows
        .filter((row) => !filters?.semesterCode || row.semesterCode === filters.semesterCode)
        .map((row) => [row.id, { id: row.id, subjectCode: row.subjectCode, semesterCode: row.semesterCode }])
    ).values()),
  };

  const summary = {
    totalExams: rows.length,
    totalSubmissions: rows.reduce((sum, row) => sum + row.submissionCount, 0),
    totalQuestions: rows.reduce((sum, row) => sum + row.questionCount, 0),
    gradedCount: rows.reduce((sum, row) => sum + row.gradedCount, 0),
  };

  return { rows, summary, filterOptions };
}

export async function fetchSemesters() {
  const client = getClient();
  const result = await queryFirst<any[]>(TABLES.semesters, (table) => client.from(table).select('*').order('NgayBatDau', { ascending: false }));

  const today = new Date().toISOString().slice(0, 10);
  return (result.data || []).map((r: any) => {
    const startDate = formatDate(r.NgayBatDau);
    const endDate = formatDate(r.NgayKetThuc);
    let status: 'active' | 'inactive' | 'pending';
    if (startDate && endDate) {
      if (endDate < today || startDate > today) {
        status = 'inactive';
      } else {
        status = 'active';
      }
    } else {
      status = normalizeStatus(r.TrangThai);
    }
    return {
      id: r.MaHocKyNamHoc,
      code: r.MaHocKyNamHoc,
      name: r.TenHocKy || '',
      academicYearName: r.NamHoc || '',
      startDate,
      endDate,
      status,
      rawStatus: r.TrangThai || '',
    };
  });
}

export async function fetchActiveSemesters() {
  const semesters = await fetchSemesters();
  return semesters.filter((semester) => semester.status === 'active');
}

export async function fetchSemesterById(semesterId: string) {
  const rows = await fetchSemesters();
  return rows.find((row) => String(row.id) === String(semesterId)) || null;
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

export async function updateAcademicYear(payload: {
  originalNamHoc: string;
  namHoc: string;
  trangThai?: string;
  ngayBatDau?: string;
  ngayKetThuc?: string;
}) {
  const client = getClient();
  validateDateRange(payload.ngayBatDau, payload.ngayKetThuc);
  const update: Record<string, any> = { NamHoc: payload.namHoc };
  if (payload.trangThai !== undefined) update.TrangThai = payload.trangThai;
  if (payload.ngayBatDau !== undefined) update.NgayBatDau = payload.ngayBatDau || null;
  if (payload.ngayKetThuc !== undefined) update.NgayKetThuc = payload.ngayKetThuc || null;
  try {
    await queryFirst<any[]>(TABLES.semesters, (table) =>
      client.from(table).update(update).eq('NamHoc', payload.originalNamHoc).select('MaHocKyNamHoc'),
    );
  } catch (error: any) {
    throw toAppError(error);
  }
}

export async function deleteAcademicYear(namHoc: string) {
  const client = getClient();
  const semestersRes = await queryFirstSafe<any[]>(TABLES.semesters, (table) =>
    client.from(table).select('MaHocKyNamHoc').eq('NamHoc', namHoc), []
  );
  const semesterIds = (semestersRes.data || []).map((r: any) => r.MaHocKyNamHoc);
  if (semesterIds.length > 0) {
    const [classesRes, examsRes] = await Promise.all([
      queryFirstSafe<any[]>(TABLES.classes, (table) => client.from(table).select('MaLopHoc').in('MaHocKyNamHoc', semesterIds).limit(1), []),
      queryFirstSafe<any[]>(TABLES.exams, (table) => client.from(table).select('MaDeThi').in('MaHocKyNamHoc', semesterIds).limit(1), []),
    ]);
    const reasons: string[] = [];
    if ((classesRes.data || []).length > 0) reasons.push('có lớp học thuộc các học kỳ trong năm này');
    if ((examsRes.data || []).length > 0) reasons.push('có đề thi thuộc các học kỳ trong năm này');
    if (reasons.length > 0) {
      throw new Error(`Không thể xóa năm học này vì ${reasons.join(', ')}. Hãy xóa các dữ liệu liên quan trước.`);
    }
  }
  try {
    await queryFirst<any[]>(TABLES.semesters, (table) =>
      client.from(table).delete().eq('NamHoc', namHoc).select('MaHocKyNamHoc'),
    );
  } catch (error: any) {
    throw toAppError(error);
  }
}

export async function fetchClasses() {
  const client = getClient();

  const [classesRes, subjectsRes, usersRes, semRes, classStudentsRes] = await Promise.all([
    queryFirst<any[]>(TABLES.classes, (table) => client.from(table).select('*')),
    queryFirstSafe<any[]>(TABLES.subjects, (table) => client.from(table).select('MaMonHoc,TenMonHoc'), []),
    queryFirstSafe<any[]>(TABLES.users, (table) => client.from(table).select('MaNguoiDung,HoTen'), []),
    queryFirstSafe<any[]>(TABLES.semesters, (table) => client.from(table).select('MaHocKyNamHoc,TenHocKy,NamHoc'), []),
    queryFirstSafe<any[]>(TABLES.classStudents, (table) => client.from(table).select('MaLopHoc,MaSinhVien').eq('TrangThai', 'active'), []),
  ]);

  const subjectMap = new Map((subjectsRes.data || []).map((s: any) => [s.MaMonHoc, s.TenMonHoc]));
  const userMap = new Map((usersRes.data || []).map((u: any) => [u.MaNguoiDung, u.HoTen]));
  const semMap = new Map((semRes.data || []).map((s: any) => [s.MaHocKyNamHoc, s]));
  const enrollmentCountMap: Record<string, number> = {};
  (classStudentsRes.data || []).forEach((row: any) => {
    enrollmentCountMap[row.MaLopHoc] = (enrollmentCountMap[row.MaLopHoc] || 0) + 1;
  });

  return (classesRes.data || []).map((c: any) => {
    const sem = semMap.get(c.MaHocKyNamHoc);
    const actualStudentCount = enrollmentCountMap[c.MaLopHoc] || 0;
    return {
      id: c.MaLopHoc,
      code: c.MaLopHoc,
      name: c.TenLopHoc || c.MaLopHoc,
      subjectCode: c.MaMonHoc || '',
      lecturerId: c.MaGiangVien || '',
      semesterCode: c.MaHocKyNamHoc || '',
      subjectName: subjectMap.get(c.MaMonHoc) || c.MaMonHoc,
      lecturerName: userMap.get(c.MaGiangVien) || c.MaGiangVien,
      semesterName: sem?.TenHocKy || '',
      academicYearName: sem?.NamHoc || '',
      studentCount: actualStudentCount,
      plannedStudentCount: c.SiSo || 0,
      room: c.PhongHoc || '',
      schedule: c.LichHoc || '',
      status: 'active',
    };
  });
}

export async function fetchClassById(classId: string) {
  const rows = await fetchClasses();
  return rows.find((row) => String(row.id) === String(classId)) || null;
}

export async function fetchLecturerOptions() {
  const rows = await fetchUsers();
  return rows
    .filter((row) => row.role === 'lecturer')
    .map((row) => ({ value: row.id, label: `${row.id} - ${row.fullName}` }));
}

export async function saveClass(payload: {
  id?: string;
  code: string;
  name: string;
  semesterCode: string;
  subjectCode: string;
  lecturerId: string;
  studentCount?: number;
  room?: string;
  schedule?: string;
}) {
  const client = getClient();
  const normalizedCode = payload.code.trim();
  if (!normalizedCode) throw new Error('Mã lớp học là bắt buộc.');
  if (!payload.semesterCode) throw new Error('Học kỳ là bắt buộc.');
  if (!payload.subjectCode) throw new Error('Môn học là bắt buộc.');
  if (!payload.lecturerId) throw new Error('Giảng viên phụ trách là bắt buộc.');
  const plannedStudentCount = Number(payload.studentCount || 0);
  if (Number.isNaN(plannedStudentCount) || plannedStudentCount < 0) {
    throw new Error('Sĩ số lớp học phải lớn hơn hoặc bằng 0.');
  }

  const existingClass = await queryFirstSafe<any[]>(TABLES.classes, (table) =>
    client.from(table).select('MaLopHoc').eq('MaLopHoc', normalizedCode).limit(1), []
  );
  if (!payload.id && (existingClass.data || []).length > 0) {
    throw new Error(`Mã lớp "${normalizedCode}" đã tồn tại.`);
  }

  if (payload.id) {
    const enrolledRows = await queryFirstSafe<any[]>(TABLES.classStudents, (table) =>
      client.from(table).select('MaSinhVienLopHoc').eq('MaLopHoc', payload.id).eq('TrangThai', 'active'), []
    );
    const enrolledCount = (enrolledRows.data || []).length;
    if (plannedStudentCount < enrolledCount) {
      throw new Error(`Sĩ số kế hoạch không được nhỏ hơn số sinh viên hiện có (${enrolledCount}).`);
    }
  }

  const row = {
    MaLopHoc: normalizedCode,
    TenLopHoc: payload.name.trim() || normalizedCode,
    MaHocKyNamHoc: payload.semesterCode,
    MaMonHoc: payload.subjectCode,
    MaGiangVien: payload.lecturerId,
    SiSo: plannedStudentCount,
    PhongHoc: payload.room?.trim() || null,
    LichHoc: payload.schedule?.trim() || null,
  };
  try {
    if (payload.id) {
      await queryFirst<any[]>(TABLES.classes, (table) => client.from(table).update(row).eq('MaLopHoc', payload.id).select('MaLopHoc'));
      return payload.id;
    }
    await queryFirst<any[]>(TABLES.classes, (table) => client.from(table).insert(row).select('MaLopHoc'));
    return payload.code.trim();
  } catch (error: any) {
    throw toAppError(error);
  }
}

export async function fetchLecturerOwnedClassById(classId: string) {
  const rows = await fetchLecturerClasses();
  return rows.find((row) => String(row.id) === String(classId)) || null;
}

export async function saveLecturerClass(payload: {
  id?: string;
  code: string;
  name?: string;
  semesterCode: string;
  subjectCode: string;
  studentCount?: number;
  room?: string;
  schedule?: string;
}) {
  const currentUserId = await resolveCurrentDbUserId();
  if (!currentUserId) {
    throw new Error('Không xác định được giảng viên đăng nhập. Vui lòng đăng nhập lại.');
  }

  if (payload.id) {
    const ownedClass = await fetchLecturerOwnedClassById(payload.id);
    if (!ownedClass) {
      throw new Error('Bạn không có quyền chỉnh sửa lớp học này.');
    }
  }

  return saveClass({
    id: payload.id,
    code: payload.code,
    name: payload.name || payload.code,
    semesterCode: payload.semesterCode,
    subjectCode: payload.subjectCode,
    lecturerId: currentUserId,
    studentCount: payload.studentCount,
    room: payload.room,
    schedule: payload.schedule,
  });
}

export async function deleteLecturerClass(classId: string) {
  const ownedClass = await fetchLecturerOwnedClassById(classId);
  if (!ownedClass) {
    throw new Error('Bạn không có quyền xóa lớp học này.');
  }
  await deleteClass(classId);
}

export async function deleteClass(classId: string) {
  const client = getClient();
  const studentsRes = await queryFirstSafe<any[]>(TABLES.classStudents, (table) =>
    client.from(table).select('MaSinhVienLopHoc').eq('MaLopHoc', classId).limit(1), []
  );
  if ((studentsRes.data || []).length > 0) {
    throw new Error('Không thể xóa lớp học này vì đã có danh sách sinh viên. Hãy gỡ sinh viên khỏi lớp trước.');
  }
  try {
    await queryFirst<any[]>(TABLES.classes, (table) => client.from(table).delete().eq('MaLopHoc', classId).select('MaLopHoc'));
  } catch (error: any) {
    throw toAppError(error);
  }
}

export async function fetchLecturerClasses() {
  const client = getClient();
  const currentUserId = await resolveCurrentDbUserId();
  if (!currentUserId) {
    throw new Error('Không xác định được giảng viên đăng nhập. Vui lòng đăng nhập lại.');
  }

  const [classesRes, subjectsRes, semestersRes, classStudentsRes] = await Promise.all([
    queryFirst<any[]>(TABLES.classes, (table) =>
      client.from(table).select('*').eq('MaGiangVien', currentUserId).order('MaLopHoc', { ascending: true })
    ),
    queryFirstSafe<any[]>(TABLES.subjects, (table) => client.from(table).select('MaMonHoc,TenMonHoc'), []),
    queryFirstSafe<any[]>(TABLES.semesters, (table) => client.from(table).select('MaHocKyNamHoc,TenHocKy,NamHoc'), []),
    queryFirstSafe<any[]>(TABLES.classStudents, (table) => client.from(table).select('MaLopHoc,MaSinhVien').eq('TrangThai', 'active'), []),
  ]);

  const subjectMap = new Map((subjectsRes.data || []).map((row: any) => [row.MaMonHoc, row.TenMonHoc || row.MaMonHoc]));
  const semesterMap = new Map((semestersRes.data || []).map((row: any) => [row.MaHocKyNamHoc, row]));
  const enrolledCountMap: Record<string, number> = {};
  (classStudentsRes.data || []).forEach((row: any) => {
    enrolledCountMap[row.MaLopHoc] = (enrolledCountMap[row.MaLopHoc] || 0) + 1;
  });

  return (classesRes.data || []).map((row: any) => {
    const semester = semesterMap.get(row.MaHocKyNamHoc);
    return {
      id: row.MaLopHoc,
      code: row.MaLopHoc,
      name: row.TenLopHoc || row.MaLopHoc,
      subjectCode: row.MaMonHoc || '',
      subjectName: subjectMap.get(row.MaMonHoc) || row.MaMonHoc || '',
      semesterCode: row.MaHocKyNamHoc || '',
      semesterName: semester?.TenHocKy || '',
      academicYearName: semester?.NamHoc || '',
      room: row.PhongHoc || '',
      schedule: row.LichHoc || '',
      plannedStudentCount: Number(row.SiSo || 0),
      studentCount: enrolledCountMap[row.MaLopHoc] || 0,
      status: 'active',
    };
  });
}

export async function fetchLecturerClassStudents(classId: string) {
  const client = getClient();
  const currentUserId = await resolveCurrentDbUserId();
  if (!currentUserId) {
    throw new Error('Không xác định được giảng viên đăng nhập. Vui lòng đăng nhập lại.');
  }

  const classRes = await queryFirst<any[]>(TABLES.classes, (table) =>
    client.from(table).select('*').eq('MaLopHoc', classId).eq('MaGiangVien', currentUserId).limit(1)
  );
  const classRow = (classRes.data || [])[0];
  if (!classRow) {
    throw new Error('Không tìm thấy lớp học hoặc bạn không có quyền xem lớp này.');
  }

  const [subjectsRes, semestersRes, enrollmentsRes] = await Promise.all([
    queryFirstSafe<any[]>(TABLES.subjects, (table) => client.from(table).select('MaMonHoc,TenMonHoc'), []),
    queryFirstSafe<any[]>(TABLES.semesters, (table) => client.from(table).select('MaHocKyNamHoc,TenHocKy,NamHoc'), []),
    queryFirstSafe<any[]>(TABLES.classStudents, (table) =>
      client.from(table).select('*').eq('MaLopHoc', classId).order('MaSinhVien', { ascending: true }), []
    ),
  ]);
  const studentIds = Array.from(new Set((enrollmentsRes.data || []).map((row: any) => row.MaSinhVien).filter(Boolean)));
  const studentsRes = studentIds.length > 0
    ? await queryFirstSafe<any[]>(TABLES.students, (table) =>
      client.from(table).select('*').in('MaSinhVien', studentIds).order('MaSinhVien', { ascending: true }), []
    )
    : { data: [], table: TABLES.students[0] };

  const subjectMap = new Map((subjectsRes.data || []).map((row: any) => [row.MaMonHoc, row.TenMonHoc || row.MaMonHoc]));
  const semesterMap = new Map((semestersRes.data || []).map((row: any) => [row.MaHocKyNamHoc, row]));
  const studentMap = new Map((studentsRes.data || []).map((row: any) => [row.MaSinhVien, row]));
  const semester = semesterMap.get(classRow.MaHocKyNamHoc);
  const roster = (enrollmentsRes.data || []).map((row: any) => {
    const student = studentMap.get(row.MaSinhVien);
    return {
      id: row.MaSinhVienLopHoc,
      studentId: row.MaSinhVien,
      fullName: student?.HoTen || row.MaSinhVien,
      email: student?.Email || '',
      phone: student?.SoDienThoai || '',
      dateOfBirth: student?.NgaySinh || '',
      joinedAt: row.NgayThamGia || '',
      status: normalizeStatus(row.TrangThai),
      note: row.GhiChu || '',
    };
  });

  return {
    classInfo: {
      id: classRow.MaLopHoc,
      code: classRow.MaLopHoc,
      name: classRow.TenLopHoc || classRow.MaLopHoc,
      subjectCode: classRow.MaMonHoc || '',
      subjectName: subjectMap.get(classRow.MaMonHoc) || classRow.MaMonHoc || '',
      semesterCode: classRow.MaHocKyNamHoc || '',
      semesterName: semester?.TenHocKy || '',
      academicYearName: semester?.NamHoc || '',
      room: classRow.PhongHoc || '',
      schedule: classRow.LichHoc || '',
      plannedStudentCount: Number(classRow.SiSo || 0),
      studentCount: roster.length,
    },
    students: roster,
  };
}

export async function fetchLecturerSummary() {
  const client = getClient();
  const [subRes, detailRes] = await Promise.all([
    queryFirst<any[]>(TABLES.submissions, (table) => client.from(table).select('MaBaiThi,MaDeThi,MaNguoiCham,TongDiem,XepLoai').order('MaBaiThi', { ascending: false }).limit(50)),
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
      submissionCode: b.MaBaiThi,
      examId: b.MaDeThi || '',
      graderId: b.MaNguoiCham || '',
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

export async function fetchLecturerQuestionBank() {
  const client = getClient();
  const [questionsRes, subjectsRes, levelsRes, userDirectoryRes] = await Promise.all([
    queryFirst<any[]>(TABLES.questions, (table) => {
      return client.from(table).select('*').order('NgaySoan', { ascending: false });
    }),
    queryFirst<any[]>(TABLES.subjects, (table) => client.from(table).select('MaMonHoc,TenMonHoc')),
    queryFirst<any[]>(TABLES.levels, (table) => client.from(table).select('MaMucDo,TenMucDo')),
    queryFirst<any[]>(TABLES.publicUserDirectory, (table) => client.from(table).select('MaNguoiDung,HoTen')),
  ]);

  const subjectMap = new Map((subjectsRes.data || []).map((s: any) => [s.MaMonHoc, s.TenMonHoc]));
  const levelMap = new Map((levelsRes.data || []).map((l: any) => [l.MaMucDo, l.TenMucDo || l.MaMucDo]));
  const userMap = new Map((userDirectoryRes.data || []).map((u: any) => [u.MaNguoiDung, u.HoTen || u.MaNguoiDung]));

  return (questionsRes.data || []).map((row: any) => ({
    id: row.MaCauHoi,
    code: row.MaCauHoi,
    content: row.NoiDung || '',
    subjectCode: row.MaMonHoc || '',
    subjectName: subjectMap.get(row.MaMonHoc) || row.MaMonHoc || '',
    difficultyCode: row.MaMucDo || '',
    difficulty: levelMap.get(row.MaMucDo) || row.MaMucDo || '',
    answer: row.DapAn || '',
    questionType: normalizeQuestionKind(row.LoaiCauHoi),
    choices: parseChoices(row.LuaChon),
    correctAnswer: row.DapAnDung || '',
    rubric: row.Rubric || row.DapAn || '',
    status: row.TrangThai || '',
    updatedAt: formatDate(row.NgaySoan),
    authorId: row.MaNguoiSoan || '',
    authorName: userMap.get(row.MaNguoiSoan) || row.MaNguoiSoan || '',
  }));
}

export async function fetchLecturerQuestionById(questionId: string) {
  const rows = await fetchLecturerQuestionBank();
  return rows.find((row) => String(row.id) === String(questionId)) || null;
}

export async function createSubject(payload: {
  code: string;
  name: string;
  credits?: number;
  description?: string;
}) {
  const client = getClient();
  const row = {
    MaMonHoc: payload.code.trim(),
    TenMonHoc: payload.name.trim(),
    SoTinChi: Number(payload.credits || 3),
    MoTa: payload.description?.trim() || null,
    Khoa: DEFAULT_FACULTY,
  };
  try {
    await queryFirst<any[]>(TABLES.subjects, (table) => client.from(table).insert(row).select('MaMonHoc'));
  } catch (error: any) {
    if (String(error?.message || '').toLowerCase().includes('duplicate')) {
      throw new Error('Mã môn học đã tồn tại. Vui lòng nhập mã khác.');
    }
    throw toAppError(error);
  }
}

export async function fetchSubjectById(subjectId: string) {
  const rows = await fetchSubjects();
  return rows.find((row) => String(row.id) === String(subjectId)) || null;
}

export async function saveSubject(payload: {
  id?: string;
  code: string;
  name: string;
  credits?: number;
  description?: string;
}) {
  const client = getClient();
  const row = {
    MaMonHoc: payload.code.trim(),
    TenMonHoc: payload.name.trim(),
    SoTinChi: Number(payload.credits || 3),
    MoTa: payload.description?.trim() || null,
    Khoa: DEFAULT_FACULTY,
  };

  try {
    if (payload.id) {
      await queryFirst<any[]>(TABLES.subjects, (table) =>
        client.from(table).update(row).eq('MaMonHoc', payload.id).select('MaMonHoc'),
      );
      return payload.id;
    }
    await queryFirst<any[]>(TABLES.subjects, (table) => client.from(table).insert(row).select('MaMonHoc'));
    return payload.code.trim();
  } catch (error: any) {
    throw toAppError(error);
  }
}

export async function deleteSubject(subjectId: string) {
  const client = getClient();
  const [questionsRes, examsRes, classesRes, loRes] = await Promise.all([
    queryFirstSafe<any[]>(TABLES.questions, (table) => client.from(table).select('MaCauHoi').eq('MaMonHoc', subjectId).limit(1), []),
    queryFirstSafe<any[]>(TABLES.exams, (table) => client.from(table).select('MaDeThi').eq('MaMonHoc', subjectId).limit(1), []),
    queryFirstSafe<any[]>(TABLES.classes, (table) => client.from(table).select('MaLopHoc').eq('MaMonHoc', subjectId).limit(1), []),
    queryFirstSafe<any[]>(['CHUANDAURA', 'chuandaura'], (table) => client.from(table).select('MaLO').eq('MaMonHoc', subjectId).limit(1), []),
  ]);
  const reasons: string[] = [];
  if ((questionsRes.data || []).length > 0) reasons.push('có câu hỏi trong ngân hàng đề');
  if ((examsRes.data || []).length > 0) reasons.push('có đề thi liên kết');
  if ((classesRes.data || []).length > 0) reasons.push('có lớp học đang sử dụng');
  if ((loRes.data || []).length > 0) reasons.push('có chuẩn đầu ra liên kết');
  if (reasons.length > 0) {
    throw new Error(`Không thể xóa môn học này vì ${reasons.join(', ')}. Hãy xóa các dữ liệu liên quan trước.`);
  }
  try {
    await queryFirst<any[]>(TABLES.subjects, (table) => client.from(table).delete().eq('MaMonHoc', subjectId).select('MaMonHoc'));
  } catch (error: any) {
    throw toAppError(error);
  }
}

export async function deleteLecturerQuestion(questionId: string) {
  const client = getClient();
  const usageRes = await queryFirstSafe<any[]>(TABLES.examDetails, (table) =>
    client.from(table).select('MaDeThi').eq('MaCauHoi', questionId), []
  );
  const usedInExams = usageRes.data || [];
  if (usedInExams.length > 0) {
    const examIds = [...new Set(usedInExams.map((r: any) => r.MaDeThi))];
    const preview = examIds.slice(0, 3).join(', ') + (examIds.length > 3 ? '...' : '');
    throw new Error(`Không thể xóa câu hỏi này vì đang được sử dụng trong ${examIds.length} đề thi (${preview}). Hãy xóa câu hỏi khỏi đề thi trước.`);
  }
  try {
    await queryFirst<any[]>(TABLES.questions, (table) =>
      client.from(table).delete().eq('MaCauHoi', questionId).select('MaCauHoi'),
    );
  } catch (error: any) {
    throw toAppError(error);
  }
}

export async function fetchDifficultyLevels() {
  const client = getClient();
  const result = await queryFirst<any[]>(TABLES.levels, (table) => client.from(table).select('MaMucDo,TenMucDo').order('MaMucDo', { ascending: true }));
  const rows = (result.data || []).map((row: any) => ({
    code: row.MaMucDo,
    name: row.TenMucDo || row.MaMucDo,
  }));
  return rows.length ? rows : DEFAULT_LEVEL_OPTIONS;
}

export async function saveLecturerQuestion(payload: {
  id?: string;
  subjectCode: string;
  levelCode: string;
  content: string;
  answer?: string;
  questionType: QuestionKind;
  choices?: Array<{ key: string; text: string }>;
  correctAnswer?: string;
  rubric?: string;
  status?: string;
}) {
  const client = getClient();
  const currentUserId = await resolveCurrentDbUserId();
  if (!currentUserId) {
    throw new Error('Không xác định được giảng viên đăng nhập. Vui lòng đăng nhập lại.');
  }

  const id = payload.id || `CH${Date.now()}`;
  const questionType = normalizeQuestionKind(payload.questionType);
  const choices = questionType === 'TRAC_NGHIEM' ? (payload.choices || []).filter((item) => item.key && item.text) : [];
  if (questionType === 'TRAC_NGHIEM') {
    if (choices.length < 2) throw new Error('Câu hỏi trắc nghiệm cần ít nhất 2 lựa chọn.');
    if (!payload.correctAnswer) throw new Error('Câu hỏi trắc nghiệm bắt buộc chọn đáp án đúng.');
  } else if (!String(payload.rubric || '').trim()) {
    throw new Error('Câu hỏi tự luận bắt buộc có rubric chấm.');
  }

  const dupRes = await queryFirstSafe<any[]>(TABLES.questions, (table) =>
    client.from(table).select('MaCauHoi').eq('MaMonHoc', payload.subjectCode).eq('NoiDung', payload.content.trim()), []
  );
  const duplicateRows = (dupRes.data || []).filter((row: any) => String(row.MaCauHoi) !== String(payload.id || ''));
  if (duplicateRows.length > 0)
    throw new Error('Câu hỏi có nội dung tương tự đã tồn tại trong môn học này.');

  const row = {
    MaCauHoi: id,
    NgaySoan: new Date().toISOString().slice(0, 10),
    MaMonHoc: payload.subjectCode,
    MaMucDo: payload.levelCode,
    NoiDung: payload.content,
    DapAn: questionType === 'TRAC_NGHIEM' ? (payload.correctAnswer || '') : (payload.rubric || payload.answer || ''),
    MaNguoiSoan: currentUserId,
    TrangThai: payload.status || 'Đang dùng',
    LoaiCauHoi: questionType,
    LuaChon: questionType === 'TRAC_NGHIEM' ? choices : null,
    DapAnDung: questionType === 'TRAC_NGHIEM' ? String(payload.correctAnswer || '').trim().toUpperCase() : null,
    Rubric: questionType === 'TU_LUAN' ? String(payload.rubric || payload.answer || '').trim() : null,
  };

  try {
    if (payload.id) {
      await queryFirst<any[]>(TABLES.questions, (table) => client.from(table).update(row).eq('MaCauHoi', payload.id).select('MaCauHoi'));
    } else {
      await queryFirst<any[]>(TABLES.questions, (table) => client.from(table).insert(row).select('MaCauHoi'));
    }
  } catch (error: any) {
    throw toAppError(error);
  }
}

export async function fetchLecturerExamList() {
  const client = getClient();
  const currentUserId = await resolveCurrentDbUserId();
  const [examsRes, subjectsRes, semestersRes, detailsRes, submissionsRes] = await Promise.all([
    queryFirst<any[]>(TABLES.exams, (table) => {
      let query = client.from(table).select('*').order('NgaySoan', { ascending: false });
      if (currentUserId) query = query.eq('MaNguoiSoan', currentUserId);
      return query;
    }),
    queryFirst<any[]>(TABLES.subjects, (table) => client.from(table).select('MaMonHoc,TenMonHoc')),
    queryFirst<any[]>(TABLES.semesters, (table) => client.from(table).select('MaHocKyNamHoc,TenHocKy,NamHoc')),
    queryFirst<any[]>(TABLES.examDetails, (table) => client.from(table).select('MaDeThi')),
    queryFirstSafe<any[]>(TABLES.submissions, (table) => client.from(table).select('MaDeThi,MaBaiThi'), []),
  ]);

  const subjectMap = new Map((subjectsRes.data || []).map((s: any) => [s.MaMonHoc, s.TenMonHoc]));
  const semesterMap = new Map((semestersRes.data || []).map((s: any) => [s.MaHocKyNamHoc, `${s.TenHocKy || ''} ${s.NamHoc || ''}`.trim()]));
  const questionCountMap: Record<string, number> = {};
  const submissionCountMap: Record<string, number> = {};

  (detailsRes.data || []).forEach((row: any) => {
    questionCountMap[row.MaDeThi] = (questionCountMap[row.MaDeThi] || 0) + 1;
  });
  (submissionsRes.data || []).forEach((row: any) => {
    submissionCountMap[row.MaDeThi] = (submissionCountMap[row.MaDeThi] || 0) + 1;
  });

  return (examsRes.data || []).map((row: any) => ({
    id: row.MaDeThi,
    title: row.GhiChu || `Đề ${row.MaDeThi}`,
    subjectCode: row.MaMonHoc || '',
    subjectName: subjectMap.get(row.MaMonHoc) || row.MaMonHoc || '',
    semester: semesterMap.get(row.MaHocKyNamHoc) || row.MaHocKyNamHoc || '',
    questionCount: questionCountMap[row.MaDeThi] || 0,
    durationMinutes: Number(row.ThoiLuongLamBai || 0),
    status: normalizeExamStatus(row.TrangThai),
    updatedAt: formatDate(row.NgaySoan),
    authorId: row.MaNguoiSoan || '',
    submissionCount: submissionCountMap[row.MaDeThi] || 0,
    hasSubmissions: (submissionCountMap[row.MaDeThi] || 0) > 0,
  }));
}

export async function fetchAllExamList() {
  const client = getClient();
  const [examsRes, subjectsRes, semestersRes, detailsRes] = await Promise.all([
    queryFirst<any[]>(TABLES.exams, (table) => client.from(table).select('*').order('NgaySoan', { ascending: false })),
    queryFirst<any[]>(TABLES.subjects, (table) => client.from(table).select('MaMonHoc,TenMonHoc')),
    queryFirst<any[]>(TABLES.semesters, (table) => client.from(table).select('MaHocKyNamHoc,TenHocKy,NamHoc')),
    queryFirst<any[]>(TABLES.examDetails, (table) => client.from(table).select('MaDeThi')),
  ]);
  const subjectMap = new Map((subjectsRes.data || []).map((s: any) => [s.MaMonHoc, s.TenMonHoc]));
  const semesterMap = new Map((semestersRes.data || []).map((s: any) => [s.MaHocKyNamHoc, `${s.TenHocKy || ''} ${s.NamHoc || ''}`.trim()]));
  const questionCountMap: Record<string, number> = {};
  (detailsRes.data || []).forEach((row: any) => {
    questionCountMap[row.MaDeThi] = (questionCountMap[row.MaDeThi] || 0) + 1;
  });
  return (examsRes.data || []).map((row: any) => ({
    id: row.MaDeThi,
    title: row.GhiChu || `Đề ${row.MaDeThi}`,
    subjectCode: row.MaMonHoc || '',
    subjectName: subjectMap.get(row.MaMonHoc) || row.MaMonHoc || '',
    semester: semesterMap.get(row.MaHocKyNamHoc) || row.MaHocKyNamHoc || '',
    questionCount: questionCountMap[row.MaDeThi] || 0,
    durationMinutes: Number(row.ThoiLuongLamBai || 0),
    status: normalizeExamStatus(row.TrangThai),
    updatedAt: formatDate(row.NgaySoan),
    authorId: row.MaNguoiSoan || '',
  }));
}

export async function fetchExamGradedCount(examId: string): Promise<number> {
  const client = getClient();
  const res = await queryFirstSafe<any[]>(
    TABLES.submissions,
    (table) => client.from(table).select('MaBaiThi,TrangThai').eq('MaDeThi', examId),
    []
  );
  return (res.data || []).filter((r: any) => String(r.TrangThai || '').includes('Đã chấm')).length;
}

export async function saveLecturerExam(payload: {
  id?: string;
  title: string;
  subjectCode: string;
  semesterCode: string;
  durationMinutes: number;
  questionIds: string[];
  questionItems?: Array<{ questionId: string; maxScore: number }>;
  status?: string;
}) {
  const client = getClient();
  const currentUserId = await resolveCurrentDbUserId();
  if (!currentUserId) {
    throw new Error('Không xác định được giảng viên đăng nhập. Vui lòng đăng nhập lại.');
  }
  if (!payload.questionIds.length) {
    throw new Error('Vui lòng chọn ít nhất 1 câu hỏi để tạo đề.');
  }
  const ruleConfig = await fetchExamRuleConfig();
  if (payload.id) {
    const existingSubmissions = await queryFirstSafe<any[]>(
      TABLES.submissions,
      (table) => client.from(table).select('MaBaiThi').eq('MaDeThi', payload.id).limit(1),
      [],
    );
    if ((existingSubmissions.data || []).length > 0) {
      throw new Error('Không thể sửa cấu trúc đề thi đã phát sinh bài thi. Hãy tạo đề mới nếu cần thay đổi câu hỏi hoặc thang điểm.');
    }
  }
  if (payload.questionIds.length > ruleConfig.maxQuestionsPerExam) {
    throw new Error(`Mỗi đề thi chỉ được có tối đa ${ruleConfig.maxQuestionsPerExam} câu hỏi theo quy định hệ thống.`);
  }
  if (payload.durationMinutes && payload.durationMinutes < ruleConfig.minDurationMinutes) {
    throw new Error(`Thời lượng làm bài phải từ ${ruleConfig.minDurationMinutes} phút trở lên.`);
  }
  if (payload.durationMinutes && payload.durationMinutes > ruleConfig.maxDurationMinutes) {
    throw new Error(`Thời lượng làm bài không được vượt quá ${ruleConfig.maxDurationMinutes} phút.`);
  }

  const examId = payload.id || `DT${Date.now()}`;
  const examRow = {
    MaDeThi: examId,
    MaMonHoc: payload.subjectCode,
    MaHocKyNamHoc: payload.semesterCode,
    ThoiLuongLamBai: payload.durationMinutes,
    MaNguoiSoan: currentUserId,
    NgaySoan: new Date().toISOString().slice(0, 10),
    TrangThai: normalizeExamStatus(payload.status),
    GhiChu: payload.title,
  };

  const questionItems = (payload.questionItems?.length
    ? payload.questionItems
    : payload.questionIds.map((questionId) => ({ questionId, maxScore: 1 })))
    .filter((item) => item.questionId);

  const detailRows = questionItems.map((item, index) => ({
    MaChiTietDeThi: `CTDT_${examId}_${index + 1}`,
    MaDeThi: examId,
    MaCauHoi: item.questionId,
    ThuTu: index + 1,
    DiemToiDa: Number(item.maxScore || 0),
    HuongDanCham: '',
  }));

  if (detailRows.some((item) => item.DiemToiDa <= 0)) {
    throw new Error('Mỗi câu hỏi trong đề thi phải có điểm tối đa lớn hơn 0.');
  }

  const invalidScore = detailRows.filter(item => item.DiemToiDa > ruleConfig.maxScore || item.DiemToiDa < ruleConfig.minScore);
  if (invalidScore.length > 0)
    throw new Error(`Điểm câu hỏi phải trong khoảng ${ruleConfig.minScore}–${ruleConfig.maxScore}. Có ${invalidScore.length} câu vi phạm quy định hệ thống.`);

  try {
    if (payload.id) {
      await queryFirst<any[]>(TABLES.exams, (table) => client.from(table).update(examRow).eq('MaDeThi', payload.id).select('MaDeThi'));
      await queryFirst<any[]>(TABLES.examDetails, (table) => client.from(table).delete().eq('MaDeThi', payload.id).select('MaChiTietDeThi'));
    } else {
      await queryFirst<any[]>(TABLES.exams, (table) => client.from(table).insert(examRow).select('MaDeThi'));
    }
    await queryFirst<any[]>(TABLES.examDetails, (table) => client.from(table).insert(detailRows).select('MaChiTietDeThi'));
  } catch (error: any) {
    throw toAppError(error);
  }

  return examId;
}

async function ensureSubmissionGradingSnapshots(submissionId: string) {
  const client = getClient();
  const [submissionRes, detailRes, examDetailRes, questionRes, examRes] = await Promise.all([
    queryFirst<any[]>(TABLES.submissions, (table) => client.from(table).select('MaBaiThi,MaDeThi').eq('MaBaiThi', submissionId).limit(1)),
    queryFirst<any[]>(TABLES.gradingDetails, (table) => client.from(table).select('*').eq('MaBaiThi', submissionId)),
    queryFirst<any[]>(TABLES.examDetails, (table) => client.from(table).select('MaDeThi,MaCauHoi,DiemToiDa,ThuTu')),
    queryFirst<any[]>(TABLES.questions, (table) => client.from(table).select('MaCauHoi,NoiDung,LoaiCauHoi,LuaChon,DapAnDung,Rubric,DapAn')),
    queryFirst<any[]>(TABLES.exams, (table) => client.from(table).select('MaDeThi,GhiChu')),
  ]);

  const submission = (submissionRes.data || [])[0];
  if (!submission) return;

  const examDetailMap = new Map(
    (examDetailRes.data || [])
      .filter((row: any) => row.MaDeThi === submission.MaDeThi)
      .map((row: any) => [row.MaCauHoi, row]),
  );
  const questionMap = new Map((questionRes.data || []).map((row: any) => [row.MaCauHoi, row]));
  const examTitle = ((examRes.data || []).find((row: any) => row.MaDeThi === submission.MaDeThi)?.GhiChu) || null;

  const orderedDetails = [...(detailRes.data || [])].sort((a: any, b: any) => String(a.MaChiTietCham || '').localeCompare(String(b.MaChiTietCham || '')));
  for (const [index, row] of orderedDetails.entries()) {
    const needsSnapshot =
      row.LoaiCauHoiSnapshot == null ||
      row.NoiDungCauHoiSnapshot == null ||
      row.DiemToiDaSnapshot == null ||
      row.ThuTuSnapshot == null;
    if (!needsSnapshot) continue;

    const question = questionMap.get(row.MaCauHoi);
    const examDetail = examDetailMap.get(row.MaCauHoi);
    await queryFirst<any[]>(TABLES.gradingDetails, (table) =>
      client.from(table).update({
        LoaiCauHoiSnapshot: question?.LoaiCauHoi || null,
        NoiDungCauHoiSnapshot: question?.NoiDung || null,
        LuaChonSnapshot: question?.LuaChon || null,
        DapAnDungSnapshot: question?.DapAnDung || null,
        RubricSnapshot: question?.Rubric || question?.DapAn || null,
        DiemToiDaSnapshot: examDetail
          ? Number(examDetail.DiemToiDa || 0)
          : Math.max(Number(row.DiemDat ?? row.DiemTuDong ?? 0), 1),
        ThuTuSnapshot: examDetail ? Number(examDetail.ThuTu || 0) : index + 1,
        TieuDeDeThiSnapshot: examTitle,
      }).eq('MaChiTietCham', row.MaChiTietCham).select('MaChiTietCham'),
    );
  }
}

export async function fetchLecturerExamById(examId: string) {
  const exam = await fetchLecturerExamPreview(examId);
  if (!exam) return null;
  return {
    id: exam.id,
    title: exam.title,
    subjectCode: exam.subjectCode,
    semesterCode: exam.semesterCode,
    durationMinutes: exam.durationMinutes,
    status: exam.status,
    questionIds: (exam.questions || []).map((item: any) => item.id),
    questionItems: (exam.questions || []).map((item: any) => ({
      questionId: item.id,
      maxScore: Number(item.maxScore || 1),
    })),
  };
}

export async function updateLecturerExamStatus(examId: string, status: string) {
  const client = getClient();
  try {
    await queryFirst<any[]>(TABLES.exams, (table) =>
      client.from(table).update({ TrangThai: normalizeExamStatus(status) }).eq('MaDeThi', examId).select('MaDeThi'),
    );
  } catch (error: any) {
    throw toAppError(error);
  }
}

export async function deleteLecturerExam(examId: string) {
  const client = getClient();
  const submissionsRes = await queryFirstSafe<any[]>(TABLES.submissions, (table) =>
    client.from(table).select('MaBaiThi,TrangThai').eq('MaDeThi', examId), []
  );
  const submissions = submissionsRes.data || [];
  if (submissions.length > 0) {
    const gradedCount = submissions.filter((r: any) => String(r.TrangThai || '').includes('Đã chấm')).length;
    if (gradedCount > 0) {
      throw new Error(`Không thể xóa đề thi này vì có ${gradedCount} bài thi đã được chấm. Hãy xóa bài thi trước.`);
    }
    throw new Error(`Không thể xóa đề thi này vì có ${submissions.length} bài thi liên kết. Hãy xóa bài thi trước.`);
  }
  try {
    await queryFirst<any[]>(TABLES.examDetails, (table) => client.from(table).delete().eq('MaDeThi', examId).select('MaChiTietDeThi'));
    await queryFirst<any[]>(TABLES.exams, (table) => client.from(table).delete().eq('MaDeThi', examId).select('MaDeThi'));
  } catch (error: any) {
    throw toAppError(error);
  }
}

export async function fetchLecturerExamPreview(examId: string) {
  const client = getClient();
  const [examRes, subjectsRes, semestersRes, detailsRes, questionsRes] = await Promise.all([
    queryFirst<any[]>(TABLES.exams, (table) => client.from(table).select('*').eq('MaDeThi', examId)),
    queryFirst<any[]>(TABLES.subjects, (table) => client.from(table).select('MaMonHoc,TenMonHoc')),
    queryFirst<any[]>(TABLES.semesters, (table) => client.from(table).select('MaHocKyNamHoc,TenHocKy,NamHoc')),
    queryFirst<any[]>(TABLES.examDetails, (table) => client.from(table).select('*').eq('MaDeThi', examId).order('ThuTu', { ascending: true })),
    queryFirst<any[]>(TABLES.questions, (table) => client.from(table).select('MaCauHoi,NoiDung,LoaiCauHoi,LuaChon,DapAnDung,Rubric,DapAn')),
  ]);

  const examRow = (examRes.data || [])[0];
  if (!examRow) return null;

  const subjectMap = new Map((subjectsRes.data || []).map((s: any) => [s.MaMonHoc, s.TenMonHoc]));
  const semesterMap = new Map((semestersRes.data || []).map((s: any) => [s.MaHocKyNamHoc, `${s.TenHocKy || ''} ${s.NamHoc || ''}`.trim()]));
  const questionMap = new Map((questionsRes.data || []).map((q: any) => [q.MaCauHoi, q]));
  const detailRows = detailsRes.data || [];

  return {
    id: examRow.MaDeThi,
    title: examRow.GhiChu || `Đề ${examRow.MaDeThi}`,
    subjectCode: examRow.MaMonHoc || '',
    subjectName: subjectMap.get(examRow.MaMonHoc) || examRow.MaMonHoc || '',
    semester: semesterMap.get(examRow.MaHocKyNamHoc) || examRow.MaHocKyNamHoc || '',
    semesterCode: examRow.MaHocKyNamHoc || '',
    durationMinutes: Number(examRow.ThoiLuongLamBai || 0),
    status: normalizeExamStatus(examRow.TrangThai),
    questionCount: detailRows.length,
    questions: detailRows.map((d: any) => ({
      id: d.MaCauHoi,
      order: Number(d.ThuTu || 0),
      content: questionMap.get(d.MaCauHoi)?.NoiDung || d.MaCauHoi,
      maxScore: Number(d.DiemToiDa || 0),
      guide: d.HuongDanCham || '',
      questionType: normalizeQuestionKind(questionMap.get(d.MaCauHoi)?.LoaiCauHoi),
      choices: parseChoices(questionMap.get(d.MaCauHoi)?.LuaChon),
      correctAnswer: questionMap.get(d.MaCauHoi)?.DapAnDung || '',
      rubric: questionMap.get(d.MaCauHoi)?.Rubric || questionMap.get(d.MaCauHoi)?.DapAn || '',
    })),
  };
}

export async function fetchLecturerGradingQueue() {
  const client = getClient();
  const currentUserId = await resolveCurrentDbUserId();
  const profile = await fetchCurrentUserProfile();
  const [submissionsRes, examsRes, subjectsRes, userDirectoryRes] = await Promise.all([
    queryFirst<any[]>(TABLES.submissions, (table) => client.from(table).select('*').order('GioNop', { ascending: false }).limit(200)),
    queryFirst<any[]>(TABLES.exams, (table) => client.from(table).select('MaDeThi,GhiChu,MaMonHoc')),
    queryFirst<any[]>(TABLES.subjects, (table) => client.from(table).select('MaMonHoc,TenMonHoc,Khoa,BoMon')),
    queryFirst<any[]>(TABLES.publicUserDirectory, (table) => client.from(table).select('MaNguoiDung,HoTen')),
  ]);

  const examMap = new Map((examsRes.data || []).map((e: any) => [e.MaDeThi, e.GhiChu || e.MaDeThi]));
  const examSubjectMap = new Map((examsRes.data || []).map((e: any) => [e.MaDeThi, e.MaMonHoc]));
  const subjectDeptMap = new Map((subjectsRes.data || []).map((s: any) => [s.MaMonHoc, s.Khoa || s.BoMon || '']));
  const userMap = new Map((userDirectoryRes.data || []).map((u: any) => [u.MaNguoiDung, u.HoTen || u.MaNguoiDung]));

  return (submissionsRes.data || [])
    .filter((row: any) => {
      if (!profile.faculty) return currentUserId ? row.MaNguoiCham === currentUserId : true;
      const subjectCode = examSubjectMap.get(row.MaDeThi);
      const department = subjectDeptMap.get(subjectCode || '');
      return department === profile.faculty;
    })
    .map((row: any) => {
    const statusRaw = String(row.TrangThai || '').toLowerCase();
    const status = statusRaw.includes('đã chấm') || statusRaw.includes('da cham') ? 'graded' : statusRaw.includes('đang') ? 'grading' : 'ungraded';
    return {
      id: row.MaBaiThi,
      submissionCode: row.MaBaiThi || '',
      submissionName: `Bài thi ${row.MaBaiThi || ''}`.trim(),
      examId: row.MaDeThi || '',
      examTitle: examMap.get(row.MaDeThi) || row.MaDeThi || '',
      total: Number(row.TongDiem || 0),
      status,
      submittedAt: toDateTimeValue(row.GioNop),
      graderId: row.MaNguoiCham || '',
      graderName: userMap.get(row.MaNguoiCham) || row.MaNguoiCham || '',
      isMine: !!currentUserId && row.MaNguoiCham === currentUserId,
      isClaimed: !!row.MaNguoiCham,
      subjectCode: examSubjectMap.get(row.MaDeThi) || '',
      subjectName: (() => {
        const subjectCode = examSubjectMap.get(row.MaDeThi) || '';
        const subjectRow = (subjectsRes.data || []).find((s: any) => s.MaMonHoc === subjectCode);
        return subjectRow?.TenMonHoc || subjectCode;
      })(),
    };
  });
}

export async function claimLecturerGradingSubmission(submissionId: string) {
  const client = getClient();
  const currentUserId = await resolveCurrentDbUserId();
  if (!currentUserId) {
    throw new Error('Không xác định được giảng viên đăng nhập. Vui lòng đăng nhập lại.');
  }

  const current = await queryFirst<any[]>(TABLES.submissions, (table) =>
    client.from(table).select('MaBaiThi,MaNguoiCham,TrangThai').eq('MaBaiThi', submissionId).limit(1),
  );
  const row = (current.data || [])[0];
  if (!row) {
    throw new Error('Không tìm thấy bài thi cần chấm.');
  }
  if (row.MaNguoiCham && row.MaNguoiCham !== currentUserId) {
    throw new Error('Bài thi này đã được giảng viên khác nhận chấm.');
  }
  if (row.MaNguoiCham === currentUserId) {
    await ensureSubmissionGradingSnapshots(submissionId);
    return true;
  }

  try {
    const result = await queryFirst<any[]>(TABLES.submissions, (table) =>
      client
        .from(table)
        .update({ MaNguoiCham: currentUserId, TrangThai: 'Đang chấm' })
        .eq('MaBaiThi', submissionId)
        .is('MaNguoiCham', null)
        .select('MaBaiThi,MaNguoiCham,TrangThai'),
    );

    if ((result.data || []).length > 0) {
      await ensureSubmissionGradingSnapshots(submissionId);
      return true;
    }
  } catch (error: any) {
    throw toAppError(error);
  }

  await ensureSubmissionGradingSnapshots(submissionId);
  throw new Error('Không thể nhận chấm bài thi này.');
}

export async function fetchLecturerGradingDetail(submissionId: string) {
  const client = getClient();
  await ensureSubmissionGradingSnapshots(submissionId);
  const [submissionRes, detailRes, questionsRes, examsRes] = await Promise.all([
    queryFirst<any[]>(TABLES.submissions, (table) => client.from(table).select('*').eq('MaBaiThi', submissionId)),
    queryFirst<any[]>(TABLES.gradingDetails, (table) => client.from(table).select('*').eq('MaBaiThi', submissionId)),
    queryFirst<any[]>(TABLES.questions, (table) => client.from(table).select('MaCauHoi,NoiDung,LoaiCauHoi,LuaChon,DapAnDung,Rubric,DapAn')),
    queryFirst<any[]>(TABLES.exams, (table) => client.from(table).select('MaDeThi,GhiChu')),
  ]);

  const submission = (submissionRes.data || [])[0];
  if (!submission) return null;

  const questionMap = new Map((questionsRes.data || []).map((q: any) => [q.MaCauHoi, q]));
  const examMap = new Map((examsRes.data || []).map((e: any) => [e.MaDeThi, e.GhiChu || e.MaDeThi]));
  const examDetailRes = await queryFirst<any[]>(TABLES.examDetails, (table) =>
    client.from(table).select('MaCauHoi,DiemToiDa,ThuTu').eq('MaDeThi', submission.MaDeThi).order('ThuTu', { ascending: true }),
  );
  const maxScoreMap = new Map((examDetailRes.data || []).map((row: any) => [row.MaCauHoi, Number(row.DiemToiDa || 1)]));
  const orderMap = new Map((examDetailRes.data || []).map((row: any) => [row.MaCauHoi, Number(row.ThuTu || 0)]));
  const details = (detailRes.data || [])
    .sort((a: any, b: any) => {
      const orderA = Number((a.ThuTuSnapshot ?? orderMap.get(a.MaCauHoi)) || 0);
      const orderB = Number((b.ThuTuSnapshot ?? orderMap.get(b.MaCauHoi)) || 0);
      return orderA - orderB;
    })
    .map((row: any, idx: number) => ({
    detailId: row.MaChiTietCham,
    questionId: row.MaCauHoi,
    label: `Câu ${idx + 1}`,
    content: row.NoiDungCauHoiSnapshot || questionMap.get(row.MaCauHoi)?.NoiDung || row.MaCauHoi || '',
    max: Number(row.DiemToiDaSnapshot ?? maxScoreMap.get(row.MaCauHoi) ?? 1),
    score: Number((row.DiemDat ?? row.DiemTuDong) || 0),
    questionType: normalizeQuestionKind(row.LoaiCauHoiSnapshot || questionMap.get(row.MaCauHoi)?.LoaiCauHoi),
    choices: parseChoices(row.LuaChonSnapshot || questionMap.get(row.MaCauHoi)?.LuaChon),
    correctAnswer: row.DapAnDungSnapshot || questionMap.get(row.MaCauHoi)?.DapAnDung || '',
    rubric: row.RubricSnapshot || questionMap.get(row.MaCauHoi)?.Rubric || questionMap.get(row.MaCauHoi)?.DapAn || '',
    studentAnswer: row.CauTraLoi || '',
    autoScore: row.DiemTuDong ?? null,
    autoGraded: !!row.ChamTuDong,
  }));

  return {
    id: submission.MaBaiThi,
    submissionCode: submission.MaBaiThi || '',
    submissionName: `Bài thi ${submission.MaBaiThi || ''}`.trim(),
    examId: submission.MaDeThi || '',
    examTitle: (detailRes.data || []).find((row: any) => row.TieuDeDeThiSnapshot)?.TieuDeDeThiSnapshot || examMap.get(submission.MaDeThi) || submission.MaDeThi || '',
    submittedAt: toDateTimeValue(submission.GioNop),
    total: Number(submission.TongDiem || 0),
    details,
  };
}

export async function saveLecturerGradingDetail(payload: {
  submissionId: string;
  rows: Array<{ detailId: string; questionId: string; maxScore: number; score: number; questionType: QuestionKind; studentAnswer?: string; correctAnswer?: string }>;
}) {
  const client = getClient();
  await claimLecturerGradingSubmission(payload.submissionId);
  await ensureSubmissionGradingSnapshots(payload.submissionId);
  const invalidRow = payload.rows.find((row) => row.questionType !== 'TRAC_NGHIEM' && (Number(row.score) < 0 || Number(row.score) > Number(row.maxScore)));
  if (invalidRow) {
    throw new Error(`Điểm của câu ${invalidRow.questionId} phải nằm trong khoảng 0–${invalidRow.maxScore}.`);
  }
  const updates = payload.rows.map((row) => {
    const autoScore = row.questionType === 'TRAC_NGHIEM' ? autoGradeMcq(row.studentAnswer, row.correctAnswer, row.maxScore) : null;
    const finalScore = row.questionType === 'TRAC_NGHIEM' ? autoScore || 0 : Number(row.score || 0);
    return {
    MaChiTietCham: row.detailId,
    DiemDat: finalScore,
    NhanXet: null,
    CauTraLoi: row.studentAnswer || null,
    DiemTuDong: autoScore,
    ChamTuDong: row.questionType === 'TRAC_NGHIEM',
    };
  });
  const total = updates.reduce((sum, row) => sum + Number(row.DiemDat || 0), 0);

  try {
    for (const row of updates) {
      await queryFirst<any[]>(TABLES.gradingDetails, (table) =>
        client.from(table).update({
          DiemDat: row.DiemDat,
          NhanXet: null,
          CauTraLoi: row.CauTraLoi,
          DiemTuDong: row.DiemTuDong,
          ChamTuDong: row.ChamTuDong,
        }).eq('MaChiTietCham', row.MaChiTietCham).select('MaChiTietCham'),
      );
    }
    await queryFirst<any[]>(TABLES.submissions, (table) =>
      client.from(table).update({ TongDiem: Number(total.toFixed(2)), TrangThai: 'Đã chấm', NgayCham: new Date().toISOString().slice(0, 10) }).eq('MaBaiThi', payload.submissionId).select('MaBaiThi'),
    );
  } catch (error: any) {
    throw toAppError(error);
  }
}

export async function fetchSystemParams() {
  const client = getClient();
  const result = await queryFirst<any[]>(TABLES.params, (table) => client.from(table).select('*').order('MaThamSo', { ascending: true }));
  return (result.data || []).map((row: any) => ({
    MaThamSo: row.MaThamSo || '',
    TenThamSo: row.TenThamSo || row.MaThamSo || '',
    GiaTri: row.GiaTri ?? '',
    KieuDuLieu: row.KieuDuLieu || 'TEXT',
    NhomThamSo: row.NhomThamSo || '',
    MoTa: row.MoTa || '',
    NgayCapNhat: row.NgayCapNhat || '',
  }));
}

function parseSystemParamValue(rawValue: any, dataType?: string) {
  const type = String(dataType || 'TEXT').toUpperCase();
  if (type === 'INT' || type === 'FLOAT') {
    const parsed = Number(rawValue);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (type === 'BOOLEAN') {
    return ['1', 'true', 'yes', 'on'].includes(String(rawValue ?? '').trim().toLowerCase());
  }
  return String(rawValue ?? '');
}

export async function fetchSystemRuleMap() {
  const rows = await fetchSystemParams();
  return rows.reduce((acc: Record<string, any>, row) => {
    acc[row.MaThamSo] = parseSystemParamValue(row.GiaTri, row.KieuDuLieu);
    return acc;
  }, {});
}

export async function fetchExamRuleConfig() {
  const rules = await fetchSystemRuleMap();
  return {
    maxQuestionsPerExam: Math.max(1, Number(rules.SoCauHoiToiDa ?? 5)),
    maxDurationMinutes: Math.max(1, Number(rules.ThoiLuongToiDa ?? 180)),
    minDurationMinutes: Math.max(1, Number(rules.ThoiLuongToiThieu ?? 30)),
    maxScore: Number(rules.DiemToiDa ?? 10),
    minScore: Number(rules.DiemToiThieu ?? 0),
  };
}

export async function saveSystemParams(rows: Array<{ MaThamSo: string; GiaTri: string | number }>) {
  const client = getClient();
  const payload = rows.map((r) => ({ MaThamSo: r.MaThamSo, GiaTri: String(r.GiaTri) }));
  try {
    await queryFirst<any[]>(TABLES.params, (table) =>
      client.from(table).upsert(payload, { onConflict: 'MaThamSo' }).select('MaThamSo'),
    );
  } catch (error: any) {
    throw toAppError(error);
  }
}

export async function saveSystemParamEntries(rows: Array<{
  MaThamSo: string;
  TenThamSo: string;
  GiaTri: string | number;
  KieuDuLieu?: string;
  NhomThamSo?: string;
  MoTa?: string;
}>) {
  const client = getClient();
  const normalizedRows = rows.map((row) => ({
    ...row,
    MaThamSo: row.MaThamSo.trim(),
    TenThamSo: row.TenThamSo.trim(),
    GiaTri: String(row.GiaTri ?? '').trim(),
    KieuDuLieu: row.KieuDuLieu?.trim() || 'TEXT',
    NhomThamSo: row.NhomThamSo?.trim() || null,
    MoTa: row.MoTa?.trim() || null,
  }));

  const requiredNumericIds = ['SoCauHoiToiDa', 'ThoiLuongToiDa', 'ThoiLuongToiThieu', 'DiemToiDa', 'DiemToiThieu'];
  for (const row of normalizedRows) {
    if (!row.MaThamSo) throw new Error('Mã tham số không được để trống.');
    if (!row.TenThamSo) throw new Error(`Tên tham số của ${row.MaThamSo} không được để trống.`);
    if (requiredNumericIds.includes(row.MaThamSo)) {
      const value = Number(row.GiaTri);
      if (Number.isNaN(value)) throw new Error(`Giá trị của ${row.MaThamSo} phải là số.`);
    }
  }

  const valueOf = (id: string, fallback: number) => {
    const row = normalizedRows.find((item) => item.MaThamSo === id);
    const parsed = Number(row?.GiaTri ?? fallback);
    return Number.isNaN(parsed) ? fallback : parsed;
  };
  const minDuration = valueOf('ThoiLuongToiThieu', 30);
  const maxDuration = valueOf('ThoiLuongToiDa', 180);
  const minScore = valueOf('DiemToiThieu', 0);
  const maxScore = valueOf('DiemToiDa', 10);
  const maxQuestions = valueOf('SoCauHoiToiDa', 5);
  if (minDuration > maxDuration) throw new Error('Thời lượng tối thiểu không được lớn hơn thời lượng tối đa.');
  if (minScore > maxScore) throw new Error('Điểm tối thiểu không được lớn hơn điểm tối đa.');
  if (maxQuestions < 1) throw new Error('Số câu hỏi tối đa phải lớn hơn hoặc bằng 1.');

  const payload = normalizedRows.map((row) => ({
    MaThamSo: row.MaThamSo.trim(),
    TenThamSo: row.TenThamSo.trim(),
    GiaTri: String(row.GiaTri ?? ''),
    KieuDuLieu: row.KieuDuLieu?.trim() || 'TEXT',
    NhomThamSo: row.NhomThamSo?.trim() || null,
    MoTa: row.MoTa?.trim() || null,
    NgayCapNhat: new Date().toISOString().slice(0, 10),
  }));
  try {
    await queryFirst<any[]>(TABLES.params, (table) =>
      client.from(table).upsert(payload, { onConflict: 'MaThamSo' }).select('MaThamSo'),
    );
  } catch (error: any) {
    throw toAppError(error);
  }
}

export async function deleteSystemParam(paramId: string) {
  const client = getClient();
  try {
    await queryFirst<any[]>(TABLES.params, (table) => client.from(table).delete().eq('MaThamSo', paramId).select('MaThamSo'));
  } catch (error: any) {
    throw toAppError(error);
  }
}

export async function saveAcademicYear(payload: {
  namHoc: string;
  tenHocKy: string;
  ngayBatDau?: string;
  ngayKetThuc?: string;
  trangThai?: string;
}) {
  const client = getClient();
  validateDateRange(payload.ngayBatDau, payload.ngayKetThuc);
  const existing = await queryFirst(TABLES.semesters, (table) =>
    client.from(table).select('MaHocKyNamHoc').eq('NamHoc', payload.namHoc.trim()).eq('TenHocKy', payload.tenHocKy.trim()).limit(1)
  );
  if ((existing.data || []).length > 0)
    throw new Error(`Học kỳ "${payload.tenHocKy}" trong năm học "${payload.namHoc}" đã tồn tại.`);
  const id = `HKNH_${Date.now()}`;
  const row = {
    MaHocKyNamHoc: id,
    TenHocKy: payload.tenHocKy || 'HK1',
    NamHoc: payload.namHoc,
    NgayBatDau: payload.ngayBatDau || null,
    NgayKetThuc: payload.ngayKetThuc || null,
    TrangThai: payload.trangThai || 'active',
  };
  try {
    await queryFirst<any[]>(TABLES.semesters, (table) => client.from(table).insert(row).select('MaHocKyNamHoc'));
  } catch (error: any) {
    throw toAppError(error);
  }
}

export async function saveSemester(payload: {
  id?: string;
  code: string;
  name: string;
  academicYearName: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}) {
  const client = getClient();
  validateDateRange(payload.startDate, payload.endDate);
  const row = {
    MaHocKyNamHoc: payload.code.trim(),
    TenHocKy: payload.name.trim(),
    NamHoc: payload.academicYearName.trim(),
    NgayBatDau: payload.startDate || null,
    NgayKetThuc: payload.endDate || null,
    TrangThai: payload.status || 'active',
  };

  const existCode = await queryFirst(TABLES.semesters, (table) => client.from(table).select('MaHocKyNamHoc').eq('MaHocKyNamHoc', payload.code.trim()));
  if ((existCode.data || []).some((row: any) => String(row.MaHocKyNamHoc) !== String(payload.id || ''))) {
    throw new Error(`Mã học kỳ "${payload.code}" đã tồn tại.`);
  }
  const existName = await queryFirst(TABLES.semesters, (table) => client.from(table).select('MaHocKyNamHoc').eq('TenHocKy', payload.name.trim()).eq('NamHoc', payload.academicYearName.trim()));
  if ((existName.data || []).some((row: any) => String(row.MaHocKyNamHoc) !== String(payload.id || ''))) {
    throw new Error(`Học kỳ "${payload.name}" trong năm học "${payload.academicYearName}" đã tồn tại.`);
  }
  const yearMatch = payload.academicYearName.trim().match(/^(\d{4})[-–](\d{4})$/);
  if (yearMatch && payload.startDate && payload.endDate) {
    const yearFrom = parseInt(yearMatch[1]);
    const yearTo = parseInt(yearMatch[2]);
    const startYear = parseInt(payload.startDate.slice(0, 4));
    const endYear = parseInt(payload.endDate.slice(0, 4));
    if (startYear < yearFrom || startYear > yearTo)
      throw new Error(`Ngày bắt đầu (${payload.startDate}) không nằm trong năm học ${payload.academicYearName}.`);
    if (endYear < yearFrom || endYear > yearTo)
      throw new Error(`Ngày kết thúc (${payload.endDate}) không nằm trong năm học ${payload.academicYearName}.`);
  }

  try {
    if (payload.id) {
      await queryFirst<any[]>(TABLES.semesters, (table) =>
        client.from(table).update(row).eq('MaHocKyNamHoc', payload.id).select('MaHocKyNamHoc'),
      );
      return payload.id;
    }
    await queryFirst<any[]>(TABLES.semesters, (table) => client.from(table).insert(row).select('MaHocKyNamHoc'));
    return payload.code.trim();
  } catch (error: any) {
    throw toAppError(error);
  }
}

export async function deleteSemester(semesterId: string) {
  const client = getClient();
  const [classesRes, examsRes] = await Promise.all([
    queryFirstSafe<any[]>(TABLES.classes, (table) => client.from(table).select('MaLopHoc').eq('MaHocKyNamHoc', semesterId).limit(1), []),
    queryFirstSafe<any[]>(TABLES.exams, (table) => client.from(table).select('MaDeThi').eq('MaHocKyNamHoc', semesterId).limit(1), []),
  ]);
  const reasons: string[] = [];
  if ((classesRes.data || []).length > 0) reasons.push('có lớp học trong học kỳ này');
  if ((examsRes.data || []).length > 0) reasons.push('có đề thi trong học kỳ này');
  if (reasons.length > 0) {
    throw new Error(`Không thể xóa học kỳ này vì ${reasons.join(', ')}. Hãy xóa các dữ liệu liên quan trước.`);
  }
  try {
    await queryFirst<any[]>(TABLES.semesters, (table) =>
      client.from(table).delete().eq('MaHocKyNamHoc', semesterId).select('MaHocKyNamHoc'),
    );
  } catch (error: any) {
    throw toAppError(error);
  }
}
