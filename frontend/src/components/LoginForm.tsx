import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await login(email, password);
            navigate('/home', { replace: true });
            window.location.reload();
        } catch (err: any) {
            setError(err.message || 'Ошибка входа');
            console.error(err);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 shadow-lg rounded-lg">
            <h2 className="text-2xl mb-4">Вход в CoworkEase</h2>
            {error && <div className="text-red-600 mb-2">{error}</div>}
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
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Войти
                </button>
            </form>
            <p className="mt-4 text-center">
                Нет аккаунта?{' '}
                <Link to="/register" className="text-blue-600">
                    Зарегистрироваться
                </Link>
            </p>
        </div>
    );
}