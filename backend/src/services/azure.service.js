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

// PRs, builds and commits are project-scoped in the Azure DevOps API,
// so every aggregation starts by listing the org's projects
async function listProjectNames(organization, headers) {
  const url = `https://dev.azure.com/${organization}/_apis/projects?api-version=7.0`;
  const res = await axios.get(url, { headers });
  return res.data.value.map((p) => p.name);
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
    // Org-level endpoint returns PRs across every project the PAT can see —
    // listing projects first misses any project _apis/projects doesn't return
    const url = `https://dev.azure.com/${organization}/_apis/git/pullrequests?searchCriteria.status=active&$top=50&api-version=7.0`;
    try {
      const res = await axios.get(url, { headers });
      return res.data.value.map((pr) => ({
        id: pr.pullRequestId,
        title: pr.title,
        repo: pr.repository.name,
        status: pr.status,
        // pr.url is the JSON API resource — build the browser link instead
        url: `https://dev.azure.com/${organization}/${encodeURIComponent(pr.repository.project.name)}/_git/${encodeURIComponent(pr.repository.name)}/pullrequest/${pr.pullRequestId}`,
        createdAt: pr.creationDate,
      }));
    } catch (error) {
      handleAzureApiError(error);
    }
  });
}

async function getPipelines(userId, organization, encryptedPat) {
  const cacheKey = `azure:pipelines:${userId}`;
  return fetchAzureWithCache(userId, cacheKey, 120, async () => {
    const headers = { Authorization: buildAuthHeader(encryptedPat) };
    try {
      const projects = await listProjectNames(organization, headers);
      // Build API instead of pipelines/runs — runs requires a pipeline id,
      // builds lists recent runs across all definitions in one call per project
      const perProject = await Promise.all(projects.map(async (project) => {
        const url = `https://dev.azure.com/${organization}/${encodeURIComponent(project)}/_apis/build/builds?$top=5&queryOrder=finishTimeDescending&api-version=7.0`;
        const res = await axios.get(url, { headers });
        return res.data.value.map((build) => ({
          id: build.id,
          name: build.definition.name,
          status: build.status,
          result: build.result || null,
          url: build._links?.web?.href,
          finishedAt: build.finishTime || null,
        }));
      }));
      // in-progress runs have no finishTime — treat them as most recent
      return perProject.flat()
        .sort((a, b) => new Date(b.finishedAt || Date.now()) - new Date(a.finishedAt || Date.now()))
        .slice(0, 5);
    } catch (error) {
      handleAzureApiError(error);
    }
  });
}

async function getCommits(userId, organization, encryptedPat) {
  const cacheKey = `azure:commits:${userId}`;
  return fetchAzureWithCache(userId, cacheKey, 300, async () => {
    const headers = { Authorization: buildAuthHeader(encryptedPat) };
    try {
      const projects = await listProjectNames(organization, headers);
      // commits are repo-scoped, so this fans out projects × repos — fine for
      // small orgs and cached 5 min, but will be slow on orgs with many repos
      const perProject = await Promise.all(projects.map(async (project) => {
        const reposUrl = `https://dev.azure.com/${organization}/${encodeURIComponent(project)}/_apis/git/repositories?api-version=7.0`;
        const reposRes = await axios.get(reposUrl, { headers });
        const perRepo = await Promise.all(reposRes.data.value.map(async (repo) => {
          const commitsUrl = `https://dev.azure.com/${organization}/${encodeURIComponent(project)}/_apis/git/repositories/${repo.id}/commits?searchCriteria.$top=10&api-version=7.0`;
          const res = await axios.get(commitsUrl, { headers });
          return res.data.value.map((c) => ({
            id: c.commitId,
            message: c.comment,
            author: c.author.name,
            url: c.remoteUrl,
            date: c.author.date,
          }));
        }));
        return perRepo.flat();
      }));
      return perProject.flat()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
    } catch (error) {
      handleAzureApiError(error);
    }
  });
}

module.exports = { getWorkItems, getPullRequests, getPipelines, getCommits };
