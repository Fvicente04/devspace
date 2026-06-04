// Tests for tasks service — covers getAllTasks, createTask, updateTask, deleteTask
jest.mock('../../src/models/task.model', () => ({
  Task: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const { getAllTasks, createTask, updateTask, deleteTask } = require('../../src/services/tasks.service');
const { Task } = require('../../src/models/task.model');

beforeEach(() => jest.clearAllMocks());

describe('getAllTasks(userId)', () => {
  it('returns all tasks for the given user', async () => {
    const tasks = [{ id: 1, userId: 1, title: 'Task 1' }];
    Task.findAll.mockResolvedValue(tasks);
    const result = await getAllTasks(1);
    expect(Task.findAll).toHaveBeenCalledWith({ where: { userId: 1 } });
    expect(result).toEqual(tasks);
  });

  it('returns empty array when user has no tasks', async () => {
    Task.findAll.mockResolvedValue([]);
    const result = await getAllTasks(1);
    expect(result).toEqual([]);
  });

  it('only queries tasks belonging to the given userId', async () => {
    Task.findAll.mockResolvedValue([]);
    await getAllTasks(42);
    expect(Task.findAll).toHaveBeenCalledWith({ where: { userId: 42 } });
  });
});

describe('createTask(userId, data)', () => {
  it('creates a task with correct fields and default status todo', async () => {
    const created = { id: 1, userId: 1, title: 'New task', status: 'todo' };
    Task.create.mockResolvedValue(created);
    const result = await createTask(1, { title: 'New task', description: 'desc' });
    expect(Task.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 1, title: 'New task', status: 'todo' })
    );
    expect(result).toEqual(created);
  });

  it('throws validation error if title is missing', async () => {
    const err = await createTask(1, {}).catch((e) => e);
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(400);
  });

  it('throws validation error if title is empty string', async () => {
    const err = await createTask(1, { title: '   ' }).catch((e) => e);
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(400);
  });

  it('ignores extra fields not in the model', async () => {
    Task.create.mockResolvedValue({ id: 1, title: 'Task', status: 'todo' });
    await expect(createTask(1, { title: 'Task', randomField: 'value' })).resolves.toBeDefined();
  });
});

describe('updateTask(taskId, userId, data)', () => {
  let mockTask;

  beforeEach(() => {
    mockTask = { id: 1, userId: 1, title: 'Task', status: 'todo', update: jest.fn() };
  });

  it('updates and returns the task', async () => {
    const updated = { ...mockTask, status: 'in_progress' };
    Task.findOne.mockResolvedValue(mockTask);
    mockTask.update.mockResolvedValue(updated);
    const result = await updateTask(1, 1, { status: 'in_progress' });
    expect(mockTask.update).toHaveBeenCalledWith({ status: 'in_progress' });
    expect(result).toEqual(updated);
  });

  it('throws 404 if task does not exist', async () => {
    Task.findOne.mockResolvedValue(null);
    const err = await updateTask(999, 1, { status: 'done' }).catch((e) => e);
    expect(err.status).toBe(404);
  });

  it('throws 404 if task belongs to a different user', async () => {
    Task.findOne.mockResolvedValue(null); // findOne with both id and userId returns null
    const err = await updateTask(1, 99, { status: 'done' }).catch((e) => e);
    expect(err.status).toBe(404);
  });

  it('rejects invalid status values with 400', async () => {
    Task.findOne.mockResolvedValue(mockTask);
    const err = await updateTask(1, 1, { status: 'invalid_status' }).catch((e) => e);
    expect(err.status).toBe(400);
  });
});

describe('deleteTask(taskId, userId)', () => {
  let mockTask;

  beforeEach(() => {
    mockTask = { id: 1, userId: 1, destroy: jest.fn() };
  });

  it('deletes the task and returns { deleted: true }', async () => {
    Task.findOne.mockResolvedValue(mockTask);
    mockTask.destroy.mockResolvedValue();
    const result = await deleteTask(1, 1);
    expect(mockTask.destroy).toHaveBeenCalled();
    expect(result).toEqual({ deleted: true });
  });

  it('throws 404 if task does not exist', async () => {
    Task.findOne.mockResolvedValue(null);
    const err = await deleteTask(999, 1).catch((e) => e);
    expect(err.status).toBe(404);
  });

  it('throws 404 if task belongs to a different user', async () => {
    Task.findOne.mockResolvedValue(null);
    const err = await deleteTask(1, 99).catch((e) => e);
    expect(err.status).toBe(404);
  });
});
