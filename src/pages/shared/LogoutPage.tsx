import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      if (supabase) {
        await supabase.auth.signOut({ scope: 'local' });
      }
      navigate('/shared/login', { replace: true });
    })();
  }, [navigate]);

  return (
    <main className="auth-layout" id="main-content" tabIndex={-1}>
      <section className="auth-card">
        <h1 className="auth-title">Đang đăng xuất...</h1>
      </section>
    </main>
  );
}
