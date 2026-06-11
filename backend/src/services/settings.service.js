const { User } = require('../models/user.model');
const encryption = require('../utils/encryption');
const cache = require('../utils/cache');

// Drop any cached Azure responses so a reconnect with a fixed PAT/org
// is reflected immediately instead of after the 5-min TTL
function invalidateAzureCache(userId) {
  ['workitems', 'prs', 'pipelines', 'commits'].forEach((type) =>
    cache.delete(`azure:${type}:${userId}`)
  );
}

// Users paste the org in many shapes — full url, old visualstudio.com host,
// trailing slash. Everything downstream builds dev.azure.com/{org}/..., so we
// reduce whatever they give us to the bare org slug.
function normalizeOrganization(input) {
  const trimmed = input.trim().replace(/^https?:\/\//, '');
  const oldHost = trimmed.match(/^([^./]+)\.visualstudio\.com/);
  if (oldHost) return oldHost[1];
  const modernHost = trimmed.match(/^dev\.azure\.com\/([^/]+)/);
  if (modernHost) return modernHost[1];
  return trimmed.replace(/\/.*$/, '');
}

// An org slug is a single path segment — no @ (email), spaces or dots. Catches
// the common mistake of pasting an email or login in the organization field.
function isValidOrganization(org) {
  return org.length > 0 && !/[@\s.]/.test(org);
}

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

  const cleanOrg = normalizeOrganization(organization);
  if (!isValidOrganization(cleanOrg)) throw new Error('Invalid organization');

  const encrypted = encryption.encrypt(patToken);
  await user.update({
    azureOrganization: cleanOrg,
    azurePatToken: JSON.stringify(encrypted),
    azureConnectedAt: new Date(),
  });

  invalidateAzureCache(userId);
  return safeAzureResponse({ azureOrganization: cleanOrg });
}

async function removeAzureSettings(userId) {
  const user = await User.findOne({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  await user.update({ azureOrganization: null, azurePatToken: null, azureConnectedAt: null });
  invalidateAzureCache(userId);
  return { connected: false, organization: null };
}

module.exports = { getAzureSettings, saveAzureSettings, removeAzureSettings };
