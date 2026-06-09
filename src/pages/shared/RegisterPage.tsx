import { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitRegistrationRequest } from '../../lib/supabaseData';

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  return (
    <main className="auth-layout" id="main-content" tabIndex={-1}>
      <section className="auth-card" aria-labelledby="register-title">
        <h1 id="register-title" className="auth-title">Đăng ký tài khoản</h1>
        <p className="auth-subtitle">Tài khoản đăng ký mới sẽ được tạo với vai trò giảng viên và cần được quản trị viên duyệt trước khi đăng nhập.</p>

        {submitted ? (
          <section className="notice notice-success" aria-live="polite">
            <strong>Đăng ký tài khoản thành công.</strong>
            <p className="mt-8">Tài khoản của bạn đang ở trạng thái chờ duyệt. Sau khi được quản trị viên kích hoạt, bạn mới có thể đăng nhập.</p>
          </section>
        ) : (
          <form
            className="form-grid"
            onSubmit={async (e) => {
              e.preventDefault();
              if (form.password.length < 8) {
                setError('Mật khẩu phải có ít nhất 8 ký tự.');
                return;
              }
              if (form.password !== form.confirmPassword) {
                setError('Mật khẩu xác nhận không khớp.');
                return;
              }
              setSaving(true);
              setError('');
              try {
                await submitRegistrationRequest({
                  fullName: form.fullName,
                  email: form.email,
                  phone: form.phone,
                  password: form.password,
                });
                setSubmitted(true);
              } catch (err: any) {
                setError(err.message || 'Không đăng ký được tài khoản.');
              } finally {
                setSaving(false);
              }
            }}
          >
            <div className="field">
              <label htmlFor="full-name">Họ và tên <span className="required">*</span></label>
              <input className="input" id="full-name" required value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} />
            </div>

            <div className="field">
              <label htmlFor="register-email">Email công vụ <span className="required">*</span></label>
              <input className="input" id="register-email" type="email" placeholder="name@university.edu.vn" required value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
            </div>

            <div className="field">
              <label htmlFor="register-phone">Số điện thoại</label>
              <input className="input" id="register-phone" type="tel" placeholder="09xx xxx xxx" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
            </div>

            <div className="field">
              <label htmlFor="register-password">Mật khẩu <span className="required">*</span></label>
              <input className="input" id="register-password" type="password" minLength={8} required value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} />
            </div>

            <div className="field">
              <label htmlFor="register-confirm-password">Xác nhận mật khẩu <span className="required">*</span></label>
              <input className="input" id="register-confirm-password" type="password" minLength={8} required value={form.confirmPassword} onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))} />
            </div>

            {error ? <div className="field-error">{error}</div> : null}

            <div className="actions">
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Đang tạo...' : 'Tạo tài khoản'}</button>
              <Link className="btn btn-secondary" to="/shared/login">Quay lại đăng nhập</Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
