const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/wallet/create-order - create Razorpay order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees
    if (!amount || amount < 10) return res.status(400).json({ message: 'Minimum top-up is ₹10' });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `wallet_${req.user._id}_${Date.now()}`,
    });

    // Save pending transaction
    await Transaction.create({
      user: req.user._id,
      type: 'credit',
      amount,
      description: 'Wallet top-up',
      razorpayOrderId: order.id,
      status: 'pending',
    });

    res.json({ orderId: order.id, amount, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ message: 'Could not create order', error: err.message });
  }
});

// POST /api/wallet/verify-payment - verify and credit wallet
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature)
      return res.status(400).json({ message: 'Payment verification failed' });

    // Find the pending transaction
    const txn = await Transaction.findOne({ razorpayOrderId: razorpay_order_id, status: 'pending' });
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });

    // Credit wallet
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { wallet: txn.amount } },
      { new: true }
    );

    txn.razorpayPaymentId = razorpay_payment_id;
    txn.status = 'success';
    await txn.save();

    res.json({ message: 'Wallet credited successfully', wallet: updated.wallet });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/wallet/webhook - Razorpay server-to-server confirmation (backup crediting)
// Mounted with express.raw() so the raw body is available for signature verification.
// This is a SERVER call from Razorpay, so there is NO auth middleware here.
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return res.status(500).json({ message: 'Webhook secret not configured' });

    // Verify the webhook signature against the RAW body
    const expected = crypto
      .createHmac('sha256', secret)
      .update(req.body) // req.body is a Buffer here (express.raw)
      .digest('hex');

    if (expected !== signature)
      return res.status(400).json({ message: 'Invalid webhook signature' });

    const event = JSON.parse(req.body.toString());

    // Only act on a captured payment
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;

      // Idempotent: only credit if the transaction is still pending
      const txn = await Transaction.findOne({ razorpayOrderId: orderId, status: 'pending' });
      if (txn) {
        await User.findByIdAndUpdate(txn.user, { $inc: { wallet: txn.amount } });
        txn.razorpayPaymentId = paymentId;
        txn.status = 'success';
        await txn.save();
      }
      // If not pending, it was already credited by verify-payment — do nothing (no double credit).
    }

    // Always 200 quickly so Razorpay does not retry a handled event
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ message: 'Webhook processing error' });
  }
});

module.exports = router;
