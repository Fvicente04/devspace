// Sequelize model for the users table — stores GitHub identity and OAuth token
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    githubId: {
      type: DataTypes.STRING(50),
      field: 'github_id',
      unique: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    displayName: {
      type: DataTypes.STRING(200),
      field: 'display_name',
    },
    avatarUrl: {
      type: DataTypes.TEXT,
      field: 'avatar_url',
    },
    githubToken: {
      type: DataTypes.TEXT,
      field: 'github_token',
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
    tableName: 'users',
    timestamps: true,
  }
);

module.exports = { User };
