const { Ticket, Client, User } = require('../../../domain/entities');
const logger = require('../../http/middlewares/logger');

/// Obtener tickets del cliente autenticado
exports.getMisTickets = async (req, res) => {
    try {
        const userId = req.userId;
        
        const client = await Client.findOne({ where: { user_id: userId } });
        
        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        
        const tickets = await Ticket.findAll({
            where: { cliente_id: client.id },
            attributes: ['id', 'asunto', 'descripcion', 'estado', 'prioridad', 'created_at', 'updated_at'], // ← Agregar 'respuesta'
            order: [['created_at', 'DESC']]
        });
        
        res.json(tickets);
        
    } catch (error) {
        logger.error('Error obteniendo tickets:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Crear nuevo ticket (cliente)
exports.crearTicket = async (req, res) => {
    try {
        const userId = req.userId;
        const { asunto, descripcion, prioridad } = req.body;
        
        const client = await Client.findOne({ where: { user_id: userId } });
        
        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        
        const ticket = await Ticket.create({
            cliente_id: client.id,
            asunto,
            descripcion,
            prioridad: prioridad || 'media',
            estado: 'abierto'
        });
        
        logger.info(`Nuevo ticket creado: ${ticket.id} por usuario ${userId}`);
        
        res.status(201).json(ticket);
        
    } catch (error) {
        logger.error('Error creando ticket:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Obtener todos los tickets (admin)
exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.findAll({
            include: [{
                model: Client,
                include: [{
                    model: User,
                    attributes: ['id', 'nombre', 'email']
                }]
            }],
            attributes: ['id', 'asunto', 'descripcion', 'estado', 'prioridad', 'created_at', 'updated_at'], // ← Agregar 'respuesta'
            order: [['created_at', 'DESC']]
        });
        
        const resultado = tickets.map(t => ({
            id: t.id,
            asunto: t.asunto,
            descripcion: t.descripcion,
            estado: t.estado,
            prioridad: t.prioridad,
            //respuesta: t.respuesta,  // ← Agregar
            cliente: t.Client?.User?.nombre || 'Desconocido',
            cliente_email: t.Client?.User?.email,
            created_at: t.created_at,
            updated_at: t.updated_at
        }));
        
        res.json(resultado);
        
    } catch (error) {
        logger.error('Error obteniendo todos los tickets:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Actualizar ticket (admin)
exports.actualizarTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, respuesta } = req.body;
        
        const ticket = await Ticket.findByPk(id);
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket no encontrado' });
        }
        
        if (estado !== undefined) {
            ticket.estado = estado;
        }
        
        if (respuesta !== undefined) {
            ticket.respuesta = respuesta;  // ← Guardar respuesta
        }
        
        await ticket.save();
        
        logger.info(`Ticket ${id} actualizado - Estado: ${estado}, Respuesta: ${respuesta ? 'Sí' : 'No'}`);
        
        res.json(ticket);
        
    } catch (error) {
        logger.error('Error actualizando ticket:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};