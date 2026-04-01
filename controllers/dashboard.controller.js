const { User, Client, Invoice, Ticket, Plan } = require('../models');
const { Op } = require('sequelize');

// Obtener estadísticas del dashboard
exports.getStats = async (req, res) => {
    try {
        // Total de clientes (usuarios con rol = 2, que es 'cliente')
        const totalClientes = await User.count({
            where: { rol_id: 2 }
        });

        // Total de facturas pagadas y su suma
        const facturasPagadas = await Invoice.findAll({
            where: { estado: 'pagada' },
            attributes: [
                [Invoice.sequelize.fn('SUM', Invoice.sequelize.col('monto')), 'total']
            ]
        });
        const totalPagado = facturasPagadas[0]?.dataValues.total || 0;

        // Total de facturas pendientes y su suma
        const facturasPendientes = await Invoice.findAll({
            where: { estado: 'pendiente' },
            attributes: [
                [Invoice.sequelize.fn('SUM', Invoice.sequelize.col('monto')), 'total']
            ]
        });
        const totalPendiente = facturasPendientes[0]?.dataValues.total || 0;

        // Total de tickets de soporte abiertos
        const ticketsAbiertos = await Ticket.count({
            where: { estado: { [Op.in]: ['abierto', 'en_proceso'] } }
        });

        // Datos de los últimos 5 clientes registrados
        const ultimosClientes = await Client.findAll({
            limit: 5,
            order: [['fecha_registro', 'DESC']],
            include: [
                {
                    model: User,
                    attributes: ['nombre', 'email', 'telefono']
                },
                {
                    model: Plan,
                    attributes: ['nombre', 'velocidad', 'precio']
                }
            ]
        });

        // Datos de las últimas 5 facturas
        const ultimasFacturas = await Invoice.findAll({
            limit: 5,
            order: [['fecha_emision', 'DESC']],
            include: [
                {
                    model: Client,
                    include: [
                        {
                            model: User,
                            attributes: ['nombre', 'email']
                        }
                    ]
                }
            ]
        });

        res.json({
            success: true,
            data: {
                totalClientes,
                totalPagado,
                totalPendiente,
                ticketsAbiertos,
                ultimosClientes: ultimosClientes.map(c => ({
                    id: c.id,
                    nombre: c.User?.nombre || 'Sin nombre',
                    email: c.User?.email || 'Sin email',
                    telefono: c.User?.telefono || 'Sin teléfono',
                    plan: c.Plan?.nombre || 'Sin plan',
                    fecha_registro: c.fecha_registro
                })),
                ultimasFacturas: ultimasFacturas.map(f => ({
                    id: f.id,
                    cliente: f.Client?.User?.nombre || 'Cliente desconocido',
                    monto: f.monto,
                    estado: f.estado,
                    fecha_emision: f.fecha_emision,
                    fecha_vencimiento: f.fecha_vencimiento
                }))
            }
        });

    } catch (error) {
        console.error('Error en dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};