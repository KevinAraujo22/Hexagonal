import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../../../../src/adapters/http/middlewares/authMiddleware';

describe('authMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      cookies: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 401 when no token is provided', () => {
    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'UnauthorizedException',
      message: 'No token provided',
      statusCode: 401,
    });
  });

  it('should extract userId from valid token', () => {
    const token = jwt.sign({ userId: 'user-123' }, 'your-secret-key-change-in-production');
    req.cookies = { token };

    authMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(req.userId).toBe('user-123');
  });

  it('should return 401 for invalid token', () => {
    req.cookies = { token: 'invalid-token' };

    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'UnauthorizedException',
      message: 'Invalid or expired token',
      statusCode: 401,
    });
  });
});
