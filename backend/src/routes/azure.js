const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { getWorkItems, getPullRequests, getPipelines, getCommits } = require('../controllers/azure.controller');

const router = Router();

router.get('/workitems', authenticate, getWorkItems);
router.get('/prs', authenticate, getPullRequests);
router.get('/pipelines', authenticate, getPipelines);
router.get('/commits', authenticate, getCommits);

module.exports = router;
