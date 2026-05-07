const formatters = require('../src/utils/formatters');

describe('Pruebas de Formateadores', () => {
    
    test('Formato moneda COP - debe formatear correctamente', () => {
        expect(formatters.formatMoney(49990)).toBe('$ 49.990');
        expect(formatters.formatMoney(100000)).toBe('$ 100.000');
    });
    
    test('Formato fecha - debe formatear correctamente', () => {
        expect(formatters.formatDate('2024-05-15')).toBe('15/5/2024');
        expect(formatters.formatDate('2024-12-25')).toBe('25/12/2024');
    });
});