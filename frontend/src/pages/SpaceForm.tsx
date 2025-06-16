
import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Space {
    id: number;
    name: string;
    address: string | null;
    capacity: number;
    description: string | null;
}

export default function SpaceForm() {
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [capacity, setCapacity] = useState<number>(1);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            fetch(`http://localhost:3000/spaces/${id}`, {
                credentials: 'include',
            })
                .then(res => {
                    if (!res.ok) throw new Error('Не удалось загрузить данные');
                    return res.json();
                })
                .then((data: Space) => {
                    setName(data.name);
                    setAddress(data.address || '');
                    setCapacity(data.capacity);
                    setDescription(data.description || '');
                })
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const payload = { name, address, capacity, description };
        const url = isEdit
            ? `http://localhost:3000/spaces/${id}`
            : 'http://localhost:3000/spaces';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Ошибка сохранения');
            navigate('/spaces');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
            <h2 className="text-2xl mb-4">
                {isEdit ? 'Редактировать пространство' : 'Создать пространство'}
            </h2>
            {error && <div className="text-red-600 mb-4">{error}</div>}
            {loading && <div className="text-center mb-4">Loading...</div>}
            {!loading && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1">Name</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Address</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Capacity</label>
                        <input
                            type="number"
                            className="w-full border rounded px-3 py-2"
                            value={capacity}
                            onChange={e => setCapacity(Number(e.target.value))}
                            required
                            min={1}
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Description</label>
                        <textarea
                            className="w-full border rounded px-3 py-2"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        {isEdit ? 'Сохранить' : 'Создать'}
                    </button>
                </form>
            )}
        </div>
    );
}