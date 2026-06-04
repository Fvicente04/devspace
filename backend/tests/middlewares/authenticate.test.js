// Tests the authenticate middleware — JWT validation and githubToken DB lookup
jest.mock('../../src/models/user.model', () => ({
  User: { findOne: jest.fn() },
}));

const jwt = require('jsonwebtoken');
const { User } = require('../../src/models/user.model');
const { authenticate } = require('../../src/middlewares/authenticate');

const secret = process.env.JWT_SECRET;
const validToken = jwt.sign({ userId: 1, username: 'test' }, secret, { expiresIn: '1h' });
const expiredToken = jwt.sign({ userId: 1, username: 'test' }, secret, { expiresIn: '-1s' });
const invalidToken = 'not.a.valid.jwt';

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
  User.findOne.mockResolvedValue({ id: 1, username: 'test', githubToken: 'gho_from_db' });
});

describe('authenticate middleware', () => {
  it('calls next() and attaches decoded user for a valid token', async () => {
    const req = { headers: { authorization: `Bearer ${validToken}` } };
    const res = mockRes();
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe(1);
  });

  it('fetches user from DB and attaches githubToken to req.user', async () => {
    const req = { headers: { authorization: `Bearer ${validToken}` } };
    const res = mockRes();
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(req.user.githubToken).toBe('gho_from_db');
  });

  it('returns 401 if user is not found in the database', async () => {
    User.findOne.mockResolvedValue(null);
    const req = { headers: { authorization: `Bearer ${validToken}` } };
    const res = mockRes();
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('returns 401 with "No token provided" when header is absent', async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
  });

  it('returns 401 with "Invalid token" for a malformed token', async () => {
    const req = { headers: { authorization: `Bearer ${invalidToken}` } };
    const res = mockRes();
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('returns 401 with "Invalid token" for an expired token', async () => {
    const req = { headers: { authorization: `Bearer ${expiredToken}` } };
    const res = mockRes();
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });
});
