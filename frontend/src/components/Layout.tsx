import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const navigate = useNavigate();

  const { profile, isAdmin } = useAuth();

  async function handleLogout() {
    await fetch('http://localhost:3000/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    navigate('/', { replace: true });
    window.location.reload();
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-content">
          <NavLink to="/" className="logo">CoWorkEase</NavLink>
          <ul className="nav-links">
            <li><NavLink to="/home" end className={({ isActive }) => isActive ? 'active' : ''}>Главная</NavLink></li>
            <li><NavLink to="/spaces" className={({ isActive }) => isActive ? 'active' : ''}>Пространства</NavLink></li>
            <li>
              {!profile ? (
                // если не залогинен — ведём на страницу логина
                <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>
                  Бронирования
                </NavLink>
              ) : isAdmin ? (
                // если админ
                <NavLink to="/admin/bookings" className={({ isActive }) => isActive ? 'active' : ''}>
                  Bookings (Admin)
                </NavLink>
              ) : (
                // если обычный пользователь
                <NavLink to="/bookings" className={({ isActive }) => isActive ? 'active' : ''}>
                  Бронирования
                </NavLink>
              )}
            </li>

          </ul>
          <div className="nav-actions">
            <div className="theme-toggle" onClick={() => { }}>
              <span id="theme-icon">🌙</span>
            </div>
            {!profile ? (

              <div className="auth-buttons">
                <button onClick={() => navigate('/login')} className="btn-login">
                  Вход
                </button>
                <button onClick={() => navigate('/register')} className="btn-register">
                  Регистрация
                </button>
              </div>
            ) : (

              <div className="profile-container">
                <button className="profile-btn">
                  {profile.full_name.charAt(0).toUpperCase()}
                </button>
                <div className="profile-dropdown">
                  <button onClick={() => navigate('/profile')}>Профиль</button>
                  <button onClick={handleLogout}>Выйти</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="main"><Outlet /></main>
    </>
  );
}