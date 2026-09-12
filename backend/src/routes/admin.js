const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Service = require('../models/Service');
const Transaction = require('../models/Transaction');

// ── Users ──────────────────────────────────────────────────────────

// GET /api/admin/users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = { role: 'user' };
    if (status) filter.status = status;
    if (search) filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { mobile: new RegExp(search, 'i') },
    ];
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/users/:id - approve/block/update details
router.patch('/users/:id', adminAuth, async (req, res) => {
  try {
    const { status, name, shopName, mobile, email, wallet } = req.body;
    const update = {};
    if (status) update.status = status;
    if (name) update.name = name;
    if (shopName) update.shopName = shopName;
    if (mobile) update.mobile = mobile;
    if (email) update.email = email;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Wallet adjustment (separate for audit)
    if (wallet !== undefined) {
      const diff = wallet - user.wallet;
      user.wallet = wallet;
      await user.save();
      if (diff !== 0) {
        await Transaction.create({
          user: user._id,
          type: diff > 0 ? 'credit' : 'debit',
          amount: Math.abs(diff),
          description: 'Admin wallet adjustment',
          status: 'success',
        });
      }
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Services ──────────────────────────────────────────────────────

// GET /api/admin/services
router.get('/services', adminAuth, async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/services
router.post('/services', adminAuth, async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/admin/services/:id
router.patch('/services/:id', adminAuth, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(service);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/admin/services/:id
router.delete('/services/:id', adminAuth, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Query logs (what data users requested) ────────────────────────

// GET /api/admin/query-logs?user=&service=&search=&limit=
// Returns service-query transactions with the input the user submitted
// and the result returned. Filterable by user and by service.
router.get('/query-logs', adminAuth, async (req, res) => {
  try {
    const { user, service, search, limit } = req.query;
    const filter = { type: 'debit', service: { $ne: null } };
    if (user) filter.user = user;
    if (service) filter.service = service;

    let logs = await Transaction.find(filter)
      .populate('user', 'name email mobile')
      .populate('service', 'name slug')
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(limit) || 200, 1000));

    // Optional free-text search over user name/email/mobile or service name
    if (search) {
      const re = new RegExp(search, 'i');
      logs = logs.filter((l) =>
        re.test(l.user?.name || '') || re.test(l.user?.email || '') ||
        re.test(l.user?.mobile || '') || re.test(l.service?.name || '')
      );
    }

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/admin/query-logs/filters - dropdown options (users & services that have queries)
router.get('/query-logs/filters', adminAuth, async (req, res) => {
  try {
    const userIds = await Transaction.distinct('user', { type: 'debit', service: { $ne: null } });
    const serviceIds = await Transaction.distinct('service', { type: 'debit', service: { $ne: null } });
    const [users, services] = await Promise.all([
      User.find({ _id: { $in: userIds } }).select('name email mobile'),
      Service.find({ _id: { $in: serviceIds } }).select('name slug'),
    ]);
    res.json({ users, services });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Admin account (change own login email / password) ─────────────

// GET /api/admin/account - current admin's login email
router.get('/account', adminAuth, async (req, res) => {
  res.json({ name: req.user.name, email: req.user.email });
});

// PATCH /api/admin/account  { currentPassword, email?, newPassword? }
// Requires the current password to change email and/or password.
router.patch('/account', adminAuth, async (req, res) => {
  try {
    const { currentPassword, email, newPassword } = req.body;
    if (!currentPassword)
      return res.status(400).json({ message: 'Current password is required' });

    // Load with password field for verification
    const admin = await User.findById(req.user._id);
    const match = await admin.comparePassword(currentPassword);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect' });

    let changed = [];

    if (email && email !== admin.email) {
      const taken = await User.findOne({ email: email.toLowerCase(), _id: { $ne: admin._id } });
      if (taken) return res.status(400).json({ message: 'That email is already in use' });
      admin.email = email.toLowerCase();
      changed.push('email');
    }

    if (newPassword) {
      if (newPassword.length < 6)
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      admin.password = newPassword; // pre-save hook re-hashes it
      changed.push('password');
    }

    if (changed.length === 0)
      return res.status(400).json({ message: 'Nothing to change' });

    await admin.save();
    res.json({ message: `Updated ${changed.join(' and ')} successfully`, email: admin.email });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── Manual UPI top-up requests ────────────────────────────────────

// GET /api/admin/topup-requests?status=pending
router.get('/topup-requests', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { method: 'manual_upi' };
    if (status) filter.status = status;
    const requests = await Transaction.find(filter)
      .populate('user', 'name email mobile shopName')
      .sort({ createdAt: -1 })
      .limit(500);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/admin/topup-requests/:id  { action: 'approve' | 'reject' }
// Approve credits the user's wallet (idempotent — only a pending request is acted on).
router.patch('/topup-requests/:id', adminAuth, async (req, res) => {
  try {
    const { action } = req.body;
    const txn = await Transaction.findById(req.params.id);
    if (!txn || txn.method !== 'manual_upi')
      return res.status(404).json({ message: 'Request not found' });
    if (txn.status !== 'pending')
      return res.status(400).json({ message: `Request already ${txn.status}` });

    if (action === 'approve') {
      await User.findByIdAndUpdate(txn.user, { $inc: { wallet: txn.amount } });
      txn.status = 'success';
      await txn.save();
      return res.json({ message: 'Approved — wallet credited', status: 'success' });
    }
    if (action === 'reject') {
      txn.status = 'failed';
      await txn.save();
      return res.json({ message: 'Request rejected', status: 'failed' });
    }
    return res.status(400).json({ message: 'Invalid action' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
