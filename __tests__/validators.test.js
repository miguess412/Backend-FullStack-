const validators = require('../src/utils/validators');

describe('Pruebas de Validadores', () => {
    
    test('Email válido - debe retornar true', () => {
        expect(validators.isValidEmail('admin@ispmanager.com')).toBe(true);
        expect(validators.isValidEmail('cliente@test.com')).toBe(true);
    });
    
    test('Email inválido - debe retornar false', () => {
        expect(validators.isValidEmail('correo-invalido')).toBe(false);
        expect(validators.isValidEmail('')).toBe(false);
    });
    
    test('Contraseña válida - mínimo 6 caracteres', () => {
        expect(validators.isValidPassword('admin123')).toBe(true);
        expect(validators.isValidPassword('123456')).toBe(true);
    });
    
    test('Contraseña inválida - menos de 6 caracteres', () => {
        expect(validators.isValidPassword('12345')).toBe(false);
        expect(validators.isValidPassword('')).toBe(false);
    });
});