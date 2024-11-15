const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const Admin = sequelize.define('admin', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        passwordHash
        : {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, { tableName: 'admin' });

    

    return Admin;
};