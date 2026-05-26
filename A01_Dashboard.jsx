import { useState } from "react";
import AdminLayout, { PageHeader, Card, StatCard, tokens } from "../layouts/AdminLayout";
import { mockDashboardStats } from "../data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

// ============================================================
// A01 — Dashboard Admin
// ============================================================

const ACTIVITY_ICONS = {
  exam_created:  { icon: "📄", color: "#2563EB" },
  exam_approved: { icon: "✅", color: "#16A34A" },
  user_created:  { icon: "👤", color: "#9333EA" },
  grade_submitted: { icon: "📊", color: "#D97706" },
};

export default function AdminDashboard({ onNavigate }) {
  const stats = mockDashboardStats;

  const pieData = stats.usersByRole.map(r => ({ name: r.role, value: r.count }));
  const PIE_COLORS = ["#2563EB", "#16A34A"];

  return (
    <AdminLayout activeKey="dashboard" breadcrumbs={["Dashboard"]} onNavigate={onNavigate}>
      <PageHeader
        title="Dashboard"
        subtitle={`Tổng quan hệ thống — Năm học ${stats.currentYear}`}
      />

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard
          label="Tổng số đề thi"
          value={stats.totalExams}
          sub="Năm học hiện tại"
          color="#2563EB"
          iconPath={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>}
        />
        <StatCard
          label="Bài đã chấm"
          value={stats.totalGradedSubmissions.toLocaleString()}
          sub="Tổng cộng"
          color="#16A34A"
          iconPath={<><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>}
        />
        <StatCard
          label="Người dùng"
          value={stats.totalUsers}
          sub="Admin & Giảng viên"
          color="#9333EA"
          iconPath={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
        />
        <StatCard
          label="Lớp học"
          value={stats.totalClasses}
          sub="Đang vận hành"
          color="#D97706"
          iconPath={<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>}
        />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, marginBottom: 24 }}>
        {/* Bar chart - Đề thi theo tháng */}
        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: 15, fontWeight: 600, color: tokens.textPrimary }}>Đề thi theo tháng</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.examsByMonth} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1F2937", border: "none", borderRadius: 8, fontSize: 13, color: "#fff", padding: "8px 12px" }}
                formatter={(v) => [v, "Số đề"]}
                labelStyle={{ color: "#9CA3AF" }}
              />
              <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie chart - Người dùng */}
        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: 15, fontWeight: 600, color: tokens.textPrimary }}>Phân bố người dùng</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 13 }} />
              <Tooltip
                contentStyle={{ background: "#1F2937", border: "none", borderRadius: 8, fontSize: 13, color: "#fff", padding: "8px 12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent activity */}
      <Card style={{ padding: 24 }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 15, fontWeight: 600, color: tokens.textPrimary }}>Hoạt động gần đây</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {stats.recentActivities.map((act, i) => {
            const meta = ACTIVITY_ICONS[act.type] || { icon: "📌", color: tokens.textMuted };
            return (
              <div key={act.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 0",
                borderBottom: i < stats.recentActivities.length - 1 ? `1px solid ${tokens.border}` : "none",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: `${meta.color}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                }}>{meta.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: tokens.textPrimary }}>{act.message}</div>
                </div>
                <div style={{ fontSize: 12, color: tokens.textMuted, whiteSpace: "nowrap" }}>{act.time}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </AdminLayout>
  );
}
