// Tests for the three auth service functions: findOrCreateUser, generateToken, verifyToken
const jwt = require('jsonwebtoken');

jest.mock('../../src/models/user.model', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const { User } = require('../../src/models/user.model');
const authService = require('../../src/services/auth.service');

const githubProfile = {
  id: '123456',
  username: 'felipedev',
  displayName: 'Felipe',
  photos: [{ value: 'https://avatar.url' }],
  accessToken: 'gho_token',
};

const existingUser = {
  id: 1,
  githubId: '123456',
  username: 'felipedev',
  displayName: 'Felipe',
  avatarUrl: 'https://avatar.url',
  update: jest.fn().mockResolvedValue(true),
};

describe('findOrCreateUser', () => {
  afterEach(() => jest.clearAllMocks());

  it('creates and returns a new user when none exists', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(existingUser);

    const user = await authService.findOrCreateUser(githubProfile);

    expect(User.findOne).toHaveBeenCalledWith({ where: { githubId: '123456' } });
    expect(User.create).toHaveBeenCalledWith({
      githubId: '123456',
      username: 'felipedev',
      displayName: 'Felipe',
      avatarUrl: 'https://avatar.url',
      githubToken: 'gho_token',
    });
    expect(user).toEqual(existingUser);
  });

  it('returns existing user without creating a new one', async () => {
    User.findOne.mockResolvedValue(existingUser);

    const user = await authService.findOrCreateUser(githubProfile);

    expect(User.findOne).toHaveBeenCalledWith({ where: { githubId: '123456' } });
    expect(User.create).not.toHaveBeenCalled();
    expect(user).toEqual(existingUser);
  });
});

describe('generateToken', () => {
  it('returns a string', () => {
    const token = authService.generateToken(existingUser);
    expect(typeof token).toBe('string');
  });

  it('decoded token contains userId and username', () => {
    const token = authService.generateToken(existingUser);
    const decoded = jwt.decode(token);
    expect(decoded.userId).toBe(existingUser.id);
    expect(decoded.username).toBe(existingUser.username);
  });

  it('decoded token does not contain githubToken', () => {
    const token = authService.generateToken({ ...existingUser, githubToken: 'secret' });
    const decoded = jwt.decode(token);
    expect(decoded.githubToken).toBeUndefined();
  });
});

describe('verifyToken', () => {
  it('returns decoded payload for a valid token', () => {
    const token = authService.generateToken(existingUser);
    const decoded = authService.verifyToken(token);
    expect(decoded.userId).toBe(existingUser.id);
    expect(decoded.username).toBe(existingUser.username);
  });

  it('throws for an invalid token', () => {
    expect(() => authService.verifyToken('not.a.valid.token')).toThrow();
  });

  it('throws for an expired token', () => {
    const expired = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    expect(() => authService.verifyToken(expired)).toThrow();
  });
});
