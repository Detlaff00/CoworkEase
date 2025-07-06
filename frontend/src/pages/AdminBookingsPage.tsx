import { useEffect, useState } from 'react';
import '../style/BookingAdmin.css';

interface AdminBooking {
  id: number;
  user_name?: string;
  user_email?: string;
  space_name: string;
  booking_date?: string;
  start_time: string;
  end_time: string;
  cost?: number;
}

export default function AdminBookingsPage() {
  const [data, setData] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterUser, setFilterUser] = useState<string>('');
  const [filterEmail, setFilterEmail] = useState<string>('');
  const [filterSpace, setFilterSpace] = useState<string>('');

  // Format cost in rubles without decimals
  const formatCost = (cost: number) =>
    cost.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }) + ' ₽';

  useEffect(() => {
    fetch('http://localhost:3000/admin/bookings', {
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Ошибка загрузки данных');
        }
        return res.json();
      })
      .then((rows: AdminBooking[]) => setData(rows))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading admin data…</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

 
  return (
    <div className="p-6 mt-6">
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="overflow-x-auto">
          <table className="bookings-table">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Пользователь</th>
                <th className="px-4 py-2 text-left">Электронная почта</th>
                <th className="px-4 py-2 text-left">Пространство</th>
                <th className="px-4 py-2 text-left">Дата</th>
                <th className="px-4 py-2 text-left">Начало</th>
                <th className="px-4 py-2 text-left">Конец</th>
                <th className="px-4 py-2 text-left">Стоимость</th>
              </tr>
            </thead>
            <tbody>
              {data.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="px-4 py-2">{b.user_name}</td>
                  <td className="px-4 py-2">{b.user_email}</td>
                  <td className="px-4 py-2">{b.space_name}</td>
                  <td className="px-4 py-2">
                    {b.booking_date
                      ? new Date(b.booking_date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-4 py-2">
                    {b.start_time
                      ? b.start_time.slice(0,5)
                      : '—'}
                  </td>
                  <td className="px-4 py-2">
                    {b.end_time
                      ? b.end_time.slice(0,5)
                      : '—'}
                  </td>
                  <td className="px-4 py-2">
                    {b.cost != null ? formatCost(b.cost) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}