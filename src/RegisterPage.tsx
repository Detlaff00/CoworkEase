import React, { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setSuccess(true);
        }
      })
      .catch(() => setError("Ошибка соединения с сервером"));
  }

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit} autoComplete="off">
        <h2>Создать аккаунт</h2>
        <div className="form-group">
          <label>Имя</label>
          <input
            name="name"
            required
            placeholder="Ваше имя"
            value={form.name}
            onChange={handleChange}
            autoFocus
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="Ваш email"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Пароль</label>
          <input
            name="password"
            type="password"
            required
            placeholder="Пароль"
            minLength={6}
            value={form.password}
            onChange={handleChange}
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">Регистрация успешна!</div>}
        <button className="header-btn big-btn" type="submit">
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
}