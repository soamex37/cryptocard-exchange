const express = require('express');
const router = express.Router();
const Merchant = require('../models/Merchant');

// list approved merchants
router.get('/', async (req, res) => {
  const m = await Merchant.find({ status: 'approved' }).lean();
  res.json({ ok: true, merchants: m });
});

module.exports = router;
