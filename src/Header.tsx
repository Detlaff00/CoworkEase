import React, { useState } from "react";
import { Link } from "react-router-dom";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type HeaderProps = {
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onToggleTheme: () => void;
  darkMode: boolean;
};

export default function Header({
  user, onLoginClick, onLogout, onToggleTheme, darkMode
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <Link to="/" className="header-title" style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}>
  CoworkEase
</Link>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button className="theme-toggle" onClick={onToggleTheme}>
          {darkMode ? "🌞" : "🌙"}
        </button>
        {!user ? (
          <>
            <button className="header-btn" onClick={onLoginClick}>Войти</button>
            <button className="header-btn" onClick={() => window.location.href = "/register"}>Регистрация</button>
          </>
        ) : (
          <div className="user-menu-wrapper">
            <div className="user-name-btn" onClick={() => setMenuOpen(m => !m)}>
              {user.name}
              <span style={{ marginLeft: 8 }}>▼</span>
            </div>
            {menuOpen && (
              <div className="user-dropdown">
                <div className="user-dropdown-item" onClick={() => {window.location.href = "/profile";}}>Личный кабинет</div>
                <div className="user-dropdown-item" onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  onLogout();
                  window.location.href = "/";
                }}>Выйти</div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}