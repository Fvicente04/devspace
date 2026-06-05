const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { getNotes, createNote, updateNote, deleteNote } = require('../controllers/notes.controller');

const router = Router();

router.get('/', authenticate, getNotes);
router.post('/', authenticate, createNote);
router.patch('/:id', authenticate, updateNote);
router.delete('/:id', authenticate, deleteNote);

module.exports = router;
