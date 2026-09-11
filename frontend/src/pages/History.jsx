import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    axios.get('/api/user/transactions').then((r) => { setTransactions(r.data); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading…</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="px-4 py-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Query History</h2>

        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-gray-400 text-sm">No transactions yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <div key={t._id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
                onClick={() => setExpanded(expanded === t._id ? null : t._id)}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                    t.type === 'credit' ? 'bg-green-100' : 'bg-red-50'
                  }`}>
                    {t.type === 'credit' ? '💰' : '🔍'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{t.description}</p>
                    {t.service?.name && (
                      <p className="text-xs text-gray-400 mt-0.5">{t.service.name}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-0.5">
                      {new Date(t.createdAt).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                    </p>
                  </div>
                  <div className={`font-bold text-sm shrink-0 ${t.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type === 'credit' ? '+' : '-'}₹{t.amount}
                  </div>
                </div>

                {expanded === t._id && (t.queryInput || t.queryResult) && (
                  <div className="border-t px-4 py-3 bg-gray-50 text-xs space-y-2">
                    {t.queryInput && Object.keys(t.queryInput).length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-500 mb-1">Input</p>
                        {Object.entries(t.queryInput).map(([k, v]) => (
                          <div key={k} className="flex gap-2">
                            <span className="text-gray-400 capitalize">{k}:</span>
                            <span className="text-gray-700 font-medium">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {t.queryResult && (
                      <div>
                        <p className="font-semibold text-gray-500 mb-1">Result summary</p>
                        <p className="text-gray-600">{t.queryResult?.message || t.queryResult?.data?.Message || JSON.stringify(t.queryResult).slice(0, 100) + '…'}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
