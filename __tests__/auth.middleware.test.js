const { verifyToken, isAdmin } = require('../src/infrastructure/http/middlewares/auth.middleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe('verifyToken', () => {
        it('debe retornar 401 si no hay token', () => {
            verifyToken(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'No se proporcionó token' });
            expect(next).not.toHaveBeenCalled();
        });

        it('debe llamar a next y decodificar el token si es válido', () => {
            req.headers['authorization'] = 'Bearer validtoken';
            const decoded = { id: 1, rol: 'admin' };
            jwt.verify.mockReturnValue(decoded);

            verifyToken(req, res, next);

            expect(req.userId).toBe(1);
            expect(req.userRol).toBe('admin');
            expect(next).toHaveBeenCalled();
        });

        it('debe retornar 401 si el token es inválido', () => {
            req.headers['authorization'] = 'Bearer invalidtoken';
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            verifyToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('isAdmin', () => {
        it('debe retornar 403 si el rol no es admin', () => {
            req.userRol = 'cliente';
            isAdmin(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Se requiere rol de administrador' });
            expect(next).not.toHaveBeenCalled();
        });

        it('debe llamar a next si el rol es admin', () => {
            req.userRol = 'admin';
            isAdmin(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });
});
