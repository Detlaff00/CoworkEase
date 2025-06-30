import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProfilePage from './pages/ProfilePage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { ProtectedRoute } from './routes/ProtectedRoute';
import SpacesListPage from './pages/SpacesListPage';
import SpaceForm from './pages/SpaceForm';
import BookingsListPage from './pages/BookingsListPage';
import BookingForm from './pages/BookingForm';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminSpacesPage from './pages/AdminSpacesPage';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <Routes>
      {/* All routes share the same Layout for header/nav */}
      <Route element={<Layout />}>
        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/spaces" element={<SpacesListPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Interactive routes require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/spaces/new" element={<SpaceForm />} />
          <Route path="/spaces/:id/edit" element={<SpaceForm />} />
          <Route path="/bookings" element={<BookingsListPage />} />
          <Route path="/bookings/new" element={<BookingForm />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Admin-only */}
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/spaces" element={<AdminSpacesPage />} />
          <Route path="/admin/spaces/new" element={<SpaceForm />} />
          <Route path="/admin/spaces/:id/edit" element={<SpaceForm />} />
        </Route>
      </Route>

      {/* Redirect unknown paths to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}