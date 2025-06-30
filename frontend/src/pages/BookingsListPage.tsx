import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../style/BookingsListPages.css';

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleString('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

interface Booking {
    id: number;
    space_id: number;
    space_name: string;
    booking_date?: string;
    start_time: string;
    end_time: string;
    cost: number;
    user_name?: string;
    user_email?: string;
}

export default function BookingsListPage() {
    const { isAdmin } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch('http://localhost:3000/bookings', { credentials: 'include' })
            .then(async res => {
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Не удалось загрузить бронирования');
                }
                return res.json();
            })
            .then((data: Booking[]) => setBookings(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleCancel = async (id: number) => {
        if (!window.confirm('Отменить бронь?')) return;
        try {
            const res = await fetch(`http://localhost:3000/bookings/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Не удалось отменить бронь');
            }
            setBookings(prev => prev.filter(b => b.id !== id));
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-600 text-center py-4">Ошибка: {error}</div>;
    }

    return (
        <div className="bookings-page">
            <div className="section-title">
              <h2>Ваши брони</h2>
            </div>
            <div className="section-actions">
              <Link to="/bookings/new" className="btn btn-primary">
                Забронировать место
              </Link>
            </div>
            <div className="booking-list">
                {bookings.map(b => {
                    // Parse booking date and times
                    const bookingDate = b.booking_date ? new Date(b.booking_date) : null;
                    const startTime   = b.start_time || null;
                    const endTime     = b.end_time   || null;

                    return (
                    <div key={b.id} className="booking-card">
                        <div className="booking-header">
                          <div className="booking-info">
                            <h3>{b.space_name}</h3>
                            {isAdmin && b.user_name && (
                              <p className="text-sm text-gray-500">User: {b.user_name}</p>
                            )}
                          </div>
                        </div>
                        <div className="booking-details">
                            <div>
                                <div className="text-xs text-gray-500">Дата</div>
                                <div className="text-sm">
                                    {bookingDate
                                        ? bookingDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
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
                            <div>
                              <div className="text-xs text-gray-500">Стоимость</div>
                              <div className="text-sm">{b.cost} ₽</div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => handleCancel(b.id)}
                                className="btn btn-secondary status-cancelled"
                            >
                                Отменить бронь
                            </button>
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
}
