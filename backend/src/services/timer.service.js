// Business logic for Pomodoro sessions — start, stop, history, and today's stats
const { Op } = require('sequelize');
const { PomodoroSession } = require('../models/pomodoro-session.model');
const { Task } = require('../models/task.model');

async function findActiveSession(userId) {
  return PomodoroSession.findOne({ where: { userId, endedAt: null } });
}

async function validateTaskOwnership(taskId, userId) {
  if (!taskId) return;

  const task = await Task.findOne({ where: { id: taskId, userId } });
  if (!task) throw new Error('Task not found');
}

async function startSession(userId, data = {}) {
  const activeSession = await findActiveSession(userId);
  if (activeSession) throw new Error('A session is already active');

  await validateTaskOwnership(data.taskId, userId);

  return PomodoroSession.create({
    userId,
    taskId: data.taskId,
    type: data.type || 'focus',
    startedAt: new Date(),
    completed: false,
  });
}

async function stopSession(userId, data = {}) {
  const activeSession = await findActiveSession(userId);
  if (!activeSession) throw new Error('No active session found');

  const endedAt = new Date();
  const durationMinutes = Math.round((endedAt - activeSession.startedAt) / 60000);

  return activeSession.update({
    endedAt,
    durationMinutes,
    completed: data.completed,
  });
}

async function getHistory(userId) {
  return PomodoroSession.findAll({
    where: { userId },
    order: [['startedAt', 'DESC']],
  });
}

async function getTodayStats(userId) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const sessions = await PomodoroSession.findAll({
    where: {
      userId,
      type: 'focus',
      startedAt: { [Op.gte]: startOfToday },
    },
  });

  return {
    totalMinutes: sessions.reduce((sum, session) => sum + (session.durationMinutes || 0), 0),
    completedSessions: sessions.filter((session) => session.completed).length,
  };
}

module.exports = { startSession, stopSession, getHistory, getTodayStats };
