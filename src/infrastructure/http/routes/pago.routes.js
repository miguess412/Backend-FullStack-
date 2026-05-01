const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pago.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.post('/crear-orden', pagoController.crearOrdenPago);
router.post('/capturar-pago', pagoController.capturarPago);

module.exports = router;