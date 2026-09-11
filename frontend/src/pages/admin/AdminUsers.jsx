import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    const params = {};
    if (filter) params.status = filter;
    if (search) params.search = search;
    axios.get('/api/admin/users', { params }).then((r) => setUsers(r.data));
  };

  useEffect(() => { load(); }, [filter, search]);

  const openEdit = (u) => { setEditUser(u); setEditForm({ name: u.name, shopName: u.shopName, mobile: u.mobile, email: u.email, wallet: u.wallet, status: u.status }); };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await axios.patch(`/api/admin/users/${editUser._id}`, editForm);
      setMsg('Saved ✅'); setEditUser(null); load();
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const quickAction = async (id, status) => {
    await axios.patch(`/api/admin/users/${id}`, { status });
    load();
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    await axios.delete(`/api/admin/users/${id}`);
    load();
  };

  const statusBadge = (s) => {
    const cls = s === 'approved' ? 'bg-green-100 text-green-700' : s === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600';
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{s}</span>;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Users</h2>

      {msg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded p-2 mb-4">{msg}</div>}

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search name / email / mobile…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
        {['', 'pending', 'approved', 'blocked'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition ${filter === s ? 'bg-blue-700 text-white border-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              {['Name', 'Email', 'Mobile', 'Shop', 'PAN', 'Status', 'Wallet', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3 text-gray-500">{u.mobile}</td>
                <td className="px-4 py-3 text-gray-400">{u.shopName || '—'}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{u.panNo}</td>
                <td className="px-4 py-3">{statusBadge(u.status)}</td>
                <td className="px-4 py-3 text-green-700 font-medium">₹{u.wallet?.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {u.status !== 'approved' && (
                      <button onClick={() => quickAction(u._id, 'approved')} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded hover:bg-green-200">Approve</button>
                    )}
                    {u.status !== 'blocked' && (
                      <button onClick={() => quickAction(u._id, 'blocked')} className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded hover:bg-red-200">Block</button>
                    )}
                    <button onClick={() => openEdit(u)} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-200">Edit</button>
                    <button onClick={() => deleteUser(u._id)} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded hover:bg-gray-200">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-semibold text-gray-800 mb-4">Edit User — {editUser.name}</h3>
            {[['name','Name'],['shopName','Shop Name'],['mobile','Mobile'],['email','Email']].map(([k,l]) => (
              <div key={k} className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>
                <input value={editForm[k]||''} onChange={(e)=>setEditForm({...editForm,[k]:e.target.value})}
                  className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Wallet Balance (₹)</label>
              <input type="number" value={editForm.wallet||0} onChange={(e)=>setEditForm({...editForm,wallet:Number(e.target.value)})}
                className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={editForm.status} onChange={(e)=>setEditForm({...editForm,status:e.target.value})}
                className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {['pending','approved','blocked'].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={()=>setEditUser(null)} className="px-4 py-1.5 text-sm border rounded-lg text-gray-600">Cancel</button>
              <button onClick={saveEdit} disabled={saving} className="px-4 py-1.5 text-sm bg-blue-700 text-white rounded-lg disabled:opacity-50">
                {saving?'Saving…':'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
