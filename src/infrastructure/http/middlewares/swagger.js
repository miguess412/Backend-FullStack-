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
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    // ACTUALIZA LAS RUTAS A LAS NUEVAS UBICACIONES
    apis: [
        './src/infrastructure/http/routes/*.js',
        './src/infrastructure/http/routes/admin/*.js'
    ]
};

module.exports = swaggerJsdoc(options);