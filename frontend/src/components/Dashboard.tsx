export default function Dashboard() {
  return (
    <div>
      <section className="hero">
        <h1>Найди идеальное рабочее место</h1>
        <p>Сеть современных коворкингов для комфортной работы в любой точке города</p>
        <div className="search-bar">
          <input type="text" className="search-input" placeholder="Поиск по району или станции метро..." />
        </div>
      </section>
      {/* остальной контент */}
    </div>
  );
}