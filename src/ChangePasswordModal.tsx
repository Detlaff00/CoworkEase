import React, { useState } from "react";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!oldPassword || !newPassword || !repeatPassword) {
      setError("Заполните все поля.");
      return;
    }
    if (newPassword !== repeatPassword) {
      setError("Новые пароли не совпадают.");
      return;
    }
    const token = localStorage.getItem("token");
    fetch("http://localhost:3000/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else {
          setSuccess("Пароль успешно изменён!");
          setOldPassword(""); setNewPassword(""); setRepeatPassword("");
        }
      })
      .catch(() => setError("Ошибка соединения с сервером."));
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{minWidth: 320, maxWidth: 360}}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>Сменить пароль</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Текущий пароль"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            autoFocus
          />
          <input
            type="password"
            placeholder="Новый пароль"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Повторите новый пароль"
            value={repeatPassword}
            onChange={e => setRepeatPassword(e.target.value)}
          />
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}
          <button className="big-btn" type="submit">Сменить</button>
        </form>
      </div>
    </div>
  );
}