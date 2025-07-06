import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../style/SpacesListPage.css';

interface Amenity {
  amenity_id: number;
  name: string;
  is_available: boolean;
}

interface Space {
  id: number;
  name: string;
  address: string | null;
  capacity: number;
  price_per_hour: number;
  description: string | null;
  amenities: Amenity[];
}

export default function SpacesListPage() {
  const { isAdmin, profile } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  // Filters state
  const [amenitiesList, setAmenitiesList] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [priceFrom, setPriceFrom] = useState<string>('');
  const [priceTo, setPriceTo] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    fetch('http://localhost:3000/amenities', { credentials: 'include' })
      .then(res => res.json())
      .then(setAmenitiesList)
      .catch(() => setAmenitiesList([]));
  }, []);

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

  // Compute filteredSpaces
  const filteredSpaces = spaces.filter(space => {
    // match selected amenities
    const hasAll = selectedAmenities.every(id =>
      space.amenities.some(a => a.amenity_id === id && a.is_available)
    );
    // match price range
    const price = space.price_per_hour;
    const from = priceFrom ? parseFloat(priceFrom) : 0;
    const to = priceTo ? parseFloat(priceTo) : Infinity;
    const inPrice = price >= from && price <= to;
    return hasAll && inPrice;
  });

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
        {isAdmin && profile && (
          <Link to="/spaces/new" className="btn btn-primary ml-4">
            Создать коворкинг
          </Link>
        )}
      </div>
      <button
        onClick={() => setShowFilters(prev => !prev)}
        className="btn btn-secondary mb-4"
      >
        {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
      </button>
      <div className={`filters mb-6 grid grid-cols-3 gap-4 ${showFilters ? 'filters-visible' : 'filters-hidden'}`}>
        {/* Amenities filter */}
        <div className="filter-group amenities-filter">
          <div className="font-semibold mb-2">Удобства:</div>
          {amenitiesList.map(a => {
            // Some APIs return `id`, others `amenity_id`
            const amenityId = (a as any).amenity_id ?? (a as any).id;
            const checkboxId = `amenity-${amenityId}`;
            return (
              <label key={amenityId} htmlFor={checkboxId} className="inline-flex items-center mr-4">
                <input
                  id={checkboxId}
                  type="checkbox"
                  className="mr-1"
                  checked={selectedAmenities.includes(amenityId)}
                  onChange={() => {
                    setSelectedAmenities(prev =>
                      prev.includes(amenityId)
                        ? prev.filter(x => x !== amenityId)
                        : [...prev, amenityId]
                    );
                  }}
                />
                {a.name}
              </label>
            );
          })}
        </div>
        {/* Price filter */}
        <div className="filter-group flex items-center space-x-2">
          <span className="font-semibold">Цена:</span>
          <input
            type="number"
            placeholder="от"
            className="border rounded px-2 py-1 w-24"
            value={priceFrom}
            onChange={e => {
              const raw = e.target.value;
              const formatted = raw.length > 1 && raw.startsWith('0')
                ? raw.substring(1)
                : raw;
              setPriceFrom(formatted);
            }}
          />
          <span>—</span>
          <input
            type="number"
            placeholder="до"
            className="border rounded px-2 py-1 w-24"
            value={priceTo}
            onChange={e => {
              const raw = e.target.value;
              const formatted = raw.length > 1 && raw.startsWith('0')
                ? raw.substring(1)
                : raw;
              setPriceTo(formatted);
            }}
          />
        </div>
      </div>
      <div className="coworkings-grid">
        {filteredSpaces.map((space) => (
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
              <div className="card-stats flex space-x-4">
                <div className="stat-item">
                  <div className="stat-number">{space.capacity}</div>
                  <div className="stat-label">Вместимость</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{space.price_per_hour}</div>
                  <div className="stat-label">Цена в час</div>
                </div>
              </div>
              <div className="card-features mt-2">
                {space.amenities
                  .filter(a => a.is_available)
                  .map(a => (
                    <span key={a.amenity_id} className="feature-tag">
                      {a.name}
                    </span>
                ))}
              </div>
              {isAdmin && profile && (
                <div className="card-actions">
                  <Link to={`/spaces/${space.id}/edit`} className="edit-btn">
                    Изменить
                  </Link>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(space.id);
                    }}
                    className="delete-btn"
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
          className="modal modal-visible fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
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
            {selectedSpace.description && (
              <p className="mt-2 text-gray-700">{selectedSpace.description}</p>
            )}
            <div className="card-features mb-4">
              {(selectedSpace.amenities ?? [])
                .filter(a => a.is_available)
                .map(a => (
                  <span key={a.amenity_id} className="feature-tag">
                    {a.name}
                  </span>
                ))
              }
            </div>
            <div className="card-stats mb-4 flex space-x-4">
              <div className="stat-item">
                <div className="stat-label">Вместимость</div>
                <div className="stat-number">{selectedSpace.capacity}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Цена в час</div>
                <div className="stat-number">{selectedSpace.price_per_hour}</div>
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (profile) {
                  window.location.href = `/bookings/new?space=${selectedSpace.id}`;
                } else {
                  window.location.href = `/login`;
                }
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