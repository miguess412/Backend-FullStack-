const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Admin - Listar clientes - implementar después' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Admin - Actualizar cliente - implementar después' });
});

module.exports = router;