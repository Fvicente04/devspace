// Business logic for tasks — CRUD with ownership validation
const { Task } = require('../models/task.model');

const VALID_STATUSES = ['todo', 'in_progress', 'done'];

async function findTaskForUser(taskId, userId) {
  const task = await Task.findOne({ where: { id: taskId, userId } });
  if (!task) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }
  return task;
}

async function getAllTasks(userId) {
  return Task.findAll({ where: { userId } });
}

async function createTask(userId, data) {
  if (!data.title || !data.title.trim()) {
    const err = new Error('Title is required');
    err.status = 400;
    throw err;
  }
  return Task.create({ userId, title: data.title.trim(), description: data.description, status: 'todo' });
}

async function updateTask(taskId, userId, data) {
  if (data.status && !VALID_STATUSES.includes(data.status)) {
    const err = new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    err.status = 400;
    throw err;
  }
  const task = await findTaskForUser(taskId, userId);
  return task.update(data);
}

async function deleteTask(taskId, userId) {
  const task = await findTaskForUser(taskId, userId);
  await task.destroy();
  return { deleted: true };
}

module.exports = { getAllTasks, createTask, updateTask, deleteTask };
