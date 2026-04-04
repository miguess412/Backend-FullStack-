const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.get('/facturas', clienteController.getMisFacturas);
router.get('/plan', clienteController.getMiPlan);
router.post('/pagar', clienteController.pagarFactura);

module.exports = router;