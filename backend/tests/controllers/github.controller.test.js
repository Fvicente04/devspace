// Tests for github controller — verifies correct service calls and HTTP status mapping
jest.mock('../../src/services/github.service');

const githubService = require('../../src/services/github.service');
const { getPRs, getIssues, getActivity } = require('../../src/controllers/github.controller');

function mockReq() {
  return { user: { userId: 1, username: 'Fvicente04', githubToken: 'gho_test' } };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

describe('getPRs', () => {
  it('calls getPullRequests with githubToken and username, returns 200', async () => {
    const prs = [{ id: 1, title: 'PR 1' }];
    githubService.getPullRequests.mockResolvedValue(prs);
    const res = mockRes();
    await getPRs(mockReq(), res);
    expect(githubService.getPullRequests).toHaveBeenCalledWith('gho_test', 'Fvicente04');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(prs);
  });

  it('returns 401 when service throws "GitHub token invalid or expired"', async () => {
    githubService.getPullRequests.mockRejectedValue(new Error('GitHub token invalid or expired'));
    const res = mockRes();
    await getPRs(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 429 when service throws "GitHub API rate limit exceeded"', async () => {
    githubService.getPullRequests.mockRejectedValue(new Error('GitHub API rate limit exceeded'));
    const res = mockRes();
    await getPRs(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(429);
  });

  it('returns 500 for any other error', async () => {
    githubService.getPullRequests.mockRejectedValue(new Error('Network error'));
    const res = mockRes();
    await getPRs(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('getIssues', () => {
  it('calls getIssues with correct args and returns 200', async () => {
    const issues = [{ id: 2, title: 'Issue 1' }];
    githubService.getIssues.mockResolvedValue(issues);
    const res = mockRes();
    await getIssues(mockReq(), res);
    expect(githubService.getIssues).toHaveBeenCalledWith('gho_test', 'Fvicente04');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(issues);
  });

  it('returns 401 when token is invalid', async () => {
    githubService.getIssues.mockRejectedValue(new Error('GitHub token invalid or expired'));
    const res = mockRes();
    await getIssues(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 429 on rate limit', async () => {
    githubService.getIssues.mockRejectedValue(new Error('GitHub API rate limit exceeded'));
    const res = mockRes();
    await getIssues(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(429);
  });

  it('returns 500 for other errors', async () => {
    githubService.getIssues.mockRejectedValue(new Error('fail'));
    const res = mockRes();
    await getIssues(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('getActivity', () => {
  it('calls getActivity with correct args and returns 200', async () => {
    const events = [{ id: '3', type: 'push' }];
    githubService.getActivity.mockResolvedValue(events);
    const res = mockRes();
    await getActivity(mockReq(), res);
    expect(githubService.getActivity).toHaveBeenCalledWith('gho_test', 'Fvicente04');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(events);
  });

  it('returns 401 when token is invalid', async () => {
    githubService.getActivity.mockRejectedValue(new Error('GitHub token invalid or expired'));
    const res = mockRes();
    await getActivity(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 429 on rate limit', async () => {
    githubService.getActivity.mockRejectedValue(new Error('GitHub API rate limit exceeded'));
    const res = mockRes();
    await getActivity(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(429);
  });

  it('returns 500 for other errors', async () => {
    githubService.getActivity.mockRejectedValue(new Error('fail'));
    const res = mockRes();
    await getActivity(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
