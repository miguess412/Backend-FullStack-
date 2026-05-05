const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Todas las rutas del dashboard requieren autenticación y rol de admin
router.use(verifyToken);
router.use(isAdmin);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Obtener estadísticas del dashboard
 *     description: Retorna estadísticas generales (clientes, facturas, tickets) - Solo administradores
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalClientes:
 *                       type: integer
 *                     totalPagado:
 *                       type: number
 *                     totalPendiente:
 *                       type: number
 *                     ticketsAbiertos:
 *                       type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol de administrador
 */

// Obtener estadísticas del dashboard
router.get('/stats', dashboardController.getStats);
/**
 * @swagger
 * /api/dashboard/stats-charts:
 *   get:
 *     summary: Obtener datos para gráficas (facturas y planes)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos formateados para gráficas
 */
router.get('/stats-charts', dashboardController.getMonthlyStats);

module.exports = router;