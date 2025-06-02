import React, { useState } from "react";

// Тип пользователя для onLogin
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  // добавь еще поля при необходимости
};

type Props = {
  open: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
};

export default function LoginModal({ open, onClose, onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.user && data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          onLogin(data.user);
          onClose();
          setEmail("");
          setPassword("");
        } else if (data.error) {
          setError(data.error);
        } else {
          setError("Ошибка авторизации. Проверьте данные.");
        }
      })
      .catch(() => {
        setLoading(false);
        setError("Ошибка соединения с сервером.");
      });
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Вход</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
            disabled={loading}
          />
          <input
            type="password"
            required
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="header-btn" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}