import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../style/LoginForm.css';

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
        <div className="register-form">
            <h2>Вход в CoworkEase</h2>
            {error && <div>{error}</div>}
            <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="form-group__input"
                    />
                </div>
                <div className="form-group">
                    <label>Пароль</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-group__input"
                    />
                </div>
                <button
                    type="submit"
                    className="btn-primary"
                >
                    Войти
                </button>
            </form>
            <p>
                Нет аккаунта?{' '}
                <Link to="/register" className="btn-secondary">
                    Зарегистрироваться
                </Link>
            </p>
        </div>
    );
}