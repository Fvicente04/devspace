// Proxy to GitHub API — all calls use the user's stored github_token, never exposed to frontend
const axios = require('axios');
const cache = require('../utils/cache');

const CACHE_TTL = 300;

function githubHeaders(token) {
  return { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' };
}

function handleAxiosError(error) {
  const status = error.response?.status;
  if (status === 401) throw new Error('GitHub token invalid or expired');
  if (status === 403) throw new Error('GitHub API rate limit exceeded');
  throw new Error('GitHub API error');
}

async function fetchWithCache(key, ttl, fetchFn) {
  const cached = cache.get(key);
  if (cached) return cached;
  const data = await fetchFn();
  cache.set(key, data, ttl);
  return data;
}

async function getPullRequests(githubToken, username) {
  return fetchWithCache(`github:prs:${username}`, CACHE_TTL, async () => {
    try {
      const { data } = await axios.get(
        `https://api.github.com/search/issues?q=author:${username}+type:pr+state:open`,
        { headers: githubHeaders(githubToken) }
      );
      return data.items.map((item) => ({
        id: item.id,
        title: item.title,
        url: item.html_url,
        repo: item.repository_url.replace('https://api.github.com/repos/', ''),
        status: 'open',
        createdAt: item.created_at,
      }));
    } catch (err) { handleAxiosError(err); }
  });
}

async function getIssues(githubToken, username) {
  return fetchWithCache(`github:issues:${username}`, CACHE_TTL, async () => {
    try {
      const { data } = await axios.get(
        `https://api.github.com/search/issues?q=assignee:${username}+type:issue+state:open`,
        { headers: githubHeaders(githubToken) }
      );
      return data.items.map((item) => ({
        id: item.id, title: item.title, url: item.html_url,
        repo: item.repository_url.replace('https://api.github.com/repos/', ''),
        createdAt: item.created_at,
      }));
    } catch (err) { handleAxiosError(err); }
  });
}

function mapEventType(type) {
  if (type === 'PushEvent') return 'push';
  if (type === 'PullRequestEvent') return 'pr';
  if (type === 'IssuesEvent') return 'issue';
  return 'other';
}

function describeEvent(event) {
  if (event.type === 'PushEvent') return `Pushed ${event.payload.commits?.length ?? 1} commit(s)`;
  if (event.type === 'PullRequestEvent') return `${event.payload.action} a pull request`;
  if (event.type === 'IssuesEvent') return `${event.payload.action} an issue`;
  return event.type.replace('Event', '');
}

async function getActivity(githubToken, username) {
  return fetchWithCache(`github:activity:${username}`, CACHE_TTL, async () => {
    try {
      const { data } = await axios.get(
        `https://api.github.com/users/${username}/events`,
        { headers: githubHeaders(githubToken) }
      );
      return data.slice(0, 10).map((e) => ({
        id: e.id, type: mapEventType(e.type), repo: e.repo.name,
        description: describeEvent(e), createdAt: e.created_at,
      }));
    } catch (err) { handleAxiosError(err); }
  });
}

module.exports = { getPullRequests, getIssues, getActivity };
