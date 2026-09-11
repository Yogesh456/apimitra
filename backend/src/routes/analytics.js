const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Service = require('../models/Service');
const Transaction = require('../models/Transaction');

// GET /api/analytics/dashboard - admin dashboard stats
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      pendingUsers,
      approvedUsers,
      blockedUsers,
      totalServices,
      activeServices,
      transactions,
      servicesCostData,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', status: 'pending' }),
      User.countDocuments({ role: 'user', status: 'approved' }),
      User.countDocuments({ role: 'user', status: 'blocked' }),
      Service.countDocuments(),
      Service.countDocuments({ isActive: true }),
      Transaction.find({ status: 'success', type: 'credit' })
        .select('amount createdAt')
        .sort({ createdAt: -1 })
        .limit(200),
      Service.find().select('totalApiCost totalRevenue'),
    ]);

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalApiCost = servicesCostData.reduce((sum, s) => sum + (s.totalApiCost || 0), 0);
    const totalProfit = totalRevenue - totalApiCost;

    // Revenue by day (last 7 days)
    const now = new Date();
    const revenueChart = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      const start = new Date(day.setHours(0, 0, 0, 0));
      const end = new Date(day.setHours(23, 59, 59, 999));
      const dayRevenue = transactions
        .filter((t) => t.createdAt >= start && t.createdAt <= end)
        .reduce((sum, t) => sum + t.amount, 0);
      revenueChart.push({ date: start.toISOString().slice(0, 10), revenue: dayRevenue });
    }

    // Top services
    const topServices = await Service.find()
      .sort({ totalQueries: -1 })
      .limit(5)
      .select('name totalQueries totalRevenue totalApiCost');

    // Recent signups
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email status createdAt');

    res.json({
      stats: { totalUsers, pendingUsers, approvedUsers, blockedUsers, totalServices, activeServices, totalRevenue, totalApiCost, totalProfit },
      revenueChart,
      topServices,
      recentUsers,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
