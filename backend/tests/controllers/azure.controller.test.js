// Tests for azure controller — 403 guard, service delegation, error mapping
jest.mock('../../src/services/azure.service', () => ({
  getWorkItems: jest.fn(),
  getPullRequests: jest.fn(),
  getPipelines: jest.fn(),
  getCommits: jest.fn(),
}));

const { getWorkItems, getPullRequests, getPipelines, getCommits } = require('../../src/controllers/azure.controller');
const azureService = require('../../src/services/azure.service');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const connectedReq = {
  user: { userId: 1, azureOrganization: 'softworks-workforce', azurePatToken: 'encrypted' },
};
const disconnectedReq = {
  user: { userId: 1, azureOrganization: null, azurePatToken: null },
};

beforeEach(() => jest.clearAllMocks());

describe('getWorkItems', () => {
  it('returns 403 if azureOrganization is null', async () => {
    const res = mockRes();
    await getWorkItems(disconnectedReq, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Azure DevOps not connected' });
  });

  it('calls azureService.getWorkItems with userId, organization, encryptedPat', async () => {
    azureService.getWorkItems.mockResolvedValue([]);
    const res = mockRes();
    await getWorkItems(connectedReq, res);
    expect(azureService.getWorkItems).toHaveBeenCalledWith(1, 'softworks-workforce', 'encrypted');
  });

  it('returns 200 with work items array', async () => {
    azureService.getWorkItems.mockResolvedValue([{ id: 1, title: 'Fix bug' }]);
    const res = mockRes();
    await getWorkItems(connectedReq, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 1, title: 'Fix bug' }]);
  });

  it('returns 401 if service throws "Azure DevOps PAT invalid or expired"', async () => {
    azureService.getWorkItems.mockRejectedValue(new Error('Azure DevOps PAT invalid or expired'));
    const res = mockRes();
    await getWorkItems(connectedReq, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 if service throws "Azure DevOps organization not found"', async () => {
    azureService.getWorkItems.mockRejectedValue(new Error('Azure DevOps organization not found'));
    const res = mockRes();
    await getWorkItems(connectedReq, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 500 for other errors', async () => {
    azureService.getWorkItems.mockRejectedValue(new Error('unexpected'));
    const res = mockRes();
    await getWorkItems(connectedReq, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('getPullRequests', () => {
  it('returns 403 if azureOrganization is null', async () => {
    const res = mockRes();
    await getPullRequests(disconnectedReq, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('calls azureService.getPullRequests and returns 200', async () => {
    azureService.getPullRequests.mockResolvedValue([{ id: 10 }]);
    const res = mockRes();
    await getPullRequests(connectedReq, res);
    expect(azureService.getPullRequests).toHaveBeenCalledWith(1, 'softworks-workforce', 'encrypted');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('getPipelines', () => {
  it('returns 403 if azureOrganization is null', async () => {
    const res = mockRes();
    await getPipelines(disconnectedReq, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('calls azureService.getPipelines and returns 200', async () => {
    azureService.getPipelines.mockResolvedValue([{ id: 5 }]);
    const res = mockRes();
    await getPipelines(connectedReq, res);
    expect(azureService.getPipelines).toHaveBeenCalledWith(1, 'softworks-workforce', 'encrypted');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('getCommits', () => {
  it('returns 403 if azureOrganization is null', async () => {
    const res = mockRes();
    await getCommits(disconnectedReq, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('calls azureService.getCommits and returns 200', async () => {
    azureService.getCommits.mockResolvedValue([{ id: 'abc' }]);
    const res = mockRes();
    await getCommits(connectedReq, res);
    expect(azureService.getCommits).toHaveBeenCalledWith(1, 'softworks-workforce', 'encrypted');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
