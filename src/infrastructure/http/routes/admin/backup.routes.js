const express = require('express');
const router = express.Router();
const backupController = require('../../controllers/backup.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');

// Todas las rutas de backups requieren autenticación y rol de Administrador
router.use(verifyToken, isAdmin);

// Listar copias de seguridad
router.get('/', backupController.listarBackups);

// Crear nueva copia de seguridad
router.post('/crear', backupController.crearBackup);

// Descargar archivo de copia de seguridad
router.get('/descargar/:nombre', backupController.descargarBackup);

// Eliminar copia de seguridad
router.delete('/:nombre', backupController.eliminarBackup);

module.exports = router;
