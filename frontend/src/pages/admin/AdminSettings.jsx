import React, { useEffect, useState } from 'react';
import axios from 'axios';

const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function AdminSettings() {
  const [email, setEmail] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // UPI payment settings
  const [upiId, setUpiId] = useState('');
  const [upiPayee, setUpiPayee] = useState('ApiMitra');
  const [upiMsg, setUpiMsg] = useState('');
  const [upiSaving, setUpiSaving] = useState(false);

  useEffect(() => {
    axios.get('/api/admin/account', authHeader())
      .then((res) => { setEmail(res.data.email); setCurrentEmail(res.data.email); })
      .catch(() => {});
    axios.get('/api/content/admin/settings', authHeader())
      .then((res) => { setUpiId(res.data.upiId || ''); setUpiPayee(res.data.upiPayee || 'ApiMitra'); })
      .catch(() => {});
  }, []);

  const saveUpi = async (e) => {
    e.preventDefault();
    setUpiMsg('');
    if (!upiId || !upiId.includes('@')) { setUpiMsg('❌ Enter a valid UPI ID (e.g. name@bank)'); return; }
    setUpiSaving(true);
    try {
      await axios.patch('/api/content/admin/settings', { upiId: upiId.trim(), upiPayee: upiPayee.trim() || 'ApiMitra' }, authHeader());
      setUpiMsg('✅ UPI details saved');
    } catch (err) {
      setUpiMsg('❌ ' + (err.response?.data?.message || 'Save failed'));
    } finally { setUpiSaving(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!currentPassword) return setError('Enter your current password to confirm changes');
    if (newPassword && newPassword !== confirmPassword) return setError('New passwords do not match');
    if (!newPassword && email === currentEmail) return setError('Nothing to change');

    setLoading(true);
    try {
      const payload = { currentPassword };
      if (email !== currentEmail) payload.email = email;
      if (newPassword) payload.newPassword = newPassword;
      const res = await axios.patch('/api/admin/account', payload, authHeader());
      setSuccess(res.data.message || 'Updated successfully');
      setCurrentEmail(res.data.email || email);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Admin Account</h1>
      <p className="text-gray-500 text-sm mb-5">Change your admin login email and password. No need to edit any files.</p>

      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm">{success}</div>}

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Admin Login Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="border-t border-gray-100 pt-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Change Password (optional)</p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <label className="block text-sm font-semibold text-gray-600 mb-1">Current Password <span className="text-red-500">*</span></label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Required to confirm any change"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p className="text-xs text-gray-400 mt-1">For security, we need your current password to save changes.</p>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-700 text-white font-bold py-3.5 rounded-xl text-base shadow disabled:opacity-50 active:scale-95 transition-transform">
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
        💡 These credentials are stored securely in the database (password is hashed), not in any file.
        Use your new email and password the next time you log in.
      </div>

      {/* UPI Payment Settings */}
      <form onSubmit={saveUpi} className="mt-8 bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Payment (UPI) Settings</h2>
          <p className="text-gray-500 text-sm mt-0.5">The UPI ID users pay to for wallet top-ups. Changing it here updates the QR instantly — no redeploy needed.</p>
        </div>
        {upiMsg && (
          <div className={`rounded-xl p-3 text-sm ${upiMsg.startsWith('✅') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
            {upiMsg}
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">UPI ID</label>
          <input value={upiId} onChange={(e) => setUpiId(e.target.value)}
            placeholder="e.g. 6265751150@okbizaxis"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Payee Name (shown in UPI app)</label>
          <input value={upiPayee} onChange={(e) => setUpiPayee(e.target.value)}
            placeholder="ApiMitra"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" disabled={upiSaving}
          className="w-full bg-blue-700 text-white font-bold py-3.5 rounded-xl text-base shadow disabled:opacity-50 active:scale-95 transition-transform">
          {upiSaving ? 'Saving…' : 'Save UPI Details'}
        </button>
      </form>
    </div>
  );
}
