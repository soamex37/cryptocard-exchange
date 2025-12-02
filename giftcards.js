const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: './uploads' });
const Redemption = require('../models/Redemption');

function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: 'missing_auth' });
  const token = h.split(' ')[1];
  try {
    const jwt = require('jsonwebtoken');
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    next();
  } catch (e) { return res.status(401).json({ error: 'invalid_token' }); }
}

// create redemption (card code or image)
router.post('/redeem', authMiddleware, upload.single('image'), async (req, res, next) => {
  try {
    const { card_code, pin } = req.body;
    let claimedUsd = 0;
    if (card_code && card_code.startsWith('GC-')) claimedUsd = parseFloat(card_code.split('-')[1]) || 0;
    else if (req.file) claimedUsd = 25;
    else return res.status(400).json({ ok:false, reason:'no_card' });

    const r = await Redemption.create({
      user_id: req.user.id,
      card_code: card_code || null,
      pin: pin || null,
      claimed_value_cents: Math.round(claimedUsd * 100),
      status: 'pending',
      image_path: req.file ? req.file.path : null
    });
    res.json({ ok: true, status: 'pending', redemption: r });
  } catch (err) { next(err); }
});

module.exports = router;
