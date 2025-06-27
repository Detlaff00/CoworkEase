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
  const { isAdmin, profile } = useAuth();
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
    <div className="coworkings-section">
      <div className="section-title">
        <h2>Доступные коворкинги</h2>
      </div>
      <div className="coworkings-grid">
        {spaces.map((space) => (
          <div key={space.id} className="coworking-card">
            <div className="card-image">🏢</div>
            <div className="card-content">
              <h3 className="card-title">{space.name}</h3>
              {space.address && <div className="card-location">📍 {space.address}</div>}
              <div className="card-stats">
                <div className="stat-item">
                  <div className="stat-number">{space.capacity}</div>
                  <div className="stat-label">мест</div>
                </div>
              </div>
              {space.description && <p className="mt-2 text-gray-700">{space.description}</p>}
              <div className="mt-4 flex space-x-2">
                {!profile ? (
                  <span></span>
                ) : isAdmin ? (
                  <>
                    <Link to={`/spaces/${space.id}/edit`} className="text-blue-600 hover:underline">Изменить</Link>
                    <button onClick={() => handleDelete(space.id)} className="text-red-600 hover:underline">Удалить</button>
                  </>
                ) : (
                  <Link to={`/bookings/new?space=${space.id}`} className="text-green-600 hover:underline">Забронировать</Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}