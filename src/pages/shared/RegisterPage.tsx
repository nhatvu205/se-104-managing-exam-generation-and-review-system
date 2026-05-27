import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="auth-layout" id="main-content" tabIndex={-1}>
      <section className="auth-card" aria-labelledby="register-title">
        <h1 id="register-title" className="auth-title">Đăng ký tài khoản</h1>
        <p className="auth-subtitle">Điền thông tin để gửi yêu cầu tạo tài khoản cho quản trị hệ thống.</p>

        {submitted ? (
          <section className="notice notice-success" aria-live="polite">
            <strong>Đã gửi yêu cầu thành công.</strong>
            <p className="mt-8">Quản trị viên sẽ duyệt và phản hồi qua email của bạn.</p>
          </section>
        ) : (
          <form className="form-grid" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
            <div className="field">
              <label htmlFor="full-name">Họ và tên <span className="required">*</span></label>
              <input className="input" id="full-name" required />
            </div>

            <div className="field">
              <label htmlFor="register-email">Email công vụ <span className="required">*</span></label>
              <input className="input" id="register-email" type="email" placeholder="name@university.edu.vn" required />
            </div>

            <div className="field">
              <label htmlFor="register-phone">Số điện thoại</label>
              <input className="input" id="register-phone" type="tel" placeholder="09xx xxx xxx" />
            </div>

            <div className="field">
              <label htmlFor="register-role">Vai trò mong muốn <span className="required">*</span></label>
              <select className="select" id="register-role" required>
                <option value="">Chọn vai trò</option>
                <option value="lecturer">Giảng viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>

            <div className="actions">
              <button className="btn btn-primary" type="submit">Gửi đăng ký</button>
              <Link className="btn btn-secondary" to="/shared/login">Quay lại đăng nhập</Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
