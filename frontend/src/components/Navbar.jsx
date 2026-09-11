import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const userTabs = [
  { to: '/dashboard', icon: '🏠', label: 'Home' },
  { to: '/services',  icon: '🔍', label: 'Services' },
  { to: '/wallet',    icon: '💰', label: 'Wallet' },
  { to: '/history',   icon: '📋', label: 'History' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (user?.role === 'admin') return null;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 grad-brand text-white safe-top shadow-lg">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg">🔍</span>
            <span className="font-extrabold text-lg tracking-tight">ApiMitra</span>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <span className="glass text-sm px-3 py-1.5 rounded-full font-bold">
                ₹{user.wallet?.toFixed(2)}
              </span>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-xl bg-white/15 flex flex-col justify-center items-center gap-1"
            >
              <span className={`block w-4 h-0.5 bg-white rounded transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block w-4 h-0.5 bg-white rounded transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-4 h-0.5 bg-white rounded transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
            <div className="absolute top-full right-3 mt-1 w-52 bg-white text-gray-800 shadow-2xl rounded-2xl overflow-hidden z-40 animate-fade-up">
              <div className="px-4 py-3 grad-brand-soft">
                <div className="font-bold text-sm text-gray-800">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              <button onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-600 text-sm hover:bg-red-50 flex items-center gap-2 font-medium">
                🚪 Logout
              </button>
              <div className="border-t border-gray-100 flex text-[11px] text-gray-400">
                <Link to="/terms" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 hover:bg-gray-50">Terms</Link>
                <Link to="/privacy" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 hover:bg-gray-50">Privacy</Link>
              </div>
            </div>
          </>
        )}
      </header>

      <div className="h-14" />

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
        <div className="mx-3 mb-2 bg-white rounded-3xl shadow-2xl border border-gray-100 flex px-2" style={{ height: 'var(--bottom-nav)' }}>
          {userTabs.map((tab) => {
            const active = location.pathname === tab.to;
            return (
              <Link key={tab.to} to={tab.to}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 press">
                <span className={`w-11 h-8 flex items-center justify-center rounded-2xl text-lg transition-all ${
                  active ? 'grad-brand text-white scale-105 shadow-md' : 'text-gray-400'
                }`}>
                  {tab.icon}
                </span>
                <span className={`text-[10px] font-semibold ${active ? 'text-indigo-700' : 'text-gray-400'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div style={{ height: 'calc(var(--bottom-nav) + 12px)' }} />
    </>
  );
}
