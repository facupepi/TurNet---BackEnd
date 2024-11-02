const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('client', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
            tableName: 'client',
        }
    );
};
