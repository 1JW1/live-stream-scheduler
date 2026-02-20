const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Meeting', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    agenda: { type: DataTypes.STRING(255), allowNull: false },
    documents: { type: DataTypes.STRING(255), allowNull: true }
  }, { tableName: 'meeting', timestamps: false });
};
