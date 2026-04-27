const express = require('express');
const cors = require('cors');
require('dotenv').config();

const logger = require('./config/logger');
const morganMiddleware = require('./config/morgan');

const { sequelize, testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES CON LOGS
// ============================================

// Log de peticiones HTTP (Morgan + Winston)
app.use(morganMiddleware);

// Log de inicio de la app
logger.info('🚀 Iniciando servidor ISP-Manager...');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// SWAGGER - Documentación de API
// ============================================
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============================================
// RUTAS
// ============================================
logger.info('📡 Configurando rutas de la API...');

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/cliente', require('./routes/cliente.routes'));
app.use('/api/admin/clientes', require('./routes/admin/clientes.routes'));

// Ruta de prueba
app.get('/', (req, res) => {
    logger.info(`Petición GET a / desde ${req.ip}`);
    res.json({ message: '🚀 API de ISP-Manager funcionando' });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
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

// ============================================
// MANEJO DE ERRORES NO CAPTURADOS
// ============================================
process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('❌ Uncaught Exception:', error);
    process.exit(1);
});