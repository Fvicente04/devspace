// Tests that timer routes require authentication and reach the correct controllers
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

jest.mock('../../src/controllers/timer.controller', () => ({
  startSession: jest.fn((req, res) => res.status(201).json({})),
  stopSession: jest.fn((req, res) => res.status(200).json({})),
  getHistory: jest.fn((req, res) => res.status(200).json([])),
  getTodayStats: jest.fn((req, res) => res.status(200).json({ totalMinutes: 0, completedSessions: 0 })),
}));

const timerRouter = require('../../src/routes/timer');
const controller = require('../../src/controllers/timer.controller');

const app = express();
app.use(express.json());
app.use('/timer', timerRouter);

beforeEach(() => jest.clearAllMocks());

describe('Timer routes — authentication required', () => {
  it('POST /timer/start without token returns 401', async () => {
    const res = await request(app).post('/timer/start');
    expect(res.status).toBe(401);
  });

  it('POST /timer/stop without token returns 401', async () => {
    const res = await request(app).post('/timer/stop');
    expect(res.status).toBe(401);
  });

  it('GET /timer/history without token returns 401', async () => {
    const res = await request(app).get('/timer/history');
    expect(res.status).toBe(401);
  });

  it('GET /timer/today without token returns 401', async () => {
    const res = await request(app).get('/timer/today');
    expect(res.status).toBe(401);
  });
});

describe('Timer routes — authenticated requests reach correct controllers', () => {
  const auth = { Authorization: 'Bearer valid-token' };

  it('POST /timer/start calls startSession controller', async () => {
    await request(app).post('/timer/start').set(auth).send({ taskId: 1 });
    expect(controller.startSession).toHaveBeenCalled();
  });

  it('POST /timer/stop calls stopSession controller', async () => {
    await request(app).post('/timer/stop').set(auth).send({ completed: true });
    expect(controller.stopSession).toHaveBeenCalled();
  });

  it('GET /timer/history calls getHistory controller', async () => {
    await request(app).get('/timer/history').set(auth);
    expect(controller.getHistory).toHaveBeenCalled();
  });

  it('GET /timer/today calls getTodayStats controller', async () => {
    await request(app).get('/timer/today').set(auth);
    expect(controller.getTodayStats).toHaveBeenCalled();
  });
});
