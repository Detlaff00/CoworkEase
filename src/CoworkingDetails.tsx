import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

type Coworking = {
    id: number;
    name: string;
    address: string;
    description: string;
    image?: string;
    facilities?: string[];
    rooms?: { id: number; name: string; capacity: number }[];
    openHours?: string;
};

export default function CoworkingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<Coworking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:3000/coworkings/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setData(data);
                setLoading(false);
                setData({
                    ...data,
                    image: data.image || 'https://placehold.co/600x320?text=Coworking',
                    openHours: data.openHours || '09:00 — 21:00',
                    facilities: data.facilities || ['Wi-Fi', 'Кухня', 'Кофе', 'Переговорные'],
                    rooms: data.rooms || [{ id: 1, name: "Большая переговорная", capacity: 8 }],
                });
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="loading">Загрузка...</div>;
    if (!data) return <div>Коворкинг не найден</div>;

    return (
        <div className="details-page">
            <button className="back-btn" onClick={() => navigate(-1)}>
                ← Назад
            </button>
            {data.image && (
                <img
                    src={data.image}
                    alt={data.name}
                    style={{
                        maxWidth: "100%",
                        borderRadius: "12px",
                        marginBottom: "24px",
                        objectFit: "cover",
                    }}
                />
            )}
            <h2>{data.name}</h2>
            <div className="card-address">{data.address}</div>
            {data.openHours && (
                <div style={{ margin: "8px 0", color: "#4badea" }}>
                    Время работы: {data.openHours}
                </div>
            )}
            <div className="card-description">{data.description}</div>
            {data.facilities && (
                <div style={{ margin: "12px 0" }}>
                    <b>Удобства:</b>
                    <ul>
                        {data.facilities.map((f) => (
                            <li key={f}>{f}</li>
                        ))}
                    </ul>
                </div>
            )}
            {data.rooms && (
                <div style={{ marginTop: "12px" }}>
                    <b>Доступные комнаты:</b>
                    <ul>
                        {data.rooms.map((room) => (
                            <li key={room.id}>
                                {room.name} — вместимость: {room.capacity}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}