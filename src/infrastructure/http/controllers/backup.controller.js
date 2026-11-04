const fs = require('fs');
const path = require('path');
const { sequelize } = require('../../../infrastructure/database/sequelize');
const logger = require('../middlewares/logger');

const backupsDir = path.join(__dirname, '../../../../backups');

// Asegurar que la carpeta de backups exista
if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
}

// Tablas a respaldar en orden
const TABLES = ['roles', 'users', 'planes', 'clientes', 'facturas', 'tickets_soporte'];

// Formatear tamaño de archivo en bytes a KB/MB
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 1. Crear nuevo backup de la base de datos
exports.crearBackup = async (req, res) => {
    try {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-');
        const filename = `backup_isp_manager_${timestamp}.sql`;
        const filePath = path.join(backupsDir, filename);

        let sqlContent = `-- ========================================================\n`;
        sqlContent += `-- ISP-Manager - Copia de Seguridad de Base de Datos\n`;
        sqlContent += `-- Fecha de generación: ${now.toLocaleString('es-CO')}\n`;
        sqlContent += `-- Base de datos: isp_manager\n`;
        sqlContent += `-- Generado por usuario ID: ${req.userId || 'admin'}\n`;
        sqlContent += `-- ========================================================\n\n`;
        sqlContent += `SET FOREIGN_KEY_CHECKS = 0;\n`;
        sqlContent += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n`;
        sqlContent += `SET time_zone = "+00:00";\n\n`;

        let totalRegistros = 0;

        for (const table of TABLES) {
            // 1. Obtener DDL (CREATE TABLE)
            const [createTableResult] = await sequelize.query(`SHOW CREATE TABLE \`${table}\``);
            const createTableSql = createTableResult[0]['Create Table'] || createTableResult[0]['Create Table\n'];

            sqlContent += `-- --------------------------------------------------------\n`;
            sqlContent += `-- Estructura y datos de la tabla \`${table}\`\n`;
            sqlContent += `-- --------------------------------------------------------\n\n`;
            sqlContent += `DROP TABLE IF EXISTS \`${table}\`;\n`;
            sqlContent += `${createTableSql};\n\n`;

            // 2. Obtener todos los registros
            const [rows] = await sequelize.query(`SELECT * FROM \`${table}\``);
            totalRegistros += rows.length;

            if (rows.length > 0) {
                const columns = Object.keys(rows[0]).map(col => `\`${col}\``).join(', ');
                sqlContent += `INSERT INTO \`${table}\` (${columns}) VALUES\n`;

                const valuesArr = rows.map(row => {
                    const rowValues = Object.values(row).map(val => sequelize.escape(val)).join(', ');
                    return `(${rowValues})`;
                });

                sqlContent += valuesArr.join(',\n') + ';\n\n';
            }
        }

        sqlContent += `SET FOREIGN_KEY_CHECKS = 1;\n`;
        sqlContent += `-- ========================================================\n`;
        sqlContent += `-- Fin del Respaldo: ${TABLES.length} tablas, ${totalRegistros} registros\n`;
        sqlContent += `-- ========================================================\n`;

        fs.writeFileSync(filePath, sqlContent, 'utf8');
        const stats = fs.statSync(filePath);

        logger.info(`✅ Backup de base de datos generado exitosamente: ${filename} (${formatBytes(stats.size)})`);

        res.status(201).json({
            success: true,
            message: 'Copia de seguridad generada exitosamente',
            backup: {
                nombre: filename,
                tamanoBytes: stats.size,
                tamano: formatBytes(stats.size),
                fecha: stats.mtime,
                tablas: TABLES.length,
                totalRegistros
            }
        });
    } catch (error) {
        logger.error('Error generando backup:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar la copia de seguridad',
            error: error.message
        });
    }
};

// 2. Listar todos los backups disponibles
exports.listarBackups = async (req, res) => {
    try {
        if (!fs.existsSync(backupsDir)) {
            return res.json([]);
        }

        const files = fs.readdirSync(backupsDir)
            .filter(file => file.endsWith('.sql'))
            .map(file => {
                const filePath = path.join(backupsDir, file);
                const stats = fs.statSync(filePath);
                return {
                    nombre: file,
                    tamanoBytes: stats.size,
                    tamano: formatBytes(stats.size),
                    fecha: stats.mtime
                };
            })
            .sort((a, b) => b.fecha - a.fecha);

        res.json(files);
    } catch (error) {
        logger.error('Error listando backups:', error);
        res.status(500).json({ message: 'Error al listar copias de seguridad' });
    }
};

// 3. Descargar un archivo de backup
exports.descargarBackup = async (req, res) => {
    try {
        const { nombre } = req.params;
        const sanitized = path.basename(nombre);
        const filePath = path.join(backupsDir, sanitized);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Archivo de copia de seguridad no encontrado' });
        }

        logger.info(`Descargando backup: ${sanitized}`);
        res.download(filePath, sanitized);
    } catch (error) {
        logger.error('Error descargando backup:', error);
        res.status(500).json({ message: 'Error al descargar la copia de seguridad' });
    }
};

// 4. Eliminar un archivo de backup
exports.eliminarBackup = async (req, res) => {
    try {
        const { nombre } = req.params;
        const sanitized = path.basename(nombre);
        const filePath = path.join(backupsDir, sanitized);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Archivo no encontrado' });
        }

        fs.unlinkSync(filePath);
        logger.info(`Backup eliminado: ${sanitized}`);

        res.json({
            success: true,
            message: 'Copia de seguridad eliminada exitosamente'
        });
    } catch (error) {
        logger.error('Error eliminando backup:', error);
        res.status(500).json({ message: 'Error al eliminar la copia de seguridad' });
    }
};
