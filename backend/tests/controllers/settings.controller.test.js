// Tests for settings controller — Azure DevOps connect/disconnect endpoints
jest.mock('../../src/services/settings.service', () => ({
  getAzureSettings: jest.fn(),
  saveAzureSettings: jest.fn(),
  removeAzureSettings: jest.fn(),
}));

const { getAzureSettings, saveAzureSettings, removeAzureSettings } = require('../../src/controllers/settings.controller');
const settingsService = require('../../src/services/settings.service');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const req = { user: { userId: 1 } };

beforeEach(() => jest.clearAllMocks());

describe('getAzureSettings(req, res)', () => {
  it('calls settingsService.getAzureSettings with req.user.userId', async () => {
    settingsService.getAzureSettings.mockResolvedValue({ connected: true, organization: 'org' });
    const res = mockRes();
    await getAzureSettings(req, res);
    expect(settingsService.getAzureSettings).toHaveBeenCalledWith(1);
  });

  it('returns 200 with { connected, organization }', async () => {
    settingsService.getAzureSettings.mockResolvedValue({ connected: true, organization: 'softworks' });
    const res = mockRes();
    await getAzureSettings(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ connected: true, organization: 'softworks' });
  });
});

describe('saveAzureSettings(req, res)', () => {
  it('calls settingsService.saveAzureSettings with userId and body', async () => {
    settingsService.saveAzureSettings.mockResolvedValue({ connected: true, organization: 'softworks' });
    const res = mockRes();
    await saveAzureSettings({ user: { userId: 1 }, body: { organization: 'softworks', patToken: 'pat123' } }, res);
    expect(settingsService.saveAzureSettings).toHaveBeenCalledWith(1, { organization: 'softworks', patToken: 'pat123' });
  });

  it('returns 200 with { connected: true, organization }', async () => {
    settingsService.saveAzureSettings.mockResolvedValue({ connected: true, organization: 'softworks' });
    const res = mockRes();
    await saveAzureSettings({ user: { userId: 1 }, body: { organization: 'softworks', patToken: 'pat123' } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ connected: true, organization: 'softworks' });
  });

  it('returns 400 if organization is missing', async () => {
    const res = mockRes();
    await saveAzureSettings({ user: { userId: 1 }, body: { patToken: 'pat123' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(settingsService.saveAzureSettings).not.toHaveBeenCalled();
  });

  it('returns 400 if patToken is missing', async () => {
    const res = mockRes();
    await saveAzureSettings({ user: { userId: 1 }, body: { organization: 'softworks' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(settingsService.saveAzureSettings).not.toHaveBeenCalled();
  });

  it('returns 404 if service throws "User not found"', async () => {
    settingsService.saveAzureSettings.mockRejectedValue(new Error('User not found'));
    const res = mockRes();
    await saveAzureSettings({ user: { userId: 99 }, body: { organization: 'org', patToken: 'pat' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 if service throws "Invalid organization"', async () => {
    settingsService.saveAzureSettings.mockRejectedValue(new Error('Invalid organization'));
    const res = mockRes();
    await saveAzureSettings({ user: { userId: 1 }, body: { organization: 'a@b.com', patToken: 'pat' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('organization name') }));
  });
});

describe('removeAzureSettings(req, res)', () => {
  it('calls settingsService.removeAzureSettings with userId', async () => {
    settingsService.removeAzureSettings.mockResolvedValue({ connected: false, organization: null });
    const res = mockRes();
    await removeAzureSettings(req, res);
    expect(settingsService.removeAzureSettings).toHaveBeenCalledWith(1);
  });

  it('returns 200 with { connected: false, organization: null }', async () => {
    settingsService.removeAzureSettings.mockResolvedValue({ connected: false, organization: null });
    const res = mockRes();
    await removeAzureSettings(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ connected: false, organization: null });
  });
});
