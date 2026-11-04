const validators = require('../src/utils/validators');
const ticketValidators = require('../src/utils/ticketValidators');

describe('Pruebas de Límites y Fronteras (Boundary Value Analysis - BVA)', () => {

    describe('Frontera 1: Longitud mínima de contraseña (Límite = 6 caracteres)', () => {
        test('Límite inferior inválido (5 caracteres) -> Debe ser rechazado', () => {
            const pass5 = '12345';
            expect(validators.isValidPassword(pass5)).toBe(false);
        });

        test('Frontera exacta mínima (6 caracteres) -> Debe ser aceptado', () => {
            const pass6 = '123456';
            expect(validators.isValidPassword(pass6)).toBe(true);
        });

        test('Frontera superior válida (7 caracteres) -> Debe ser aceptado', () => {
            const pass7 = '1234567';
            expect(validators.isValidPassword(pass7)).toBe(true);
        });

        test('Caso extremo frontera vacía (0 caracteres) -> Debe ser rechazado', () => {
            expect(validators.isValidPassword('')).toBe(false);
        });
    });

    describe('Frontera 2: Longitud del Asunto del Ticket (Límite = mínimo 5 caracteres)', () => {
        test('Frontera inferior inválida: Asunto vacío (0 caracteres) -> Inválido', () => {
            const result = ticketValidators.validateAsunto('');
            expect(result.valid).toBe(false);
            expect(result.message).toBe('El asunto es requerido');
        });

        test('Frontera inferior cercana (4 caracteres) -> Inválido (menos de 5)', () => {
            const result = ticketValidators.validateAsunto('Hola');
            expect(result.valid).toBe(false);
            expect(result.message).toBe('El asunto debe tener al menos 5 caracteres');
        });

        test('Frontera mínima válida: Asunto de 5 caracteres exactos -> Válido', () => {
            const result = ticketValidators.validateAsunto('Fibra');
            expect(result.valid).toBe(true);
        });

        test('Frontera superior válida: Asunto de 6 caracteres -> Válido', () => {
            const result = ticketValidators.validateAsunto('Router');
            expect(result.valid).toBe(true);
        });

        test('Frontera nominal: Asunto estándar (25 caracteres) -> Válido', () => {
            const result = ticketValidators.validateAsunto('Falla en la señal de fibra');
            expect(result.valid).toBe(true);
        });
    });

    describe('Frontera 3: Valores de Prioridad permitidos (Dominio cerrado)', () => {
        test('Límites del conjunto permitido: "baja", "media", "alta"', () => {
            expect(ticketValidators.validatePrioridad('baja').valid).toBe(true);
            expect(ticketValidators.validatePrioridad('media').valid).toBe(true);
            expect(ticketValidators.validatePrioridad('alta').valid).toBe(true);
        });

        test('Fuera de frontera: "urgente" o valor nulo -> Inválido', () => {
            expect(ticketValidators.validatePrioridad('urgente').valid).toBe(false);
            expect(ticketValidators.validatePrioridad('').valid).toBe(false);
        });
    });

    describe('Frontera 4: Porcentajes de Consumo de Datos', () => {
        function calcularEstadoConsumo(porcentaje) {
            if (porcentaje <= 0) return 'Sin consumo';
            if (porcentaje < 80) return 'Normal';
            if (porcentaje <= 100) return 'Advertencia';
            return 'Excedido';
        }

        test('Frontera 0% (inicio de ciclo): Debe clasificar como "Sin consumo"', () => {
            expect(calcularEstadoConsumo(0)).toBe('Sin consumo');
        });

        test('Frontera 79.9% (límite antes de advertencia): Debe ser "Normal"', () => {
            expect(calcularEstadoConsumo(79.9)).toBe('Normal');
        });

        test('Frontera 80% (inicio de advertencia): Debe ser "Advertencia"', () => {
            expect(calcularEstadoConsumo(80)).toBe('Advertencia');
        });

        test('Frontera 100% (cupo máximo exacto): Debe ser "Advertencia"', () => {
            expect(calcularEstadoConsumo(100)).toBe('Advertencia');
        });

        test('Frontera 100.1% (sobreconsumo): Debe clasificar como "Excedido"', () => {
            expect(calcularEstadoConsumo(100.1)).toBe('Excedido');
        });
    });
});
