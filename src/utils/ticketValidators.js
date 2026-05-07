const ticketValidators = {
    validateAsunto: (asunto) => {
        if (!asunto) return { valid: false, message: 'El asunto es requerido' };
        if (asunto.length < 5) return { valid: false, message: 'El asunto debe tener al menos 5 caracteres' };
        return { valid: true, message: 'Válido' };
    },
    
    validatePrioridad: (prioridad) => {
        const validPrioridades = ['baja', 'media', 'alta'];
        if (!prioridad) return { valid: false, message: 'La prioridad es requerida' };
        if (!validPrioridades.includes(prioridad)) return { valid: false, message: 'Prioridad inválida' };
        return { valid: true, message: 'Válido' };
    }
};

module.exports = ticketValidators;