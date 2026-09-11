import React, { useState, useEffect } from 'react';
import axios from 'axios';

const emptyForm = { name: '', slug: '', description: '', apiUrl: '', apiKey: '', method: 'GET', paramMap: '{}', costPerQuery: 2, apiCostPerQuery: 0, isActive: true, instructions: '' };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => axios.get('/api/admin/services').then((r) => setServices(r.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(emptyForm); setEditId(null); setShowForm(true); setError(''); };
  const openEdit = (s) => {
    setForm({
      name: s.name || '',
      slug: s.slug || '',
      description: s.description || '',
      apiUrl: s.apiUrl || '',
      apiKey: s.apiKey || '',
      method: s.method || 'GET',
      paramMap: JSON.stringify(s.paramMap || {}, null, 2),
      costPerQuery: s.costPerQuery ?? 2,
      apiCostPerQuery: s.apiCostPerQuery ?? 0,
      isActive: s.isActive ?? true,
      instructions: s.instructions || '',
    });
    setEditId(s._id); setShowForm(true); setError('');
  };

  const save = async () => {
    setSaving(true); setError('');
    try {
      let paramMap;
      try { paramMap = JSON.parse(form.paramMap); } catch { setSaving(false); return setError('Param map is invalid — fix the rows above'); }
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        apiUrl: form.apiUrl,
        apiKey: form.apiKey,
        method: form.method,
        paramMap,
        costPerQuery: Number(form.costPerQuery),
        apiCostPerQuery: Number(form.apiCostPerQuery) || 0,
        isActive: form.isActive,
        instructions: form.instructions || '',
      };
      if (editId) { await axios.patch(`/api/admin/services/${editId}`, payload); }
      else { await axios.post('/api/admin/services', payload); }
      setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.message || 'Error saving'); }
    finally { setSaving(false); }
  };

  const toggle = async (s) => { await axios.patch(`/api/admin/services/${s._id}`, { isActive: !s.isActive }); load(); };
  const del = async (id) => { if (confirm('Delete this service?')) { await axios.delete(`/api/admin/services/${id}`); load(); } };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Services</h2>
        <button onClick={openNew} className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600">
          + Add Service
        </button>
      </div>

      <div className="space-y-3">
        {services.map((s) => (
          <div key={s._id} className="bg-white border rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-800">{s.name}</span>
                <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{s.slug}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {s.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-gray-400 mt-1">
                <span>₹{s.costPerQuery}/query (user)</span>
                {s.apiCostPerQuery > 0 && <span className="text-orange-400">₹{s.apiCostPerQuery}/hit (your cost)</span>}
                <span>{s.totalQueries} queries</span>
                <span className="text-green-600">₹{s.totalRevenue} revenue</span>
                {s.apiCostPerQuery > 0 && <span className="text-blue-500">₹{((s.costPerQuery - s.apiCostPerQuery) * s.totalQueries).toFixed(2)} profit</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggle(s)} className={`text-xs px-3 py-1 rounded-lg border ${s.isActive ? 'border-gray-200 text-gray-500' : 'border-green-200 text-green-600'}`}>
                {s.isActive ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => openEdit(s)} className="text-xs px-3 py-1 rounded-lg border border-blue-200 text-blue-600">Edit</button>
              <button onClick={() => del(s._id)} className="text-xs px-3 py-1 rounded-lg border border-red-100 text-red-500">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-screen">
            <h3 className="font-semibold text-gray-800 mb-4">{editId ? 'Edit Service' : 'Add New Service'}</h3>
            {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

            {[['name','Name'],['slug','Slug (URL key)'],['description','Description'],['apiUrl','API URL'],['apiKey','API Key']].map(([k,l])=>(
              <div key={k} className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>
                <input value={form[k]||''} onChange={set(k)}
                  className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Method</label>
                <select value={form.method} onChange={set('method')} className="w-full border rounded-lg px-3 py-1.5 text-sm">
                  <option>GET</option><option>POST</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cost per Query — charged to user (₹)</label>
                <input type="number" value={form.costPerQuery} onChange={set('costPerQuery')} className="w-full border rounded-lg px-3 py-1.5 text-sm" />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Your API Cost per Hit (₹) — <span className="text-gray-400">admin only, for profit tracking</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={form.apiCostPerQuery ?? 0}
                onChange={set('apiCostPerQuery')}
                className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 0.50"
              />
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Param Map —{' '}
                <span className="text-gray-400">Your input field name → API parameter name</span>
              </label>
              <div className="border rounded-lg overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[1fr_1fr_32px] gap-0 bg-gray-50 border-b">
                  <div className="px-3 py-1.5 text-xs font-medium text-gray-500">Your field name</div>
                  <div className="px-3 py-1.5 text-xs font-medium text-gray-500 border-l">API param name</div>
                  <div />
                </div>
                {/* Rows */}
                {(() => {
                  let pairs = [];
                  try { pairs = Object.entries(JSON.parse(form.paramMap)); } catch {}
                  return pairs.length === 0
                    ? <div className="px-3 py-2 text-xs text-gray-400 italic">No params — click Add Row below</div>
                    : pairs.map(([k, v], i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_32px] border-b last:border-0">
                        <input
                          value={k}
                          placeholder="e.g. panNo"
                          onChange={(e) => {
                            const newPairs = [...pairs];
                            newPairs[i] = [e.target.value, v];
                            setForm({ ...form, paramMap: JSON.stringify(Object.fromEntries(newPairs)) });
                          }}
                          className="px-3 py-1.5 text-sm focus:outline-none focus:bg-blue-50"
                        />
                        <input
                          value={v}
                          placeholder="e.g. Panid"
                          onChange={(e) => {
                            const newPairs = [...pairs];
                            newPairs[i] = [k, e.target.value];
                            setForm({ ...form, paramMap: JSON.stringify(Object.fromEntries(newPairs)) });
                          }}
                          className="px-3 py-1.5 text-sm border-l focus:outline-none focus:bg-blue-50"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newPairs = pairs.filter((_, idx) => idx !== i);
                            setForm({ ...form, paramMap: JSON.stringify(Object.fromEntries(newPairs)) });
                          }}
                          className="flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50"
                          title="Remove"
                        >×</button>
                      </div>
                    ));
                })()}
              </div>
              <button
                type="button"
                onClick={() => {
                  let pairs = [];
                  try { pairs = Object.entries(JSON.parse(form.paramMap)); } catch {}
                  pairs.push(['', '']);
                  setForm({ ...form, paramMap: JSON.stringify(Object.fromEntries(pairs)) });
                }}
                className="mt-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >+ Add Row</button>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Instructions for Users — <span className="text-gray-400">shown above the query form</span>
              </label>
              <textarea
                value={form.instructions || ''}
                onChange={set('instructions')}
                rows={3}
                placeholder="e.g. Enter your 12-digit Aadhaar number without spaces. Make sure your Aadhaar is linked to a PAN."
                className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4 flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={set('isActive')} />
              <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-1.5 text-sm border rounded-lg text-gray-600">Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-1.5 text-sm bg-blue-700 text-white rounded-lg disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
