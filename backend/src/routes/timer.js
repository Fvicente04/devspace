const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { startSession, stopSession, getHistory, getTodayStats } = require('../controllers/timer.controller');

const router = Router();

router.post('/start', authenticate, startSession);
router.post('/stop', authenticate, stopSession);
router.get('/history', authenticate, getHistory);
router.get('/today', authenticate, getTodayStats);

module.exports = router;
