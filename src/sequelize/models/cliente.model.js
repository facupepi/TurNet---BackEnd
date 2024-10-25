const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    // Definimos el modelo 'Cliente'
    sequelize.define('cliente', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: true
        },
        contrasena: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        tableName: 'cliente', // Nombre de la tabla en la base de datos
      });
};
