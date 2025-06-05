import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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
            <button className="header-btn" onClick={() => navigate("/register")}>Регистрация</button>
          </>
        ) : (
          <div className="user-menu-wrapper">
            <div className="user-name-btn" onClick={() => setMenuOpen(m => !m)}>
              {user.name}
              <span style={{ marginLeft: 8 }}>▼</span>
            </div>
            {menuOpen && (
              <div className="user-dropdown">
                <div className="user-dropdown-item" onClick={() => navigate("/profile")}>Личный кабинет</div>
                <div className="user-dropdown-item" onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  onLogout();
                  navigate("/");
                }}>Выйти</div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
