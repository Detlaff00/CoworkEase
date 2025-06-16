
import { NavLink, useNavigate, Outlet } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch('http://localhost:3000/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4 flex justify-between">
        <nav className="space-x-4">
          <NavLink to="/" className={({isActive}) => isActive ? 'underline' : ''} end>Dashboard</NavLink>
          <NavLink to="/spaces" className={({isActive}) => isActive ? 'underline' : ''}>Spaces</NavLink>
          <NavLink to="/bookings" className={({isActive}) => isActive ? 'underline' : ''}>Bookings</NavLink>
          <NavLink to="/profile" className={({isActive}) => isActive ? 'underline' : ''}>Profile</NavLink>
        </nav>
        <button onClick={handleLogout} className="hover:underline">Logout</button>
      </header>
      <main className="flex-grow p-6 bg-gray-100">
        <Outlet />
      </main>
      <footer className="bg-gray-200 text-center p-4">
        CoworkEase © {new Date().getFullYear()}
      </footer>
    </div>
  );
}