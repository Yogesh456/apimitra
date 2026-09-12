import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Wallet() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [upi, setUpi] = useState({ upiId: '', payee: 'ApiMitra' });
  const [requests, setRequests] = useState([]);
  const presets = [50, 100, 200, 500, 1000];

  const loadRequests = async () => {
    try {
      const r = await axios.get('/api/wallet/my-requests');
      setRequests(r.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    axios.get('/api/wallet/upi-info').then((r) => setUpi(r.data)).catch(() => {});
    loadRequests();
  }, []);

  // Build the UPI deep-link (rendered as an in-app QR, no external service)
  const amt = Number(amount) || 0;
  const upiLink =
    upi.upiId &&
    `upi://pay?pa=${encodeURIComponent(upi.upiId)}&pn=${encodeURIComponent(upi.payee)}${
      amt >= 10 ? `&am=${amt}` : ''
    }&cu=INR&tn=${encodeURIComponent('ApiMitra Wallet Top-Up')}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!amount || amount < 10) return setMessage('❌ Minimum top-up is ₹10');
    if (!utr || utr.trim().length < 6) return setMessage('❌ Enter the UPI reference / UTR number after paying');
    setLoading(true);
    try {
      const r = await axios.post('/api/wallet/topup-request', { amount: Number(amount), utr: utr.trim() });
      setMessage(`✅ ${r.data.message}`);
      setAmount('');
      setUtr('');
      await loadRequests();
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || 'Could not submit request'}`);
    } finally {
      setLoading(false);
    }
  };

  const statusChip = (s) =>
    s === 'success'
      ? 'bg-emerald-50 text-emerald-700'
      : s === 'failed'
      ? 'bg-red-50 text-red-600'
      : 'bg-amber-50 text-amber-700';
  const statusLabel = (s) => (s === 'success' ? 'Approved' : s === 'failed' ? 'Rejected' : 'Pending');

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="grad-brand px-4 pt-5 pb-14 rounded-b-[2rem]">
        <p className="text-white/70 text-sm">Available Balance</p>
        <p className="text-white text-4xl font-extrabold mt-1">₹{user?.wallet?.toFixed(2)}</p>
        <p className="text-white/50 text-xs mt-1">Add money via UPI — credited after quick verification</p>
      </div>

      <div className="px-4 -mt-8 pb-8">
        <div className="card p-5 animate-fade-up">
          <h3 className="font-bold text-gray-800 mb-4">Add Money via UPI</h3>

          {/* Step 1: amount */}
          <label className="block text-xs font-semibold text-gray-500 mb-2">1. Choose amount</label>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {presets.map((p) => (
              <button key={p} onClick={() => setAmount(p)} type="button"
                className={`py-2.5 rounded-2xl text-sm font-bold border transition press ${
                  amount == p ? 'grad-brand text-white border-transparent shadow-md' : 'border-slate-200 text-gray-600 bg-slate-50'
                }`}>
                ₹{p}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 mb-5">
            <span className="px-4 text-gray-400 text-xl font-bold">₹</span>
            <input type="number" min="10" value={amount}
              onChange={(e) => setAmount(e.target.value)} placeholder="Custom amount"
              className="flex-1 py-3.5 pr-3 text-base bg-transparent focus:outline-none" />
          </div>

          {/* Step 2: pay via QR */}
          <label className="block text-xs font-semibold text-gray-500 mb-2">2. Scan &amp; pay with any UPI app</label>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col items-center mb-3">
            {upiLink ? (
              <div className="rounded-xl bg-white p-3">
                <QRCodeSVG value={upiLink} size={200} level="M" />
              </div>
            ) : (
              <div className="h-[200px] w-[200px] grid place-items-center text-sm text-gray-400">Loading QR…</div>
            )}
            <div className="mt-3 text-center">
              <div className="text-xs text-gray-500">Pay to UPI ID</div>
              <div className="font-bold text-gray-800 select-all">{upi.upiId || '—'}</div>
              {amt >= 10 && <div className="text-xs text-indigo-600 mt-1">Amount pre-filled: ₹{amt}</div>}
            </div>
          </div>
          {upiLink && (
            <a href={upiLink} className="block text-center text-sm font-semibold text-indigo-600 mb-5">
              Open in a UPI app on this phone →
            </a>
          )}

          {/* Step 3: submit UTR */}
          <label className="block text-xs font-semibold text-gray-500 mb-2">3. Enter the UPI reference number (UTR) after paying</label>
          <input value={utr} onChange={(e) => setUtr(e.target.value)}
            placeholder="e.g. 4198XXXXXXXX (from your payment app)"
            className="w-full py-3.5 px-4 text-base bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4" />

          {message && (
            <div className={`mb-4 text-sm p-3 rounded-2xl ${message.startsWith('✅') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
              {message}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full grad-brand text-white font-bold py-4 rounded-2xl text-base shadow-lg disabled:opacity-50 press">
            {loading ? 'Submitting…' : 'Submit top-up request'}
          </button>
          <p className="mt-2 text-center text-xs text-gray-400">
            Wallet is credited after we verify your payment (usually quickly).
          </p>
        </div>

        {/* Past requests */}
        {requests.length > 0 && (
          <div className="mt-4 card p-4">
            <h4 className="font-bold text-gray-800 mb-3 text-sm">Your top-up requests</h4>
            <div className="space-y-2">
              {requests.map((r) => (
                <div key={r._id} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 last:border-0">
                  <div>
                    <div className="font-semibold text-gray-800">₹{r.amount}</div>
                    <div className="text-xs text-gray-400">UTR: {r.utr}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusChip(r.status)}`}>
                    {statusLabel(r.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
