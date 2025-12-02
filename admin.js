const express = require('express');
const router = express.Router();
const Redemption = require('../models/Redemption');
const Wallet = require('../models/Wallet');
const jwt = require('jsonwebtoken');

function adminAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: 'missing_auth' });
  const token = h.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    // simple admin check: set ADMIN_EMAILS env var (comma-separated) to allow admin users
    const adminList = (process.env.ADMIN_EMAILS || 'alice@example.com').split(',').map(s=>s.trim().toLowerCase());
    if (!adminList.includes((payload.email||'').toLowerCase())) return res.status(403).json({ error: 'not_admin' });
    req.admin = payload;
    next();
  } catch (e) { return res.status(401).json({ error: 'invalid_token' }); }
}

// list pending
router.get('/redemptions/pending', adminAuth, async (req, res, next) => {
  const list = await Redemption.find({ status: 'pending' }).sort({ created_at: 1 }).lean();
  res.json({ ok: true, redemptions: list });
});

// approve
router.post('/redemptions/:id/approve', adminAuth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const sats = parseInt(req.body.sats, 10) || 0;
    if (!sats) return res.status(400).json({ ok:false, error: 'missing_sats' });
    const r = await Redemption.findById(id);
    if (!r) return res.status(404).json({ ok:false, error: 'not_found' });
    if (r.status !== 'pending') return res.status(400).json({ ok:false, error: 'not_pending' });

    // credit wallet
    const wallet = await Wallet.findOne({ user_id: r.user_id });
    if (!wallet) return res.status(500).json({ ok:false, error: 'no_wallet' });
    wallet.balance_sats = (wallet.balance_sats || 0) + sats;
    await wallet.save();

    r.status = 'approved';
    r.processed_by = null;
    r.processed_at = new Date();
    r.admin_notes = req.body.notes || null;
    await r.save();

    res.json({ ok:true, credited_sats: sats });
  } catch (err) { next(err); }
});

// reject
router.post('/redemptions/:id/reject', adminAuth, async (req, res, next) => {
  const id = req.params.id;
  const r = await Redemption.findById(id);
  if (!r) return res.status(404).json({ ok:false });
  r.status = 'rejected';
  r.admin_notes = req.body.notes || null;
  r.processed_at = new Date();
  await r.save();
  res.json({ ok:true });
});

module.exports = router;
