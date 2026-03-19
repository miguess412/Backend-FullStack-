const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Ruta para login
router.post('/login', authController.login);

module.exports = router;