import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import AdminLayout, { PageHeader, Card, StatCard, Btn, PageState, tokens } from '../../layouts/AdminLayout';
import { fetchDashboardData } from '../../lib/supabaseData';

const PIE_COLORS = ['#2563EB', '#16A34A', '#D97706'];

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchDashboardData();
      setStats(res);
    } catch (e) {
      setError(e.message || 'Không tải được dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <AdminLayout activeKey="dashboard" breadcrumbs={['Dashboard']} onNavigate={onNavigate}>
        <PageHeader title="Dashboard" subtitle="Tổng quan hệ thống" />
        <PageState kind="loading" title="Đang tải dashboard" description="Hệ thống đang tổng hợp dữ liệu..." />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout activeKey="dashboard" breadcrumbs={['Dashboard']} onNavigate={onNavigate}>
        <PageHeader title="Dashboard" subtitle="Không thể tải dữ liệu" />
        <PageState
          kind="error"
          title="Không tải được dashboard"
          description={error}
          action={<Btn variant="secondary" onClick={load}>Thử lại</Btn>}
        />
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout activeKey="dashboard" breadcrumbs={['Dashboard']} onNavigate={onNavigate}>
        <PageHeader title="Dashboard" subtitle="Tổng quan hệ thống" />
        <PageState kind="empty" title="Chưa có dữ liệu" description="Chưa có dữ liệu để hiển thị dashboard." />
      </AdminLayout>
    );
  }

  const pieData = stats.usersByRole.filter((x) => x.count > 0);

  return (
    <AdminLayout activeKey="dashboard" breadcrumbs={['Dashboard']} onNavigate={onNavigate}>
      <PageHeader title="Dashboard" subtitle={`Tổng quan hệ thống — Năm ${stats.currentYear}`} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Tổng số đề thi" value={stats.totalExams} sub="Toàn hệ thống" color="#2563EB" />
        <StatCard label="Bài đã chấm" value={stats.totalGradedSubmissions.toLocaleString()} sub="Toàn hệ thống" color="#16A34A" />
        <StatCard label="Người dùng" value={stats.totalUsers} sub="Admin/GV/SV" color="#9333EA" />
        <StatCard label="Lớp học" value={stats.totalClasses} sub="Đang quản lý" color="#D97706" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: tokens.textPrimary }}>Đề thi theo tháng</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.examsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="field-help">Xu hướng số đề thi được tạo theo từng tháng trong năm hiện tại.</p>
        </Card>

        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: tokens.textPrimary }}>Phân bố người dùng</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="count" nameKey="role">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 13 }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <p className="field-help">Tỷ trọng người dùng theo vai trò (Admin/Giảng viên/Sinh viên).</p>
        </Card>
      </div>
    </AdminLayout>
  );
}
