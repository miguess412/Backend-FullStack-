const express = require('express');
const router = express.Router();
const clientesController = require('../../controllers/admin/clientes.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol de administrador
router.use(verifyToken);
router.use(isAdmin);

// Rutas del CRUD
router.get('/', clientesController.getClientes);           // Obtener todos
router.post('/', clientesController.crearCliente);         // Crear uno
router.put('/:id', clientesController.actualizarCliente);   // Actualizar
router.delete('/:id', clientesController.eliminarCliente);  // Eliminar

module.exports = router;