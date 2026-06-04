// Tasks controller — receives request, calls service, returns response
const tasksService = require('../services/tasks.service');

async function getTasks(req, res) {
  const tasks = await tasksService.getAllTasks(req.user.userId);
  res.status(200).json(tasks);
}

async function createTask(req, res) {
  try {
    const task = await tasksService.createTask(req.user.userId, req.body);
    res.status(201).json(task);
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
}

async function updateTask(req, res) {
  try {
    const task = await tasksService.updateTask(req.params.id, req.user.userId, req.body);
    res.status(200).json(task);
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
}

async function deleteTask(req, res) {
  try {
    const result = await tasksService.deleteTask(req.params.id, req.user.userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 404).json({ error: err.message });
  }
}

module.exports = { getTasks, createTask, updateTask, deleteTask };
