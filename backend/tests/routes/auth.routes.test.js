// Integration tests for auth routes — passport and authService are mocked
const request = require('supertest');

jest.mock('passport', () => ({
  initialize: jest.fn(() => (req, res, next) => next()),
  use: jest.fn(),
  authenticate: jest.fn(),
  serializeUser: jest.fn(),
  deserializeUser: jest.fn(),
}));

jest.mock('../../src/services/auth.service', () => ({
  findOrCreateUser: jest.fn(),
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
}));

const passport = require('passport');
const authService = require('../../src/services/auth.service');
const app = require('../../src/app');

const mockUser = {
  id: 1,
  username: 'felipedev',
  displayName: 'Felipe',
  avatarUrl: 'https://avatar.url',
};

afterEach(() => jest.clearAllMocks());

describe('GET /auth/github', () => {
  it('returns a 302 redirect to GitHub OAuth URL', async () => {
    passport.authenticate.mockReturnValue((req, res) => {
      res.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`);
    });

    const res = await request(app).get('/auth/github');

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('github.com');
    expect(res.headers.location).toContain(process.env.GITHUB_CLIENT_ID);
  });
});

describe('GET /auth/github/callback', () => {
  it('redirects to frontend with JWT on success', async () => {
    passport.authenticate.mockImplementation((strategy, options, callback) => {
      return (req, res, next) => callback(null, mockUser);
    });
    authService.generateToken.mockReturnValue('mock_jwt');

    const res = await request(app).get('/auth/github/callback');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(
      `${process.env.FRONTEND_URL}/auth/callback?token=mock_jwt`
    );
  });

  it('redirects to login with error on auth failure', async () => {
    passport.authenticate.mockImplementation((strategy, options, callback) => {
      return (req, res, next) => callback(null, false);
    });

    const res = await request(app).get('/auth/github/callback');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(
      `${process.env.FRONTEND_URL}/login?error=auth_failed`
    );
  });
});

describe('GET /auth/me', () => {
  it('returns 401 with no token', async () => {
    authService.verifyToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns safe user fields with a valid token', async () => {
    authService.verifyToken.mockReturnValue({
      userId: mockUser.id,
      username: mockUser.username,
      displayName: mockUser.displayName,
      avatarUrl: mockUser.avatarUrl,
    });

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer valid_token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: mockUser.id,
      username: mockUser.username,
      displayName: mockUser.displayName,
      avatarUrl: mockUser.avatarUrl,
    });
    expect(res.body.githubToken).toBeUndefined();
  });
});
