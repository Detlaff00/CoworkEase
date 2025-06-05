import { useEffect, useState } from "react";

export type Booking = {
  id: number;
  user_id: number;
  worckspace_id: number;
  start_time: string;
  end_time: string;
  status: string;
};

export default function BookingForm({ coworkingId }: { coworkingId: number }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/coworkings/${coworkingId}/bookings`)
      .then((res) => res.json())
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [coworkingId]);

  if (loading) return <div>Загрузка бронирований...</div>;

  return (
    <div>
      <h3>Занятые даты</h3>
      <ul>
        {bookings.map((b) => (
          <li key={b.id}>
            {new Date(b.start_time).toLocaleString()} – {" "}
            {new Date(b.end_time).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
