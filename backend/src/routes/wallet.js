const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// ── Instamojo config ──────────────────────────────────────────────
// LIVE base. (Test would be https://test.instamojo.com/api/1.1/)
const INSTAMOJO_BASE = process.env.INSTAMOJO_BASE || 'https://www.instamojo.com/api/1.1/';
const IM_API_KEY = process.env.INSTAMOJO_API_KEY;
const IM_AUTH_TOKEN = process.env.INSTAMOJO_AUTH_TOKEN;
const IM_SALT = process.env.INSTAMOJO_SALT;
// Where Instamojo sends the user back after payment, and where its webhook posts.
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://apimitra.vercel.app';
const BACKEND_URL = process.env.BACKEND_URL || 'https://apimitra.onrender.com';

const imHeaders = () => ({
  'X-Api-Key': IM_API_KEY,
  'X-Auth-Token': IM_AUTH_TOKEN,
});

// POST /api/wallet/create-order - create an Instamojo payment request
// Returns a hosted payment URL the frontend redirects the user to.
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount } = req.body; // rupees
    if (!amount || amount < 10) return res.status(400).json({ message: 'Minimum top-up is ₹10' });
    if (!IM_API_KEY || !IM_AUTH_TOKEN) {
      return res.status(500).json({ message: 'Payment gateway not configured' });
    }

    // Create a pending transaction first so we have an id to correlate
    const txn = await Transaction.create({
      user: req.user._id,
      type: 'credit',
      amount,
      description: 'Wallet top-up',
      status: 'pending',
    });

    // Instamojo expects form-urlencoded data
    const form = new URLSearchParams();
    form.append('purpose', 'ApiMitra Wallet Top-Up');
    form.append('amount', String(amount));
    form.append('buyer_name', req.user.name || 'ApiMitra User');
    form.append('email', req.user.email || '');
    form.append('phone', req.user.mobile || '');
    form.append('redirect_url', `${FRONTEND_URL}/wallet?im=1`);
    form.append('webhook', `${BACKEND_URL}/api/wallet/webhook`);
    form.append('send_email', 'false');
    form.append('send_sms', 'false');
    form.append('allow_repeated_payments', 'false');

    const { data } = await axios.post(`${INSTAMOJO_BASE}payment-requests/`, form, {
      headers: { ...imHeaders(), 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!data || !data.success || !data.payment_request) {
      return res.status(502).json({ message: 'Could not create payment request' });
    }

    // Save the Instamojo request id on our pending txn
    txn.instamojoRequestId = data.payment_request.id;
    await txn.save();

    // Frontend redirects the browser to this URL
    res.json({ paymentUrl: data.payment_request.longurl, requestId: data.payment_request.id, amount });
  } catch (err) {
    console.error('Instamojo create-order error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Could not initiate payment' });
  }
});

// Shared crediting helper — idempotent (only credits a still-pending txn)
async function creditIfPending(requestId, paymentId) {
  const txn = await Transaction.findOne({ instamojoRequestId: requestId, status: 'pending' });
  if (!txn) return null; // already handled or unknown — do nothing (no double credit)
  await User.findByIdAndUpdate(txn.user, { $inc: { wallet: txn.amount } });
  txn.instamojoPaymentId = paymentId;
  txn.status = 'success';
  await txn.save();
  return txn;
}

// POST /api/wallet/webhook - Instamojo server-to-server confirmation (PRIMARY)
// Instamojo posts form-urlencoded data with a 'mac' HMAC-SHA1 signature over the
// alphabetically-sorted values, keyed by the account Salt.
router.post('/webhook', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    if (!IM_SALT) return res.status(500).json({ message: 'Salt not configured' });

    const data = req.body || {};
    const providedMac = data.mac;

    // Build the MAC: sort keys (except 'mac') alphabetically, join their values with '|'
    const keys = Object.keys(data).filter((k) => k !== 'mac').sort();
    const message = keys.map((k) => data[k]).join('|');
    const computedMac = crypto.createHmac('sha1', IM_SALT).update(message).digest('hex');

    if (!providedMac || computedMac !== providedMac) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    // Only credit on a successful payment
    if (data.status === 'Credit') {
      await creditIfPending(data.payment_request_id, data.payment_id);
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Instamojo webhook error:', err.message);
    res.status(500).json({ message: 'Webhook processing error' });
  }
});

// GET /api/wallet/confirm - browser-return fallback (BACKUP)
// After payment Instamojo redirects the user to /wallet?im=1&payment_id=..&payment_request_id=..
// The frontend calls this to confirm quickly; we verify the payment via Instamojo's API.
router.get('/confirm', auth, async (req, res) => {
  try {
    const { payment_request_id, payment_id } = req.query;
    if (!payment_request_id || !payment_id) return res.status(400).json({ message: 'Missing payment reference' });

    // Verify with Instamojo that this payment is genuinely successful
    const { data } = await axios.get(
      `${INSTAMOJO_BASE}payment-requests/${payment_request_id}/${payment_id}/`,
      { headers: imHeaders() }
    );

    const payment = data?.payment_request?.payment;
    if (!data?.success || !payment || payment.status !== 'Credit') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    const txn = await creditIfPending(payment_request_id, payment_id);
    const updated = await User.findById(req.user._id);
    res.json({
      message: txn ? 'Wallet credited successfully' : 'Payment already processed',
      wallet: updated.wallet,
    });
  } catch (err) {
    console.error('Instamojo confirm error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Could not confirm payment' });
  }
});

module.exports = router;
