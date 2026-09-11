import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grad-brand flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center text-4xl mb-4 shadow-xl">🔍</div>
        <h1 className="text-white text-3xl font-extrabold tracking-tight">ApiMitra</h1>
        <p className="text-white/70 text-sm mt-1">Your API Services Platform</p>
      </div>

      <div className="bg-white rounded-t-[2.5rem] px-6 pt-8 pb-10 shadow-2xl animate-fade-up">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Welcome back</h2>
        <p className="text-gray-400 text-sm mb-6">Sign in to continue</p>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-3 mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Email</label>
            <input type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Password</label>
            <input type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full grad-brand text-white font-bold py-4 rounded-2xl text-base shadow-lg disabled:opacity-50 press mt-2">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-600 font-bold">Sign Up</Link>
        </p>

        <p className="text-center text-xs text-gray-400 mt-4">
          <Link to="/terms" className="underline">Terms &amp; Conditions</Link>
          {' · '}
          <Link to="/privacy" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
