const winston = require('winston');
const path = require('path');

// Definir niveles personalizados
const niveles = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// Definir colores para cada nivel
winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white'
});

// Formato personalizado para los logs
const formatoPersonalizado = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        
        // Si hay metadata, agregarla al log
        if (Object.keys(meta).length > 0 && meta.stack !== undefined) {
            log += `\n${meta.stack}`;
        } else if (Object.keys(meta).length > 0) {
            log += `\n${JSON.stringify(meta, null, 2)}`;
        }
        
        return log;
    })
);

// Crear el logger
const logger = winston.createLogger({
    levels: niveles,
    format: formatoPersonalizado,
    transports: [
        // Console transport (para ver en terminal)
        new winston.transports.Console({
            level: 'debug',
            format: formatoPersonalizado
        }),
        
        // File transport - Todos los logs
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/combined.log'),
            level: 'debug',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: winston.format.uncolorize()
        }),
        
        // File transport - Solo errores
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: winston.format.uncolorize()
        }),
        
        // File transport - Peticiones HTTP
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/http.log'),
            level: 'http',
            maxsize: 5242880,
            maxFiles: 5,
            format: winston.format.uncolorize()
        })
    ],
    // No salir del proceso si hay error en logs
    exitOnError: false
});

// Crear un stream para Morgan (middleware HTTP)
logger.stream = {
    write: (message) => {
        logger.http(message.trim());
    }
};

module.exports = logger;