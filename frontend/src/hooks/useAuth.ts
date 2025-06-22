import { useState, useEffect } from 'react';

export interface Profile {
  id: number;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
}

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    fetch('http://localhost:3000/users/me', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);
  return {
    profile,
    isAdmin: profile?.role === 'admin'
  };
}