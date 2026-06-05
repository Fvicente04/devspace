// JWT authentication middleware — verifies token and fetches full user (including githubToken) from DB
const authService = require('../services/auth.service');
const { User } = require('../models/user.model');

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = authService.verifyToken(token);
    const user = await User.findOne({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      ...decoded,
      githubToken: user.githubToken,
      azureOrganization: user.azureOrganization || null,
      azurePatToken: user.azurePatToken || null,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authenticate };
