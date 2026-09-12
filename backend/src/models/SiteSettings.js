const mongoose = require('mongoose');

// Single-document settings store — always upsert by key='global'
const siteSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'global', unique: true },
  supportWhatsapp: { type: String, default: '' },   // e.g. 919876543210
  supportPhone: { type: String, default: '' },
  supportEmail: { type: String, default: '' },
  supportMessage: { type: String, default: 'Hello! I need help with ApiMitra.' },
  supportLabel: { type: String, default: 'Customer Support' },
  showWhatsapp: { type: Boolean, default: true },
  showPhone: { type: Boolean, default: false },
  showEmail: { type: Boolean, default: false },
  // Manual UPI top-up config (editable from admin)
  upiId: { type: String, default: '' },
  upiPayee: { type: String, default: 'ApiMitra' },
  qrImageUrl: { type: String, default: '/payment-qr.jpg' }, // static QR image shown on wallet
  // FinPayUltra (API provider) prepaid balance tracker
  apiPortalBalance: { type: Number, default: 0 },
  apiLowBalanceThreshold: { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
