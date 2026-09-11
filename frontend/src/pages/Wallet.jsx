import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Wallet() {
  const { user, refreshWallet } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const presets = [50, 100, 200, 500, 1000];

  const handleTopUp = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!amount || amount < 10) return setMessage('Minimum top-up is ₹10');
    setLoading(true);
    try {
      const res = await axios.post('/api/wallet/create-order', { amount: Number(amount) });
      const { orderId, key } = res.data;
      const options = {
        key, amount: Number(amount) * 100, currency: 'INR',
        name: 'ApiMitra', description: 'Wallet Top-Up', order_id: orderId,
        handler: async (response) => {
          try {
            const v = await axios.post('/api/wallet/verify-payment', response);
            setMessage(`✅ ${v.data.message} Balance: ₹${v.data.wallet}`);
            await refreshWallet();
          } catch { setMessage('❌ Verification failed'); }
        },
        prefill: { name: user?.name, email: user?.email, contact: user?.mobile },
        theme: { color: '#6d28d9' },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => setMessage('❌ Payment failed'));
      rzp.open();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to initiate payment');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="grad-brand px-4 pt-5 pb-14 rounded-b-[2rem]">
        <p className="text-white/70 text-sm">Available Balance</p>
        <p className="text-white text-4xl font-extrabold mt-1">₹{user?.wallet?.toFixed(2)}</p>
        <p className="text-white/50 text-xs mt-1">Tap below to add money instantly</p>
      </div>

      <div className="px-4 -mt-8">
        <div className="card p-5 animate-fade-up">
          <h3 className="font-bold text-gray-800 mb-4">Add Money</h3>

          <div className="grid grid-cols-5 gap-2 mb-4">
            {presets.map((p) => (
              <button key={p} onClick={() => setAmount(p)}
                className={`py-2.5 rounded-2xl text-sm font-bold border transition press ${
                  amount == p ? 'grad-brand text-white border-transparent shadow-md' : 'border-slate-200 text-gray-600 bg-slate-50'
                }`}>
                ₹{p}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Or enter custom amount</label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
              <span className="px-4 text-gray-400 text-xl font-bold">₹</span>
              <input type="number" min="10" value={amount}
                onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount"
                className="flex-1 py-3.5 pr-3 text-base bg-transparent focus:outline-none" />
            </div>
          </div>

          {message && (
            <div className={`mb-4 text-sm p-3 rounded-2xl ${message.startsWith('✅') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
              {message}
            </div>
          )}

          <button onClick={handleTopUp} disabled={loading}
            className="w-full grad-brand text-white font-bold py-4 rounded-2xl text-base shadow-lg disabled:opacity-50 press">
            {loading ? 'Processing…' : `Pay ₹${amount || '0'} via Razorpay`}
          </button>
        </div>

        <div className="mt-4 card p-4 text-sm text-gray-600 space-y-2">
          <div className="flex items-center gap-2">🔒 <span>Secured by Razorpay</span></div>
          <div className="flex items-center gap-2">⚡ <span>Instant wallet credit</span></div>
          <div className="flex items-center gap-2">💳 <span>UPI, Cards & Net Banking</span></div>
        </div>
      </div>
    </div>
  );
}
