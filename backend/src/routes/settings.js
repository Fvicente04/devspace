const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { getAzureSettings, saveAzureSettings, removeAzureSettings } = require('../controllers/settings.controller');

const router = Router();

router.get('/azure', authenticate, getAzureSettings);
router.post('/azure', authenticate, saveAzureSettings);
router.delete('/azure', authenticate, removeAzureSettings);

module.exports = router;
