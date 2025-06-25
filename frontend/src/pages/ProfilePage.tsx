
import { useEffect, useState, type FormEvent } from 'react';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/profile', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setEmail(data.email);
      })
      .catch(err => console.error(err));
  }, []);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const body: any = {};
    if (email !== user?.email) body.email = email;
    if (password) body.password = password;

    const res = await fetch('http://localhost:3000/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data);
      setPassword('');
      setMessage('Данные успешно обновлены');
    } else {
      setMessage(data.error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить аккаунт?')) return;
    await fetch('http://localhost:3000/profile', {
      method: 'DELETE',
      credentials: 'include',
    });
    window.location.href = '/login';
  };

  if (!user) return <div>Loading profile...</div>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl mb-4">Мой профиль</h2>
      {message && <div className="mb-4 text-green-600">{message}</div>}
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Новый пароль</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Сохранить
        </button>
      </form>
      <hr className="my-6" />
      <button
        onClick={handleDelete}
        className="text-red-600 hover:underline"
      >
        Удалить аккаунт
      </button>
    </div>
  );
}