import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface Space {
    id: number;
    name: string;
}

export default function BookingForm() {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [spaceId, setSpaceId] = useState<number | ''>('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Load available spaces
        fetch('http://localhost:3000/spaces', { credentials: 'include' })
            .then(async res => {
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Не удалось загрузить пространства');
                }
                return res.json();
            })
            .then((data: Space[]) => {
                setSpaces(data);
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!spaceId || !startTime || !endTime) {
            setError('Заполните все поля');
            return;
        }
        setError(null);
        setLoading(true);

        try {
            const res = await fetch('http://localhost:3000/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    space_id: spaceId,
                    start_time: startTime,
                    end_time: endTime
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Ошибка создания брони');
            }
            navigate('/bookings');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
            <h2 className="text-2xl mb-4">Создать бронь</h2>
            {error && <div className="text-red-600 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1">Пространство</label>
                    <select
                        className="w-full border rounded px-3 py-2"
                        value={spaceId}
                        onChange={e => setSpaceId(Number(e.target.value))}
                        required
                    >
                        <option value="">Выберите пространство</option>
                        {spaces.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block mb-1">Начало</label>
                    <input
                        type="datetime-local"
                        className="w-full border rounded px-3 py-2"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1">Конец</label>
                    <input
                        type="datetime-local"
                        className="w-full border rounded px-3 py-2"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    disabled={loading}
                >
                    {loading ? 'Сохранение...' : 'Создать бронь'}
                </button>
            </form>
        </div>
    );
}
