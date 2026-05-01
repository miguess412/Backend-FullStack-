const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

// Importaciones desde las nuevas ubicaciones
const logger = require('./infrastructure/http/middlewares/logger');
const morganMiddleware = require('./infrastructure/http/middlewares/morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./infrastructure/http/middlewares/swagger');
const { sequelize, testConnection } = require('./infrastructure/database/sequelize');
const pagoRoutes = require('./infrastructure/http/routes/pago.routes');

// Importar rutas
const authRoutes = require('./infrastructure/http/routes/auth.routes');
const dashboardRoutes = require('./infrastructure/http/routes/dashboard.routes');
const clienteRoutes = require('./infrastructure/http/routes/cliente.routes');
const clientesRoutes = require('./infrastructure/http/routes/admin/clientes.routes');
const reportesRoutes = require('./infrastructure/http/routes/reportes.routes');
const ticketRoutes = require('./infrastructure/http/routes/ticket.routes');


// CREAR APLICACIÓN EXPRESS
const app = express();
const PORT = process.env.PORT || 3000;

logger.info('🚀 Iniciando servidor ISP-Manager...');
logger.info('📡 Configurando rutas de la API...');


// MIDDLEWARES
app.use(morganMiddleware);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// SERVIDOR DE ARCHIVOS ESTÁTICOS (PDFs)
// Servir archivos estáticos de la carpeta reports
const reportsPath = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsPath)) {
    fs.mkdirSync(reportsPath, { recursive: true });
}
app.use('/reports', express.static(reportsPath));

// Agregar un log para verificar
logger.info(`📁 Carpeta de reports: ${reportsPath}`);

// SWAGGER - Documentación de API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
logger.info('📚 Swagger UI disponible en http://localhost:3000/api-docs');


// RUTAS DE LA API
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/admin/clientes', clientesRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/pago', pagoRoutes);
app.use('/api/tickets', ticketRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: '🚀 API de ISP-Manager funcionando' });
});


// INICIAR SERVIDOR
const startServer = async () => {
    try {
        logger.info('🔄 Probando conexión a MySQL...');
        await testConnection();
        logger.info('✅ Conexión a MySQL establecida correctamente');
        
        logger.info('🔄 Sincronizando modelos...');
        await sequelize.sync({ alter: false });
        logger.info('✅ Modelos sincronizados');
        
        app.listen(PORT, () => {
            logger.info(`✅ Servidor corriendo en http://localhost:${PORT}`);
            logger.info('📋 Logs disponibles en:');
            logger.info('   - Consola (terminal)');
            logger.info('   - logs/combined.log (todos los logs)');
            logger.info('   - logs/error.log (solo errores)');
            logger.info('   - logs/http.log (peticiones HTTP)');
        });
    } catch (error) {
        logger.error('❌ Error iniciando servidor:', error);
        process.exit(1);
    }
};

startServer();

// MANEJO DE ERRORES NO CAPTURADOS
process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Unhandled Rejection:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('❌ Uncaught Exception:', error);
    process.exit(1);
});