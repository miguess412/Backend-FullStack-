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

// Obtener plan del cliente (HU9)
exports.getMiPlan = async (req, res) => {
    try {
        const userId = req.userId;
        
        const client = await Client.findOne({
            where: { user_id: userId },
            include: [{ model: Plan, attributes: ['id', 'nombre', 'velocidad', 'precio', 'descripcion'] }]
        });
        
        if (!client || !client.Plan) {
            return res.status(404).json({ message: 'Plan no encontrado' });
        }
        
        res.json(client.Plan);
    } catch (error) {
        logger.error('Error obteniendo plan del cliente:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Obtener consumo de internet del cliente (HU10)
exports.getMiConsumo = async (req, res) => {
    try {
        const userId = req.userId;
        
        const client = await Client.findOne({
            where: { user_id: userId },
            include: [{ model: Plan }]
        });
        
        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        
        const plan = client.Plan;
        const velocidadNum = plan ? parseInt(plan.velocidad) || 50 : 50;
        
        // Límite de GB estimado según el plan de velocidad (ej: 10 Mbps -> 200 GB, 50 Mbps -> 500 GB, 100 Mbps -> 1000 GB)
        const gigasTotales = velocidadNum * 10;
        
        const now = new Date();
        const diaDelMes = now.getDate();
        const diasEnMes = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const diasRestantes = Math.max(1, diasEnMes - diaDelMes);
        
        // Simulación de consumo acorde al avance del mes
        const factorCliente = ((client.id * 17) % 25 + 45) / 100;
        const gigasConsumidos = Math.min(
            gigasTotales,
            Math.round(((diaDelMes / diasEnMes) * gigasTotales * factorCliente) * 10) / 10
        );
        const porcentaje = Math.round((gigasConsumidos / gigasTotales) * 100);
        
        res.json({
            clienteId: client.id,
            planNombre: plan ? plan.nombre : 'Plan Estándar',
            velocidad: plan ? plan.velocidad : '50 Mbps',
            gigasConsumidos,
            gigasTotales,
            porcentajeConsumo: porcentaje,
            diasRestantesCiclo: diasRestantes,
            estadoServicio: 'Activo / Óptimo',
            periodo: now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        });
    } catch (error) {
        logger.error('Error obteniendo consumo del cliente:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Cambiar de plan (HU12)
exports.cambiarMiPlan = async (req, res) => {
    try {
        const userId = req.userId;
        const { nuevoPlanId } = req.body;
        
        if (!nuevoPlanId) {
            return res.status(400).json({ message: 'Debe especificar el nuevo plan' });
        }
        
        const client = await Client.findOne({ where: { user_id: userId } });
        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        
        const plan = await Plan.findByPk(nuevoPlanId);
        if (!plan || !plan.activo) {
            return res.status(404).json({ message: 'El plan seleccionado no existe o no está activo' });
        }
        
        if (client.plan_id === Number(nuevoPlanId)) {
            return res.status(400).json({ message: 'Ya tienes contratado este plan actualmente' });
        }
        
        await client.update({ plan_id: nuevoPlanId });
        logger.info(`✅ Cliente ID ${client.id} cambió su plan a: ${plan.nombre} (ID: ${plan.id})`);
        
        res.json({
            success: true,
            message: `Plan actualizado correctamente a ${plan.nombre}`,
            plan: {
                id: plan.id,
                nombre: plan.nombre,
                velocidad: plan.velocidad,
                precio: plan.precio,
                descripcion: plan.descripcion
            }
        });
    } catch (error) {
        logger.error('Error cambiando plan del cliente:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Pagar factura (Simulada - HU14)
exports.pagarFactura = async (req, res) => {
    try {
        const { facturaId } = req.body;
        const userId = req.userId;
        
        if (!facturaId) {
            return res.status(400).json({ message: 'ID de factura requerido' });
        }
        
        const client = await Client.findOne({ where: { user_id: userId } });
        
        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        
        const factura = await Invoice.findOne({
            where: { id: facturaId, cliente_id: client.id }
        });
        
        if (!factura) {
            return res.status(404).json({ message: 'Factura no encontrada para este cliente' });
        }
        
        if (factura.estado === 'pagada') {
            return res.status(400).json({ message: 'Esta factura ya se encuentra pagada' });
        }
        
        // Actualizar factura
        const fechaPago = new Date();
        await factura.update({
            estado: 'pagada',
            fecha_pago: fechaPago
        });
        
        logger.info(`✅ Factura ${facturaId} pagada exitosamente de forma simulada por cliente ${client.id}`);
        
        res.json({
            success: true,
            message: 'Pago simulado realizado exitosamente',
            factura: {
                id: factura.id,
                monto: factura.monto,
                estado: 'pagada',
                fecha_emision: factura.fecha_emision,
                fecha_vencimiento: factura.fecha_vencimiento,
                fecha_pago: fechaPago
            }
        });
    } catch (error) {
        logger.error('Error en pago simulado:', error);
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