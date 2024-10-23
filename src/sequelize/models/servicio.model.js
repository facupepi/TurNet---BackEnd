const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    // Definimos el modelo 'Servicio'
    sequelize.define('servicio', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        duracion: {
            type: DataTypes.INTEGER, // Duración en minutos
            allowNull: false
        },
        precio: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        periodo_reserva: {
            type: DataTypes.STRING, // Descripción del período disponible para reserva
            allowNull: false
        }
    });
};
