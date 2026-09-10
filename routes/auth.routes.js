const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - implementar después' });
});

router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint - implementar después' });
});

module.exports = router;