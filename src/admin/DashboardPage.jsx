import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Mail, CheckSquare, Users, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    invitations: 0,
    checkins: 0,
    admins: 0,
  });

  useEffect(() => {
    // Basic aggregation if specific stat endpoints don't exist
    const fetchStats = async () => {
      try {
        const [invRes, checkRes, adminRes] = await Promise.all([
          apiClient.get('/invitations/'),
          apiClient.get('/checkins/'),
          apiClient.get('/admins/'),
        ]);
        setStats({
          invitations: invRes.data.length || 0,
          checkins: checkRes.data.length || 0,
          admins: adminRes.data.length || 0,
        });
      } catch (err) {
        toast.error("Failed to load dashboard stats");
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { 
      title: 'Total Invitations', 
      count: stats.invitations, 
      icon: <Mail size={24} />, 
      link: '/admin/invitations', 
      gradient: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/20'
    },
    { 
      title: 'Total Check-ins', 
      count: stats.checkins, 
      icon: <CheckSquare size={24} />, 
      link: '/admin/checkins', 
      gradient: 'from-emerald-400 to-green-600',
      shadow: 'shadow-emerald-500/20'
    },
    { 
      title: 'Total Admins', 
      count: stats.admins, 
      icon: <Users size={24} />, 
      link: '/admin/admins', 
      gradient: 'from-purple-500 to-pink-600',
      shadow: 'shadow-purple-500/20'
    },
  ];

  return (
    <div className="font-admin animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard Overview</h2>
          <p className="text-gray-500 mt-1 font-medium">Welcome back, here's what's happening today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow-sm text-sm font-medium text-gray-600">
          <TrendingUp size={16} className="text-[#1b3312]" />
          <span>Live Updates Active</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((c, index) => (
          <Link 
            key={c.title} 
            to={c.link} 
            className="block group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 p-7 transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-xl group-hover:bg-white/90 relative overflow-hidden">
              {/* Decorative background glow */}
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${c.gradient} opacity-10 blur-xl group-hover:opacity-20 transition-opacity`}></div>
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className={`p-3.5 rounded-xl text-white bg-gradient-to-br ${c.gradient} shadow-md ${c.shadow} transform transition-transform group-hover:scale-110`}>
                  {c.icon}
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-semibold tracking-wide uppercase relative z-10">{c.title}</h3>
              <p className="text-4xl font-bold text-gray-800 mt-2 tracking-tight relative z-10">{c.count}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
