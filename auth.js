const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ ok:false, error: 'missing' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ ok:false, error: 'email_taken' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password_hash: hash, name });
    await Wallet.create({ user_id: user._id });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ ok: true, token });
  } catch (err) { next(err); }
});

// login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ ok:false, error: 'invalid' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ ok:false, error: 'invalid' });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ ok: true, token });
  } catch (err) { next(err); }
});

module.exports = router;
