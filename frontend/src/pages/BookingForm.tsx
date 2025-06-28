import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../style/BookingForm.css';

interface Space {
    id: number;
    name: string;
}

export default function BookingForm() {
    const [searchParams] = useSearchParams();
    const initialSpaceParam = searchParams.get('space');
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [spaceId, setSpaceId] = useState<number | ''>(
        initialSpaceParam ? Number(initialSpaceParam) : ''
    );
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [date, setDate] = useState('');
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
    // default date to today
    useEffect(() => {
      setDate(new Date().toISOString().split('T')[0]);
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!spaceId || !startTime || !endTime || !date) {
            setError('Заполните все поля');
            return;
        }
        // Prevent booking in the past
        const selectedStart = new Date(`${date}T${startTime}`);
        if (selectedStart < new Date()) {
            setError('Нельзя забронировать место в прошлом');
            return;
        }
        // Prevent end time earlier than start time
        const selectedEnd = new Date(`${date}T${endTime}`);
        if (selectedEnd <= selectedStart) {
            setError('Время окончания должно быть позже времени начала');
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
                    start_time: `${date}T${startTime}`,
                    end_time:   `${date}T${endTime}`
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
        <div className="booking-form">
            <h2 className="booking-form__title">Создать бронь</h2>
            {error && <div className="booking-form__error">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                    <label className="form-group__label">Пространство</label>
                    <select
                        className="form-group__input"
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2 form-group">
                    <label className="form-group__label">Дата</label>
                    <input
                      type="date"
                      className="form-group__input"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-group__label">Начало</label>
                    <input
                      type="time"
                      className="form-group__input"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-group__label">Конец</label>
                    <input
                      type="time"
                      className="form-group__input"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Сохранение...' : 'Создать бронь'}
                </button>
            </form>
        </div>
    );
}
