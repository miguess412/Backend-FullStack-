const { sequelize } = require('../config/database');

// Importar modelos
const Role = require('./role.model');
const User = require('./user.model');
const Plan = require('./plan.model');
const Client = require('./client.model');
const Invoice = require('./invoice.model');
const Ticket = require('./ticket.model');

// Definir relaciones
User.belongsTo(Role, { foreignKey: 'rol_id' });
Role.hasMany(User, { foreignKey: 'rol_id' });

User.hasOne(Client, { foreignKey: 'user_id' });
Client.belongsTo(User, { foreignKey: 'user_id' });

Plan.hasMany(Client, { foreignKey: 'plan_id' });
Client.belongsTo(Plan, { foreignKey: 'plan_id' });

Client.hasMany(Invoice, { foreignKey: 'cliente_id' });
Invoice.belongsTo(Client, { foreignKey: 'cliente_id' });

Client.hasMany(Ticket, { foreignKey: 'cliente_id' });
Ticket.belongsTo(Client, { foreignKey: 'cliente_id' });

module.exports = {
    sequelize,
    Role,
    User,
    Plan,
    Client,
    Invoice,
    Ticket
};
