import { Link } from 'react-router-dom';

export default function ErrorNoPermissionPage() {
  return (
    <main className="error-layout" id="main-content" tabIndex={-1}>
      <section className="card error-card" aria-labelledby="error-title">
        <div className="error-code" aria-hidden="true">403</div>
        <h1 id="error-title" className="page-title">Bạn không có quyền truy cập</h1>
        <p className="page-subtitle mt-12">
          Tài khoản hiện tại không được cấp quyền cho trang này hoặc đường dẫn không tồn tại.
        </p>
        <div className="actions actions-center">
          <Link className="btn btn-primary" to="/shared/login">Về đăng nhập</Link>
          <Link className="btn btn-secondary" to="/shared/register">Đăng ký tài khoản</Link>
        </div>
      </section>
    </main>
  );
}
