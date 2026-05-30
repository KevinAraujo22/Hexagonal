import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { envConfig } from '../../../infra/config/env';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const JWT_SECRET = envConfig.JWT_SECRET || 'your-secret-key-change-in-production';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      error: 'UnauthorizedException',
      message: 'No token provided',
      statusCode: 401,
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === 'object' && 'userId' in decoded) {
      req.userId = decoded.userId as string;
      next();
    } else {
      return res.status(401).json({
        error: 'UnauthorizedException',
        message: 'Invalid token',
        statusCode: 401,
      });
    }
  } catch (error) {
    return res.status(401).json({
      error: 'UnauthorizedException',
      message: 'Invalid or expired token',
      statusCode: 401,
    });
  }
}
