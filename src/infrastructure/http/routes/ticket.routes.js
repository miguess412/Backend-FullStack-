const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Rutas para clientes
router.get('/mis-tickets', ticketController.getMisTickets);
router.post('/crear', ticketController.crearTicket);

// Rutas para administradores
router.get('/todos', isAdmin, ticketController.getAllTickets);
router.put('/:id', isAdmin, ticketController.actualizarTicket);

module.exports = router;