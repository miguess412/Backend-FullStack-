const request = require('supertest');
const app = require('../src/server');

describe('Pruebas End-to-End (E2E) - Ciclo Completo de Vida de la Aplicación', () => {
    let clientToken = '';
    let adminToken = '';
    let ticketCreadoId = null;
    let backupNombre = '';

    test('Paso 1 (E2E): Inicio de sesión del Cliente y obtención de Token', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'cliente@isp.com', password: 'cliente123' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        clientToken = response.body.token;
    });

    test('Paso 2 (E2E): Cliente crea un nuevo Ticket de Soporte Técnico', async () => {
        const response = await request(app)
            .post('/api/tickets/crear')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                asunto: 'Prueba E2E: Microcortes en la fibra',
                descripcion: 'La conexión se interrumpe cada 30 minutos.',
                prioridad: 'alta'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.estado).toBe('abierto');
        ticketCreadoId = response.body.id;
    });

    test('Paso 3 (E2E): Cliente consulta "Mis Tickets" y verifica el ticket creado', async () => {
        const response = await request(app)
            .get('/api/tickets/mis-tickets')
            .set('Authorization', `Bearer ${clientToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);

        const ticket = response.body.find(t => t.id === ticketCreadoId);
        expect(ticket).toBeDefined();
        expect(ticket.asunto).toBe('Prueba E2E: Microcortes en la fibra');
        expect(ticket.estado).toBe('abierto');
    });

    test('Paso 4 (E2E): Inicio de sesión del Administrador', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@isp.com', password: 'admin123' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        adminToken = response.body.token;
    });

    test('Paso 5 (E2E): Administrador visualiza todos los tickets del sistema', async () => {
        const response = await request(app)
            .get('/api/tickets/todos')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);

        const ticket = response.body.find(t => t.id === ticketCreadoId);
        expect(ticket).toBeDefined();
    });

    test('Paso 6 (E2E): Administrador responde al ticket y cambia estado a "resuelto"', async () => {
        const respuestaSoporte = 'Se calibró el canal de subida en la OLT remota. Conexión estabilizada.';
        const response = await request(app)
            .put(`/api/tickets/${ticketCreadoId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                estado: 'resuelto',
                respuesta: respuestaSoporte
            });

        expect(response.status).toBe(200);
        expect(response.body.estado).toBe('resuelto');
        expect(response.body.respuesta).toBe(respuestaSoporte);
    });

    test('Paso 7 (E2E): Cliente comprueba la solución técnica y estado resuelto en tiempo real', async () => {
        const response = await request(app)
            .get('/api/tickets/mis-tickets')
            .set('Authorization', `Bearer ${clientToken}`);

        expect(response.status).toBe(200);
        const ticket = response.body.find(t => t.id === ticketCreadoId);

        expect(ticket).toBeDefined();
        expect(ticket.estado).toBe('resuelto');
        expect(ticket.respuesta).toContain('Se calibró el canal de subida');
    });

    test('Paso 8 (E2E): Administrador genera copia de seguridad (backup .sql) y verifica su registro', async () => {
        // Crear backup
        const resCrear = await request(app)
            .post('/api/admin/backups/crear')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(resCrear.status).toBe(201);
        expect(resCrear.body.success).toBe(true);
        expect(resCrear.body.backup).toHaveProperty('nombre');
        expect(resCrear.body.backup.tablas).toBe(6);
        backupNombre = resCrear.body.backup.nombre;

        // Listar backups y verificar que está disponible
        const resListar = await request(app)
            .get('/api/admin/backups')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(resListar.status).toBe(200);
        const backupExiste = resListar.body.some(b => b.nombre === backupNombre);
        expect(backupExiste).toBe(true);
    });

    afterAll(async () => {
        const { sequelize } = require('../src/infrastructure/database/sequelize');
        await sequelize.close();
    });
});
