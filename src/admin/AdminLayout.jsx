import React from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Mail, CheckSquare, CalendarDays, Users, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const navLinks = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/invitations', icon: <Mail size={20} />, label: 'Invitations' },
    { to: '/admin/checkins', icon: <CheckSquare size={20} />, label: 'Check-ins' },
    { to: '/admin/event', icon: <CalendarDays size={20} />, label: 'Event Details' },
    { to: '/admin/admins', icon: <Users size={20} />, label: 'Admins' },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] font-admin antialiased text-gray-800">
      {/* Sidebar - Glassmorphism */}
      <aside className="w-64 bg-white/70 backdrop-blur-xl border-r border-white/40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col relative z-20">
        <div className="h-20 flex items-center px-8 border-b border-gray-200/50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1b3312] to-[#2a4d1c] flex items-center justify-center mr-3 shadow-md">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 tracking-tight">WedAdmin</h1>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2.5">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-[#1b3312] text-white shadow-md shadow-[#1b3312]/20 translate-x-1' 
                    : 'text-gray-500 hover:bg-white/60 hover:text-gray-900 hover:shadow-sm'
                }`
              }
            >
              <div className={`transition-transform duration-300 group-hover:scale-110`}>
                {link.icon}
              </div>
              <span className="font-medium tracking-wide">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-200/50">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300 font-medium group"
          >
            <div className="transition-transform duration-300 group-hover:-rotate-12">
              <LogOut size={20} />
            </div>
            <span className="tracking-wide">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative">
        {/* Subtle background decorative blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-20 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="p-8 md:p-12 relative z-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
