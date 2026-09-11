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

module.exports = router;
