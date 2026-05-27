import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'admin' | 'lecturer'>('admin');

  const handleLogin = () => {
    navigate(role === 'admin' ? '/admin/dashboard' : '/lecturer/year-report');
  };

  return (
    <main className="auth-layout" id="main-content" tabIndex={-1}>
      <section className="auth-card" aria-labelledby="login-title">
        <h1 id="login-title" className="auth-title">Đăng nhập</h1>
        <p className="auth-subtitle">Đăng nhập bằng email công vụ để truy cập hệ thống.</p>

        <form className="form-grid" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <div className="field">
            <label htmlFor="email">Email <span className="required">*</span></label>
            <input className="input" id="email" type="email" placeholder="name@university.edu.vn" required />
          </div>

          <div className="field">
            <label htmlFor="password">Mật khẩu <span className="required">*</span></label>
            <input className="input" id="password" type="password" placeholder="Nhập mật khẩu" required />
          </div>

          <div className="field">
            <label htmlFor="role-login">Vai trò</label>
            <select id="role-login" className="select" value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'lecturer')}>
              <option value="admin">Admin</option>
              <option value="lecturer">Giảng viên</option>
            </select>
          </div>

          <div className="actions">
            <button type="submit" className="btn btn-primary">Đăng nhập</button>
            <Link className="btn btn-secondary" to="/shared/change-password">Đổi mật khẩu</Link>
          </div>
        </form>

        <div className="auth-footer">
          <span className="auth-footer-text">Chưa có tài khoản?</span>
          <Link className="btn btn-tertiary" to="/shared/register">Đăng ký tài khoản</Link>
        </div>
      </section>
    </main>
  );
}
