// Integration tests for auth routes — axios and authService are mocked
const request = require('supertest');

jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

jest.mock('../../src/services/auth.service', () => ({
  findOrCreateUser: jest.fn(),
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
}));

jest.mock('../../src/models/user.model', () => ({
  User: { findOne: jest.fn() },
}));

const axios = require('axios');
const authService = require('../../src/services/auth.service');
const { User } = require('../../src/models/user.model');
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
    const res = await request(app).get('/auth/github');

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('github.com/login/oauth/authorize');
    expect(res.headers.location).toContain(process.env.GITHUB_CLIENT_ID);
  });
});

describe('GET /auth/github/callback', () => {
  it('redirects to frontend with JWT on success', async () => {
    axios.post.mockResolvedValue({ data: { access_token: 'gho_token' } });
    axios.get.mockResolvedValue({
      data: { id: 99, login: 'felipedev', name: 'Felipe', avatar_url: 'https://avatar.url' },
    });
    authService.findOrCreateUser.mockResolvedValue(mockUser);
    authService.generateToken.mockReturnValue('mock_jwt');

    const res = await request(app).get('/auth/github/callback?code=valid_code');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(
      `${process.env.FRONTEND_URL}/auth/callback?token=mock_jwt`
    );
    expect(authService.findOrCreateUser).toHaveBeenCalledWith(
      expect.objectContaining({ id: '99', username: 'felipedev', accessToken: 'gho_token' })
    );
  });

  it('redirects to login with error when code is missing', async () => {
    const res = await request(app).get('/auth/github/callback');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(
      `${process.env.FRONTEND_URL}/login?error=auth_failed`
    );
  });

  it('redirects to login with error detail when GitHub returns no access token', async () => {
    axios.post.mockResolvedValue({
      data: { error_description: 'bad_verification_code' },
    });

    const res = await request(app).get('/auth/github/callback?code=expired_code');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(
      `${process.env.FRONTEND_URL}/login?error=bad_verification_code`
    );
  });

  it('redirects to login with error when token exchange throws', async () => {
    axios.post.mockRejectedValue(new Error('network down'));

    const res = await request(app).get('/auth/github/callback?code=valid_code');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(
      `${process.env.FRONTEND_URL}/login?error=network%20down`
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
    User.findOne.mockResolvedValue({ ...mockUser, githubToken: 'gho_secret' });

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
