import { Link } from 'react-router-dom';

export default function ChangePasswordPage() {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Điều hướng chính">
        <div className="brand">Exam System</div>
        <ul className="nav-list">
          <li><Link className="nav-link" to="/shared/login">Đăng nhập</Link></li>
          <li><span className="nav-link active">Đổi mật khẩu</span></li>
        </ul>
      </aside>

      <div className="main">
        <header className="topbar">
          <strong>Thiết lập tài khoản</strong>
          <span className="badge badge-info">Người dùng hệ thống</span>
        </header>

        <main className="container" id="main-content" tabIndex={-1}>
          <header className="page-header">
            <div>
              <h1 className="page-title">Đổi mật khẩu</h1>
              <p className="page-subtitle">Cập nhật mật khẩu định kỳ để bảo mật tài khoản.</p>
            </div>
          </header>

          <section className="card" aria-labelledby="change-pass-title" style={{ maxWidth: 760 }}>
            <h2 id="change-pass-title" className="section-title">Thông tin bảo mật</h2>

            <form className="form-grid" action="#" method="post">
              <div className="field">
                <label htmlFor="current-password">Mật khẩu hiện tại <span className="required">*</span></label>
                <input className="input" id="current-password" type="password" required />
              </div>

              <div className="field">
                <label htmlFor="new-password">Mật khẩu mới <span className="required">*</span></label>
                <input className="input" id="new-password" type="password" required />
                <p className="field-help">Ít nhất 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.</p>
              </div>

              <div className="field">
                <label htmlFor="confirm-password">Xác nhận mật khẩu mới <span className="required">*</span></label>
                <input className="input" id="confirm-password" type="password" required />
              </div>

              <div className="actions">
                <button type="submit" className="btn btn-primary">Lưu mật khẩu mới</button>
                <Link to="/shared/login" className="btn btn-secondary">Quay lại đăng nhập</Link>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
