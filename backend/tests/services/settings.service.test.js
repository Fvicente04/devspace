// Tests for settings service — Azure DevOps PAT connect/disconnect
jest.mock('../../src/models/user.model', () => ({
  User: { findOne: jest.fn(), update: jest.fn() },
}));

jest.mock('../../src/utils/encryption', () => ({
  encrypt: jest.fn().mockReturnValue({ iv: 'iv', encryptedData: 'enc', authTag: 'tag' }),
}));

const { getAzureSettings, saveAzureSettings, removeAzureSettings } = require('../../src/services/settings.service');
const { User } = require('../../src/models/user.model');
const encryption = require('../../src/utils/encryption');

const connectedUser = {
  id: 1,
  azureOrganization: 'softworks-workforce',
  azurePatToken: JSON.stringify({ iv: 'iv', encryptedData: 'enc', authTag: 'tag' }),
  update: jest.fn().mockResolvedValue(true),
};

const disconnectedUser = {
  id: 1,
  azureOrganization: null,
  azurePatToken: null,
  update: jest.fn().mockResolvedValue(true),
};

beforeEach(() => jest.clearAllMocks());

describe('getAzureSettings(userId)', () => {
  it('returns connected: true and organization when user has azureOrganization set', async () => {
    User.findOne.mockResolvedValue(connectedUser);
    const result = await getAzureSettings(1);
    expect(result).toEqual({ connected: true, organization: 'softworks-workforce' });
  });

  it('returns connected: false and organization: null when not connected', async () => {
    User.findOne.mockResolvedValue(disconnectedUser);
    const result = await getAzureSettings(1);
    expect(result).toEqual({ connected: false, organization: null });
  });

  it('never returns azurePatToken in the response', async () => {
    User.findOne.mockResolvedValue(connectedUser);
    const result = await getAzureSettings(1);
    expect(result).not.toHaveProperty('azurePatToken');
    expect(result).not.toHaveProperty('patToken');
  });
});

describe('saveAzureSettings(userId, { organization, patToken })', () => {
  it('calls encryption.encrypt with the patToken', async () => {
    User.findOne.mockResolvedValue({ ...disconnectedUser, update: jest.fn().mockResolvedValue(true) });
    await saveAzureSettings(1, { organization: 'softworks-workforce', patToken: 'my-pat' });
    expect(encryption.encrypt).toHaveBeenCalledWith('my-pat');
  });

  it('updates user with organization, encrypted PAT, and azureConnectedAt', async () => {
    const mockUpdate = jest.fn().mockResolvedValue(true);
    User.findOne.mockResolvedValue({ ...disconnectedUser, update: mockUpdate });
    await saveAzureSettings(1, { organization: 'softworks-workforce', patToken: 'my-pat' });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        azureOrganization: 'softworks-workforce',
        azurePatToken: expect.any(String),
        azureConnectedAt: expect.any(Date),
      })
    );
  });

  it('returns { connected: true, organization }', async () => {
    User.findOne.mockResolvedValue({ ...disconnectedUser, update: jest.fn().mockResolvedValue(true) });
    const result = await saveAzureSettings(1, { organization: 'softworks-workforce', patToken: 'my-pat' });
    expect(result).toEqual({ connected: true, organization: 'softworks-workforce' });
  });

  it('throws "User not found" if userId does not exist', async () => {
    User.findOne.mockResolvedValue(null);
    await expect(saveAzureSettings(99, { organization: 'org', patToken: 'pat' }))
      .rejects.toThrow('User not found');
  });

  it.each([
    ['https://dev.azure.com/softworks-workforce', 'softworks-workforce'],
    ['softworks-workforce.visualstudio.com', 'softworks-workforce'],
    ['https://softworks-workforce.visualstudio.com/', 'softworks-workforce'],
    ['dev.azure.com/softworks-workforce/AllSoftworksProjects', 'softworks-workforce'],
    ['  softworks-workforce/  ', 'softworks-workforce'],
  ])('normalizes pasted org %s to the bare slug', async (input, expected) => {
    const mockUpdate = jest.fn().mockResolvedValue(true);
    User.findOne.mockResolvedValue({ ...disconnectedUser, update: mockUpdate });
    const result = await saveAzureSettings(1, { organization: input, patToken: 'my-pat' });
    expect(result.organization).toBe(expected);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ azureOrganization: expected })
    );
  });
});

describe('removeAzureSettings(userId)', () => {
  it('nullifies azureOrganization, azurePatToken, and azureConnectedAt', async () => {
    const mockUpdate = jest.fn().mockResolvedValue(true);
    User.findOne.mockResolvedValue({ ...connectedUser, update: mockUpdate });
    await removeAzureSettings(1);
    expect(mockUpdate).toHaveBeenCalledWith({
      azureOrganization: null,
      azurePatToken: null,
      azureConnectedAt: null,
    });
  });

  it('returns { connected: false, organization: null }', async () => {
    User.findOne.mockResolvedValue({ ...connectedUser, update: jest.fn().mockResolvedValue(true) });
    const result = await removeAzureSettings(1);
    expect(result).toEqual({ connected: false, organization: null });
  });

  it('throws "User not found" if userId does not exist', async () => {
    User.findOne.mockResolvedValue(null);
    await expect(removeAzureSettings(99)).rejects.toThrow('User not found');
  });
});
