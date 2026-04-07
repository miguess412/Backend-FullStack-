const { User, Client, Plan } = require('../../models');
const bcrypt = require('bcryptjs');
const logger = require('../../config/logger');

// Obtener todos los clientes
exports.getClientes = async (req, res) => {
    const userId = req.userId;
    logger.info(`📋 Usuario ${userId} solicitó lista de clientes`);
    
    try {
        const clientes = await Client.findAll({
            include: [
                { 
                    model: User, 
                    attributes: ['id', 'nombre', 'email', 'telefono', 'activo'] 
                },
                { 
                    model: Plan, 
                    attributes: ['id', 'nombre', 'velocidad', 'precio'] 
                }
            ]
        });
        
        const resultado = clientes.map(c => ({
            id: c.id,
            nombre: c.User.nombre,
            email: c.User.email,
            telefono: c.User.telefono,
            direccion: c.direccion,
            ciudad: c.ciudad,
            fecha_registro: c.fecha_registro,
            activo: c.User.activo,
            plan: c.Plan ? {
                id: c.Plan.id,
                nombre: c.Plan.nombre,
                velocidad: c.Plan.velocidad,
                precio: c.Plan.precio
            } : null
        }));
        
        logger.info(`✅ Lista de clientes enviada - Total: ${resultado.length} clientes`);
        res.json(resultado);
        
    } catch (error) {
        logger.error(`❌ Error al obtener clientes - Usuario: ${userId}`, error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Crear nuevo cliente
exports.crearCliente = async (req, res) => {
    const userId = req.userId;
    const { nombre, email, password, telefono, direccion, ciudad, plan_id } = req.body;
    
    logger.info(`👤 Usuario ${userId} intenta crear nuevo cliente: ${nombre} (${email})`);
    
    try {
        const existeUsuario = await User.findOne({ where: { email } });
        if (existeUsuario) {
            logger.warn(`⚠️ Intento de crear cliente con email existente: ${email}`);
            return res.status(400).json({ message: 'El email ya está registrado' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        const usuario = await User.create({
            nombre,
            email,
            password_hash,
            rol_id: 2,
            telefono,
            activo: true
        });
        
        const cliente = await Client.create({
            user_id: usuario.id,
            direccion,
            ciudad,
            fecha_registro: new Date(),
            plan_id: plan_id || null
        });
        
        logger.info(`✅ Cliente creado exitosamente: ${nombre} (${email}) - ID: ${cliente.id}`);
        res.status(201).json({
            id: cliente.id,
            nombre: usuario.nombre,
            email: usuario.email,
            telefono: usuario.telefono,
            direccion: cliente.direccion,
            ciudad: cliente.ciudad,
            plan_id: cliente.plan_id
        });
        
    } catch (error) {
        logger.error(`❌ Error al crear cliente ${email}:`, error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Actualizar cliente
exports.actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    const { nombre, email, telefono, direccion, ciudad, plan_id, activo, password } = req.body;
    
    logger.info(`✏️ Usuario ${userId} intenta actualizar cliente ID: ${id}`);
    
    try {
        const cliente = await Client.findByPk(id);
        if (!cliente) {
            logger.warn(`⚠️ Intento de actualizar cliente inexistente ID: ${id}`);
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        
        const userData = { nombre, email, telefono, activo };
        
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            userData.password_hash = await bcrypt.hash(password, salt);
            logger.info(`🔐 Contraseña actualizada para cliente ID: ${id}`);
        }
        
        await User.update(userData, { where: { id: cliente.user_id } });
        await cliente.update({ direccion, ciudad, plan_id });
        
        logger.info(`✅ Cliente ID ${id} actualizado correctamente por usuario ${userId}`);
        res.json({ message: 'Cliente actualizado correctamente' });
        
    } catch (error) {
        logger.error(`❌ Error al actualizar cliente ID ${id}:`, error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Eliminar cliente
exports.eliminarCliente = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    
    logger.warn(`⚠️ Usuario ${userId} intenta eliminar cliente ID: ${id}`);
    
    try {
        const cliente = await Client.findByPk(id);
        if (!cliente) {
            logger.warn(`⚠️ Intento de eliminar cliente inexistente ID: ${id}`);
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        
        await User.destroy({ where: { id: cliente.user_id } });
        
        logger.warn(`🗑️ Cliente ID ${id} eliminado por usuario ${userId}`);
        res.json({ message: 'Cliente eliminado correctamente' });
        
    } catch (error) {
        logger.error(`❌ Error al eliminar cliente ID ${id}:`, error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};