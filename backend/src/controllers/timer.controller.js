// Timer controller — receives request, calls service, returns response
const timerService = require('../services/timer.service');

function handleTimerError(res, error) {
  const statusByMessage = {
    'A session is already active': 409,
    'Task not found': 404,
    'No active session found': 404,
  };

  res.status(statusByMessage[error.message] || 500).json({ error: error.message });
}

async function startSession(req, res) {
  try {
    const session = await timerService.startSession(req.user.userId, req.body);
    res.status(201).json(session);
  } catch (error) {
    handleTimerError(res, error);
  }
}

async function stopSession(req, res) {
  try {
    const session = await timerService.stopSession(req.user.userId, req.body);
    res.status(200).json(session);
  } catch (error) {
    handleTimerError(res, error);
  }
}

async function getHistory(req, res) {
  const sessions = await timerService.getHistory(req.user.userId);
  res.status(200).json(sessions);
}

async function getTodayStats(req, res) {
  const stats = await timerService.getTodayStats(req.user.userId);
  res.status(200).json(stats);
}

module.exports = { startSession, stopSession, getHistory, getTodayStats };
