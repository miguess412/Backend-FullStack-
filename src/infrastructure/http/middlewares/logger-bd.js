const mysql = require('mysql2/promise');

let connection = null;

// Función para obtener conexión (singleton)
async function getConnection() {
    if (!connection) {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'isp_manager_db'
        });
    }
    return connection;
}

// Función principal para guardar logs importantes en BD
async function guardarLogBD(nivel, mensaje, datos = {}) {
    try {
        const conn = await getConnection();
        await conn.execute(
            `INSERT INTO logs_importantes 
            (nivel, mensaje, usuario_id, email, ip, endpoint, metodo) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                nivel,
                mensaje,
                datos.usuarioId || null,
                datos.email || null,
                datos.ip || null,
                datos.endpoint || null,
                datos.metodo || null
            ]
        );
    } catch (error) {
        // No usar logger aquí para evitar bucles infinitos
        console.error('❌ Error guardando log en BD:', error.message);
    }
}

// ============================================
// MÉTODOS PARA DIFERENTES EVENTOS
// ============================================

// Registro de LOGIN EXITOSO
async function loginExitoso(email, req, usuarioId) {
    const mensaje = `✅ LOGIN EXITOSO: ${email}`;
    guardarLogBD('info_audit', mensaje, {
        usuarioId: usuarioId,
        email: email,
        ip: req?.ip || req?.connection?.remoteAddress,
        endpoint: req?.originalUrl,
        metodo: req?.method
    });
}

// Registro de LOGIN FALLIDO
async function loginFallido(email, req) {
    const mensaje = `❌ LOGIN FALLIDO: ${email}`;
    guardarLogBD('warn', mensaje, {
        email: email,
        ip: req?.ip || req?.connection?.remoteAddress,
        endpoint: req?.originalUrl,
        metodo: req?.method
    });
}

// Registro de CLIENTE CREADO
async function clienteCreado(cliente, adminId, adminEmail, req) {
    const mensaje = `👤 CLIENTE CREADO: ${cliente.nombre} (${cliente.email}) por admin: ${adminEmail}`;
    guardarLogBD('info_audit', mensaje, {
        usuarioId: adminId,
        email: adminEmail,
        ip: req?.ip,
        endpoint: req?.originalUrl,
        metodo: req?.method
    });
}

// Registro de CLIENTE ACTUALIZADO
async function clienteActualizado(clienteId, adminId, adminEmail, req) {
    const mensaje = `✏️ CLIENTE ACTUALIZADO: ID ${clienteId} por admin: ${adminEmail}`;
    guardarLogBD('info_audit', mensaje, {
        usuarioId: adminId,
        email: adminEmail,
        ip: req?.ip,
        endpoint: req?.originalUrl,
        metodo: req?.method
    });
}

// Registro de CLIENTE ELIMINADO
async function clienteEliminado(clienteId, clienteEmail, adminId, adminEmail, req) {
    const mensaje = `🗑️ CLIENTE ELIMINADO: ID ${clienteId} - ${clienteEmail} por admin: ${adminEmail}`;
    guardarLogBD('info_audit', mensaje, {
        usuarioId: adminId,
        email: adminEmail,
        ip: req?.ip,
        endpoint: req?.originalUrl,
        metodo: req?.method
    });
}

// Registro de ERROR en el sistema
async function errorSistema(errorMsg, req, usuarioEmail = null) {
    const mensaje = `⚠️ ERROR: ${errorMsg}`;
    guardarLogBD('error', mensaje, {
        email: usuarioEmail,
        ip: req?.ip,
        endpoint: req?.originalUrl,
        metodo: req?.method
    });
}

module.exports = {
    loginExitoso,
    loginFallido,
    clienteCreado,
    clienteActualizado,
    clienteEliminado,
    errorSistema,
    guardarLogBD
};