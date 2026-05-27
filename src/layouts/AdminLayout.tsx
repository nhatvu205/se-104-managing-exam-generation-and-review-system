import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useId, useMemo, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';

export const tokens = {
  bgPrimary: '#F5F5F3',
  bgSecondary: '#ECECE8',
  surface: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  accentPrimary: '#2563EB',
  accentHover: '#1D4ED8',
  accentSoft: '#DBEAFE',
  success: '#16A34A',
  successBg: '#DCFCE7',
  warning: '#D97706',
  warningBg: '#FEF3C7',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  info: '#0891B2',
  infoBg: '#CFFAFE',
  border: '#E5E7EB',
};

type NavigateHandler = (key: string, path: string) => void;

const navItems = [
  { key: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
  { key: 'users-list', label: 'Người dùng', path: '/admin/users' },
  { key: 'years-list', label: 'Năm học', path: '/admin/academic-years' },
  { key: 'semesters-list', label: 'Học kỳ', path: '/admin/semesters' },
  { key: 'classes-list', label: 'Lớp học', path: '/admin/classes' },
  { key: 'subjects-list', label: 'Môn học', path: '/admin/subjects' },
  { key: 'system-rules', label: 'Quy định hệ thống', path: '/admin/system-rules' },
  { key: 'year-report-export', label: 'Báo cáo năm', path: '/admin/year-report-export' },
];

function resolveBadgeColor(color?: string) {
  if (!color) return { bg: tokens.bgSecondary, fg: tokens.textMuted };
  if (color === 'active' || color === 'success' || color === 'lecturer') return { bg: tokens.successBg, fg: tokens.success };
  if (color === 'inactive' || color === 'danger') return { bg: tokens.dangerBg, fg: tokens.danger };
  if (color === 'admin' || color === 'info') return { bg: tokens.accentSoft, fg: tokens.accentPrimary };
  if (color === 'warning') return { bg: tokens.warningBg, fg: tokens.warning };
  if (color.startsWith('#')) return { bg: `${color}15`, fg: color };
  return { bg: tokens.bgSecondary, fg: tokens.textMuted };
}

export default function AdminLayout({
  children,
  activeKey,
  breadcrumbs = [],
  onNavigate,
}: {
  children: ReactNode;
  activeKey?: string;
  breadcrumbs?: string[];
  onNavigate?: NavigateHandler;
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Điều hướng Admin">
        <div className="brand">Exam System</div>
        <p style={{ margin: '-12px 0 20px', color: tokens.textMuted, fontSize: 13 }}>Ra đề &amp; Chấm thi</p>

        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.key}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive || activeKey === item.key ? 'active' : ''}`}
                onClick={() => onNavigate?.(item.key, item.path)}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${tokens.border}` }}>
          <Link to="/shared/login" className="btn btn-tertiary">Đăng xuất</Link>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <strong>Admin Portal</strong>
          <span className="badge badge-success">Quản trị viên</span>
        </header>

        <main className="container" id="main-content" tabIndex={-1}>
          {breadcrumbs.length > 0 && (
            <nav aria-label="breadcrumb" style={{ marginBottom: 16, fontSize: 13, color: tokens.textMuted }}>
              {breadcrumbs.join(' / ')}
            </nav>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="toolbar">{actions}</div> : null}
    </header>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <section className="card" style={style}>{children}</section>;
}

export function PageState({
  kind,
  title,
  description,
  action,
}: {
  kind: 'loading' | 'empty' | 'error';
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <section className="card">
      <div className="empty">
        <div aria-hidden="true" style={{ marginBottom: 12, color: kind === 'error' ? tokens.danger : tokens.accentPrimary }}>
          {kind === 'loading' ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4" />
              <path d="M12 18v4" />
              <path d="m4.93 4.93 2.83 2.83" />
              <path d="m16.24 16.24 2.83 2.83" />
              <path d="M2 12h4" />
              <path d="M18 12h4" />
              <path d="m4.93 19.07 2.83-2.83" />
              <path d="m16.24 7.76 2.83-2.83" />
            </svg>
          ) : kind === 'error' ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6v14H5V6" />
              <path d="m9 10 3 3 3-3" />
            </svg>
          )}
        </div>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>{title}</h2>
        {description ? <p style={{ marginBottom: 16 }}>{description}</p> : null}
        {action}
      </div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  sub,
  color = tokens.accentPrimary,
  iconPath,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  color?: string;
  iconPath?: ReactNode;
}) {
  return (
    <Card style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ color: tokens.textMuted, fontSize: 13 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{value}</div>
          {sub ? <div style={{ marginTop: 6, color: tokens.textSecondary, fontSize: 13 }}>{sub}</div> : null}
        </div>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: `${color}18`,
            color,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          {iconPath ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {iconPath}
            </svg>
          ) : (
            '•'
          )}
        </div>
      </div>
    </Card>
  );
}

export function Btn({
  children,
  variant = 'primary',
  size = 'md',
  style,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}) {
  const className =
    variant === 'primary'
      ? 'btn btn-primary'
      : variant === 'secondary'
        ? 'btn btn-secondary'
        : variant === 'danger'
          ? 'btn btn-primary'
          : 'btn btn-tertiary';

  const mergedStyle: CSSProperties = {
    ...(size === 'sm' ? { minHeight: 34, padding: '6px 10px', fontSize: 13 } : {}),
    ...(variant === 'danger' ? { background: tokens.danger } : {}),
    ...style,
  };

  return <button {...props} className={`${className} ${props.className || ''}`.trim()} style={mergedStyle}>{children}</button>;
}

