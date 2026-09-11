import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const TYPE_STYLES = {
  info:    'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-300 text-amber-800',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error:   'bg-red-50 border-red-200 text-red-700',
};
const TYPE_ICONS = { info: 'ℹ️', warning: '⚠️', success: '✅', error: '🚨' };

function BannerSlideshow({ banners }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef();
  useEffect(() => {
    if (banners.length < 2) return;
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % banners.length), 3500);
    return () => clearInterval(timerRef.current);
  }, [banners.length]);
  if (!banners.length) return null;
  const b = banners[idx];
  return (
    <div className="relative mx-4 -mt-6 rounded-3xl overflow-hidden shadow-xl animate-fade-up" style={{ height: 150 }}>
      <img src={b.imageUrl} alt={b.title || 'Banner'} className="w-full h-full object-cover"
        onError={e => { e.target.src = 'https://placehold.co/400x150/6d28d9/white?text=ApiMitra'; }} />
      {(b.title || b.subtitle) && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent px-4 py-3">
          {b.title && <p className="text-white font-bold text-sm">{b.title}</p>}
          {b.subtitle && <p className="text-white/80 text-xs">{b.subtitle}</p>}
        </div>
      )}
      {banners.length > 1 && (
        <div className="absolute bottom-3 right-3 flex gap-1">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [banners, setBanners] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    axios.get('/api/content/notices').then(r => setNotices(r.data)).catch(() => {});
    axios.get('/api/content/banners').then(r => setBanners(r.data)).catch(() => {});
  }, []);

  const visibleNotices = notices.filter(n => !dismissed.includes(n._id));

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      {/* Hero */}
      <div className="grad-brand px-4 pt-5 pb-12 rounded-b-[2rem]">
        <p className="text-white/70 text-sm">Welcome back 👋</p>
        <h2 className="text-white text-2xl font-extrabold tracking-tight">{user?.name}</h2>
        {user?.shopName && <p className="text-white/60 text-xs mt-0.5">{user.shopName}</p>}

        <div className="mt-5 glass rounded-3xl p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/70 text-xs">Wallet Balance</p>
              <p className="text-white text-3xl font-extrabold mt-1">₹{user?.wallet?.toFixed(2)}</p>
            </div>
            <Link to="/wallet" className="bg-white text-indigo-700 text-sm font-bold px-5 py-2.5 rounded-2xl shadow-lg press">
              + Add Money
            </Link>
          </div>
        </div>
      </div>

      <BannerSlideshow banners={banners} />

      {/* Notices */}
      {visibleNotices.length > 0 && (
        <div className="px-4 mt-4 space-y-2">
          {visibleNotices.map(n => (
            <div key={n._id} className={`border rounded-2xl p-3 flex gap-2 items-start animate-fade-up ${TYPE_STYLES[n.type]}`}>
              <span className="text-base shrink-0">{TYPE_ICONS[n.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{n.title}</p>
                <p className="text-xs mt-0.5 opacity-90">{n.message}</p>
              </div>
              <button onClick={() => setDismissed([...dismissed, n._id])}
                className="text-lg leading-none opacity-40 hover:opacity-100 shrink-0">×</button>
            </div>
          ))}
        </div>
      )}

      {user?.status === 'pending' && (
        <div className="mx-4 mt-4 bg-amber-50 border border-amber-300 rounded-2xl p-3 text-amber-800 text-sm">
          ⏳ Pending admin approval — services unlock once approved.
        </div>
      )}

      {/* Stats */}
      <div className="px-4 mt-5 grid grid-cols-2 gap-3">
        {[
          { icon: '🔍', label: 'Total Queries', value: user?.totalQueries || 0, grad: 'from-violet-500 to-purple-600' },
          { icon: '💸', label: 'Total Spent', value: `₹${user?.totalSpent?.toFixed(2) || '0.00'}`, grad: 'from-blue-500 to-indigo-600' },
        ].map((s) => (
          <div key={s.label} className="card p-4 animate-fade-up">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-lg mb-2`}>{s.icon}</div>
            <div className="text-xl font-extrabold text-gray-800">{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="px-4 mt-5 pb-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { to: '/services', icon: '🔎', label: 'Services', grad: 'from-violet-500 to-purple-600' },
            { to: '/wallet',   icon: '💳', label: 'Add Money', grad: 'from-emerald-500 to-teal-600' },
            { to: '/history',  icon: '📋', label: 'History', grad: 'from-orange-500 to-pink-600' },
          ].map((c) => (
            <Link key={c.to} to={c.to} className="card p-4 flex flex-col items-center gap-2 press animate-fade-up">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.grad} flex items-center justify-center text-xl shadow-md`}>{c.icon}</div>
              <div className="font-semibold text-gray-700 text-xs text-center">{c.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
