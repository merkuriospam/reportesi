const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  personId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
  },
  urgency: {
    type: DataTypes.ENUM('Baja', 'Media', 'Alta', 'Crítica'),
    defaultValue: 'Media',
  },
  status: {
    type: DataTypes.ENUM('Pendiente', 'Atendido', 'Derivado', 'Resuelto'),
    defaultValue: 'Pendiente',
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reportedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  paranoid: true,
});

module.exports = Report;
