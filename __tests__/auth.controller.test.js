const authController = require('../src/infrastructure/http/controllers/auth.controller');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../src/domain/entities');
const loggerBD = require('../src/infrastructure/http/middlewares/logger-bd');

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../src/domain/entities', () => ({
    User: {
        findOne: jest.fn()
    },
    Role: {}
}));
jest.mock('../src/infrastructure/http/middlewares/logger-bd', () => ({
    loginFallido: jest.fn(),
    loginExitoso: jest.fn(),
    errorSistema: jest.fn()
}));

describe('Auth Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: { email: 'test@example.com', password: 'password123' },
            ip: '127.0.0.1',
            originalUrl: '/api/auth/login',
            method: 'POST'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    it('debe retornar 401 si el usuario no existe', async () => {
        User.findOne.mockResolvedValue(null);

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Credenciales incorrectas' });
        expect(loggerBD.loginFallido).toHaveBeenCalled();
    });

    it('debe retornar 401 si la contraseña es incorrecta', async () => {
        const mockUser = { email: 'test@example.com', password_hash: 'hash' };
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Credenciales incorrectas' });
        expect(loggerBD.loginFallido).toHaveBeenCalled();
    });

    it('debe retornar 200 y token si las credenciales son válidas', async () => {
        const mockUser = {
            id: 1,
            nombre: 'Admin',
            email: 'test@example.com',
            password_hash: 'hash',
            telefono: '12345',
            Role: { nombre: 'admin' }
        };
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('mocktoken');

        await authController.login(req, res);

        expect(res.json).toHaveBeenCalledWith({
            token: 'mocktoken',
            user: {
                id: 1,
                nombre: 'Admin',
                email: 'test@example.com',
                rol: 'admin',
                telefono: '12345'
            }
        });
        expect(loggerBD.loginExitoso).toHaveBeenCalled();
    });

    it('debe retornar 500 si ocurre una excepción', async () => {
        User.findOne.mockRejectedValue(new Error('DB Error'));

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error del servidor' });
        expect(loggerBD.errorSistema).toHaveBeenCalled();
    });
});
