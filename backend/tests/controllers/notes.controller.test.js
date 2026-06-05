// Tests for notes controller — verifies service calls and HTTP responses
jest.mock('../../src/services/notes.service');

const notesService = require('../../src/services/notes.service');
const { getNotes, createNote, updateNote, deleteNote } = require('../../src/controllers/notes.controller');

function mockReq(overrides = {}) {
  return { user: { userId: 1 }, body: {}, params: {}, query: {}, ...overrides };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

describe('getNotes', () => {
  it('calls service with userId and query, returns 200', async () => {
    const notes = [{ id: 1, title: 'Note' }];
    notesService.getNotes.mockResolvedValue(notes);
    const res = mockRes();

    await getNotes(mockReq({ query: { taskId: '2' } }), res);

    expect(notesService.getNotes).toHaveBeenCalledWith(1, { taskId: '2' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(notes);
  });
});

describe('createNote', () => {
  it('calls service with userId and body, returns 201', async () => {
    const created = { id: 1, title: 'New' };
    notesService.createNote.mockResolvedValue(created);
    const res = mockRes();

    await createNote(mockReq({ body: { title: 'New', content: 'Body' } }), res);

    expect(notesService.createNote).toHaveBeenCalledWith(1, { title: 'New', content: 'Body' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
  });
});

describe('updateNote', () => {
  it('calls service with id, userId, body and returns 200', async () => {
    const updated = { id: 1, title: 'Updated' };
    notesService.updateNote.mockResolvedValue(updated);
    const res = mockRes();

    await updateNote(mockReq({ params: { id: '1' }, body: { title: 'Updated' } }), res);

    expect(notesService.updateNote).toHaveBeenCalledWith('1', 1, { title: 'Updated' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('returns 404 if service throws Note not found', async () => {
    notesService.updateNote.mockRejectedValue(new Error('Note not found'));
    const res = mockRes();

    await updateNote(mockReq({ params: { id: '99' } }), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Note not found' });
  });
});

describe('deleteNote', () => {
  it('calls service with id and userId, returns 200', async () => {
    notesService.deleteNote.mockResolvedValue({ deleted: true });
    const res = mockRes();

    await deleteNote(mockReq({ params: { id: '1' } }), res);

    expect(notesService.deleteNote).toHaveBeenCalledWith('1', 1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ deleted: true });
  });

  it('returns 404 if service throws Note not found', async () => {
    notesService.deleteNote.mockRejectedValue(new Error('Note not found'));
    const res = mockRes();

    await deleteNote(mockReq({ params: { id: '99' } }), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Note not found' });
  });
});
