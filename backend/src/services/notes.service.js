// Business logic for notes — CRUD with ownership validation
const { Note } = require('../models/note.model');

async function findNoteForUser(noteId, userId) {
  const note = await Note.findOne({ where: { id: noteId, userId } });
  if (!note) throw new Error('Note not found');
  return note;
}

async function getNotes(userId, filters = {}) {
  const where = { userId };
  if (filters.taskId) where.taskId = filters.taskId;

  return Note.findAll({
    where,
    order: [['updatedAt', 'DESC']],
  });
}

async function createNote(userId, data = {}) {
  return Note.create({
    userId,
    title: data.title,
    content: data.content,
    taskId: data.taskId,
  });
}

async function updateNote(noteId, userId, data = {}) {
  const note = await findNoteForUser(noteId, userId);
  return note.update({
    title: data.title,
    content: data.content,
  });
}

async function deleteNote(noteId, userId) {
  const note = await findNoteForUser(noteId, userId);
  await note.destroy();
  return { deleted: true };
}

module.exports = { getNotes, createNote, updateNote, deleteNote };
