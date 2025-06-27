
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

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
          />
        </div>
      </section>
    </div>
  );
}