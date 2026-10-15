const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

/**
 * @swagger
 * /api/cliente/facturas:
 *   get:
 *     summary: Obtener mis facturas
 *     description: Retorna las facturas del cliente autenticado
 *     tags: [Cliente]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de facturas del cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   monto:
 *                     type: number
 *                   estado:
 *                     type: string
 *                   fecha_emision:
 *                     type: string
 *                   fecha_vencimiento:
 *                     type: string
 *       401:
 *         description: No autorizado
 */
router.get('/facturas', clienteController.getMisFacturas);

/**
 * @swagger
 * /api/cliente/plan:
 *   get:
 *     summary: Obtener mi plan
 *     description: Retorna el plan de internet del cliente autenticado
 *     tags: [Cliente]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Plan del cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 velocidad:
 *                   type: string
 *                 precio:
 *                   type: number
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Plan no encontrado
 */
router.get('/plan', clienteController.getMiPlan);

/**
 * @swagger
 * /api/cliente/consumo:
 *   get:
 *     summary: Consultar consumo de internet (HU10)
 *     description: Retorna las métricas de consumo de datos y ancho de banda del cliente autenticado
 *     tags: [Cliente]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas de consumo
 *       401:
 *         description: No autorizado
 */
router.get('/consumo', clienteController.getMiConsumo);

/**
 * @swagger
 * /api/cliente/cambiar-plan:
 *   post:
 *     summary: Cambiar de plan (HU12)
 *     description: Permite al cliente autenticado cambiar su plan de internet
 *     tags: [Cliente]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nuevoPlanId
 *             properties:
 *               nuevoPlanId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Plan cambiado exitosamente
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *         description: Plan no encontrado
 */
router.post('/cambiar-plan', clienteController.cambiarMiPlan);

/**
 * @swagger
 * /api/cliente/pagar:
 *   post:
 *     summary: Pagar factura simulada (HU14)
 *     description: Realiza el pago simulado de una factura pendiente y la registra como pagada
 *     tags: [Cliente]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - facturaId
 *             properties:
 *               facturaId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Pago exitoso
 *       400:
 *         description: Factura ya pagada
 *       404:
 *         description: Factura no encontrada
 *       401:
 *         description: No autorizado
 */
router.post('/pagar', clienteController.pagarFactura);
router.get('/perfil', clienteController.getPerfil);
router.put('/perfil', clienteController.actualizarPerfil);

module.exports = router;