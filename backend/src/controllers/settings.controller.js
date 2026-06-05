const settingsService = require('../services/settings.service');

async function getAzureSettings(req, res) {
  try {
    const result = await settingsService.getAzureSettings(req.user.userId);
    res.status(200).json(result);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function saveAzureSettings(req, res) {
  const { organization, patToken } = req.body;
  if (!organization || !patToken) {
    return res.status(400).json({ error: 'organization and patToken are required' });
  }

  try {
    const result = await settingsService.saveAzureSettings(req.user.userId, { organization, patToken });
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'User not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function removeAzureSettings(req, res) {
  try {
    const result = await settingsService.removeAzureSettings(req.user.userId);
    res.status(200).json(result);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getAzureSettings, saveAzureSettings, removeAzureSettings };
