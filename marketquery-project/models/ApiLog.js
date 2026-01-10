'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ApiLog extends Model {
    static associate(models) {
      ApiLog.belongsTo(models.User, { foreignKey: 'ID_User', as: 'user' });
    }
  }

  ApiLog.init({
    ID_Log: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ID_User: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    endpoint: {
      type: DataTypes.STRING,
      allowNull: false
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at' 
    }
  }, {
    sequelize,
    modelName: 'ApiLog',
    tableName: 'ApiLogs',
    timestamps: false, 
  });

  return ApiLog;
};