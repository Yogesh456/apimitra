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

module.exports = router;
