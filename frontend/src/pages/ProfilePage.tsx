import { useEffect, useState, type FormEvent } from 'react';

import '../style/Profile.css';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  birthdate: string;
  phone_number: string;
  email: string;
  role: string;
  stats?: {
    total_bookings: number;
    total_hours: number;
    total_spent: number;
    total_time: string;
  };
}

interface Booking {
  id: number;
  space_name: string;
  booking_date?: string;
  start_time: string;
  end_time: string;
  cost: number;
  status?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsReminders, setSmsReminders] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Tab switching state
  const [activeTab, setActiveTab] = useState<'bookings' | 'history' | 'settings'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/users/profile', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setFirstName(data.first_name);
        setLastName(data.last_name);

        if (data.birthdate) {
          const dt = new Date(data.birthdate);

          dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
          setBirthdate(dt.toISOString().split('T')[0]);
        } else {
          setBirthdate('');
        }
        setPhoneNumber(data.phone_number);
        setEmail(data.email);
      })
      .catch(err => console.error(err));
  }, []);
  // Fetch user bookings
  useEffect(() => {
    fetch('http://localhost:3000/bookings', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        // support both plain array and { bookings: [...] }
        const list = Array.isArray(data) ? data : data.bookings || [];
        setBookings(list);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetch('http://localhost:3000/bookings/history', { credentials: 'include' })
        .then(res => res.json())
        .then(setHistoryBookings)
        .catch(err => console.error(err));
    }
  }, [activeTab]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const body: any = {};
    if (firstName !== user?.first_name) body.first_name = firstName;
    if (lastName !== user?.last_name) body.last_name = lastName;
    if (birthdate !== user?.birthdate) body.birthdate = birthdate;
    if (phoneNumber !== user?.phone_number) body.phone_number = phoneNumber;
    if (email !== user?.email) body.email = email;
    if (password) body.password = password;

    const res = await fetch('http://localhost:3000/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data);
      setPassword('');
      setMessage('Данные успешно обновлены');
      setIsEditing(false);
    } else {
      setMessage(data.error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить аккаунт без возможности восстановления?')) return;
    try {
      const res = await fetch('http://localhost:3000/users/profile', {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка при удалении профиля');
      }
      // После успешного удаления — разлогиниваем пользователя
      const logoutRes = await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!logoutRes.ok) {
        console.warn('Logout failed after delete');
      }
      window.location.href = '/login';
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (!user) return <div>Loading profile...</div>;

  return (
    <>
      {showPwdModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close-btn"
              onClick={() => setShowPwdModal(false)}
            >
              ✕
            </button>
            <h2 >Смена пароля</h2>
            {pwdError && <div >{pwdError}</div>}
            <form
              className="form-group"
              onSubmit={async e => {
                e.preventDefault();
                setPwdError(null);
                if (newPassword !== confirmNewPassword) {
                  setPwdError('Новые пароли не совпадают');
                  return;
                }
                try {
                  const res = await fetch('http://localhost:3000/auth/change-password', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ oldPassword, newPassword })
                  });
                  if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Ошибка при смене пароля');
                  }
                  setShowPwdModal(false);
                } catch (err) {
                  setPwdError((err as Error).message);
                }
              }}
            >
              <div className="form-group">
                <label>Старый пароль</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  required
                  className="form-group__input"
                />
              </div>
              <div className="form-group">
                <label>Новый пароль</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  className="form-group__input"
                />
              </div>
              <div className="form-group">
                <label >Подтвердите новый пароль</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  required
                  className="form-group__input"
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowPwdModal(false)}
                  className="btn-secondary"
                >
                  Отмена
                </button>
                <button type="submit" className="btn-primary">
                  Сменить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <main className="main">
        <div className="dashboard-grid">
          <div className="page-header">
            <h1 className="page-title">Личный кабинет</h1>
            <p className="page-subtitle">Управляйте своим профилем и бронированиями</p>
          </div>
       
        <div className="profile-card fade-in">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.first_name.charAt(0).toUpperCase()}
              {user.last_name.charAt(0).toUpperCase()}
            </div>
            <h2 className="profile-name">{user.first_name} {user.last_name}</h2>
            <p className="profile-email">{user.email}</p>
          </div>
          <div className="profile-stats">
           <div className="stat-item">
          <div className="stat-number">{user.stats?.total_bookings ?? '—'}</div>
          <div className="stat-label">Бронирований</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{user.stats?.total_time ?? '—'}</div>
          <div className="stat-label">Часов работы</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">
            {user.stats?.total_spent != null ? user.stats.total_spent : '—'}
          </div>
          <div className="stat-label">Потрачено</div>
        </div>
          </div>
          <div className="profile-actions">
            <button
              onClick={handleDelete}
              className="btn btn-secondary"
            >
              Удалить аккаунт
            </button>
          </div>
        </div>
     
        <div className="content-section fade-in">
          <div className="tabs">
            <div
              className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              Бронирования
            </div>
            <div
              className={`tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              История
            </div>
            <div
              className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Настройки
            </div>
          </div>
          {/* Bookings content */}
          <div className={`tab-content ${activeTab === 'bookings' ? 'active' : ''}`}>
            {bookings.length > 0 ? (
              <div className="booking-list">
                {bookings.map(b => {
                  // Parse date and time from booking fields
                  const dateDatum = b.booking_date ? new Date(b.booking_date) : null;
                  const startTime = b.start_time || null;
                  const endTime = b.end_time || null;
                  // Determine if booking has started
                  const now = new Date();
                  let isStarted = false;
                  if (dateDatum && startTime) {
                    const [h, m] = startTime.split(':').map(Number);
                    const startDate = new Date(dateDatum);
                    startDate.setHours(h, m, 0, 0);
                    isStarted = now >= startDate;
                  }
                  return (
                    <div key={b.id} className="booking-card">
                      <div className="booking-header">
                        <div className="booking-info">
                          <h3>{b.space_name}</h3>
                        </div>
                        {isStarted && (
                          <div className="booking-status status-started">
                            Началось
                          </div>
                        )}
                      </div>
                      <div className="booking-details">
                        <div>
                          <div className="text-xs text-gray-500">Дата</div>
                          <div className="text-sm">
                            {dateDatum && !isNaN(dateDatum.getTime())
                              ? dateDatum.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
                              : '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Начало</div>
                          <div className="text-sm">
                            {startTime
                              ? startTime.slice(0, 5)
                              : '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Конец</div>
                          <div className="text-sm">
                            {endTime
                              ? endTime.slice(0, 5)
                              : '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Стоимость</div>
                          <div className="text-sm">{b.cost} ₽</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>У вас нет активных бронирований.</p>
            )}
          </div>
          {/* History content */}
          <div className={`tab-content ${activeTab === 'history' ? 'active' : ''}`}>
            {historyBookings.length > 0 ? (
              <div className="booking-list">
                {historyBookings.map(b => {
                  const dateDatum = b.booking_date ? new Date(b.booking_date) : null;
                  const startTime = b.start_time || null;
                  const endTime = b.end_time || null;
                  return (
                    <div key={b.id} className="booking-card">
                      <div className="booking-header">
                        <div className="booking-info">
                          <h3>{b.space_name}</h3>
                        </div>
                        <div className={`booking-status ${
                          b.status === 'cancelled' ? 'status-cancelled' : 'status-completed'
                        }`}>
                          {b.status === 'cancelled' ? 'Отменено' : 'Завершено'}
                        </div>
                      </div>
                      <div className="booking-details">
                        <div>
                          <div className="text-xs text-gray-500">Дата</div>
                          <div className="text-sm">
                            {dateDatum
                              ? dateDatum.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
                              : '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Начало</div>
                          <div className="text-sm">
                            {startTime ? startTime.slice(0,5) : '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Конец</div>
                          <div className="text-sm">
                            {endTime ? endTime.slice(0,5) : '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Стоимость</div>
                          <div className="text-sm">{b.cost} ₽</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>У вас нет завершённых или отменённых броней.</p>
            )}
          </div>
          {/* Settings content */}
          <div className={`tab-content ${activeTab === 'settings' ? 'active' : ''}`}>
            <div className="settings-group">
              <h3>Уведомления</h3>
              <div className="form-field">
                <label>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={() => setEmailNotifications(!emailNotifications)}
                  /> Email уведомления о бронированиях
                </label>
              </div>
              <div className="form-field">
                <label>
                  <input
                    type="checkbox"
                    checked={smsReminders}
                    onChange={() => setSmsReminders(!smsReminders)}
                  /> SMS напоминания
                </label>
              </div>
              <div className="form-field">
                <label>
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={() => setMarketing(!marketing)}
                  /> Маркетинговые рассылки
                </label>
              </div>
            </div>
            <div className="settings-group">
              <h3>Безопасность</h3>
              <button
                className="btn btn-secondary"
                onClick={() => { setPwdError(null); setShowPwdModal(true); }}
              >
                Сменить пароль
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}