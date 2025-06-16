// src/components/RegisterForm.tsx
import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, full_name: fullName }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
                // Redirect to Login after short delay
                setTimeout(() => navigate('/login'), 1500);
            } else {
                const msg = Array.isArray(data.error)
                    ? data.error.join(', ')
                    : data.error;
                setError(msg);
            }
        } catch (err) {
            setError('Network error');
            console.error(err);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 shadow-lg rounded-lg">
            <h2 className="text-2xl mb-4">Регистрация в CoworkEase</h2>
            {success && <div className="text-green-600 mb-2">Успешно. Перенаправление...</div>}
            {error && <div className="text-red-600 mb-2">{error}</div>}
            {!success && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full border rounded px-3 py-2"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Полное имя</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Пароль</label>
                        <input
                            type="password"
                            className="w-full border rounded px-3 py-2"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                        Зарегистрироваться
                    </button>
                </form>
            )}
            <p className="mt-4 text-center">
                Уже есть аккаунт?{' '}
                <Link to="/login" className="text-blue-600">
                    Войти
                </Link>
            </p>
        </div>
    );
}