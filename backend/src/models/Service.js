const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    apiUrl: { type: String, required: true },
    apiKey: { type: String },
    method: { type: String, enum: ['GET', 'POST'], default: 'POST' },
    // Map of field names: { inputField: apiParamName }
    paramMap: { type: Object, default: {} },
    // Cost charged to user per query
    costPerQuery: { type: Number, required: true, default: 1 },
    // Your actual API provider cost per hit (admin-only, for profit tracking)
    apiCostPerQuery: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    totalQueries: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalApiCost: { type: Number, default: 0 },
    // How-to instructions shown to users before querying
    instructions: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
