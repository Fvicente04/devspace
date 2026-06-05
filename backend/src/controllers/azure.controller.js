const azureService = require('../services/azure.service');

function requireAzureConnection(req, res) {
  if (!req.user.azureOrganization) {
    res.status(403).json({ error: 'Azure DevOps not connected' });
    return false;
  }
  return true;
}

function handleAzureError(res, error) {
  if (error.message === 'Azure DevOps PAT invalid or expired') return res.status(401).json({ error: error.message });
  if (error.message === 'Azure DevOps organization not found') return res.status(404).json({ error: error.message });
  res.status(500).json({ error: 'Internal server error' });
}

async function getWorkItems(req, res) {
  if (!requireAzureConnection(req, res)) return;
  try {
    const items = await azureService.getWorkItems(req.user.userId, req.user.azureOrganization, req.user.azurePatToken);
    res.status(200).json(items);
  } catch (error) { handleAzureError(res, error); }
}

async function getPullRequests(req, res) {
  if (!requireAzureConnection(req, res)) return;
  try {
    const prs = await azureService.getPullRequests(req.user.userId, req.user.azureOrganization, req.user.azurePatToken);
    res.status(200).json(prs);
  } catch (error) { handleAzureError(res, error); }
}

async function getPipelines(req, res) {
  if (!requireAzureConnection(req, res)) return;
  try {
    const pipelines = await azureService.getPipelines(req.user.userId, req.user.azureOrganization, req.user.azurePatToken);
    res.status(200).json(pipelines);
  } catch (error) { handleAzureError(res, error); }
}

async function getCommits(req, res) {
  if (!requireAzureConnection(req, res)) return;
  try {
    const commits = await azureService.getCommits(req.user.userId, req.user.azureOrganization, req.user.azurePatToken);
    res.status(200).json(commits);
  } catch (error) { handleAzureError(res, error); }
}

module.exports = { getWorkItems, getPullRequests, getPipelines, getCommits };
