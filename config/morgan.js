const morgan = require('morgan');
const logger = require('./logger');

// Definir el formato de logs
const stream = {
  write: (message) => logger.info(message.trim())
};

// Skip logs en tests o en producción si se desea
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'test';
};

// Middleware de morgan con Winston
const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

module.exports = morganMiddleware;