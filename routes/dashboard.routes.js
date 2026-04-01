const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Todas las rutas del dashboard requieren autenticación y rol de admin
router.use(verifyToken);
router.use(isAdmin);

// Obtener estadísticas del dashboard
router.get('/stats', dashboardController.getStats);

module.exports = router;