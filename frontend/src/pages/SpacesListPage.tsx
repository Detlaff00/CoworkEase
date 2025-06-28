import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../style/SpacesListPage.css';

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
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);

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
          <div
            key={space.id}
            className="coworking-card cursor-pointer"
            onClick={() => {
              setSelectedSpace(space);
              document.body.classList.add('modal-open');
            }}
          >
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
              {isAdmin && profile && (
                <div className="mt-4 flex space-x-2">
                  <Link to={`/spaces/${space.id}/edit`} className="text-blue-600 hover:underline">
                    Изменить
                  </Link>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(space.id);
                    }}
                    className="text-red-600 hover:underline"
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {selectedSpace && (
        <div
          className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => {
            setSelectedSpace(null);
            document.body.classList.remove('modal-open');
          }}
        >
          <div
            className="modal-content bg-white p-6 rounded-lg max-w-lg w-full"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="close-btn float-right text-xl font-bold"
              onClick={() => {
                setSelectedSpace(null);
                document.body.classList.remove('modal-open');
              }}
            >
              &times;
            </button>
            <h3 className="text-2xl font-semibold mb-2">{selectedSpace.name}</h3>
            {selectedSpace.address && (
              <p className="text-gray-600 mb-2">📍 {selectedSpace.address}</p>
            )}
            <p className="mb-4">{selectedSpace.description}</p>
            <div className="card-stats mb-4">
              <div className="stat-item">
                <div className="stat-label">Вместимость</div>
                <div className="stat-number">{selectedSpace.capacity}</div>
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                // redirect to booking page
                window.location.href = `/bookings/new?space=${selectedSpace.id}`;
              }}
            >
              Забронировать
            </button>
          </div>
        </div>
      )}
    </div>
  );
}