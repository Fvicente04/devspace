// Auth routes — GitHub OAuth redirect, callback, current user, and logout
// Uses manual OAuth flow (no passport session/state) for reliability in production
const { Router } = require('express');
const axios = require('axios');
const authService = require('../services/auth.service');
const { authenticate } = require('../middlewares/authenticate');
const env = require('../config/env');

const router = Router();

router.get('/github', (req, res) => {
  const params = new URLSearchParams({
    client_id: env.githubClientId,
    redirect_uri: env.githubCallbackUrl,
    scope: 'user repo',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

router.get('/github/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(`${env.frontendUrl}/login?error=auth_failed`);

  try {
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      { client_id: env.githubClientId, client_secret: env.githubClientSecret, code },
      { headers: { Accept: 'application/json' } }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) {
      const detail = tokenRes.data.error_description || 'no_access_token';
      return res.redirect(`${env.frontendUrl}/login?error=${encodeURIComponent(detail)}`);
    }

    const profileRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}` },
    });

    const p = profileRes.data;
    const user = await authService.findOrCreateUser({
      id: String(p.id),
      username: p.login,
      displayName: p.name || p.login,
      photos: p.avatar_url ? [{ value: p.avatar_url }] : [],
      accessToken,
    });

    const token = authService.generateToken(user);
    res.redirect(`${env.frontendUrl}/auth/callback?token=${token}`);
  } catch (err) {
    const detail = encodeURIComponent(err.message || 'unknown');
    console.error('GitHub OAuth error:', err.message);
    res.redirect(`${env.frontendUrl}/login?error=${detail}`);
  }
});

router.get('/me', authenticate, (req, res) => {
  const { userId, username, displayName, avatarUrl } = req.user;
  res.json({ id: userId, username, displayName, avatarUrl });
});

module.exports = router;
