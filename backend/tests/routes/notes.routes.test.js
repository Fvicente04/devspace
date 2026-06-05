// Tests that notes routes require authentication and reach the correct controllers
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

jest.mock('../../src/controllers/notes.controller', () => ({
  getNotes: jest.fn((req, res) => res.status(200).json([])),
  createNote: jest.fn((req, res) => res.status(201).json({})),
  updateNote: jest.fn((req, res) => res.status(200).json({})),
  deleteNote: jest.fn((req, res) => res.status(200).json({ deleted: true })),
}));

const notesRouter = require('../../src/routes/notes');
const controller = require('../../src/controllers/notes.controller');

const app = express();
app.use(express.json());
app.use('/notes', notesRouter);

beforeEach(() => jest.clearAllMocks());

describe('Notes routes — authentication required', () => {
  it('GET /notes without token returns 401', async () => {
    const res = await request(app).get('/notes');
    expect(res.status).toBe(401);
  });

  it('POST /notes without token returns 401', async () => {
    const res = await request(app).post('/notes');
    expect(res.status).toBe(401);
  });

  it('PATCH /notes/1 without token returns 401', async () => {
    const res = await request(app).patch('/notes/1');
    expect(res.status).toBe(401);
  });

  it('DELETE /notes/1 without token returns 401', async () => {
    const res = await request(app).delete('/notes/1');
    expect(res.status).toBe(401);
  });
});

describe('Notes routes — authenticated requests reach correct controllers', () => {
  const auth = { Authorization: 'Bearer valid-token' };

  it('GET /notes calls getNotes controller', async () => {
    await request(app).get('/notes').set(auth);
    expect(controller.getNotes).toHaveBeenCalled();
  });

  it('GET /notes?taskId=1 calls getNotes controller', async () => {
    await request(app).get('/notes?taskId=1').set(auth);
    expect(controller.getNotes).toHaveBeenCalled();
  });

  it('POST /notes calls createNote controller', async () => {
    await request(app).post('/notes').set(auth).send({ title: 'New' });
    expect(controller.createNote).toHaveBeenCalled();
  });

  it('PATCH /notes/:id calls updateNote controller', async () => {
    await request(app).patch('/notes/1').set(auth).send({ title: 'Updated' });
    expect(controller.updateNote).toHaveBeenCalled();
  });

  it('DELETE /notes/:id calls deleteNote controller', async () => {
    await request(app).delete('/notes/1').set(auth);
    expect(controller.deleteNote).toHaveBeenCalled();
  });
});
