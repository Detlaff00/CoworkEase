import React from "react";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Header from "./Header";
import CoworkingDetails from "./CoworkingDetails";
import RegisterPage from "./RegisterPage";
import LoginModal from "./LoginModal";
import ProfilePage from "./ProfilePage";
import "./App.css";

type Coworking = {
  id: number;
  name: string;
  address: string;
  description: string;
};
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

function CoworkingCard({ coworking }: { coworking: Coworking }) {
  const navigate = useNavigate();
  return (
    <div className="card">
      <div className="card-title">{coworking.name}</div>
      <div className="card-address">{coworking.address}</div>
      <div className="card-description">{coworking.description}</div>
      <button
        className="details-btn"
        onClick={() => navigate(`/coworking/${coworking.id}`)}
      >
        Подробнее
      </button>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<Coworking[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);


  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setDarkMode(savedTheme === "dark");
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/coworkings")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  function handleLogout() {
    setCurrentUser(null);
    // по желанию: очистить токен/localStorage
  }

  function toggleTheme() {
    setDarkMode((prev) => {
      const nextTheme = !prev ? "dark" : "light";
      localStorage.setItem("theme", nextTheme);
      return !prev;
    });
  }

  return (
    <BrowserRouter>
      <div className={darkMode ? "app dark" : "app"}>
        <Header
          user={currentUser}
          onLoginClick={() => setLoginOpen(true)}
          onLogout={handleLogout}
          darkMode={darkMode}
          onToggleTheme={toggleTheme}
        />
        <main>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <h1 className="main-title">
                    Бронирование рабочих мест и переговорок
                  </h1>
                  {loading ? (
                    <div className="loading">Загрузка...</div>
                  ) : (
                    <div className="grid">
                      {data.map((cw) => (
                        <CoworkingCard key={cw.id} coworking={cw} />
                      ))}
                    </div>
                  )}
                </>
              }
            />
            <Route path="/coworking/:id" element={<CoworkingDetails />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
          <LoginModal
            open={loginOpen}
            onClose={() => setLoginOpen(false)}
            onLogin={setCurrentUser}
          />
        </main>
      </div>
    </BrowserRouter>
  );
}