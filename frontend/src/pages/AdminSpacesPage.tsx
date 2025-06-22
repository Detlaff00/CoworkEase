
import { useEffect, useState } from 'react';
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
        fetch('http://localhost:3000/admin/spaces', { credentials: 'include' })
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
            const res = await fetch(`http://localhost:3000/admin/spaces/${id}`, {
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
                <Link
                    to="/admin/spaces/new"
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    + Create Space
                </Link>
            </div>

            <table className="min-w-full bg-white shadow rounded">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2">ID</th>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Capacity</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {spaces.map(s => (
                        <tr key={s.id} className="border-t">
                            <td className="px-4 py-2">{s.id}</td>
                            <td className="px-4 py-2">{s.name}</td>
                            <td className="px-4 py-2">{s.capacity}</td>
                            <td className="px-4 py-2 space-x-2">
                                <Link
                                    to={`/admin/spaces/${s.id}/edit`}
                                    className="text-blue-600 hover:underline"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(s.id)}
                                    className="text-red-600 hover:underline"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}