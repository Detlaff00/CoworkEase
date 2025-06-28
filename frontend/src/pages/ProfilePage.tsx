import { useEffect, useState, type FormEvent } from 'react';
import '../index.css';
import '../style/Profile.css';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  birthdate: string;
  phone_number: string;
  email: string;
  role: string;
}

interface Booking {
  id: number;
  space_name: string;
  booking_date?: string;
  start_time: string;
  end_time: string;
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
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  // Tab switching state
  const [activeTab, setActiveTab] = useState<'bookings'|'history'|'settings'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);

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
    if (!window.confirm('Удалить аккаунт?')) return;
    await fetch('http://localhost:3000/users/profile', {
      method: 'DELETE',
      credentials: 'include',
    });
    window.location.href = '/login';
  };

  if (!user) return <div>Loading profile...</div>;

  return (
    <main className="main">
      <div className="page-header">
        <h1 className="page-title">Личный кабинет</h1>
        <p className="page-subtitle">Управляйте своим профилем и бронированиями</p>
      </div>
      <div className="dashboard-grid">
        {/* Profile Card */}
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
              <div className="stat-number">—</div>
              <div className="stat-label">Бронирований</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">—</div>
              <div className="stat-label">Часов работы</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">—</div>
              <div className="stat-label">Рейтинг</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">—</div>
              <div className="stat-label">Потрачено</div>
            </div>
          </div>
          <div className="profile-actions">
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
            >
              Редактировать профиль
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-secondary"
            >
              Выйти из аккаунта
            </button>
          </div>
        </div>
        {/* Content Section for future tabs */}
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
                  const endTime   = b.end_time   || null;
                  return (
                    <div key={b.id} className="booking-card">
                      <div className="booking-header">
                        <div className="booking-info">
                          <h3>{b.space_name}</h3>
                        </div>
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
                              ? startTime.slice(0,5)
                              : '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Конец</div>
                          <div className="text-sm">
                            {endTime
                              ? endTime.slice(0,5)
                              : '—'}
                          </div>
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
            {/* TODO: Render booking history here */}
          </div>
          {/* Settings content */}
          <div className={`tab-content ${activeTab === 'settings' ? 'active' : ''}`}>
            {/* TODO: Render settings form here */}
          </div>
        </div>
      </div>
    </main>
  );
}