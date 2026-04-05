const { User, Client, Plan } = require('../../models');
const bcrypt = require('bcryptjs');

// Obtener todos los clientes
exports.getClientes = async (req, res) => {
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
        
        res.json(resultado);
    } catch (error) {
        console.error('Error en getClientes:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Crear nuevo cliente
exports.crearCliente = async (req, res) => {
    try {
        const { nombre, email, password, telefono, direccion, ciudad, plan_id } = req.body;
        
        // Verificar si el email ya existe
        const existeUsuario = await User.findOne({ where: { email } });
        if (existeUsuario) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }
        
        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        // Crear el usuario (rol_id = 2 es cliente)
        const usuario = await User.create({
            nombre,
            email,
            password_hash,
            rol_id: 2,
            telefono,
            activo: true
        });
        
        // Crear el cliente asociado al usuario
        const cliente = await Client.create({
            user_id: usuario.id,
            direccion,
            ciudad,
            fecha_registro: new Date(),
            plan_id: plan_id || null
        });
        
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
        console.error('Error en crearCliente:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Actualizar cliente
exports.actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, telefono, direccion, ciudad, plan_id, activo, password } = req.body;
        
        // Buscar el cliente
        const cliente = await Client.findByPk(id);
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        
        // Preparar datos del usuario
        const userData = { nombre, email, telefono, activo };
        
        // Si se proporcionó una nueva contraseña, encriptarla
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            userData.password_hash = await bcrypt.hash(password, salt);
        }
        
        // Actualizar el usuario asociado
        await User.update(userData, { where: { id: cliente.user_id } });
        
        // Actualizar el cliente
        await cliente.update({ direccion, ciudad, plan_id });
        
        res.json({ message: 'Cliente actualizado correctamente' });
        
    } catch (error) {
        console.error('Error en actualizarCliente:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Eliminar cliente
exports.eliminarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Buscar el cliente
        const cliente = await Client.findByPk(id);
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        
        // Eliminar el usuario (en cascada se elimina el cliente también)
        await User.destroy({ where: { id: cliente.user_id } });
        
        res.json({ message: 'Cliente eliminado correctamente' });
        
    } catch (error) {
        console.error('Error en eliminarCliente:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};