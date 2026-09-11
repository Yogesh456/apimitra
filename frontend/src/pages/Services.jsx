import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function flatten(obj, prefix = '') {
  const result = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v === null || v === undefined || v === '') continue;
    if (typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(result, flatten(v, key));
    } else {
      result[key] = v;
    }
  }
  return result;
}

function toLabel(key) {
  const last = key.split('.').pop();
  return last.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase());
}

const SKIP = new Set(['status_code','status','Status','order_id','Order_id','orderid','Charged','charged','Success','success','Message_code','message_code','less_info','latest_by']);
function shouldSkip(key) {
  const last = key.split('.').pop();
  return SKIP.has(key) || SKIP.has(last) || key.startsWith('response_metadata');
}

function ResultCard({ data }) {
  if (!data || typeof data !== 'object') return <p className="text-sm text-gray-700">{String(data)}</p>;
  let payload = data;
  if (data?.data?.provider_response) {
    try {
      const parsed = typeof data.data.provider_response === 'string' ? JSON.parse(data.data.provider_response) : data.data.provider_response;
      payload = parsed?.result || parsed?.data || parsed;
    } catch { payload = data?.data || data; }
  } else if (data?.data && typeof data.data === 'object') {
    payload = data.data;
  }
  const flat = flatten(payload);
  const entries = Object.entries(flat).filter(([k]) => !shouldSkip(k));
  const message = data?.message || data?.data?.Message || data?.data?.message || '';
  if (entries.length === 0) return <p className="text-sm text-gray-500 italic">No data returned.</p>;
  return (
    <div>
      {message && message !== 'Transaction Successful' && (
        <p className="text-sm font-semibold text-green-700 mb-3">{message}</p>
      )}
      <div className="space-y-2">
        {entries.map(([key, val]) => (
          <div key={key} className="flex justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
            <span className="text-gray-500 text-sm shrink-0">{toLabel(key)}</span>
            <span className="font-semibold text-gray-900 text-sm text-right break-all">
              {typeof val === 'boolean' ? (val ? '✅ Yes' : '❌ No') : String(val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const FIELD_LABELS = {
  'pan-by-aadhaar':  { aadharNo: 'Aadhaar Number' },
  'pan-details':     { panNo: 'PAN Number' },
  'vehicle-details': { regNo: 'Vehicle Reg Number' },
};

export default function Services() {
  const { user, refreshWallet } = useAuth();
  const [services, setServices] = useState([]);
  const [active, setActive] = useState(null);
  const [showQuery, setShowQuery] = useState(false);
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/services').then((r) => { setServices(r.data); });
  }, []);

  useEffect(() => { setInputs({}); setResult(null); setError(''); }, [active]);

  const openService = (s) => { setActive(s); setShowQuery(true); setResult(null); setError(''); };

  const handleQuery = async (e) => {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const res = await axios.post(`/api/services/query/${active.slug}`, inputs);
      setResult(res.data);
      await refreshWallet();
    } catch (err) {
      setError(err.response?.data?.message || 'Query failed');
    } finally {
      setLoading(false);
    }
  };

  const fieldMap = active ? (FIELD_LABELS[active.slug] || Object.fromEntries(Object.keys(active.paramMap || {}).map((k) => [k, k]))) : {};

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Service list */}
      {!showQuery && (
        <div className="px-4 py-4">
          <h2 className="text-xl font-extrabold text-gray-800 mb-4">Services</h2>
          {user?.status !== 'approved' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4 text-amber-800 text-sm">
              ⏳ Account needs admin approval to use services.
            </div>
          )}
          <div className="space-y-3">
            {services.map((s, i) => (
              <button
                key={s._id}
                onClick={() => openService(s)}
                className="w-full card p-4 flex items-center gap-3 press text-left animate-fade-up"
              >
                <div className="w-12 h-12 rounded-2xl grad-brand flex items-center justify-center text-xl shadow-md shrink-0">
                  {['🆔','📄','🚗','🏦','📱'][i % 5]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800">{s.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5 truncate">{s.description}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-indigo-700 font-extrabold text-sm">₹{s.costPerQuery}</div>
                  <div className="text-[10px] text-gray-400">per query</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Query screen — slides in */}
      {showQuery && active && (
        <div className="px-4 py-4">
          {/* Back button */}
          <button onClick={() => { setShowQuery(false); setResult(null); }}
            className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-4">
            ← Back to Services
          </button>

          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <h3 className="font-bold text-gray-800 text-lg">{active.name}</h3>
            <p className="text-gray-400 text-sm mt-0.5">{active.description}</p>
            <span className="inline-block mt-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
              ₹{active.costPerQuery} per query
            </span>
          </div>

          {/* Instructions */}
          {active.instructions && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex gap-2">
              <span className="text-base shrink-0">📌</span>
              <p className="text-amber-800 text-sm whitespace-pre-line">{active.instructions}</p>
            </div>
          )}

          {!result ? (
            <form onSubmit={handleQuery} className="space-y-3">
              {Object.entries(fieldMap).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="text"
                    required
                    value={inputs[key] || ''}
                    onChange={(e) => setInputs({ ...inputs, [key]: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    autoComplete="off"
                  />
                </div>
              ))}
              {Object.keys(fieldMap).length === 0 && (
                <p className="text-gray-400 text-sm">This service requires no additional input.</p>
              )}
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">{error}</div>}
              <button
                type="submit"
                disabled={loading || user?.status !== 'approved'}
                className="w-full grad-brand text-white font-bold py-4 rounded-2xl text-base shadow-lg disabled:opacity-50 press mt-2"
              >
                {loading ? '🔍 Searching…' : `Search — ₹${active.costPerQuery}`}
              </button>
            </form>
          ) : (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-green-800">✅ Result</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">₹{result.walletDeducted} deducted</span>
                </div>
                <ResultCard data={result.result} />
              </div>
              <button
                onClick={() => setResult(null)}
                className="w-full border border-blue-200 text-blue-700 font-semibold py-3 rounded-2xl text-sm"
              >
                Search Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
