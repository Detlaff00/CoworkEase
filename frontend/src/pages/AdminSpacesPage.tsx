
import { useEffect, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Space {
    id: number;
    name: string;
    address: string | null;
    capacity: number;
    description: string | null;
}

export default function AdminSpacesPage() {
    const { isAdmin } = useAuth();
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('http://localhost:3000/spaces', { credentials: 'include' })
            .then(async res => {
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Ошибка загрузки');
                }
                return res.json();
            })
            .then(setSpaces)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Удалить пространство?')) return;
        try {
            const res = await fetch(`http://localhost:3000/spaces/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            setSpaces(s => s.filter(x => x.id !== id));
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (!isAdmin) return <div>Доступ запрещён</div>;
    if (loading) return <div>Loading spaces…</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl">Admin Spaces</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {spaces.map(space => (
                    <div key={space.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold mb-2">{space.name}</h2>
                            {space.address && (
                                <p className="text-gray-500 text-sm mb-2">📍 {space.address}</p>
                            )}
                            <p className="text-gray-700 mb-4">Вместимость: {space.capacity}</p>
                            {space.description && (
                                <p className="text-gray-600 mb-4">{space.description}</p>
                            )}
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
 