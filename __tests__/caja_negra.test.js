const request = require('supertest');
const app = require('../src/server');

describe('Pruebas de Caja Negra (Black-box Testing) - API REST', () => {
    let clientToken = '';
    let adminToken = '';

    beforeAll(async () => {
        // Autenticación como cliente
        const resCliente = await request(app)
            .post('/api/auth/login')
            .send({ email: 'cliente@isp.com', password: 'cliente123' });
        clientToken = resCliente.body.token;

        // Autenticación como admin
        const resAdmin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@isp.com', password: 'admin123' });
        adminToken = resAdmin.body.token;
    });

    afterAll(async () => {
        const { sequelize } = require('../src/infrastructure/database/sequelize');
        await sequelize.close();
    });

    test('1. [Caja Negra] Healthcheck - GET /health debe responder 200 y status ok', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('timestamp');
    });

    test('2. [Caja Negra] Login exitoso - POST /api/auth/login debe retornar 200 y token JWT', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@isp.com', password: 'admin123' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.email).toBe('admin@isp.com');
    });

    test('3. [Caja Negra] Listar Planes - GET /api/planes debe responder 200 con un array', async () => {
        const response = await request(app)
            .get('/api/planes')
            .set('Authorization', `Bearer ${clientToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('nombre');
        expect(response.body[0]).toHaveProperty('precio');
    });

    test('4. [Caja Negra] Consumo de Cliente - GET /api/cliente/consumo debe responder 200 con estructura de consumo', async () => {
        const response = await request(app)
            .get('/api/cliente/consumo')
            .set('Authorization', `Bearer ${clientToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('gigasConsumidos');
        expect(response.body).toHaveProperty('gigasTotales');
        expect(response.body).toHaveProperty('porcentajeConsumo');
        expect(response.body).toHaveProperty('diasRestantesCiclo');
    });

    test('5. [Caja Negra] Listar Backups como Admin - GET /api/admin/backups debe responder 200', async () => {
        const response = await request(app)
            .get('/api/admin/backups')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});
