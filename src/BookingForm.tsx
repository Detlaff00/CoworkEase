import React, { useEffect, useState } from "react";

export type Booking = {
    id: number;
    start_time: string;
    end_time: string;
};

interface Props {
    coworkingId: number;
}

export default function BookingForm({ coworkingId }: Props) {
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;

    useEffect(() => {
        fetch("http://localhost:3000/bookings")
            .then((res) => res.json())
            .then((data) => {
                const filtered = data.filter((b: any) => Number(b.worckspace_id) === coworkingId);
                setBookings(filtered);
            });
    }, [coworkingId]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!token || !user) {
            setError("Требуется авторизация");
            return;
        }
        setError(null);
        fetch("http://localhost:3000/bookings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            body: JSON.stringify({
                user_id: user.id,
                worckspace_id: coworkingId,
                start_time: `${date}T${startTime}`,
                end_time: `${date}T${endTime}`,
                status: "pending",
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setDate("");
                    setStartTime("");
                    setEndTime("");
                    setBookings((prev) => [...prev, data]);
                }
            })
            .catch(() => setError("Ошибка соединения с сервером"));
    }

    return (
        <div style={{ marginTop: "24px" }}>
            <h3>Бронирование</h3>
            {!token ? (
                <div>Для бронирования войдите в систему.</div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "360px" }}
                >
                    <div className="form-group">
                        <label>Дата</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Начало</label>
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Конец</label>
                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                    </div>
                    {error && <div className="form-error">{error}</div>}
                    <button type="submit" className="big-btn">
                        Забронировать
                    </button>
                </form>
            )}
            {bookings.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                    <b>Текущие бронирования:</b>
                    <ul>
                        {bookings.map((b) => (
                            <li key={b.id}>
                                {new Date(b.start_time).toLocaleString()} — {new Date(b.end_time).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
