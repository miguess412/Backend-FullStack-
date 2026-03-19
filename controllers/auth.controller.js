const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar que email y password existen
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email y contraseña son requeridos' 
            });
        }

        // Buscar usuario por email
        const user = await User.findOne({
            where: { email },
            include: [{ model: Role, attributes: ['nombre'] }]
        });

        // Si no existe el usuario
        if (!user) {
            return res.status(401).json({ 
                message: 'Credenciales incorrectas' 
            });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ 
                message: 'Credenciales incorrectas' 
            });
        }

        // Verificar si usuario está activo
        if (!user.activo) {
            return res.status(403).json({ 
                message: 'Usuario inactivo. Contacte al administrador.' 
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                id: user.id,
                email: user.email,
                rol: user.Role?.nombre || 'cliente'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Enviar respuesta exitosa
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
        console.error('Error en login:', error);
        res.status(500).json({ 
            message: 'Error del servidor. Intente más tarde.' 
        });
    }
};