// Tests for the GitHub service — proxy to GitHub API with in-memory caching
jest.mock('axios');
jest.mock('../../src/utils/cache');

const axios = require('axios');
const cache = require('../../src/utils/cache');
const { getPullRequests, getIssues, getActivity } = require('../../src/services/github.service');

const githubToken = 'gho_test_token';
const username = 'Fvicente04';

const mockPRItem = {
  id: 1,
  title: 'Fix auth bug',
  html_url: 'https://github.com/owner/repo/pull/1',
  repository_url: 'https://api.github.com/repos/owner/repo',
  created_at: '2024-01-01T00:00:00Z',
};

const mockIssueItem = {
  id: 2,
  title: 'Update docs',
  html_url: 'https://github.com/owner/repo/issues/2',
  repository_url: 'https://api.github.com/repos/owner/repo',
  created_at: '2024-01-02T00:00:00Z',
};

const mockEventItem = {
  id: '3',
  type: 'PushEvent',
  repo: { name: 'owner/repo' },
  payload: { commits: [{ message: 'fix bug' }, { message: 'add test' }] },
  created_at: '2024-01-03T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  cache.get.mockReturnValue(null); // cache miss by default
  cache.set.mockImplementation(() => {});
});

describe('getPullRequests(githubToken, username)', () => {
  it('makes GET to the correct GitHub search URL', async () => {
    axios.get.mockResolvedValue({ data: { items: [mockPRItem] } });
    await getPullRequests(githubToken, username);
    expect(axios.get).toHaveBeenCalledWith(
      `https://api.github.com/search/issues?q=author:${username}+type:pr+state:open`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${githubToken}` }) })
    );
  });

  it('returns formatted PRs array', async () => {
    axios.get.mockResolvedValue({ data: { items: [mockPRItem] } });
    const result = await getPullRequests(githubToken, username);
    expect(result).toEqual([{
      id: 1,
      title: 'Fix auth bug',
      url: 'https://github.com/owner/repo/pull/1',
      repo: 'owner/repo',
      status: 'open',
      createdAt: '2024-01-01T00:00:00Z',
    }]);
  });

  it('returns cached result without calling axios on cache hit', async () => {
    const cached = [{ id: 1, title: 'cached PR' }];
    cache.get.mockReturnValue(cached);
    const result = await getPullRequests(githubToken, username);
    expect(axios.get).not.toHaveBeenCalled();
    expect(result).toEqual(cached);
  });

  it('stores result in cache with 300s TTL', async () => {
    axios.get.mockResolvedValue({ data: { items: [mockPRItem] } });
    await getPullRequests(githubToken, username);
    expect(cache.set).toHaveBeenCalledWith(`github:prs:${username}`, expect.any(Array), 300);
  });
});

describe('getIssues(githubToken, username)', () => {
  it('makes GET to the correct GitHub search URL', async () => {
    axios.get.mockResolvedValue({ data: { items: [mockIssueItem] } });
    await getIssues(githubToken, username);
    expect(axios.get).toHaveBeenCalledWith(
      `https://api.github.com/search/issues?q=assignee:${username}+type:issue+state:open`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${githubToken}` }) })
    );
  });

  it('returns formatted issues array', async () => {
    axios.get.mockResolvedValue({ data: { items: [mockIssueItem] } });
    const result = await getIssues(githubToken, username);
    expect(result).toEqual([{
      id: 2,
      title: 'Update docs',
      url: 'https://github.com/owner/repo/issues/2',
      repo: 'owner/repo',
      createdAt: '2024-01-02T00:00:00Z',
    }]);
  });

  it('returns cached result without calling axios on cache hit', async () => {
    const cached = [{ id: 2, title: 'cached issue' }];
    cache.get.mockReturnValue(cached);
    const result = await getIssues(githubToken, username);
    expect(axios.get).not.toHaveBeenCalled();
    expect(result).toEqual(cached);
  });
});

describe('getActivity(githubToken, username)', () => {
  it('makes GET to the correct GitHub events URL', async () => {
    axios.get.mockResolvedValue({ data: [mockEventItem] });
    await getActivity(githubToken, username);
    expect(axios.get).toHaveBeenCalledWith(
      `https://api.github.com/users/${username}/events`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${githubToken}` }) })
    );
  });

  it('returns formatted activity array with mapped type', async () => {
    axios.get.mockResolvedValue({ data: [mockEventItem] });
    const result = await getActivity(githubToken, username);
    expect(result[0]).toMatchObject({
      id: '3',
      type: 'push',
      repo: 'owner/repo',
      createdAt: '2024-01-03T00:00:00Z',
    });
  });

  it('returns cached result without calling axios on cache hit', async () => {
    const cached = [{ id: '3', type: 'push' }];
    cache.get.mockReturnValue(cached);
    const result = await getActivity(githubToken, username);
    expect(axios.get).not.toHaveBeenCalled();
    expect(result).toEqual(cached);
  });
});

describe('error handling', () => {
  it('throws "GitHub token invalid or expired" on 401', async () => {
    axios.get.mockRejectedValue({ response: { status: 401 } });
    await expect(getPullRequests(githubToken, username)).rejects.toThrow('GitHub token invalid or expired');
  });

  it('throws "GitHub API rate limit exceeded" on 403', async () => {
    axios.get.mockRejectedValue({ response: { status: 403 } });
    await expect(getPullRequests(githubToken, username)).rejects.toThrow('GitHub API rate limit exceeded');
  });

  it('throws a generic error for other failures', async () => {
    axios.get.mockRejectedValue({ response: { status: 500 } });
    await expect(getPullRequests(githubToken, username)).rejects.toThrow();
  });
});
