// Tests for timer service — covers start, stop, history, and today's stats
jest.mock('../../src/models/pomodoro-session.model', () => ({
  PomodoroSession: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../src/models/task.model', () => ({
  Task: {
    findOne: jest.fn(),
  },
}));

const { PomodoroSession } = require('../../src/models/pomodoro-session.model');
const { Task } = require('../../src/models/task.model');
const { startSession, stopSession, getHistory, getTodayStats } = require('../../src/services/timer.service');

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe('startSession(userId, data)', () => {
  it('creates and returns a new session', async () => {
    const now = new Date('2026-06-05T09:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);
    const created = { id: 1, userId: 1, taskId: 2, type: 'focus', completed: false };

    PomodoroSession.findOne.mockResolvedValue(null);
    Task.findOne.mockResolvedValue({ id: 2, userId: 1 });
    PomodoroSession.create.mockResolvedValue(created);

    const result = await startSession(1, { taskId: 2, type: 'focus' });

    expect(PomodoroSession.findOne).toHaveBeenCalledWith({ where: { userId: 1, endedAt: null } });
    expect(Task.findOne).toHaveBeenCalledWith({ where: { id: 2, userId: 1 } });
    expect(PomodoroSession.create).toHaveBeenCalledWith({
      userId: 1,
      taskId: 2,
      type: 'focus',
      startedAt: now,
      completed: false,
    });
    expect(result).toEqual(created);
  });

  it('throws if there is already an active session for the user', async () => {
    PomodoroSession.findOne.mockResolvedValue({ id: 1, endedAt: null });

    await expect(startSession(1, { type: 'focus' })).rejects.toThrow('A session is already active');
  });

  it('throws if the provided task does not belong to the user', async () => {
    PomodoroSession.findOne.mockResolvedValue(null);
    Task.findOne.mockResolvedValue(null);

    await expect(startSession(1, { taskId: 99, type: 'focus' })).rejects.toThrow('Task not found');
  });
});

describe('stopSession(userId, data)', () => {
  it('updates and returns the active session', async () => {
    const startedAt = new Date('2026-06-05T09:00:00.000Z');
    const endedAt = new Date('2026-06-05T09:25:00.000Z');
    jest.useFakeTimers().setSystemTime(endedAt);
    const session = {
      id: 1,
      startedAt,
      update: jest.fn().mockResolvedValue({ id: 1, completed: true, durationMinutes: 25 }),
    };

    PomodoroSession.findOne.mockResolvedValue(session);

    const result = await stopSession(1, { completed: true });

    expect(PomodoroSession.findOne).toHaveBeenCalledWith({ where: { userId: 1, endedAt: null } });
    expect(session.update).toHaveBeenCalledWith({
      endedAt,
      durationMinutes: 25,
      completed: true,
    });
    expect(result).toEqual({ id: 1, completed: true, durationMinutes: 25 });
  });

  it('uses completed false when stopping manually', async () => {
    const session = {
      startedAt: new Date('2026-06-05T09:00:00.000Z'),
      update: jest.fn().mockResolvedValue({ completed: false }),
    };

    PomodoroSession.findOne.mockResolvedValue(session);

    await stopSession(1, { completed: false });

    expect(session.update).toHaveBeenCalledWith(expect.objectContaining({ completed: false }));
  });

  it('throws if there is no active session', async () => {
    PomodoroSession.findOne.mockResolvedValue(null);

    await expect(stopSession(1, { completed: true })).rejects.toThrow('No active session found');
  });
});

describe('getHistory(userId)', () => {
  it('returns all sessions for the user ordered by startedAt descending', async () => {
    const sessions = [{ id: 2 }, { id: 1 }];
    PomodoroSession.findAll.mockResolvedValue(sessions);

    const result = await getHistory(1);

    expect(PomodoroSession.findAll).toHaveBeenCalledWith({
      where: { userId: 1 },
      order: [['startedAt', 'DESC']],
    });
    expect(result).toEqual(sessions);
  });

  it('returns an empty array when no sessions exist', async () => {
    PomodoroSession.findAll.mockResolvedValue([]);

    await expect(getHistory(1)).resolves.toEqual([]);
  });
});

describe('getTodayStats(userId)', () => {
  it('returns total focus minutes and completed focus session count for today', async () => {
    PomodoroSession.findAll.mockResolvedValue([
      { durationMinutes: 25, completed: true },
      { durationMinutes: 15, completed: false },
      { durationMinutes: null, completed: true },
    ]);

    const result = await getTodayStats(1);

    expect(PomodoroSession.findAll).toHaveBeenCalledWith({
      where: expect.objectContaining({
        userId: 1,
        type: 'focus',
      }),
    });
    expect(result).toEqual({ totalMinutes: 40, completedSessions: 2 });
  });
});
