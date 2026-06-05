// Tests for azure service — proxy calls to Azure DevOps REST API with caching
jest.mock('axios');
jest.mock('../../src/utils/cache');
jest.mock('../../src/utils/encryption', () => ({
  decrypt: jest.fn().mockReturnValue('decrypted-pat'),
}));

const axios = require('axios');
const cache = require('../../src/utils/cache');
const { getWorkItems, getPullRequests, getPipelines, getCommits } = require('../../src/services/azure.service');

const encryptedPat = JSON.stringify({ iv: 'iv', encryptedData: 'enc', authTag: 'tag' });
const org = 'softworks-workforce';
const userId = 1;
const expectedAuthHeader = `Basic ${Buffer.from(':decrypted-pat').toString('base64')}`;

beforeEach(() => {
  jest.clearAllMocks();
  cache.get.mockReturnValue(null);
  cache.set.mockReturnValue(undefined);
});

describe('getWorkItems(userId, organization, encryptedPat)', () => {
  const mockItems = [{ id: { workItemType: 'Task', state: 'Active' }, fields: { 'System.Id': 1, 'System.Title': 'Fix bug', 'System.WorkItemType': 'Task', 'System.State': 'Active' }, url: 'https://dev.azure.com/item/1' }];

  beforeEach(() => {
    axios.post.mockResolvedValue({ data: { workItems: mockItems } });
    axios.get.mockResolvedValue({ data: { value: mockItems } });
  });

  it('decrypts the PAT and uses Basic auth header', async () => {
    await getWorkItems(userId, org, encryptedPat);
    const call = axios.post.mock.calls[0];
    expect(call[2].headers['Authorization']).toBe(expectedAuthHeader);
  });

  it('POSTs to the WIQL endpoint', async () => {
    await getWorkItems(userId, org, encryptedPat);
    expect(axios.post.mock.calls[0][0]).toContain(`dev.azure.com/${org}`);
    expect(axios.post.mock.calls[0][0]).toContain('wiql');
  });

  it('returns formatted array with id, title, type, state, url', async () => {
    axios.post.mockResolvedValue({
      data: {
        workItems: [{ id: 42 }],
      },
    });
    axios.get.mockResolvedValue({
      data: {
        value: [{ id: 42, fields: { 'System.Title': 'Fix bug', 'System.WorkItemType': 'Task', 'System.State': 'Active' }, url: 'https://dev.azure.com/item/42' }],
      },
    });
    const result = await getWorkItems(userId, org, encryptedPat);
    expect(result[0]).toMatchObject({ id: 42, title: 'Fix bug', type: 'Task', state: 'Active' });
  });

  it('returns cached result on second call', async () => {
    cache.get.mockReturnValueOnce(null).mockReturnValueOnce([{ id: 1, title: 'cached' }]);
    await getWorkItems(userId, org, encryptedPat);
    const cached = await getWorkItems(userId, org, encryptedPat);
    expect(cached).toEqual([{ id: 1, title: 'cached' }]);
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('uses cache TTL of 300 seconds', async () => {
    await getWorkItems(userId, org, encryptedPat);
    expect(cache.set).toHaveBeenCalledWith(expect.any(String), expect.any(Array), 300);
  });

  it('throws "Azure DevOps PAT invalid or expired" on 401', async () => {
    axios.post.mockRejectedValue({ response: { status: 401 } });
    await expect(getWorkItems(userId, org, encryptedPat)).rejects.toThrow('Azure DevOps PAT invalid or expired');
  });

  it('throws "Azure DevOps organization not found" on 404', async () => {
    axios.post.mockRejectedValue({ response: { status: 404 } });
    await expect(getWorkItems(userId, org, encryptedPat)).rejects.toThrow('Azure DevOps organization not found');
  });
});

describe('getPullRequests(userId, organization, encryptedPat)', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: {
        value: [{ pullRequestId: 10, title: 'Add feature', repository: { name: 'repo' }, status: 'active', url: 'https://dev.azure.com/pr/10', creationDate: '2024-01-01' }],
      },
    });
  });

  it('GETs the pull requests endpoint', async () => {
    await getPullRequests(userId, org, encryptedPat);
    expect(axios.get.mock.calls[0][0]).toContain(`dev.azure.com/${org}`);
    expect(axios.get.mock.calls[0][0]).toContain('pullrequests');
  });

  it('returns formatted array with id, title, repo, status, url, createdAt', async () => {
    const result = await getPullRequests(userId, org, encryptedPat);
    expect(result[0]).toMatchObject({ id: 10, title: 'Add feature', repo: 'repo', status: 'active' });
  });

  it('returns cached result on second call', async () => {
    cache.get.mockReturnValueOnce(null).mockReturnValueOnce([{ id: 10, title: 'cached' }]);
    await getPullRequests(userId, org, encryptedPat);
    const cached = await getPullRequests(userId, org, encryptedPat);
    expect(cached).toEqual([{ id: 10, title: 'cached' }]);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
});

describe('getPipelines(userId, organization, encryptedPat)', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: {
        value: [{ id: 5, pipeline: { name: 'CI' }, state: 'completed', result: 'succeeded', _links: { web: { href: 'https://dev.azure.com/run/5' } }, finishedDate: '2024-01-01' }],
      },
    });
  });

  it('GETs the pipelines runs endpoint', async () => {
    await getPipelines(userId, org, encryptedPat);
    expect(axios.get.mock.calls[0][0]).toContain('pipelines');
  });

  it('returns formatted array with id, name, status, result, url, finishedAt', async () => {
    const result = await getPipelines(userId, org, encryptedPat);
    expect(result[0]).toMatchObject({ id: 5, name: 'CI', status: 'completed', result: 'succeeded' });
  });

  it('uses cache TTL of 120 seconds', async () => {
    await getPipelines(userId, org, encryptedPat);
    expect(cache.set).toHaveBeenCalledWith(expect.any(String), expect.any(Array), 120);
  });

  it('returns cached result on second call', async () => {
    cache.get.mockReturnValueOnce(null).mockReturnValueOnce([{ id: 5, name: 'cached' }]);
    await getPipelines(userId, org, encryptedPat);
    const cached = await getPipelines(userId, org, encryptedPat);
    expect(cached).toEqual([{ id: 5, name: 'cached' }]);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
});

describe('getCommits(userId, organization, encryptedPat)', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: {
        value: [{ commitId: 'abc123', comment: 'fix: bug', author: { name: 'Felipe' }, remoteUrl: 'https://dev.azure.com/commit/abc', author: { name: 'Felipe', date: '2024-01-01' } }],
      },
    });
  });

  it('GETs the commits endpoint', async () => {
    await getCommits(userId, org, encryptedPat);
    expect(axios.get.mock.calls[0][0]).toContain('commits');
  });

  it('returns formatted array with id, message, author, url, date', async () => {
    const result = await getCommits(userId, org, encryptedPat);
    expect(result[0]).toMatchObject({ id: 'abc123', message: 'fix: bug', author: 'Felipe' });
  });

  it('returns cached result on second call', async () => {
    cache.get.mockReturnValueOnce(null).mockReturnValueOnce([{ id: 'abc', message: 'cached' }]);
    await getCommits(userId, org, encryptedPat);
    const cached = await getCommits(userId, org, encryptedPat);
    expect(cached).toEqual([{ id: 'abc', message: 'cached' }]);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
});
