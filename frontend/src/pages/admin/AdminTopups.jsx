import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminTopups() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await axios.get('/api/admin/topup-requests', {
        params: filter ? { status: filter } : {},
      });
      setRequests(r.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const act = async (id, action) => {
    if (action === 'approve' && !window.confirm('Confirm you have verified this payment in your bank/UPI app?')) return;
    setBusyId(id);
    try {
      await axios.patch(`/api/admin/topup-requests/${id}`, { action });
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
    setBusyId(null);
  };

  const chip = (s) =>
    s === 'success' ? 'bg-emerald-100 text-emerald-700'
    : s === 'failed' ? 'bg-red-100 text-red-600'
    : 'bg-amber-100 text-amber-700';
  const label = (s) => (s === 'success' ? 'Approved' : s === 'failed' ? 'Rejected' : 'Pending');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Top-up Requests</h1>
      <p className="text-gray-500 text-sm mt-1">Verify each UPI payment in your bank/UPI app before approving — approving credits the user's wallet.</p>

      <div className="mt-4 flex gap-2">
        {['pending', 'success', 'failed', ''].map((s) => (
          <button key={s || 'all'} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-slate-200'}`}>
            {s === '' ? 'All' : label(s === 'success' ? 'success' : s === 'failed' ? 'failed' : 'pending')}
          </button>
        ))}
      </div>

      <div className="mt-4 bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No requests.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">UTR / Reference</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-gray-500">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800">{r.user?.name}</div>
                    <div className="text-xs text-gray-400">{r.user?.mobile} · {r.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-800">₹{r.amount}</td>
                  <td className="px-4 py-3 font-mono text-gray-700 select-all">{r.utr}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${chip(r.status)}`}>{label(r.status)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button onClick={() => act(r._id, 'approve')} disabled={busyId === r._id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold disabled:opacity-50">
                          Approve
                        </button>
                        <button onClick={() => act(r._id, 'reject')} disabled={busyId === r._id}
                          className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold disabled:opacity-50">
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
