const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol de administrador
router.use(verifyToken);
router.use(isAdmin);

router.post('/clientes', reportesController.generarReporteClientes);
router.post('/facturas', reportesController.generarReporteFacturas);

module.exports = router;