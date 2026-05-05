const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol de administrador
router.use(verifyToken);
router.use(isAdmin);

/**
 * @swagger
 * /api/reportes/clientes:
 *   post:
 *     summary: Generar reporte PDF de clientes
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientes:
 *                 type: array
 *               titulo:
 *                 type: string
 *     responses:
 *       200:
 *         description: PDF generado exitosamente
 */
router.post('/clientes', reportesController.generarReporteClientes);

/**
 * @swagger
 * /api/reportes/facturas:
 *   post:
 *     summary: Generar reporte PDF de facturas
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: PDF generado exitosamente
 */
router.post('/facturas', reportesController.generarReporteFacturas);

module.exports = router;