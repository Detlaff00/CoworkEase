import React, { useEffect, useState } from "react";
import ChangePasswordModal from "./ChangePasswordModal";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Нет авторизации");
      return;
    }
    fetch("http://localhost:3000/profile", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setUser(data.user);
      })
      .catch(() => setError("Ошибка соединения с сервером"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (error) return <div className="profile-error">{error}</div>;
  if (!user) return <div className="profile-loading">Загрузка...</div>;

  return (
    <div className="profile-card">
      <div className="profile-avatar">
      <svg
  className="profile-avatar-svg"
  width="82"
  height="82"
  viewBox="0 0 82 82"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <radialGradient id="avatarGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#9eaaff" />
      <stop offset="100%" stopColor="#4255ff" />
    </radialGradient>
  </defs>
  <circle
    cx="41"
    cy="41"
    r="36"
    fill="url(#avatarGradient)"
    filter="url(#dropshadow)"
    opacity={1}
  />
  <text
    x="50%"
    y="56%"
    textAnchor="middle"
    dominantBaseline="middle"
    fontSize="3.3rem"
    fontWeight="bold"
    fill="#fff"
    filter="url(#lettershadow)"
    style={{ fontFamily: "Montserrat, Arial, sans-serif", paintOrder: "stroke" }}
  >
    {user.name && user.name.trim().length > 0
      ? user.name.trim()[0].toUpperCase()
      : user.email[0].toUpperCase()}
  </text>
  <filter id="dropshadow" x="0" y="0" width="200%" height="200%">
    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#273285" floodOpacity="0.25" />
  </filter>
  <filter id="lettershadow" x="0" y="0" width="200%" height="200%">
    <feDropShadow dx="0" dy="2" stdDeviation="1" floodColor="#13234d" floodOpacity="0.25" />
  </filter>
</svg>
      </div>
      <h1 className="profile-name">{user.name}</h1>
      <div className="profile-info">
        <p><strong>Email:</strong> {user.email}</p>
      </div>
      <div className="profile-btns">
        <button type="button" className="profile-btn" onClick={() => setModalOpen(true)}>Сменить пароль</button>
      </div>
      <div className="profile-booking-history">
        <h2>История бронирований</h2>
        <p>Здесь будет отображаться история бронирований пользователя.</p>
      </div>
      <ChangePasswordModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}