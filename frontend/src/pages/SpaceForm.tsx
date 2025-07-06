import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../style/SpaceForm.css';

interface Space {
  id: number;
  name: string;
  address: string | null;
  capacity: number;
  price_per_hour: number;
  description: string | null;
}

interface Amenity {
  id: number;
  name: string;
}

export default function SpaceForm() {
  // Support both 'id' and 'spaceId' as URL params
  const params = useParams<{ id?: string; spaceId?: string }>();
  const id = params.id ?? params.spaceId;
  const isEdit = Boolean(id);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [pricePerHour, setPricePerHour] = useState<number>(0);
  
  const [amenitiesList, setAmenitiesList] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      fetch(`http://localhost:3000/spaces/${id}`, {
        credentials: 'include',
      })
        .then(res => {
          if (!res.ok) throw new Error('Не удалось загрузить данные');
          return res.json();
        })
        .then((data: Space & { amenities?: { amenity_id?: number; id?: number }[] }) => {
          setName(data.name);
          setAddress(data.address || '');
          setCapacity(data.capacity);
          setDescription(data.description || '');
          setPricePerHour(data.price_per_hour);
          // Map by amenity_id if present, otherwise by id
          setSelectedAmenities(
            data.amenities?.map(a => (a.amenity_id !== undefined ? a.amenity_id : a.id!)) || []
          );
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  useEffect(() => {
    fetch('http://localhost:3000/amenities', { credentials: 'include' })
      .then(res => res.json())
      .then((list: Amenity[]) => setAmenitiesList(list))
      .catch(console.error);
  }, []);


  const toggleAmenity = (id: number) => {
    setSelectedAmenities(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name,
      address,
      capacity,
      description,
      price_per_hour: pricePerHour,
      amenities: selectedAmenities
    };
    const base = isAdmin ? 'http://localhost:3000/admin/spaces' : 'http://localhost:3000/spaces';
    const url = isEdit ? `${base}/${id}` : base;
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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded space-form">
      <h2 className="text-2xl mb-4">
        {isEdit ? 'Редактировать пространство' : 'Создать пространство'}
      </h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading && <div className="text-center mb-4">Loading...</div>}
      {!loading && (
        <form onSubmit={handleSubmit} className="space-form">
          <div className="form-group">
            <label className="block mb-1">Название</label>
            <input
              type="text"
              className="form-group__input"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="block mb-1">Адрес</label>
            <input
              type="text"
              className="form-group__input"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="block mb-1">Вместимость</label>
            <input
              type="number"
              className="form-group__input"
              value={capacity}
              onChange={e => setCapacity(Number(e.target.value))}
              required
              min={1}
            />
          </div>
          <div className="form-group">
            <label className="block mb-1">Цена в час</label>
            <input
              type="number"
              step="0.01"
              className="form-group__input"
              value={pricePerHour}
              onChange={e => setPricePerHour(Number(e.target.value))}
              required
              min={0}
            />
          </div>
          <div className="form-group">
            <label className="block mb-1">Описание</label>
            <textarea
              className="form-group__input"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <fieldset className="space-form__amenities mb-4">
            <legend className="block mb-2 font-medium">Удобства</legend>
            <div className="grid grid-cols-2 gap-2">
              {amenitiesList.map(a => (
                <label key={a.id}>
                  <input
                    type="checkbox"
                    className="space-form__checkbox"
                    checked={selectedAmenities.includes(a.id)}
                    onChange={() => toggleAmenity(a.id)}
                  />
                  <span>{a.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button
            type="submit"
            className="btn-primary"
          >
            {isEdit ? 'Сохранить' : 'Создать'}
          </button>
        </form>
      )}
    </div>
  );
}