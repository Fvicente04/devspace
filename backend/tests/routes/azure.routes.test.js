// Tests that azure routes require authentication and reach the correct controllers
const request = require('supertest');
const express = require('express');

jest.mock('../../src/middlewares/authenticate', () => ({
  authenticate: (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });
    req.user = { userId: 1, azureOrganization: 'softworks-workforce', azurePatToken: 'enc' };
    next();
  },
}));

jest.mock('../../src/controllers/azure.controller', () => ({
  getWorkItems: jest.fn((req, res) => res.status(200).json([])),
  getPullRequests: jest.fn((req, res) => res.status(200).json([])),
  getPipelines: jest.fn((req, res) => res.status(200).json([])),
  getCommits: jest.fn((req, res) => res.status(200).json([])),
}));

const azureRouter = require('../../src/routes/azure');
const controller = require('../../src/controllers/azure.controller');

const app = express();
app.use(express.json());
app.use('/azure', azureRouter);

beforeEach(() => jest.clearAllMocks());

describe('Azure routes — authentication required', () => {
  it('GET /azure/workitems without token returns 401', async () => {
    expect((await request(app).get('/azure/workitems')).status).toBe(401);
  });

  it('GET /azure/prs without token returns 401', async () => {
    expect((await request(app).get('/azure/prs')).status).toBe(401);
  });

  it('GET /azure/pipelines without token returns 401', async () => {
    expect((await request(app).get('/azure/pipelines')).status).toBe(401);
  });

  it('GET /azure/commits without token returns 401', async () => {
    expect((await request(app).get('/azure/commits')).status).toBe(401);
  });
});

describe('Azure routes — authenticated requests reach correct controllers', () => {
  const auth = { Authorization: 'Bearer valid-token' };

  it('GET /azure/workitems calls getWorkItems', async () => {
    await request(app).get('/azure/workitems').set(auth);
    expect(controller.getWorkItems).toHaveBeenCalled();
  });

  it('GET /azure/prs calls getPullRequests', async () => {
    await request(app).get('/azure/prs').set(auth);
    expect(controller.getPullRequests).toHaveBeenCalled();
  });

  it('GET /azure/pipelines calls getPipelines', async () => {
    await request(app).get('/azure/pipelines').set(auth);
    expect(controller.getPipelines).toHaveBeenCalled();
  });

  it('GET /azure/commits calls getCommits', async () => {
    await request(app).get('/azure/commits').set(auth);
    expect(controller.getCommits).toHaveBeenCalled();
  });
});
