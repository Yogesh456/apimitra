const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    // For wallet top-ups via Razorpay (legacy)
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    // For manual UPI top-ups (admin-approved)
    method: { type: String }, // e.g. 'manual_upi'
    utr: { type: String },    // UPI reference / transaction id submitted by the user
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'success' },
    // For service queries
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    queryInput: { type: Object },
    queryResult: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
