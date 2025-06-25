import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';




export default function Layout() {
  const navigate = useNavigate();
  
  const { isAdmin } = useAuth();

  async function handleLogout() {
    await fetch('http://localhost:3000/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    navigate('/login');
  }

  return (
       <>
      <nav className="nav">
        <div className="nav-content">
          <NavLink to="/" className="logo">CoWorkEase</NavLink>
          <ul className="nav-links">
            <li><NavLink to="/" end className={({isActive})=>isActive?'active':''}>Dashboard</NavLink></li>
            <li><NavLink to="/spaces" className={({isActive})=>isActive?'active':''}>Spaces</NavLink></li>
            <li>
              {isAdmin ? (
                <NavLink to="/admin/bookings" className={({isActive})=>isActive?'active':''}>
                  Bookings (Admin)
                </NavLink>
              ) : (
                <NavLink to="/bookings" className={({isActive})=>isActive?'active':''}>
                  Bookings
                </NavLink>
              )}
            </li>
            <li><NavLink to="/profile" className={({isActive})=>isActive?'active':''}>Profile</NavLink></li>
 
          </ul>
          <div className="nav-actions">
            <div className="theme-toggle" onClick={() => {/* ваша функция toggleTheme */}}>
              <span id="theme-icon">🌙</span>
            </div>
            <div className="auth-buttons">
                  <button onClick={() => navigate('/login')} className="btn-login">Вход</button>
              <button onClick={() => navigate('/register')} className="btn-register">Регистрация</button>
            </div>
            <button className="profile-btn" onClick={() => navigate('/profile')}> Профиль</button>
          </div>
        </div>
      </nav>
    <main className="main"><Outlet /></main>
    </>
  );
}