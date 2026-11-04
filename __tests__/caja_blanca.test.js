require('dotenv').config();
const { verifyToken, isAdmin } = require('../src/infrastructure/http/middlewares/auth.middleware');
const validators = require('../src/utils/validators');
const jwt = require('jsonwebtoken');

describe('Pruebas de Caja Blanca (White-box Testing) - Cobertura de Ramas y Lógica Interna', () => {
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

    describe('Rama 1: verifyToken - Cobertura de caminos lógicos', () => {
        test('Camino A: Cabecera Authorization ausente -> Rama error 401', () => {
            req.headers = {};
            verifyToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'No se proporcionó token' });
            expect(next).not.toHaveBeenCalled();
        });

        test('Camino B: Cabecera sin prefijo Bearer -> Extrae token o falla validación', () => {
            req.headers['authorization'] = 'InvalidFormatToken';
            verifyToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        test('Camino C: Token válido -> Decodifica payload y asigna userId y userRol al req', () => {
            const secret = process.env.JWT_SECRET || '(clave)';
            process.env.JWT_SECRET = secret;
            const fakeToken = jwt.sign({ id: 99, rol: 'admin' }, secret, { expiresIn: '1h' });

            req.headers['authorization'] = `Bearer ${fakeToken}`;
            verifyToken(req, res, next);

            expect(req.userId).toBe(99);
            expect(req.userRol).toBe('admin');
            expect(next).toHaveBeenCalled();
        });
    });

    describe('Rama 2: isAdmin - Cobertura de control de acceso por roles', () => {
        test('Camino A: userRol es "cliente" -> Rama rechazo 403 Forbidden', () => {
            req.userRol = 'cliente';
            isAdmin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Se requiere rol de administrador' });
            expect(next).not.toHaveBeenCalled();
        });

        test('Camino B: userRol es "admin" -> Rama autorización exitosa next()', () => {
            req.userRol = 'admin';
            isAdmin(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });
    });

    describe('Rama 3: Expresiones regulares de validación interna', () => {
        test('Evaluación interna de formato de email (regex RFC 5322 simplificado)', () => {
            expect(validators.isValidEmail('correo@dominio.com')).toBe(true);
            expect(validators.isValidEmail('sin_arroba.com')).toBe(false);
            expect(validators.isValidEmail('doble@@arroba.com')).toBe(false);
        });
    });
});
