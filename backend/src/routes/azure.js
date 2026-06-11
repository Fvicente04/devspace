const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { getWorkItems, getPullRequests, getPipelines, getCommits } = require('../controllers/azure.controller');

const router = Router();

router.get('/workitems', authenticate, getWorkItems);
router.get('/prs', authenticate, getPullRequests);
router.get('/pipelines', authenticate, getPipelines);
router.get('/commits', authenticate, getCommits);

// TEMPORARY DIAGNOSTIC — remove after debugging the empty Azure widgets.
// Tests each Azure API step server-side with the stored PAT and reports raw results.
const axios = require('axios');
const { decrypt } = require('../utils/encryption');

async function probe(label, fn) {
  try {
    const data = await fn();
    return { label, ok: true, ...data };
  } catch (error) {
    return {
      label,
      ok: false,
      status: error.response?.status ?? null,
      message: error.message,
    };
  }
}

router.get('/debug', authenticate, async (req, res) => {
  const org = req.user.azureOrganization;
  const report = { organization: org, hasPat: !!req.user.azurePatToken, steps: [] };

  let headers;
  try {
    const pat = decrypt(JSON.parse(req.user.azurePatToken));
    headers = { Authorization: `Basic ${Buffer.from(`:${pat}`).toString('base64')}` };
    report.patDecrypted = true;
    report.patLength = pat.length;
  } catch (error) {
    report.patDecrypted = false;
    report.patError = error.message;
    return res.json(report);
  }

  report.steps.push(await probe('profile/me', async () => {
    const r = await axios.get('https://vssps.dev.azure.com/_apis/profile/profiles/me?api-version=7.0', { headers });
    return { status: r.status, id: r.data.id, displayName: r.data.displayName };
  }));

  report.steps.push(await probe('projects', async () => {
    const r = await axios.get(`https://dev.azure.com/${org}/_apis/projects?api-version=7.0`, { headers });
    return { status: r.status, count: r.data.count, names: (r.data.value || []).map((p) => p.name) };
  }));

  report.steps.push(await probe('org-level prs', async () => {
    const r = await axios.get(`https://dev.azure.com/${org}/_apis/git/pullrequests?searchCriteria.status=active&api-version=7.0`, { headers });
    return { status: r.status, count: (r.data.value || []).length };
  }));

  res.json(report);
});

module.exports = router;
