const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Note = sequelize.define(
  'Note',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id',
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    taskId: {
      type: DataTypes.INTEGER,
      field: 'task_id',
      allowNull: true,
      references: { model: 'tasks', key: 'id' },
      onDelete: 'SET NULL',
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    tableName: 'notes',
    timestamps: true,
  }
);

module.exports = { Note };
