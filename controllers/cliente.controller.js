const { User, Client, Plan, Invoice, Ticket } = require('../models');

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