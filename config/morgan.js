const morgan = require('morgan');
const logger = require('./logger');

// Configurar Morgan para usar Winston
const morganMiddleware = morgan(
    ':method :url :status :response-time ms - :res[content-length]',
    {
        stream: logger.stream,
        skip: (req, res) => {
            // Omitir logs de health checks o rutas que no queremos
            return req.url === '/health' || req.url === '/favicon.ico';
        }
    }
);

module.exports = morganMiddleware;