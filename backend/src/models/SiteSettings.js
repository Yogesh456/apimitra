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
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
