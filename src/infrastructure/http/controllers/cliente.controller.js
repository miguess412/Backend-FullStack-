const { User, Client, Plan, Invoice, Ticket } = require('../../../domain/entities');
const logger = require('../../http/middlewares/logger');

// Obtener facturas del cliente autenticado
exports.getMisFacturas = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Buscar el cliente asociado al usuario
        const client = await Client.findOne({ where: { user_id: userId } });
        
        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        
        const facturas = await Invoice.findAll({
            where: { cliente_id: client.id },
            order: [['fecha_vencimiento', 'ASC']]
        });
        
        res.json(facturas);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Obtener plan del cliente
exports.getMiPlan = async (req, res) => {
    try {
        const userId = req.userId;
        
        const client = await Client.findOne({
            where: { user_id: userId },
            include: [{ model: Plan, attributes: ['id', 'nombre', 'velocidad', 'precio'] }]
        });
        
        if (!client || !client.Plan) {
            return res.status(404).json({ message: 'Plan no encontrado' });
        }
        
        res.json(client.Plan);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Pagar factura
exports.pagarFactura = async (req, res) => {
    try {
        const { facturaId } = req.body;
        const userId = req.userId;
        
        const client = await Client.findOne({ where: { user_id: userId } });
        
        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        
        const factura = await Invoice.findOne({
            where: { id: facturaId, cliente_id: client.id }
        });
        
        if (!factura) {
            return res.status(404).json({ message: 'Factura no encontrada' });
        }
        
        if (factura.estado === 'pagada') {
            return res.status(400).json({ message: 'Factura ya pagada' });
        }
        
        // Actualizar factura
        await factura.update({
            estado: 'pagada',
            fecha_pago: new Date()
        });
        
        res.json({ message: 'Pago exitoso', factura });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Obtener perfil completo del cliente
exports.getPerfil = async (req, res) => {
    try {
        const userId = req.userId;
        
        const user = await User.findByPk(userId, {
            attributes: ['id', 'nombre', 'email', 'telefono']
        });
        
        const client = await Client.findOne({ 
            where: { user_id: userId },
            attributes: ['direccion', 'ciudad']
        });
        
        res.json({
            nombre: user.nombre,
            email: user.email,
            telefono: user.telefono,
            direccion: client?.direccion || '',
            ciudad: client?.ciudad || ''
        });
        
    } catch (error) {
        logger.error('Error obteniendo perfil:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Actualizar perfil del cliente autenticado
exports.actualizarPerfil = async (req, res) => {
    try {
        const userId = req.userId;
        const { nombre, telefono, direccion, ciudad } = req.body;
        
        // Buscar el usuario
        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Actualizar datos del usuario
        await user.update({
            nombre: nombre || user.nombre,
            telefono: telefono || user.telefono
        });
        
        // Buscar el cliente asociado
        const client = await Client.findOne({ where: { user_id: userId } });
        
        if (client) {
            await client.update({
                direccion: direccion || client.direccion,
                ciudad: ciudad || client.ciudad
            });
        }
        
        logger.info(`Perfil actualizado para usuario ${userId}`);
        
        res.json({
            success: true,
            message: 'Perfil actualizado correctamente',
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                telefono: user.telefono,
                direccion: client?.direccion || '',
                ciudad: client?.ciudad || ''
            }
        });
        
    } catch (error) {
        logger.error('Error actualizando perfil:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};