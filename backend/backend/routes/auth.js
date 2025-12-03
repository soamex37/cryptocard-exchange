import express from 'express';

const router = express.Router();

// Temporary test register route
router.post('/register', (req, res) => {
  res.json({ message: "User registered successfully!" });
});

export default router;
