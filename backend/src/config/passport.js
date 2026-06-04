// Configures passport-github2 strategy — delegates user lookup to auth service
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const env = require('./env');
const authService = require('../services/auth.service');

passport.use(
  new GitHubStrategy(
    {
      clientID: env.githubClientId,
      clientSecret: env.githubClientSecret,
      callbackURL: env.githubCallbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await authService.findOrCreateUser({
          id: profile.id,
          username: profile.username,
          displayName: profile.displayName,
          photos: profile.photos,
          accessToken,
        });
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

module.exports = passport;
