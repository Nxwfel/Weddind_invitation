import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import GuestFlow from './guest/GuestFlow';
import AdminLayout from './admin/AdminLayout';
import LoginPage from './admin/LoginPage';
import DashboardPage from './admin/DashboardPage';
import InvitationsPage from './admin/InvitationsPage';
import CheckinsPage from './admin/CheckinsPage';
import EventPage from './admin/EventPage';
import AdminsPage from './admin/AdminsPage';
import { useAuth } from './context/AuthContext';

export default function App() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      navigate('/admin/login');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout, navigate]);

  return (
    <Routes>
      <Route path="/" element={<GuestFlow />} />
      <Route path="/invite" element={<GuestFlow />} />

      {/* Admin Flow */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="invitations" element={<InvitationsPage />} />
        <Route path="checkins" element={<CheckinsPage />} />
        <Route path="event" element={<EventPage />} />
        <Route path="admins" element={<AdminsPage />} />
      </Route>
    </Routes>
  );
}