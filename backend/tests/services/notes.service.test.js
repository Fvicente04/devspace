// Tests for notes service — covers list, create, update, and delete
jest.mock('../../src/models/note.model', () => ({
  Note: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const { Note } = require('../../src/models/note.model');
const { getNotes, createNote, updateNote, deleteNote } = require('../../src/services/notes.service');

beforeEach(() => jest.clearAllMocks());

describe('getNotes(userId, filters)', () => {
  it('returns all notes for the user ordered by updatedAt descending', async () => {
    const notes = [{ id: 1, userId: 1 }];
    Note.findAll.mockResolvedValue(notes);

    const result = await getNotes(1, {});

    expect(Note.findAll).toHaveBeenCalledWith({
      where: { userId: 1 },
      order: [['updatedAt', 'DESC']],
    });
    expect(result).toEqual(notes);
  });

  it('filters notes by taskId when provided', async () => {
    Note.findAll.mockResolvedValue([]);

    await getNotes(1, { taskId: '2' });

    expect(Note.findAll).toHaveBeenCalledWith({
      where: { userId: 1, taskId: '2' },
      order: [['updatedAt', 'DESC']],
    });
  });

  it('never queries notes without userId', async () => {
    Note.findAll.mockResolvedValue([]);

    await getNotes(42, {});

    expect(Note.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 42 } }));
  });
});

describe('createNote(userId, data)', () => {
  it('creates and returns a note with provided data', async () => {
    const created = { id: 1, userId: 1, title: 'Title', content: 'Body', taskId: 2 };
    Note.create.mockResolvedValue(created);

    const result = await createNote(1, { title: 'Title', content: 'Body', taskId: 2 });

    expect(Note.create).toHaveBeenCalledWith({ userId: 1, title: 'Title', content: 'Body', taskId: 2 });
    expect(result).toEqual(created);
  });

  it('allows standalone notes and empty titles', async () => {
    Note.create.mockResolvedValue({ id: 1, userId: 1, title: '', content: 'Body', taskId: null });

    await createNote(1, { title: '', content: 'Body', taskId: null });

    expect(Note.create).toHaveBeenCalledWith({ userId: 1, title: '', content: 'Body', taskId: null });
  });
});

describe('updateNote(noteId, userId, data)', () => {
  it('updates title and content when note belongs to user', async () => {
    const note = { id: 1, userId: 1, update: jest.fn().mockResolvedValue({ id: 1, title: 'New' }) };
    Note.findOne.mockResolvedValue(note);

    const result = await updateNote(1, 1, { title: 'New', content: 'Updated', taskId: 99 });

    expect(Note.findOne).toHaveBeenCalledWith({ where: { id: 1, userId: 1 } });
    expect(note.update).toHaveBeenCalledWith({ title: 'New', content: 'Updated' });
    expect(result).toEqual({ id: 1, title: 'New' });
  });

  it('throws Note not found when note does not exist', async () => {
    Note.findOne.mockResolvedValue(null);

    await expect(updateNote(999, 1, { title: 'New' })).rejects.toThrow('Note not found');
  });

  it('throws Note not found when note belongs to another user', async () => {
    Note.findOne.mockResolvedValue(null);

    await expect(updateNote(1, 99, { title: 'New' })).rejects.toThrow('Note not found');
  });
});

describe('deleteNote(noteId, userId)', () => {
  it('deletes the note and returns deleted true', async () => {
    const note = { id: 1, userId: 1, destroy: jest.fn().mockResolvedValue() };
    Note.findOne.mockResolvedValue(note);

    const result = await deleteNote(1, 1);

    expect(Note.findOne).toHaveBeenCalledWith({ where: { id: 1, userId: 1 } });
    expect(note.destroy).toHaveBeenCalled();
    expect(result).toEqual({ deleted: true });
  });

  it('throws Note not found when note does not exist', async () => {
    Note.findOne.mockResolvedValue(null);

    await expect(deleteNote(999, 1)).rejects.toThrow('Note not found');
  });

  it('throws Note not found when note belongs to another user', async () => {
    Note.findOne.mockResolvedValue(null);

    await expect(deleteNote(1, 99)).rejects.toThrow('Note not found');
  });
});
