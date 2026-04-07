const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ISP-Manager API',
            version: '1.0.0',
            description: 'API para gestión de ISP-Manager'
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de desarrollo'
            }
        ]
    },
    apis: [
        './routes/*.js',
        './routes/admin/*.js',
        './routes/cliente/*.js']
    
};

module.exports = swaggerJsdoc(options);