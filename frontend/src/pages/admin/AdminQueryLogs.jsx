import React, { useEffect, useState } from 'react';
import axios from 'axios';

const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

// Flatten a query result into readable key/value pairs (mirrors ResultCard logic, lightweight)
function summarize(obj) {
  if (obj == null) return '—';
  let data = obj;
  // drill into common nesting
  if (data.data && typeof data.data === 'object') data = data.data;
  if (typeof data.result === 'string') {
    try { data = JSON.parse(data.result); } catch { /* keep */ }
  } else if (data.result && typeof data.result === 'object') {
    data = data.result;
  }
  if (typeof data !== 'object') return String(data);
  const hide = new Set(['status_code', 'status', 'order_id', 'orderid', 'response_metadata', 'masked_name', 'masked_chassis', 'masked_engine']);
  return Object.entries(data)
    .filter(([k, v]) => !hide.has(k) && v !== '' && v !== null && typeof v !== 'object')
    .slice(0, 6)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ') || '—';
}

const label = (k) => k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function AdminQueryLogs() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [userF, setUserF] = useState('');
  const [serviceF, setServiceF] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const loadFilters = async () => {
    try {
      const res = await axios.get('/api/admin/query-logs/filters', authHeader());
      setUsers(res.data.users || []);
      setServices(res.data.services || []);
    } catch { /* ignore */ }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (userF) params.user = userF;
      if (serviceF) params.service = serviceF;
      if (search) params.search = search;
      const res = await axios.get('/api/admin/query-logs', { ...authHeader(), params });
      setLogs(res.data || []);
    } catch { setLogs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadFilters(); }, []);
  useEffect(() => { loadLogs(); /* eslint-disable-next-line */ }, [userF, serviceF]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Query Logs</h1>
      <p className="text-gray-500 text-sm mb-5">Every service query users ran — filter by user or by service.</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">User</label>
          <select value={userF} onChange={(e) => setUserF(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm min-w-[200px]">
            <option value="">All users</option>
            {users.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.mobile || u.email})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Service</label>
          <select value={serviceF} onChange={(e) => setServiceF(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm min-w-[200px]">
            <option value="">All services</option>
            {services.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Search</label>
          <div className="flex gap-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadLogs()}
              placeholder="name / email / mobile / service"
              className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <button onClick={loadLogs} className="px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold">Search</button>
          </div>
        </div>
        <button onClick={() => { setUserF(''); setServiceF(''); setSearch(''); }}
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium">Reset</button>
      </div>

      <div className="text-xs text-gray-400 mb-2">{logs.length} record(s)</div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Service</th>
                <th className="text-left px-4 py-3">Input</th>
                <th className="text-left px-4 py-3">Result (summary)</th>
                <th className="text-right px-4 py-3">Charged</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading…</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No queries found</td></tr>
              ) : logs.map((l) => (
                <React.Fragment key={l._id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{new Date(l.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{l.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-400">{l.user?.mobile || l.user?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{l.service?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                      {l.queryInput ? Object.entries(l.queryInput).map(([k, v]) => `${k}: ${v}`).join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[280px] truncate">{summarize(l.queryResult)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800 whitespace-nowrap">₹{l.amount}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setExpanded(expanded === l._id ? null : l._id)}
                        className="text-blue-600 text-xs font-semibold">{expanded === l._id ? 'Hide' : 'View'}</button>
                    </td>
                  </tr>
                  {expanded === l._id && (
                    <tr className="bg-slate-50">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs font-bold text-gray-500 mb-1">INPUT</div>
                            <pre className="bg-white rounded-lg p-3 text-xs overflow-x-auto border">{JSON.stringify(l.queryInput, null, 2)}</pre>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-500 mb-1">FULL RESULT</div>
                            <pre className="bg-white rounded-lg p-3 text-xs overflow-x-auto border max-h-64">{JSON.stringify(l.queryResult, null, 2)}</pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
