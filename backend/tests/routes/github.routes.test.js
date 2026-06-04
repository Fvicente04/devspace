// Tests that github routes require authentication and reach the correct controllers
const request = require('supertest');
const express = require('express');

jest.mock('../../src/middlewares/authenticate', () => ({
  authenticate: (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });
    req.user = { userId: 1, username: 'Fvicente04', githubToken: 'gho_test' };
    next();
  },
}));

jest.mock('../../src/controllers/github.controller', () => ({
  getPRs: jest.fn((req, res) => res.status(200).json([])),
  getIssues: jest.fn((req, res) => res.status(200).json([])),
  getActivity: jest.fn((req, res) => res.status(200).json([])),
}));

const githubRouter = require('../../src/routes/github');
const controller = require('../../src/controllers/github.controller');

const app = express();
app.use(express.json());
app.use('/github', githubRouter);

beforeEach(() => jest.clearAllMocks());

describe('GitHub routes — authentication required', () => {
  it('GET /github/prs without token returns 401', async () => {
    const res = await request(app).get('/github/prs');
    expect(res.status).toBe(401);
  });

  it('GET /github/issues without token returns 401', async () => {
    const res = await request(app).get('/github/issues');
    expect(res.status).toBe(401);
  });

  it('GET /github/activity without token returns 401', async () => {
    const res = await request(app).get('/github/activity');
    expect(res.status).toBe(401);
  });
});

describe('GitHub routes — authenticated requests reach correct controllers', () => {
  const auth = { Authorization: 'Bearer valid-token' };

  it('GET /github/prs calls getPRs controller', async () => {
    await request(app).get('/github/prs').set(auth);
    expect(controller.getPRs).toHaveBeenCalled();
  });

  it('GET /github/issues calls getIssues controller', async () => {
    await request(app).get('/github/issues').set(auth);
    expect(controller.getIssues).toHaveBeenCalled();
  });

  it('GET /github/activity calls getActivity controller', async () => {
    await request(app).get('/github/activity').set(auth);
    expect(controller.getActivity).toHaveBeenCalled();
  });
});
