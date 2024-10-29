const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('work_schedules', { 
    service_id: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service', 
        key: 'id',
      },
      onDelete: 'CASCADE' 
    },
    schedule_id: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'schedule', 
        key: 'id',
      },
      onDelete: 'CASCADE' 
    }
  }, {
    tableName: 'work_schedules',
    timestamps: false, 
  });
};
