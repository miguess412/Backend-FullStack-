const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Client = sequelize.define('Client', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        unique: true
    },
    direccion: {
        type: DataTypes.STRING(255)
    },
    ciudad: {
        type: DataTypes.STRING(100)
    },
    fecha_registro: {
        type: DataTypes.DATE
    },
    plan_id: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'clientes',
    timestamps: false
});

module.exports = Client;