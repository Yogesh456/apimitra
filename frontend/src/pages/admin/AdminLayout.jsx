import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', label: '📊 Dashboard', end: true },
  { to: '/admin/users', label: '👥 Users' },
  { to: '/admin/topups', label: '💰 Top-up Requests' },
  { to: '/admin/services', label: '⚙️ Services' },
  { to: '/admin/query-logs', label: '🗂️ Query Logs' },
  { to: '/admin/content', label: '📢 Content' },
  { to: '/admin/settings', label: '🔐 Admin Account' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-blue-800 text-white flex flex-col">
        <div className="px-5 py-5 border-b border-blue-700">
          <div className="font-bold text-lg">ApiMitra 🔍</div>
          <div className="text-blue-300 text-xs mt-0.5">Admin Panel</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  isActive ? 'bg-blue-600 text-white font-semibold' : 'text-blue-200 hover:bg-blue-700'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-blue-700 text-xs text-blue-300">
          <div>{user?.name}</div>
          <button onClick={handleLogout} className="mt-2 text-blue-400 hover:text-white">Logout →</button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
