const express = require('express');
const router = express.Router();
const clientesController = require('../../controllers/clientes.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol de administrador
router.use(verifyToken);
router.use(isAdmin);

/**
 * @swagger
 * /api/admin/clientes:
 *   get:
 *     summary: Obtener todos los clientes
 *     description: Retorna la lista completa de clientes (solo administradores)
 *     tags: [Admin - Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   email:
 *                     type: string
 *                   telefono:
 *                     type: string
 *                   ciudad:
 *                     type: string
 *                   plan:
 *                     type: object
 *                   activo:
 *                     type: boolean
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol de administrador
 */


// Rutas del CRUD
router.get('/', clientesController.getClientes);

/**
 * @swagger
 * /api/admin/clientes:
 *   post:
 *     summary: Crear nuevo cliente
 *     description: Crea un nuevo cliente en el sistema (solo administradores)
 *     tags: [Admin - Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Nuevo Cliente"
 *               email:
 *                 type: string
 *                 example: "cliente@email.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               telefono:
 *                 type: string
 *                 example: "3123456789"
 *               direccion:
 *                 type: string
 *                 example: "Calle 123"
 *               ciudad:
 *                 type: string
 *                 example: "Bogotá"
 *               plan_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *       400:
 *         description: Email ya registrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol de administrador
 */

router.post('/', clientesController.crearCliente);

/**
 * @swagger
 * /api/admin/clientes/{id}:
 *   put:
 *     summary: Actualizar cliente
 *     description: Actualiza los datos de un cliente existente (solo administradores)
 *     tags: [Admin - Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *               ciudad:
 *                 type: string
 *               plan_id:
 *                 type: integer
 *               activo:
 *                 type: boolean
 *               password:
 *                 type: string
 *                 description: Nueva contraseña (opcional)
 *     responses:
 *       200:
 *         description: Cliente actualizado correctamente
 *       404:
 *         description: Cliente no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol de administrador
 */

router.put('/:id', clientesController.actualizarCliente);

/**
 * @swagger
 * /api/admin/clientes/{id}:
 *   delete:
 *     summary: Eliminar cliente
 *     description: Elimina un cliente del sistema (solo administradores)
 *     tags: [Admin - Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente eliminado correctamente
 *       404:
 *         description: Cliente no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol de administrador
 */

router.delete('/:id', clientesController.eliminarCliente);

module.exports = router;