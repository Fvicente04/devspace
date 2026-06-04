// Tests that tasks routes require authentication and reach the correct controllers
const request = require('supertest');
const express = require('express');

jest.mock('../../src/middlewares/authenticate', () => ({
  authenticate: (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });
    req.user = { userId: 1, username: 'testuser' };
    next();
  },
}));

jest.mock('../../src/controllers/tasks.controller', () => ({
  getTasks: jest.fn((req, res) => res.status(200).json([])),
  createTask: jest.fn((req, res) => res.status(201).json({})),
  updateTask: jest.fn((req, res) => res.status(200).json({})),
  deleteTask: jest.fn((req, res) => res.status(200).json({ deleted: true })),
}));

const tasksRouter = require('../../src/routes/tasks');
const controller = require('../../src/controllers/tasks.controller');

const app = express();
app.use(express.json());
app.use('/tasks', tasksRouter);

beforeEach(() => jest.clearAllMocks());

describe('Tasks routes — authentication required', () => {
  it('GET /tasks without token returns 401', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(401);
  });

  it('POST /tasks without token returns 401', async () => {
    const res = await request(app).post('/tasks');
    expect(res.status).toBe(401);
  });

  it('PATCH /tasks/1 without token returns 401', async () => {
    const res = await request(app).patch('/tasks/1');
    expect(res.status).toBe(401);
  });

  it('DELETE /tasks/1 without token returns 401', async () => {
    const res = await request(app).delete('/tasks/1');
    expect(res.status).toBe(401);
  });
});

describe('Tasks routes — authenticated requests reach correct controllers', () => {
  const auth = { Authorization: 'Bearer valid-token' };

  it('GET /tasks calls getTasks controller', async () => {
    await request(app).get('/tasks').set(auth);
    expect(controller.getTasks).toHaveBeenCalled();
  });

  it('POST /tasks calls createTask controller', async () => {
    await request(app).post('/tasks').set(auth).send({ title: 'New' });
    expect(controller.createTask).toHaveBeenCalled();
  });

  it('PATCH /tasks/:id calls updateTask controller', async () => {
    await request(app).patch('/tasks/1').set(auth).send({ status: 'done' });
    expect(controller.updateTask).toHaveBeenCalled();
  });

  it('DELETE /tasks/:id calls deleteTask controller', async () => {
    await request(app).delete('/tasks/1').set(auth);
    expect(controller.deleteTask).toHaveBeenCalled();
  });
});
