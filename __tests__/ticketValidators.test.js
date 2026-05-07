const ticketValidators = require('../src/utils/ticketValidators');

describe('Pruebas de Validación de Tickets', () => {
    
    test('Asunto válido - debe retornar true', () => {
        const result = ticketValidators.validateAsunto('Problema con internet');
        expect(result.valid).toBe(true);
    });
    
    test('Asunto vacío - debe retornar false', () => {
        const result = ticketValidators.validateAsunto('');
        expect(result.valid).toBe(false);
        expect(result.message).toBe('El asunto es requerido');
    });
    
    test('Prioridad válida - debe retornar true', () => {
        expect(ticketValidators.validatePrioridad('alta').valid).toBe(true);
        expect(ticketValidators.validatePrioridad('media').valid).toBe(true);
        expect(ticketValidators.validatePrioridad('baja').valid).toBe(true);
    });
    
    test('Prioridad inválida - debe retornar false', () => {
        const result = ticketValidators.validatePrioridad('urgente');
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Prioridad inválida');
    });
});