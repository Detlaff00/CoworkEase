import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/HomePage.css';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<{ id: number; name: string; }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim()) {
        fetch(`/spaces?search=${encodeURIComponent(searchTerm)}`)
          .then(res => res.json())
          .then(data => setSuggestions(data))
          .catch(() => setSuggestions([]));
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  return (
    <div className="main">
      <section className="hero">
        <h1>Добро пожаловать на CoworkEase</h1>
        <p>Мы помогаем быстро находить и бронировать коворкинги в вашем городе.</p>
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Введите название коворкинга"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {suggestions.length > 0 && (
            <ul className="suggestions-list border bg-white mt-1">
              {suggestions.map(s => (
                <li
                  key={s.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    navigate(`/spaces/${s.id}`);
                    setSearchTerm('');
                    setSuggestions([]);
                  }}
                >
                  {s.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}