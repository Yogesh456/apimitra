import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Field({ label, name, type = 'text', placeholder, value, onChange, required = true, disabled = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
      />
    </div>
  );
}

export default function Signup() {
  const [form, setForm] = useState({
    name: '', shopName: '', mobile: '', email: '',
    aadharNo: '', password: '', rePassword: '',
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const sendOtp = async () => {
    setError(''); setInfo('');
    if (!/^\d{10}$/.test(form.mobile)) return setError('Enter a valid 10-digit mobile number');
    setOtpLoading(true);
    try {
      const res = await axios.post('/api/auth/send-otp', { mobile: form.mobile });
      setOtpSent(true);
      setInfo(res.data.message || 'OTP sent');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send OTP');
    } finally { setOtpLoading(false); }
  };

  const verifyOtp = async () => {
    setError(''); setInfo('');
    if (!/^\d{4,6}$/.test(otp)) return setError('Enter the OTP you received');
    setOtpLoading(true);
    try {
      await axios.post('/api/auth/verify-otp', { mobile: form.mobile, otp });
      setMobileVerified(true);
      setInfo('Mobile verified ✓');
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect OTP');
    } finally { setOtpLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!mobileVerified) return setError('Please verify your mobile number with OTP first');
    if (!agreed) return setError('Please accept the Terms & Conditions and Privacy Policy to continue');
    if (form.password !== form.rePassword) return setError('Passwords do not match');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/signup', form);
      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-700 px-4 pt-10 pb-6">
        <h1 className="text-white text-2xl font-bold">Create Account</h1>
        <p className="text-blue-200 text-sm mt-1">Register for ApiMitra</p>
      </div>

      <div className="px-4 py-6 space-y-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">{error}</div>}
        {info && <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-3 text-sm">{info}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm">{success}</div>}

        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Personal Info</p>
          <Field label="Full Name" name="name" placeholder="Rahul Sharma" value={form.name} onChange={set('name')} />
          <Field label="Shop Name (optional)" name="shopName" placeholder="Sharma Enterprises" value={form.shopName} onChange={set('shopName')} required={false} />

          {/* Mobile with OTP verification */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Mobile Number</label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => { set('mobile')(e); setOtpSent(false); setMobileVerified(false); }}
                placeholder="9876543210"
                disabled={mobileVerified}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              />
              {mobileVerified ? (
                <span className="px-3 flex items-center rounded-xl bg-green-100 text-green-700 text-sm font-semibold">✓ Verified</span>
              ) : (
                <button type="button" onClick={sendOtp} disabled={otpLoading}
                  className="px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-50 whitespace-nowrap">
                  {otpLoading ? '…' : otpSent ? 'Resend' : 'Send OTP'}
                </button>
              )}
            </div>
          </div>

          {otpSent && !mobileVerified && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Enter OTP</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={verifyOtp} disabled={otpLoading}
                  className="px-4 rounded-xl bg-green-600 text-white text-sm font-semibold disabled:opacity-50">
                  {otpLoading ? '…' : 'Verify'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">OTP sent to {form.mobile}. Valid for 5 minutes.</p>
            </div>
          )}

          <Field label="Email Address" name="email" type="email" placeholder="rahul@example.com" value={form.email} onChange={set('email')} />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">KYC Details</p>
          <Field label="Aadhaar Number" name="aadharNo" placeholder="1234 5678 9012" value={form.aadharNo} onChange={set('aadharNo')} />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Set Password</p>
          <Field label="Password" name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} />
          <Field label="Confirm Password" name="rePassword" type="password" placeholder="Re-enter password" value={form.rePassword} onChange={set('rePassword')} />
        </div>

        <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
          ℹ️ Your account needs admin approval before you can use services.
        </div>

        <label className="flex items-start gap-2 bg-white rounded-2xl p-3 shadow-sm text-xs text-gray-600">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-blue-600 flex-shrink-0"
          />
          <span>
            I confirm I am 18+, I will use all services for lawful purposes only, and I
            agree to the{' '}
            <Link to="/terms" className="text-blue-600 font-semibold underline">Terms &amp; Conditions</Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-600 font-semibold underline">Privacy Policy</Link>.
          </span>
        </label>

        <button
          onClick={handleSubmit}
          disabled={loading || !agreed || !mobileVerified}
          className="w-full bg-blue-700 text-white font-bold py-4 rounded-2xl text-base shadow disabled:opacity-50 active:scale-95 transition-transform"
        >
          {loading ? 'Registering…' : 'Create Account'}
        </button>

        <p className="text-center text-sm text-gray-400 pb-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
