// GitHub controller — receives request, calls service, maps errors to HTTP status codes
const githubService = require('../services/github.service');

function handleGithubError(res, error) {
  if (error.message === 'GitHub token invalid or expired') return res.status(401).json({ error: error.message });
  if (error.message === 'GitHub API rate limit exceeded') return res.status(429).json({ error: error.message });
  res.status(500).json({ error: 'GitHub API error' });
}

async function getPRs(req, res) {
  try {
    const prs = await githubService.getPullRequests(req.user.githubToken, req.user.username);
    res.status(200).json(prs);
  } catch (err) { handleGithubError(res, err); }
}

async function getIssues(req, res) {
  try {
    const issues = await githubService.getIssues(req.user.githubToken, req.user.username);
    res.status(200).json(issues);
  } catch (err) { handleGithubError(res, err); }
}

async function getActivity(req, res) {
  try {
    const events = await githubService.getActivity(req.user.githubToken, req.user.username);
    res.status(200).json(events);
  } catch (err) { handleGithubError(res, err); }
}

module.exports = { getPRs, getIssues, getActivity };
