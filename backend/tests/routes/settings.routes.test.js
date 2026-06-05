// Tests that settings routes require authentication and reach the correct controllers
const request = require('supertest');
const express = require('express');

jest.mock('../../src/middlewares/authenticate', () => ({
  authenticate: (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });
    req.user = { userId: 1 };
    next();
  },
}));

jest.mock('../../src/controllers/settings.controller', () => ({
  getAzureSettings: jest.fn((req, res) => res.status(200).json({ connected: true, organization: 'org' })),
  saveAzureSettings: jest.fn((req, res) => res.status(200).json({ connected: true, organization: 'org' })),
  removeAzureSettings: jest.fn((req, res) => res.status(200).json({ connected: false, organization: null })),
}));

const settingsRouter = require('../../src/routes/settings');
const controller = require('../../src/controllers/settings.controller');

const app = express();
app.use(express.json());
app.use('/settings', settingsRouter);

beforeEach(() => jest.clearAllMocks());

describe('Settings routes — authentication required', () => {
  it('GET /settings/azure without token returns 401', async () => {
    const res = await request(app).get('/settings/azure');
    expect(res.status).toBe(401);
  });

  it('POST /settings/azure without token returns 401', async () => {
    const res = await request(app).post('/settings/azure');
    expect(res.status).toBe(401);
  });

  it('DELETE /settings/azure without token returns 401', async () => {
    const res = await request(app).delete('/settings/azure');
    expect(res.status).toBe(401);
  });
});

describe('Settings routes — authenticated requests reach correct controllers', () => {
  const auth = { Authorization: 'Bearer valid-token' };

  it('GET /settings/azure calls getAzureSettings', async () => {
    await request(app).get('/settings/azure').set(auth);
    expect(controller.getAzureSettings).toHaveBeenCalled();
  });

  it('POST /settings/azure calls saveAzureSettings', async () => {
    await request(app).post('/settings/azure').set(auth).send({ organization: 'org', patToken: 'pat' });
    expect(controller.saveAzureSettings).toHaveBeenCalled();
  });

  it('DELETE /settings/azure calls removeAzureSettings', async () => {
    await request(app).delete('/settings/azure').set(auth);
    expect(controller.removeAzureSettings).toHaveBeenCalled();
  });
});
