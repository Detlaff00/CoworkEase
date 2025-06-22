
import { useEffect, useState } from 'react';

interface AdminBooking {
  id: number;
  space_name: string;
  start_time: string;
  end_time: string;
  user_name?: string;
  user_email?: string;
}

export default function AdminBookingsPage() {
  const [data, setData] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="p-6">
      <h1 className="text-2xl mb-4">Admin: Все бронирования</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">User Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Space</th>
              <th className="px-4 py-2 text-left">From</th>
              <th className="px-4 py-2 text-left">To</th>
            </tr>
          </thead>
          <tbody>
            {data.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="px-4 py-2">{b.id}</td>
                <td className="px-4 py-2">{b.user_name}</td>
                <td className="px-4 py-2">{b.user_email}</td>
                <td className="px-4 py-2">{b.space_name}</td>
                <td className="px-4 py-2">
                  {new Date(b.start_time).toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  {new Date(b.end_time).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}