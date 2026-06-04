// Task routes — CRUD for user tasks
const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/tasks.controller');

const router = Router();

router.get('/', authenticate, getTasks);
router.post('/', authenticate, createTask);
router.patch('/:id', authenticate, updateTask);
router.delete('/:id', authenticate, deleteTask);

module.exports = router;
