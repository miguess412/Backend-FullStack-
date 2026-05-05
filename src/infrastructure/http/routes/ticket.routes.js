const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * @swagger
 * /api/tickets/mis-tickets:
 *   get:
 *     summary: Obtener tickets del cliente autenticado
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tickets del cliente
 */
// Rutas para clientes
router.get('/mis-tickets', ticketController.getMisTickets);

/**
 * @swagger
 * /api/tickets/crear:
 *   post:
 *     summary: Crear nuevo ticket de soporte
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               asunto:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               prioridad:
 *                 type: string
 *                 enum: [baja, media, alta]
 *     responses:
 *       201:
 *         description: Ticket creado exitosamente
 */
router.post('/crear', ticketController.crearTicket);


/**
 * @swagger
 * /api/tickets/todos:
 *   get:
 *     summary: Obtener todos los tickets (solo admin)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos los tickets
 */
// Rutas para administradores
router.get('/todos', isAdmin, ticketController.getAllTickets);

/**
 * @swagger
 * /api/tickets/{id}:
 *   put:
 *     summary: Actualizar estado de un ticket (solo admin)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [abierto, en_proceso, resuelto, cerrado]
 *     responses:
 *       200:
 *         description: Ticket actualizado
 */
router.put('/:id', isAdmin, ticketController.actualizarTicket);

module.exports = router;