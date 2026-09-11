import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/analytics/dashboard').then((r) => {
      setData(r.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-gray-400">Loading analytics…</div>;

  const { stats, revenueChart, topServices, recentUsers } = data;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Approval', value: stats.pendingUsers, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Active Users', value: stats.approvedUsers, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Blocked', value: stats.blockedUsers, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Active Services', value: `${stats.activeServices}/${stats.totalServices}`, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue?.toFixed(2)}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'API Cost (your spend)', value: `₹${stats.totalApiCost?.toFixed(2)}`, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Net Profit', value: `₹${stats.totalProfit?.toFixed(2)}`, color: stats.totalProfit >= 0 ? 'text-blue-700' : 'text-red-600', bg: stats.totalProfit >= 0 ? 'bg-blue-50' : 'bg-red-50' },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((c) => (
          <div key={c.label} className={`${c.bg} rounded-xl p-4 border border-transparent`}>
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Revenue (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueChart}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `₹${v}`} labelFormatter={(l) => l} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Services */}
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Top Services</h3>
          <div className="space-y-3">
            {topServices.map((s) => (
              <div key={s._id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{s.name}</span>
                <div className="flex gap-3 text-gray-400">
                  <span>{s.totalQueries} queries</span>
                  <span className="text-green-600">₹{s.totalRevenue} rev</span>
                  {s.totalApiCost > 0 && <span className="text-orange-400">₹{s.totalApiCost?.toFixed(2)} cost</span>}
                  {s.totalApiCost > 0 && <span className="text-blue-600 font-medium">₹{(s.totalRevenue - s.totalApiCost).toFixed(2)} profit</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent signups */}
      <div className="bg-white border rounded-2xl p-5">
        <h3 className="font-semibold text-gray-700 mb-4">Recent Signups</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Email</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((u) => (
              <tr key={u._id} className="border-b last:border-0">
                <td className="py-2 font-medium text-gray-800">{u.name}</td>
                <td className="py-2 text-gray-500">{u.email}</td>
                <td className="py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.status === 'approved' ? 'bg-green-100 text-green-700' :
                    u.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-600'
                  }`}>{u.status}</span>
                </td>
                <td className="py-2 text-gray-400">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
