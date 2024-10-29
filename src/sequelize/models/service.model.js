const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {

    sequelize.define('service', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        price: { // precio -> price
            type: DataTypes.FLOAT,
            allowNull: false
        },
        reservation_period: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {tableName: 'service'});
};
