const { Plan } = require('../../../domain/entities');
const logger = require('../../http/middlewares/logger');

// Obtener todos los planes
exports.getPlanes = async (req, res) => {
    try {
        const planes = await Plan.findAll({
            order: [['id', 'ASC']]
        });
        res.json(planes);
    } catch (error) {
        logger.error('Error obteniendo planes:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Obtener un plan por ID
exports.getPlanById = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await Plan.findByPk(id);
        
        if (!plan) {
            return res.status(404).json({ message: 'Plan no encontrado' });
        }
        
        res.json(plan);
    } catch (error) {
        logger.error('Error obteniendo plan:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Crear nuevo plan
exports.crearPlan = async (req, res) => {
    try {
        const { nombre, velocidad, precio, descripcion, activo } = req.body;
        
        const plan = await Plan.create({
            nombre,
            velocidad,
            precio,
            descripcion,
            activo: activo !== undefined ? activo : true
        });
        
        logger.info(`Plan creado: ${plan.nombre} (ID: ${plan.id})`);
        res.status(201).json(plan);
    } catch (error) {
        logger.error('Error creando plan:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Actualizar plan
exports.actualizarPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, velocidad, precio, descripcion, activo } = req.body;
        
        const plan = await Plan.findByPk(id);
        
        if (!plan) {
            return res.status(404).json({ message: 'Plan no encontrado' });
        }
        
        await plan.update({
            nombre: nombre || plan.nombre,
            velocidad: velocidad || plan.velocidad,
            precio: precio !== undefined ? precio : plan.precio,
            descripcion: descripcion !== undefined ? descripcion : plan.descripcion,
            activo: activo !== undefined ? activo : plan.activo
        });
        
        logger.info(`Plan actualizado: ${plan.nombre} (ID: ${plan.id})`);
        res.json(plan);
    } catch (error) {
        logger.error('Error actualizando plan:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Eliminar plan (soft delete - desactivar)
exports.eliminarPlan = async (req, res) => {
    try {
        const { id } = req.params;
        
        const plan = await Plan.findByPk(id);
        
        if (!plan) {
            return res.status(404).json({ message: 'Plan no encontrado' });
        }
        
        // Soft delete: desactivar en lugar de eliminar físicamente
        await plan.update({ activo: false });
        
        logger.info(`Plan desactivado: ${plan.nombre} (ID: ${plan.id})`);
        res.json({ message: 'Plan desactivado correctamente' });
    } catch (error) {
        logger.error('Error eliminando plan:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};