require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || '';
if (!MONGODB_URI) {
  console.warn('MONGODB_URI not set, server will still run but DB unavailable.');
} else {
  mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(()=> console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err.message));
}

// Models
const User = require('./models/User');
const Redemption = require('./models/Redemption');
const Wallet = require('./models/Wallet');
const Merchant = require('./models/Merchant');

// Routers
const authRouter = require('./routes/auth');
const giftRouter = require('./routes/giftcards');
const adminRouter = require('./routes/admin');
const merchantRouter = require('./routes/merchant');
app.use('/api/auth', authRouter);
app.use('/api/giftcards', giftRouter);
app.use('/api/admin', adminRouter);
app.use('/api/merchant', merchantRouter);

// Spot price endpoint (Binance)
const axios = require('axios');
let cachedSpot = parseFloat(process.env.MOCK_SPOT_USD || '60000');
async function updateSpot() {
  try {
    const r = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', { timeout: 5000 });
    const p = parseFloat(r.data.price);
    if (!isNaN(p) && p > 0) cachedSpot = p;
  } catch (e) { /* ignore */ }
}
setInterval(updateSpot, 60_000);
app.get('/api/spot', async (req, res) => { await updateSpot(); res.json({ ok: true, spot_usd: cachedSpot }); });

// Health & ping
app.get('/api/ping', (req, res) => res.json({ ok: true, message: 'CryptoCard Exchange API Running 🚀' }));

// Simple error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ ok: false, error: err.message || 'server_error' });
});

// Start
const PORT = process.env.PORT || 4001;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
