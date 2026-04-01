const jwt = require('jsonwebtoken');

// Verificar token JWT
exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'No se proporcionó token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        req.userRol = decoded.rol;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};

// Verificar si es administrador
exports.isAdmin = (req, res, next) => {
    if (req.userRol !== 'admin') {
        return res.status(403).json({ message: 'Se requiere rol de administrador' });
    }
    next();
};