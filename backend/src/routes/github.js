// GitHub proxy routes — PRs, issues, and activity fetched via the stored user token
const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { getPRs, getIssues, getActivity } = require('../controllers/github.controller');

const router = Router();

router.get('/prs', authenticate, getPRs);
router.get('/issues', authenticate, getIssues);
router.get('/activity', authenticate, getActivity);

module.exports = router;
