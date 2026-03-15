import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { logControllerError } from '../lib/logger.js';

export const authenticate = (
  req: Request & { userId: string },
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const [scheme, token] = authHeader?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decoded) => {
    if (err || typeof decoded !== 'object' || !decoded?.id) {
      logControllerError(res, 'Token verification failed.', err ?? new Error('Invalid payload'));
      return res.sendStatus(403);
    }

    req.userId = decoded.id as string;
    next();
  });
};
