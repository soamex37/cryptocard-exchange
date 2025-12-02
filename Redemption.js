const mongoose = require('mongoose');

const RedemptionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  card_code: String,
  pin: String,
  claimed_value_cents: Number,
  status: { type: String, default: 'pending' }, // pending, approved, rejected
  admin_notes: String,
  image_path: String,
  processed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now },
  processed_at: Date
});

module.exports = mongoose.model('Redemption', RedemptionSchema);
