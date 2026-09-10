const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Clientes - implementar después' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Crear cliente - implementar después' });
});

module.exports = router;