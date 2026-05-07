const formatters = {
    formatMoney: (value) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(num);
    },
    
    formatDate: (dateStr) => {
        const date = new Date(dateStr);
        // Usar UTC para evitar problemas de zona horaria
        const day = date.getUTCDate();
        const month = date.getUTCMonth() + 1;
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
    }
};

module.exports = formatters;