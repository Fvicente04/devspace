const { User } = require('../models/user.model');
const encryption = require('../utils/encryption');

function safeAzureResponse(user) {
  return {
    connected: !!user.azureOrganization,
    organization: user.azureOrganization || null,
  };
}

async function getAzureSettings(userId) {
  const user = await User.findOne({ where: { id: userId } });
  return safeAzureResponse(user);
}

async function saveAzureSettings(userId, { organization, patToken }) {
  const user = await User.findOne({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const encrypted = encryption.encrypt(patToken);
  await user.update({
    azureOrganization: organization,
    azurePatToken: JSON.stringify(encrypted),
    azureConnectedAt: new Date(),
  });

  return safeAzureResponse({ azureOrganization: organization });
}

async function removeAzureSettings(userId) {
  const user = await User.findOne({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  await user.update({ azureOrganization: null, azurePatToken: null, azureConnectedAt: null });
  return { connected: false, organization: null };
}

module.exports = { getAzureSettings, saveAzureSettings, removeAzureSettings };
