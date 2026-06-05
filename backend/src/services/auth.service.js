// Handles user lookup/creation from GitHub profile, JWT generation and verification
const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');
const env = require('../config/env');

async function findOrCreateUser(githubProfile) {
  const existing = await User.findOne({ where: { githubId: githubProfile.id } });
  if (existing) {
    await existing.update({
      githubToken: githubProfile.accessToken,
      username: githubProfile.username,
      displayName: githubProfile.displayName,
      avatarUrl: githubProfile.photos?.[0]?.value ?? existing.avatarUrl,
    });
    return existing;
  }

  return User.create({
    githubId: githubProfile.id,
    username: githubProfile.username,
    displayName: githubProfile.displayName,
    avatarUrl: githubProfile.photos?.[0]?.value ?? null,
    githubToken: githubProfile.accessToken,
  });
}

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = { findOrCreateUser, generateToken, verifyToken };
