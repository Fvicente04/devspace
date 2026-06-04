// Tests the authenticate middleware for all JWT scenarios
const jwt = require('jsonwebtoken');
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

describe('authenticate middleware', () => {
  it('calls next() and attaches decoded user for a valid token', () => {
    const req = { headers: { authorization: `Bearer ${validToken}` } };
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe(1);
  });

  it('returns 401 with "No token provided" when header is absent', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
  });

  it('returns 401 with "Invalid token" for a malformed token', () => {
    const req = { headers: { authorization: `Bearer ${invalidToken}` } };
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('returns 401 with "Invalid token" for an expired token', () => {
    const req = { headers: { authorization: `Bearer ${expiredToken}` } };
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });
});
