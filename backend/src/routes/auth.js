// Auth routes — GitHub OAuth redirect, callback, current user, and logout
const { Router } = require('express');
const passport = require('passport');
const authService = require('../services/auth.service');
const { authenticate } = require('../middlewares/authenticate');
const env = require('../config/env');

const router = Router();

router.get('/github', (req, res, next) => {
  passport.authenticate('github', { scope: ['user', 'repo'], session: false })(req, res, next);
});

router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${env.frontendUrl}/login?error=auth_failed`);
    }
    const token = authService.generateToken(user);
    res.redirect(`${env.frontendUrl}/auth/callback?token=${token}`);
  })(req, res, next);
});

router.get('/me', authenticate, (req, res) => {
  const { userId, username, displayName, avatarUrl } = req.user;
  res.json({ id: userId, username, displayName, avatarUrl });
});

module.exports = router;
