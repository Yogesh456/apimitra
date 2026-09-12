const express = require('express');
const router = express.Router();
const axios = require('axios');
const { auth } = require('../middleware/auth');
const Service = require('../models/Service');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const SiteSettings = require('../models/SiteSettings');
const { sendTelegram } = require('../utils/telegram');

// GET /api/services - list all active services
router.get('/', auth, async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).select('-apiKey -apiUrl');
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/services/query/:slug - run a service query
router.post('/query/:slug', auth, async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, isActive: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // Check approved status
    if (req.user.status !== 'approved')
      return res.status(403).json({ message: 'Account not approved yet' });

    // Check wallet balance
    if (req.user.wallet < service.costPerQuery)
      return res.status(400).json({ message: 'Insufficient wallet balance' });

    // Build API request params from paramMap
    const params = {};
    Object.entries(service.paramMap).forEach(([inputField, apiParam]) => {
      if (req.body[inputField] !== undefined) params[apiParam] = req.body[inputField];
    });

    // Call external API
    let apiResult;
    try {
      // Strip any trailing ? from the URL (admin might paste it with ? already)
      const cleanUrl = service.apiUrl.replace(/\?+$/, '');

      // FinPayUltra-style: api_key and orderid always go as query params
      const queryParams = {
        api_key: service.apiKey,
        orderid: `TXN_${req.user._id}_${Date.now()}`,
        ...params,
      };

      if (service.method === 'GET') {
        const response = await axios.get(cleanUrl, { params: queryParams, timeout: 15000 });
        apiResult = response.data;
      } else {
        const response = await axios.post(cleanUrl, queryParams, { timeout: 15000 });
        apiResult = response.data;
      }
    } catch (apiErr) {
      const status = apiErr.response?.status;
      const msg = apiErr.response?.data?.message || apiErr.message;
      return res.status(502).json({
        message: `External API error${status ? ` (${status})` : ''}: ${msg}`,
      });
    }

    // Deduct wallet and record transaction
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { wallet: -service.costPerQuery, totalSpent: service.costPerQuery, totalQueries: 1 },
    });
    await Service.findByIdAndUpdate(service._id, {
      $inc: { totalQueries: 1, totalRevenue: service.costPerQuery, totalApiCost: service.apiCostPerQuery || 0 },
    });
    // Deduct the provider's per-hit cost from the tracked API portal balance
    if (service.apiCostPerQuery > 0) {
      const updated = await SiteSettings.findOneAndUpdate(
        { key: 'global' },
        { $inc: { apiPortalBalance: -service.apiCostPerQuery } },
        { upsert: true, new: true }
      );
      // Alert once, only when this hit is what crossed the threshold
      const bal = updated.apiPortalBalance;
      const th = updated.apiLowBalanceThreshold ?? 100;
      const prev = bal + service.apiCostPerQuery; // balance before this deduction
      if (bal <= th && prev > th) {
        sendTelegram(
          `⚠️ <b>Low API portal balance</b>\n\n` +
          `Your FinPayUltra balance is now ₹${bal.toFixed(2)} (threshold ₹${th}).\n` +
          `Recharge FinPayUltra and update it in Admin Account → API Portal Balance.`
        );
      }
    }
    await Transaction.create({
      user: req.user._id,
      type: 'debit',
      amount: service.costPerQuery,
      description: `${service.name} query`,
      service: service._id,
      queryInput: req.body,
      queryResult: apiResult,
    });

    res.json({ result: apiResult, walletDeducted: service.costPerQuery });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
