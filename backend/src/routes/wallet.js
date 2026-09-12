const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const SiteSettings = require('../models/SiteSettings');
const { sendTelegram } = require('../utils/telegram');

// Fallback UPI details (used only if admin hasn't set them in Site Settings)
const UPI_ID = process.env.UPI_ID || '6265751150@okbizaxis';
const UPI_PAYEE = process.env.UPI_PAYEE || 'ApiMitra';

// GET /api/wallet/upi-info - the UPI id + payee the user should pay to
// Prefers the admin-configured value in Site Settings, else env/default.
router.get('/upi-info', auth, async (req, res) => {
  try {
    const s = await SiteSettings.findOne({ key: 'global' }).lean();
    res.json({
      upiId: (s && s.upiId) || UPI_ID,
      payee: (s && s.upiPayee) || UPI_PAYEE,
      qrImageUrl: (s && s.qrImageUrl) || '/payment-qr.jpg',
    });
  } catch {
    res.json({ upiId: UPI_ID, payee: UPI_PAYEE, qrImageUrl: '/payment-qr.jpg' });
  }
});

// POST /api/wallet/topup-request - user submits a manual UPI top-up for admin approval
// Body: { amount, utr }  (utr = the UPI reference / transaction id from their payment app)
router.post('/topup-request', auth, async (req, res) => {
  try {
    const { amount, utr } = req.body;
    if (!amount || amount < 10) return res.status(400).json({ message: 'Minimum top-up is ₹10' });
    if (!utr || String(utr).trim().length < 6)
      return res.status(400).json({ message: 'Enter a valid UPI reference / UTR number' });

    // Prevent duplicate submissions of the same UTR
    const dupe = await Transaction.findOne({ utr: String(utr).trim() });
    if (dupe) return res.status(400).json({ message: 'This UPI reference has already been submitted' });

    const txn = await Transaction.create({
      user: req.user._id,
      type: 'credit',
      amount: Number(amount),
      description: 'Wallet top-up (manual UPI)',
      method: 'manual_upi',
      utr: String(utr).trim(),
      status: 'pending',
    });

    // Notify admin on Telegram (fire-and-forget)
    sendTelegram(
      `💰 <b>New wallet top-up request</b>\n\n` +
      `👤 ${req.user.name || 'User'} (${req.user.mobile || req.user.email || '—'})\n` +
      `💵 Amount: ₹${Number(amount)}\n` +
      `🔖 UTR: <code>${String(utr).trim()}</code>\n\n` +
      `Verify the payment, then Approve in the admin panel → Top-up Requests.`
    );

    res.json({
      message: 'Top-up request submitted. Your wallet will be credited once we verify the payment.',
      requestId: txn._id,
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not submit request', error: err.message });
  }
});

// GET /api/wallet/my-requests - user's own manual top-up requests (latest first)
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await Transaction.find({
      user: req.user._id,
      method: 'manual_upi',
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('amount utr status createdAt');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
