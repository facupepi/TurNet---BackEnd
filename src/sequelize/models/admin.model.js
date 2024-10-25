const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    // Definimos el modelo 'Admin'
    sequelize.define('admin', {
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
        contrasena: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'admin', // Nombre de la tabla en la base de datos
      });
};
