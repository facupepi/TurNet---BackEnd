const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    // Definimos el modelo 'horarios_laborales'
    return sequelize.define('horarios_laborales', {
        id_servicio: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'servicios', // Nombre de la tabla de servicios
                key: 'id',
            },
        },
        id_horario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'horarios', // Nombre de la tabla de horarios
                key: 'id',
            },
        },
    }, {
        tableName: 'horarios_laborales', // Nombre de la tabla en la base de datos
        timestamps: true, // Si deseas mantener createdAt y updatedAt
    });
};