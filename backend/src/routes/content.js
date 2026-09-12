const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Notice = require('../models/Notice');
const Banner = require('../models/Banner');
const SiteSettings = require('../models/SiteSettings');

// ── Public/User endpoints ──────────────────────────────

// GET /api/content/notices
router.get('/notices', auth, async (req, res) => {
  try {
    const now = new Date();
    const notices = await Notice.find({
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }],
    }).sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// GET /api/content/banners
router.get('/banners', auth, async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// GET /api/content/settings — public support info for users
router.get('/settings', auth, async (req, res) => {
  try {
    const s = await SiteSettings.findOne({ key: 'global' }).lean();
    res.json(s || {});
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// ── Admin endpoints ────────────────────────────────────

// Notices CRUD
router.get('/admin/notices', adminAuth, async (req, res) => {
  const notices = await Notice.find().sort({ createdAt: -1 });
  res.json(notices);
});
router.post('/admin/notices', adminAuth, async (req, res) => {
  const notice = await Notice.create(req.body);
  res.status(201).json(notice);
});
router.patch('/admin/notices/:id', adminAuth, async (req, res) => {
  const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(notice);
});
router.delete('/admin/notices/:id', adminAuth, async (req, res) => {
  await Notice.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Banners CRUD
router.get('/admin/banners', adminAuth, async (req, res) => {
  const banners = await Banner.find().sort({ order: 1 });
  res.json(banners);
});
router.post('/admin/banners', adminAuth, async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json(banner);
});
router.patch('/admin/banners/:id', adminAuth, async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(banner);
});
router.delete('/admin/banners/:id', adminAuth, async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── Site Settings (support / customer care info) ──────
router.get('/admin/settings', adminAuth, async (req, res) => {
  const s = await SiteSettings.findOne({ key: 'global' }).lean();
  res.json(s || {});
});
router.patch('/admin/settings', adminAuth, async (req, res) => {
  const s = await SiteSettings.findOneAndUpdate(
    { key: 'global' },
    { $set: req.body },
    { new: true, upsert: true }
  );
  res.json(s);
});

// ── API Portal (FinPayUltra) balance tracker ──────────
// PATCH /api/content/admin/api-balance  { mode: 'set'|'add', amount, threshold? }
router.patch('/admin/api-balance', adminAuth, async (req, res) => {
  try {
    const { mode, amount, threshold } = req.body;
    const amt = Number(amount);
    if (isNaN(amt) || amt < 0) return res.status(400).json({ message: 'Enter a valid amount' });

    const update = {};
    if (mode === 'add') {
      // recharge: increment existing balance
      const s = await SiteSettings.findOneAndUpdate(
        { key: 'global' },
        { $inc: { apiPortalBalance: amt }, ...(threshold !== undefined ? { $set: { apiLowBalanceThreshold: Number(threshold) } } : {}) },
        { new: true, upsert: true }
      );
      return res.json(s);
    }
    // set: absolute value
    update.apiPortalBalance = amt;
    if (threshold !== undefined) update.apiLowBalanceThreshold = Number(threshold);
    const s = await SiteSettings.findOneAndUpdate(
      { key: 'global' },
      { $set: update },
      { new: true, upsert: true }
    );
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
