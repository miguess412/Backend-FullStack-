const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../../../domain/entities');  // ← Ruta a los modelos movidos
const logger = require('../../http/middlewares/logger');

exports.login = async (req, res) => {
    const startTime = Date.now();
    const { email, password } = req.body;
    
    logger.info(`🔐 Intento de login con email: ${email}`);
    
    try {
        const user = await User.findOne({
            where: { email },
            include: [{ model: Role, attributes: ['nombre'] }]
        });

        if (!user) {
            logger.warn(`⚠️ Login fallido - Usuario no existe: ${email}`);
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            logger.warn(`⚠️ Login fallido - Contraseña incorrecta para: ${email}`);
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, rol: user.Role?.nombre || 'cliente' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        const duration = Date.now() - startTime;
        logger.info(`✅ Login exitoso: ${email} (rol: ${user.Role?.nombre}) - ${duration}ms`);

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
        res.status(500).json({ message: 'Error del servidor' });
    }
};