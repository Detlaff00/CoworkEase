import { useState, useEffect } from 'react';

export interface Profile {
  id: number;
  first_name: string;
  last_name: string;
  birthdate: string;
  phone_number: string;
  email: string;
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

  // POST /auth/login, store HTTP-only cookie, setProfile
  const login = async (email: string, password: string) => {
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || 'Ошибка входа');
    }
    const data: Profile = await res.json();
    setProfile(data);
  };

  // POST /auth/logout, clear cookie, clear profile
  const logout = async () => {
    await fetch('http://localhost:3000/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setProfile(null);
  };

  return {
    profile,
    isAdmin: profile?.role === 'admin',
    login,
    logout
  };
}