export function Badge({ label, color }: { label: string; color?: string }) {
  const c = resolveBadgeColor(color);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: c.bg,
        color: c.fg,
      }}
    >
      {label}
    </span>
  );
}

export function Input({
  label,
  required,
  error,
  hint,
  style,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
}) {
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div style={style}>
      {label ? (
        <label htmlFor={inputId} style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: tokens.textSecondary }}>
          {label} {required ? <span style={{ color: tokens.danger }}>*</span> : null}
        </label>
      ) : null}
      <input
        {...props}
        id={inputId}
        className="input"
        aria-invalid={!!error}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        style={{ borderColor: error ? tokens.danger : '#D1D5DB' }}
      />
      {hint ? <div id={hintId} style={{ marginTop: 6, fontSize: 12, color: tokens.textMuted }}>{hint}</div> : null}
      {error ? <div id={errorId} role="alert" style={{ marginTop: 6, fontSize: 12, color: tokens.danger }}>{error}</div> : null}
    </div>
  );
}

export function Select({
  label,
  options,
  placeholder,
  required,
  error,
  style,
  id,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  const generatedId = useId();
  const selectId = id || `select-${generatedId}`;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div style={style}>
      {label ? (
        <label htmlFor={selectId} style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: tokens.textSecondary }}>
          {label} {required ? <span style={{ color: tokens.danger }}>*</span> : null}
        </label>
      ) : null}
      <select
        {...props}
        id={selectId}
        className="select"
        aria-invalid={!!error}
        aria-describedby={errorId}
        style={{ borderColor: error ? tokens.danger : '#D1D5DB' }}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <div id={errorId} role="alert" style={{ marginTop: 6, fontSize: 12, color: tokens.danger }}>{error}</div> : null}
    </div>
  );
}

export function SearchInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ position: 'relative', minWidth: 260, flex: 1 }}>
      <span style={{ position: 'absolute', left: 10, top: 10, color: tokens.textMuted }} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <input {...props} className="input" style={{ paddingLeft: 34 }} aria-label={props['aria-label'] || 'Tìm kiếm'} />
    </div>
  );
}

type Column<T> = {
  key: string;
  label: ReactNode;
  width?: number;
  render?: (value: any, row: T) => ReactNode;
};

export function Table<T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = 'Không có dữ liệu',
}: {
  columns: Array<Column<T>>;
  data: T[];
  emptyMessage?: string;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" style={col.width ? { width: col.width } : undefined}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', color: tokens.textMuted }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id ?? idx}>
                {columns.map((col) => {
                  const labelText = typeof col.label === 'string' ? col.label : '';
                  return (
                    <td key={col.key} data-label={labelText}>{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = useMemo(() => {
    const arr: number[] = [];
    for (let i = 1; i <= totalPages; i += 1) arr.push(i);
    return arr;
  }, [totalPages]);

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} aria-label="Phân trang">
      <Btn size="sm" variant="secondary" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}>
        Trước
      </Btn>
      {pages.map((p) => (
        <Btn
          key={p}
          size="sm"
          variant={p === currentPage ? 'primary' : 'secondary'}
          onClick={() => onPageChange(p)}
          aria-current={p === currentPage ? 'page' : undefined}
        >
          {p}
        </Btn>
      ))}
      <Btn size="sm" variant="secondary" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages}>
        Sau
      </Btn>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const root = dialogRef.current;
    if (!root) return;

    const getFocusable = () => Array.from(
      root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'),
    ).filter((el) => !el.hasAttribute('disabled'));

    const focusables = getFocusable();
    focusables[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const items = getFocusable();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.4)',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        zIndex: 40,
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Hộp thoại'}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(640px, 100%)',
          background: '#fff',
          borderRadius: 14,
          border: `1px solid ${tokens.border}`,
          boxShadow: '0 16px 32px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${tokens.border}`, fontWeight: 600 }}>{title}</div>
        <div style={{ padding: 24 }}>{children}</div>
        {footer ? <div style={{ padding: '16px 24px', borderTop: `1px solid ${tokens.border}`, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>{footer}</div> : null}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Xác nhận',
  confirmVariant = 'primary',
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'danger';
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={(
        <>
          <Btn variant="secondary" onClick={onClose}>Hủy</Btn>
          <Btn
            variant={confirmVariant === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Btn>
        </>
      )}
    >
      <p style={{ margin: 0, color: tokens.textSecondary }}>{message}</p>
    </Modal>
  );
}

export function Toast({
  message,
  type = 'success',
  onDismiss,
}: {
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss: () => void;
}) {
  const map = {
    success: { bg: tokens.successBg, fg: tokens.success },
    error: { bg: tokens.dangerBg, fg: tokens.danger },
    info: { bg: tokens.infoBg, fg: tokens.info },
  } as const;

  const c = map[type];

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.fg}40`,
        padding: '12px 14px',
        borderRadius: 10,
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        zIndex: 50,
      }}
    >
      <span>{message}</span>
      <button type="button" onClick={onDismiss} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: c.fg }}>
        ✕
      </button>
    </div>
  );
}

export function ScreenNavLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to}>{children}</Link>;
}
