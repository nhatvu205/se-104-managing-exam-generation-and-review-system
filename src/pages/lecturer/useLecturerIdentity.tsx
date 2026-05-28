import { useEffect, useState } from 'react';
import { fetchCurrentUserProfile } from '../../lib/supabaseData';

export function useLecturerIdentity() {
  const [identity, setIdentity] = useState({
    fullName: 'Giảng viên',
    department: 'Chưa cập nhật bộ môn',
  });

  useEffect(() => {
    let mounted = true;
    fetchCurrentUserProfile()
      .then((profile) => {
        if (!mounted) return;
        setIdentity({
          fullName: profile.fullName || 'Giảng viên',
          department: profile.department || 'Chưa cập nhật bộ môn',
        });
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  return {
    title: `Giảng viên: ${identity.fullName}`,
    roleBadge: <span className="badge badge-info">{identity.department}</span>,
  };
}
