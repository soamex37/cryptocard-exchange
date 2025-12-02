const mongoose = require('mongoose');

const MerchantSchema = new mongoose.Schema({
  business_name: String,
  email: String,
  location: String,
  country: String,
  status: { type: String, default: 'pending' }, // pending, approved
  payout_method: String,
  payout_details_json: { type: Object, default: {} },
  rate_margin_bps: { type: Number, default: 500 },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Merchant', MerchantSchema);
