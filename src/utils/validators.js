const validators = {
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    isValidPassword: (password) => {
        // Asegurar que retorna true o false, no string vacío
        if (!password) return false;
        return password.length >= 6;
    }
};

module.exports = validators;