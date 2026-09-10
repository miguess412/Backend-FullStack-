const { Sequelize } = require('sequelize');
const logger = require('./logger');

// Configuración de la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME || 'isp_manager',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Conexión a MySQL establecida correctamente');
    return true;
  } catch (error) {
    logger.error('❌ Error al conectar con MySQL:', error);
    throw error;
  }
};

// EXPORTAR correctamente
module.exports = {
  sequelize: sequelize,
  testConnection: testConnection
};