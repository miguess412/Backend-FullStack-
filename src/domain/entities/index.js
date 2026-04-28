const { sequelize } = require('../../infrastructure/database/sequelize');

// Importar modelos
const Role = require('./role.model');
const User = require('./user.model');
const Plan = require('./plan.model');
const Client = require('./client.model');
const Invoice = require('./invoice.model');
const Ticket = require('./ticket.model');

// ============================================
// DEFINIR RELACIONES (ASOCIACIONES)
// ============================================

// User - Role
User.belongsTo(Role, { foreignKey: 'rol_id' });
Role.hasMany(User, { foreignKey: 'rol_id' });

// User - Client
User.hasOne(Client, { foreignKey: 'user_id' });
Client.belongsTo(User, { foreignKey: 'user_id' });

// Plan - Client
Plan.hasMany(Client, { foreignKey: 'plan_id' });
Client.belongsTo(Plan, { foreignKey: 'plan_id' });

// Client - Invoice
Client.hasMany(Invoice, { foreignKey: 'cliente_id' });
Invoice.belongsTo(Client, { foreignKey: 'cliente_id' });

// Client - Ticket
Client.hasMany(Ticket, { foreignKey: 'cliente_id' });
Ticket.belongsTo(Client, { foreignKey: 'cliente_id' });

// Exportar modelos y sequelize
module.exports = {
    sequelize,
    Role,
    User,
    Plan,
    Client,
    Invoice,
    Ticket
};