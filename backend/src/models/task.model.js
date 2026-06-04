// Sequelize model for the tasks table — stores user tasks with optional GitHub issue link
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Task = sequelize.define(
  'Task',
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
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'todo',
    },
    githubIssueUrl: {
      type: DataTypes.TEXT,
      field: 'github_issue_url',
    },
    githubIssueNumber: {
      type: DataTypes.INTEGER,
      field: 'github_issue_number',
    },
    githubRepo: {
      type: DataTypes.STRING(200),
      field: 'github_repo',
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
    tableName: 'tasks',
    timestamps: true,
  }
);

module.exports = { Task };
