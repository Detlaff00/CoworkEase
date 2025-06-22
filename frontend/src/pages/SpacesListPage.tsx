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

export default function SpacesListPage() {
  const { isAdmin } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить это пространство?')) return;
    try {
      const res = await fetch(`http://localhost:3000/spaces/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Не удалось удалить пространство');
      }
      setSpaces(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3000/spaces', {
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch spaces');
        }
        return res.json();
      })
      .then((data: Space[]) => {
        setSpaces(data);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-4">
        Ошибка: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl">Spaces</h1>
        {isAdmin && (
          <Link
            to="/spaces/new"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Create Space
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {spaces.map((space) => (
          <div key={space.id} className="bg-white p-4 shadow rounded">
            <h2 className="text-xl font-semibold">{space.name}</h2>
            {space.address && <p className="text-gray-600">{space.address}</p>}
            <p>Capacity: {space.capacity}</p>
            {space.description && (
              <p className="mt-2 text-gray-700">{space.description}</p>
            )}
            <div className="mt-4 flex space-x-2">
              {isAdmin ? (
                <>
                  <Link to={`/spaces/${space.id}/edit`} className="text-blue-600 hover:underline">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(space.id)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </>
              ) : (
                <Link to={`/bookings/new?space=${space.id}`} className="text-green-600 hover:underline">
                  Book
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}