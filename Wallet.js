const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  balance_sats: { type: Number, default: 0 },
  reserved_sats: { type: Number, default: 0 },
  fiat_balance_cents: { type: Number, default: 0 }
});

module.exports = mongoose.model('Wallet', WalletSchema);
