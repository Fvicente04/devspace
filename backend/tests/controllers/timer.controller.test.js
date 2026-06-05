// Tests for timer controller — verifies service calls, responses, and error mapping
jest.mock('../../src/services/timer.service');

const timerService = require('../../src/services/timer.service');
const {
  startSession,
  stopSession,
  getHistory,
  getTodayStats,
} = require('../../src/controllers/timer.controller');

function mockReq(overrides = {}) {
  return { user: { userId: 1 }, body: {}, ...overrides };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

describe('startSession controller', () => {
  it('calls service with userId and body, then returns 201', async () => {
    const session = { id: 1, type: 'focus' };
    timerService.startSession.mockResolvedValue(session);
    const res = mockRes();

    await startSession(mockReq({ body: { taskId: 2, type: 'focus' } }), res);

    expect(timerService.startSession).toHaveBeenCalledWith(1, { taskId: 2, type: 'focus' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(session);
  });

  it('returns 409 if service throws active session error', async () => {
    timerService.startSession.mockRejectedValue(new Error('A session is already active'));
    const res = mockRes();

    await startSession(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'A session is already active' });
  });

  it('returns 404 if service throws task not found', async () => {
    timerService.startSession.mockRejectedValue(new Error('Task not found'));
    const res = mockRes();

    await startSession(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Task not found' });
  });

  it('returns 500 for unexpected errors', async () => {
    timerService.startSession.mockRejectedValue(new Error('Database unavailable'));
    const res = mockRes();

    await startSession(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Database unavailable' });
  });
});

describe('stopSession controller', () => {
  it('calls service with userId and body, then returns 200', async () => {
    const session = { id: 1, completed: true };
    timerService.stopSession.mockResolvedValue(session);
    const res = mockRes();

    await stopSession(mockReq({ body: { completed: true } }), res);

    expect(timerService.stopSession).toHaveBeenCalledWith(1, { completed: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(session);
  });

  it('returns 404 if service throws no active session found', async () => {
    timerService.stopSession.mockRejectedValue(new Error('No active session found'));
    const res = mockRes();

    await stopSession(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'No active session found' });
  });

  it('returns 500 for unexpected errors', async () => {
    timerService.stopSession.mockRejectedValue(new Error('Database unavailable'));
    const res = mockRes();

    await stopSession(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Database unavailable' });
  });
});

describe('getHistory controller', () => {
  it('calls service with userId and returns 200', async () => {
    const sessions = [{ id: 1 }];
    timerService.getHistory.mockResolvedValue(sessions);
    const res = mockRes();

    await getHistory(mockReq(), res);

    expect(timerService.getHistory).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(sessions);
  });
});

describe('getTodayStats controller', () => {
  it('calls service with userId and returns 200', async () => {
    const stats = { totalMinutes: 25, completedSessions: 1 };
    timerService.getTodayStats.mockResolvedValue(stats);
    const res = mockRes();

    await getTodayStats(mockReq(), res);

    expect(timerService.getTodayStats).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(stats);
  });
});
