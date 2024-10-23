const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    // Definimos el modelo 'Reserva'
    sequelize.define('reserva', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_cliente: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'cliente', // Hace referencia al modelo Cliente
                key: 'id'
            }
        },
        id_servicio: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'servicio', // Hace referencia al modelo Servicio
                key: 'id'
            }
        },
        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        hora: {
            type: DataTypes.TIME,
            allowNull: false
        }
    });
};
