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
    roleId: '',
  });

  return (
    <main className="auth-layout" id="main-content" tabIndex={-1}>
      <section className="auth-card" aria-labelledby="register-title">
        <h1 id="register-title" className="auth-title">Đăng ký tài khoản</h1>
        <p className="auth-subtitle">Điền thông tin để gửi yêu cầu tạo tài khoản cho quản trị hệ thống.</p>

        {submitted ? (
          <section className="notice notice-success" aria-live="polite">
            <strong>Đã gửi yêu cầu thành công.</strong>
            <p className="mt-8">Quản trị viên sẽ xem xét yêu cầu của bạn trong vòng 24 giờ.</p>
          </section>
        ) : (
          <form
            className="form-grid"
            onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              setError('');
              try {
                await submitRegistrationRequest(form);
                setSubmitted(true);
              } catch (err: any) {
                setError(err.message || 'Không gửi được yêu cầu đăng ký.');
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
              <label htmlFor="register-role">Vai trò mong muốn <span className="required">*</span></label>
              <select className="select" id="register-role" required value={form.roleId} onChange={(e) => setForm((prev) => ({ ...prev, roleId: e.target.value }))}>
                <option value="">Chọn vai trò</option>
                <option value="GV">Giảng viên</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
            </div>

            {error ? <div className="field-error">{error}</div> : null}

            <div className="actions">
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Đang gửi...' : 'Gửi đăng ký'}</button>
              <Link className="btn btn-secondary" to="/shared/login">Quay lại đăng nhập</Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
