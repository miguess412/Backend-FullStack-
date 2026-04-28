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
 * /api/cliente/pagar:
 *   post:
 *     summary: Pagar factura
 *     description: Realiza el pago de una factura pendiente
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

module.exports = router;