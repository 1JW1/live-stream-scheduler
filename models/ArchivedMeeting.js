const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('ArchivedMeeting', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: DataTypes.DATE, allowNull: false },
    video_path: { type: DataTypes.STRING(200), allowNull: false },
    minutes_path: { type: DataTypes.STRING(200), allowNull: false }
  }, { tableName: 'archived_meeting', timestamps: false });
};
