import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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
    start_time: string;
    end_time: string;
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
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl">Bookings</h1>
                <Link
                    to="/bookings/new"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    + New Booking
                </Link>
            </div>
            <div className="space-y-2">
                {bookings.map(b => (
                    <div key={b.id} className="bg-white p-4 shadow rounded flex justify-between">
                        <div>
                          {isAdmin && (
                            <>
                              {b.user_name && (
                                <p className="text-sm text-gray-500">User: {b.user_name}</p>
                              )}
                              {b.user_email && (
                                <p className="text-sm text-gray-500">Email: {b.user_email}</p>
                              )}
                            </>
                          )}
                            <h2 className="font-semibold">{b.space_name}</h2>
                            <p>
                                {formatDateTime(b.start_time)} — {formatDateTime(b.end_time)}
                            </p>
                        </div>
                        <button
                            onClick={() => handleCancel(b.id)}
                            className="text-red-600 hover:underline"
                        >
                            Cancel
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
