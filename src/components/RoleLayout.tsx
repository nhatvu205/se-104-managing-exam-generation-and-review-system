import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';

type NavItem = { label: string; to?: string; active?: boolean };

export default function RoleLayout({
  title,
  roleBadge,
  sidebarTitle = 'Exam System',
  sidebarSubtitle,
  navItems,
  children,
}: {
  title: string;
  roleBadge: ReactNode;
  sidebarTitle?: string;
  sidebarSubtitle?: string;
  navItems: NavItem[];
  children: ReactNode;
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Điều hướng vai trò">
        <div className="brand"><img src="/assets/logo.svg" alt={sidebarTitle} className="brand-logo" /><span>{sidebarTitle}</span></div>
        {sidebarSubtitle ? <p style={{ margin: '-12px 0 20px', color: '#6b7280', fontSize: 13 }}>{sidebarSubtitle}</p> : null}
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.label}>
              {item.to ? (
                <NavLink to={item.to} className={({ isActive }) => `nav-link ${isActive || item.active ? 'active' : ''}`}>
                  {item.label}
                </NavLink>
              ) : (
                <span className={`nav-link ${item.active ? 'active' : ''}`}>{item.label}</span>
              )}
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
          <Link className="btn btn-tertiary" to="/shared/logout">Đăng xuất</Link>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <strong>{title}</strong>
          {roleBadge}
        </header>

        <main className="container" id="main-content" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}
