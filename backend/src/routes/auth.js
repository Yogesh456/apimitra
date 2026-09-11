const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const Service = require('../models/Service');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── Signup OTP store (in-memory, short-lived) ─────────────────────────
// Maps mobile -> { otp, expires, verified, attempts }
const otpStore = new Map();
const OTP_TTL_MS = 5 * 60 * 1000;      // 5 minutes
const OTP_RESEND_MS = 30 * 1000;       // min gap between sends

// Periodically clear expired entries
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of otpStore) if (v.expires < now && !v.verified) otpStore.delete(k);
}, 60 * 1000).unref?.();

// Resolve the OTP sender API config. Prefer an admin-managed service with
// slug 'send-otp'; fall back to env-based FinPayUltra defaults.
async function getOtpConfig() {
  const svc = await Service.findOne({ slug: 'send-otp' });
  return {
    url: (svc?.apiUrl || process.env.OTP_API_URL || 'https://api.finpayultra.com/api/otp1').replace(/\?+$/, ''),
    apiKey: svc?.apiKey || process.env.FINPAY_API_KEY || '',
    method: svc?.method || 'GET',
  };
}

// POST /api/auth/send-otp  { mobile }
router.post('/send-otp', async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile || !/^\d{10}$/.test(mobile))
      return res.status(400).json({ message: 'Enter a valid 10-digit mobile number' });

    // Block if already registered
    const existing = await User.findOne({ mobile });
    if (existing) return res.status(400).json({ message: 'Mobile already registered' });

    const prev = otpStore.get(mobile);
    if (prev && Date.now() - (prev.sentAt || 0) < OTP_RESEND_MS)
      return res.status(429).json({ message: 'Please wait before requesting another OTP' });

    // Generate a 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Send via FinPayUltra
    const cfg = await getOtpConfig();
    if (!cfg.apiKey)
      return res.status(500).json({ message: 'OTP service not configured. Set the API key in Admin → Services (send-otp) or FINPAY_API_KEY.' });

    const queryParams = {
      api_key: cfg.apiKey,
      orderid: `OTP_${mobile}_${Date.now()}`,
      number: mobile,
      otp,
    };
    try {
      if (cfg.method === 'GET') await axios.get(cfg.url, { params: queryParams, timeout: 15000 });
      else await axios.post(cfg.url, queryParams, { timeout: 15000 });
    } catch (apiErr) {
      const status = apiErr.response?.status;
      const msg = apiErr.response?.data?.message || apiErr.message;
      return res.status(502).json({ message: `Could not send OTP${status ? ` (${status})` : ''}: ${msg}` });
    }

    otpStore.set(mobile, {
      otp,
      expires: Date.now() + OTP_TTL_MS,
      sentAt: Date.now(),
      verified: false,
      attempts: 0,
    });

    res.json({ message: 'OTP sent to your mobile number' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/verify-otp  { mobile, otp }
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const entry = otpStore.get(mobile);
    if (!entry) return res.status(400).json({ message: 'Request an OTP first' });
    if (entry.expires < Date.now()) { otpStore.delete(mobile); return res.status(400).json({ message: 'OTP expired, request a new one' }); }
    if (entry.attempts >= 5) { otpStore.delete(mobile); return res.status(429).json({ message: 'Too many attempts, request a new OTP' }); }

    entry.attempts += 1;
    if (String(otp) !== entry.otp)
      return res.status(400).json({ message: 'Incorrect OTP' });

    entry.verified = true;
    res.json({ message: 'Mobile verified' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, shopName, mobile, email, aadharNo, panNo, password, rePassword } = req.body;

    if (!name || !mobile || !email || !aadharNo || !password)
      return res.status(400).json({ message: 'All required fields must be filled' });

    // Mobile must be OTP-verified in this flow
    const otpEntry = otpStore.get(mobile);
    if (!otpEntry || !otpEntry.verified)
      return res.status(400).json({ message: 'Please verify your mobile number with OTP first' });

    if (password !== rePassword)
      return res.status(400).json({ message: 'Passwords do not match' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const orQuery = [{ email }, { mobile }, { aadharNo }];
    if (panNo) orQuery.push({ panNo: panNo.toUpperCase() });
    const existing = await User.findOne({ $or: orQuery });
    if (existing) {
      if (existing.email === email) return res.status(400).json({ message: 'Email already registered' });
      if (existing.mobile === mobile) return res.status(400).json({ message: 'Mobile already registered' });
      if (existing.aadharNo === aadharNo) return res.status(400).json({ message: 'Aadhar already registered' });
      if (panNo && existing.panNo === panNo.toUpperCase()) return res.status(400).json({ message: 'PAN already registered' });
    }

    const doc = { name, shopName, mobile, email, aadharNo, password, mobileVerified: true };
    if (panNo) doc.panNo = panNo.toUpperCase();
    await User.create(doc);

    otpStore.delete(mobile); // consume the verification
    res.status(201).json({ message: 'Registration successful. Awaiting admin approval.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.status === 'pending')
      return res.status(403).json({ message: 'Account pending admin approval' });
    if (user.status === 'blocked')
      return res.status(403).json({ message: 'Account has been blocked' });

    const token = signToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet: user.wallet,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
