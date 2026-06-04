// Tests for tasks controller — verifies correct service calls and HTTP responses
jest.mock('../../src/services/tasks.service');

const tasksService = require('../../src/services/tasks.service');
const { getTasks, createTask, updateTask, deleteTask } = require('../../src/controllers/tasks.controller');

function mockReq(overrides = {}) {
  return { user: { userId: 1 }, body: {}, params: {}, ...overrides };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

describe('getTasks', () => {
  it('calls getAllTasks with userId and returns 200', async () => {
    const tasks = [{ id: 1, title: 'Task' }];
    tasksService.getAllTasks.mockResolvedValue(tasks);
    const res = mockRes();
    await getTasks(mockReq(), res);
    expect(tasksService.getAllTasks).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(tasks);
  });
});

describe('createTask', () => {
  it('calls createTask with userId and body, returns 201', async () => {
    const created = { id: 1, title: 'New' };
    tasksService.createTask.mockResolvedValue(created);
    const res = mockRes();
    await createTask(mockReq({ body: { title: 'New' } }), res);
    expect(tasksService.createTask).toHaveBeenCalledWith(1, { title: 'New' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
  });

  it('returns 400 if service throws a validation error', async () => {
    const err = new Error('Title is required');
    err.status = 400;
    tasksService.createTask.mockRejectedValue(err);
    const res = mockRes();
    await createTask(mockReq({ body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Title is required' });
  });
});

describe('updateTask', () => {
  it('calls updateTask with id, userId, body and returns 200', async () => {
    const updated = { id: 1, status: 'done' };
    tasksService.updateTask.mockResolvedValue(updated);
    const res = mockRes();
    await updateTask(mockReq({ params: { id: '1' }, body: { status: 'done' } }), res);
    expect(tasksService.updateTask).toHaveBeenCalledWith('1', 1, { status: 'done' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('returns 404 if service throws a not found error', async () => {
    const err = new Error('Task not found');
    err.status = 404;
    tasksService.updateTask.mockRejectedValue(err);
    const res = mockRes();
    await updateTask(mockReq({ params: { id: '99' }, body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Task not found' });
  });

  it('returns 400 if service throws a validation error', async () => {
    const err = new Error('Invalid status');
    err.status = 400;
    tasksService.updateTask.mockRejectedValue(err);
    const res = mockRes();
    await updateTask(mockReq({ params: { id: '1' }, body: { status: 'invalid' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('deleteTask', () => {
  it('calls deleteTask with id and userId, returns 200', async () => {
    tasksService.deleteTask.mockResolvedValue({ deleted: true });
    const res = mockRes();
    await deleteTask(mockReq({ params: { id: '1' } }), res);
    expect(tasksService.deleteTask).toHaveBeenCalledWith('1', 1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ deleted: true });
  });

  it('returns 404 if service throws a not found error', async () => {
    const err = new Error('Task not found');
    err.status = 404;
    tasksService.deleteTask.mockRejectedValue(err);
    const res = mockRes();
    await deleteTask(mockReq({ params: { id: '99' } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Task not found' });
  });
});
