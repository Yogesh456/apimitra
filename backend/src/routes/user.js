const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// GET /api/user/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/user/transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    const txns = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('service', 'name');
    res.json(txns);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
