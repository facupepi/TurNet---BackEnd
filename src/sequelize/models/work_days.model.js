const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('work_days', {
        service_id: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'service', 
                key: 'id'
            },
            onDelete: 'CASCADE' 
        },
        name: { 
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false, 
        }
    }, {
        tableName: 'work_days', 
        timestamps: false, 
    });
};
