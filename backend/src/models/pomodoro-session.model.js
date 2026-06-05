// Sequelize model for pomodoro_sessions table — stores Pomodoro timer history
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PomodoroSession = sequelize.define(
  'PomodoroSession',
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
    },
    taskId: {
      type: DataTypes.INTEGER,
      field: 'task_id',
      allowNull: true,
      references: { model: 'tasks', key: 'id' },
    },
    startedAt: {
      type: DataTypes.DATE,
      field: 'started_at',
      allowNull: false,
    },
    endedAt: {
      type: DataTypes.DATE,
      field: 'ended_at',
      allowNull: true,
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      field: 'duration_minutes',
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(20),
      defaultValue: 'focus',
      validate: {
        isIn: [['focus', 'short_break', 'long_break']],
      },
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
  },
  {
    tableName: 'pomodoro_sessions',
    timestamps: false,
  }
);

module.exports = { PomodoroSession };
