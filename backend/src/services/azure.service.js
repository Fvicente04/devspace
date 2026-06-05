const axios = require('axios');
const cache = require('../utils/cache');
const { decrypt } = require('../utils/encryption');

function buildAuthHeader(encryptedPat) {
  const pat = decrypt(JSON.parse(encryptedPat));
  return `Basic ${Buffer.from(`:${pat}`).toString('base64')}`;
}

function handleAzureApiError(error) {
  const status = error.response?.status;
  if (status === 401) throw new Error('Azure DevOps PAT invalid or expired');
  if (status === 404) throw new Error('Azure DevOps organization not found');
  throw error;
}

async function fetchAzureWithCache(userId, cacheKey, ttl, fetchFn) {
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  const result = await fetchFn();
  cache.set(cacheKey, result, ttl);
  return result;
}

async function getWorkItems(userId, organization, encryptedPat) {
  const cacheKey = `azure:workitems:${userId}`;
  return fetchAzureWithCache(userId, cacheKey, 300, async () => {
    const headers = { Authorization: buildAuthHeader(encryptedPat) };
    const wiqlUrl = `https://dev.azure.com/${organization}/_apis/wit/wiql?api-version=7.0`;
    try {
      const wiqlRes = await axios.post(wiqlUrl, { query: 'SELECT [System.Id] FROM WorkItems WHERE [System.AssignedTo] = @Me AND [System.State] <> \'Closed\'' }, { headers });
      const ids = wiqlRes.data.workItems.map((i) => i.id);
      if (!ids.length) return [];
      const detailsUrl = `https://dev.azure.com/${organization}/_apis/wit/workitems?ids=${ids.join(',')}&api-version=7.0`;
      const detailsRes = await axios.get(detailsUrl, { headers });
      return detailsRes.data.value.map((i) => ({
        id: i.id,
        title: i.fields['System.Title'],
        type: i.fields['System.WorkItemType'],
        state: i.fields['System.State'],
        url: i.url,
      }));
    } catch (error) {
      handleAzureApiError(error);
    }
  });
}

async function getPullRequests(userId, organization, encryptedPat) {
  const cacheKey = `azure:prs:${userId}`;
  return fetchAzureWithCache(userId, cacheKey, 300, async () => {
    const headers = { Authorization: buildAuthHeader(encryptedPat) };
    const url = `https://dev.azure.com/${organization}/_apis/git/pullrequests?api-version=7.0`;
    const res = await axios.get(url, { headers });
    return res.data.value.map((pr) => ({
      id: pr.pullRequestId,
      title: pr.title,
      repo: pr.repository.name,
      status: pr.status,
      url: pr.url,
      createdAt: pr.creationDate,
    }));
  });
}

async function getPipelines(userId, organization, encryptedPat) {
  const cacheKey = `azure:pipelines:${userId}`;
  return fetchAzureWithCache(userId, cacheKey, 120, async () => {
    const headers = { Authorization: buildAuthHeader(encryptedPat) };
    const url = `https://dev.azure.com/${organization}/_apis/pipelines/runs?api-version=7.0`;
    const res = await axios.get(url, { headers });
    return res.data.value.map((run) => ({
      id: run.id,
      name: run.pipeline.name,
      status: run.state,
      result: run.result,
      url: run._links?.web?.href,
      finishedAt: run.finishedDate,
    }));
  });
}

async function getCommits(userId, organization, encryptedPat) {
  const cacheKey = `azure:commits:${userId}`;
  return fetchAzureWithCache(userId, cacheKey, 300, async () => {
    const headers = { Authorization: buildAuthHeader(encryptedPat) };
    const url = `https://dev.azure.com/${organization}/_apis/git/commits?api-version=7.0`;
    const res = await axios.get(url, { headers });
    return res.data.value.map((c) => ({
      id: c.commitId,
      message: c.comment,
      author: c.author.name,
      url: c.remoteUrl,
      date: c.author.date,
    }));
  });
}

module.exports = { getWorkItems, getPullRequests, getPipelines, getCommits };
