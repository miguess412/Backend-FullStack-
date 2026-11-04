const request = require('supertest');
const app = require('../src/server');

describe('Pruebas de Caminos Negativos (Negative Path Testing)', () => {
    let clientToken = '';

    beforeAll(async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'cliente@isp.com', password: 'cliente123' });
        clientToken = res.body.token;
    });

    afterAll(async () => {
        const { sequelize } = require('../src/infrastructure/database/sequelize');
        await sequelize.close();
    });

    test('1. Camino Negativo: Login con contraseña incorrecta -> 401 Unauthorized', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'cliente@isp.com', password: 'password_totalmente_erronea' });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message.toLowerCase()).toContain('credenciales');
    });

    test('2. Camino Negativo: Login con email no registrado -> 401 Unauthorized', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'usuario_fantasma_999@isp.com', password: 'password123' });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message');
    });

    test('3. Camino Negativo: Petición a endpoint protegido sin Token -> 401 Unauthorized', async () => {
        const response = await request(app)
            .get('/api/cliente/consumo');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('No se proporcionó token');
    });

    test('4. Camino Negativo: Token malformado o adulterado -> 401 Unauthorized', async () => {
        const response = await request(app)
            .get('/api/cliente/consumo')
            .set('Authorization', 'Bearer token_invalido_hacked_xyz');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Token inválido');
    });

    test('5. Camino Negativo: Cliente intenta acceder a Backups de Administrador -> 403 Forbidden', async () => {
        const response = await request(app)
            .get('/api/admin/backups')
            .set('Authorization', `Bearer ${clientToken}`);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('administrador');
    });

    test('6. Camino Negativo: Creación de ticket con asunto vacío -> 400 Bad Request', async () => {
        const response = await request(app)
            .post('/api/tickets/crear')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                asunto: '',
                descripcion: 'Descripción sin asunto',
                prioridad: 'media'
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('obligatorios');
    });

    test('7. Camino Negativo: Consulta de plan inexistente por ID (ID: 999999) -> 404 Not Found', async () => {
        const response = await request(app)
            .get('/api/planes/999999')
            .set('Authorization', `Bearer ${clientToken}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Plan no encontrado');
    });
});
