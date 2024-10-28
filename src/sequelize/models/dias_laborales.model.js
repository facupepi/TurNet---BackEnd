const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('dias_laborales', {
        id_servicio: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'servicio', // Nombre de la tabla de servicios
                key: 'id'
            },
            onDelete: 'CASCADE' // Eliminación en cascada si el servicio se elimina
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false, // Asegura que el nombre del día esté siempre presente
        }
    }, {
        tableName: 'dias_laborales', // Nombre de la tabla en la base de datos
        timestamps: false, // No necesitas createdAt y updatedAt para tablas intermedias
    });
};
