import { useEffect, useState } from 'react';
import { fetchCurrentUserProfile } from '../../lib/supabaseData';

export function useLecturerIdentity() {
  const [identity, setIdentity] = useState({
    userId: null as string | null,
    fullName: 'Giảng viên',
    faculty: 'Chưa cập nhật khoa',
  });

  useEffect(() => {
    let mounted = true;
    fetchCurrentUserProfile()
      .then((profile) => {
        if (!mounted) return;
        setIdentity({
          userId: profile.userId || null,
          fullName: profile.fullName || 'Giảng viên',
          faculty: profile.faculty || 'Chưa cập nhật khoa',
        });
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  return {
    userId: identity.userId,
    title: `Giảng viên: ${identity.fullName}`,
    roleBadge: <span className="badge badge-info">{identity.faculty}</span>,
  };
}
