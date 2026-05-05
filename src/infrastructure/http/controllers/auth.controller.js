const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../../../domain/entities');
const logger = require('../../http/middlewares/logger');
const loggerBD = require('../../http/middlewares/logger-bd');

exports.login = async (req, res) => {
    const startTime = Date.now();
    const { email, password } = req.body;
    
    logger.info(`Intento de login con email: ${email}`);
    
    try {
        const user = await User.findOne({
            where: { email },
            include: [{ model: Role, attributes: ['nombre'] }]
        });

        if (!user) {
            logger.warn(`Login fallido - Usuario no existe: ${email}`);
            // LOG IMPORTANTE EN BD
            await loggerBD.loginFallido(email, req);
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            logger.warn(`Login fallido - Contraseña incorrecta para: ${email}`);
            // LOG IMPORTANTE EN BD
            await loggerBD.loginFallido(email, req);
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, rol: user.Role?.nombre || 'cliente' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        const duration = Date.now() - startTime;
        logger.info(`✅ Login exitoso: ${email} (rol: ${user.Role?.nombre}) - ${duration}ms`);
        
        // LOG IMPORTANTE EN BD (LOGIN EXITOSO)
        await loggerBD.loginExitoso(email, req, user.id);

        res.json({
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.Role?.nombre || 'cliente',
                telefono: user.telefono
            }
        });

    } catch (error) {
        logger.error(`❌ Error en login para ${email}:`, error);
        // LOG IMPORTANTE EN BD (ERROR)
        await loggerBD.errorSistema(error.message, req, email);
        res.status(500).json({ message: 'Error del servidor' });
    }
};