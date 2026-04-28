const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importaciones desde las nuevas ubicaciones
const logger = require('./infrastructure/http/middlewares/logger');
const morganMiddleware = require('./infrastructure/http/middlewares/morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./infrastructure/http/middlewares/swagger');
const { sequelize, testConnection } = require('./infrastructure/database/sequelize');

// Importar rutas
const authRoutes = require('./infrastructure/http/routes/auth.routes');
const dashboardRoutes = require('./infrastructure/http/routes/dashboard.routes');
const clienteRoutes = require('./infrastructure/http/routes/cliente.routes');
const clientesRoutes = require('./infrastructure/http/routes/admin/clientes.routes');

const app = express();
const PORT = process.env.PORT || 3000;

logger.info('🚀 Iniciando servidor ISP-Manager...');
logger.info('📡 Configurando rutas de la API...');

// Middlewares
app.use(morganMiddleware);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger - Documentación de API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
logger.info('📚 Swagger UI disponible en http://localhost:3000/api-docs');

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/admin/clientes', clientesRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: '🚀 API de ISP-Manager funcionando' });
});

// Iniciar servidor
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

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Unhandled Rejection:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('❌ Uncaught Exception:', error);
    process.exit(1);
});