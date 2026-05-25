const express = require('express');
const router = express.Router();
const planController = require('../controllers/plan.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Rutas públicas (cualquier usuario autenticado puede ver los planes)
router.get('/', verifyToken, planController.getPlanes);
router.get('/:id', verifyToken, planController.getPlanById);

// Rutas protegidas solo para administrador
router.post('/', verifyToken, isAdmin, planController.crearPlan);
router.put('/:id', verifyToken, isAdmin, planController.actualizarPlan);
router.delete('/:id', verifyToken, isAdmin, planController.eliminarPlan);

module.exports = router;