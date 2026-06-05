// Notes controller — receives request, calls service, returns response
const notesService = require('../services/notes.service');

function handleNotesError(res, error) {
  const status = error.message === 'Note not found' ? 404 : 500;
  res.status(status).json({ error: error.message });
}

async function getNotes(req, res) {
  const notes = await notesService.getNotes(req.user.userId, req.query);
  res.status(200).json(notes);
}

async function createNote(req, res) {
  const note = await notesService.createNote(req.user.userId, req.body);
  res.status(201).json(note);
}

async function updateNote(req, res) {
  try {
    const note = await notesService.updateNote(req.params.id, req.user.userId, req.body);
    res.status(200).json(note);
  } catch (error) {
    handleNotesError(res, error);
  }
}

async function deleteNote(req, res) {
  try {
    const result = await notesService.deleteNote(req.params.id, req.user.userId);
    res.status(200).json(result);
  } catch (error) {
    handleNotesError(res, error);
  }
}

module.exports = { getNotes, createNote, updateNote, deleteNote };
