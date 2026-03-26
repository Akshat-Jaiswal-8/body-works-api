import type { AuthenticatedRequest, NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

import { logControllerError } from '../lib/logger.js';

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const [scheme, accessToken] = authHeader?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !accessToken) {
    return res.status(401).json({ error: 'Access denied. No access token provided.' });
  }

  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!, (err, decoded) => {
    if (err || typeof decoded !== 'object' || !decoded?.id) {
      logControllerError(res, 'Token verification failed.', err ?? new Error('Invalid payload'));
      return res.status(403).json({ error: 'Invalid or expired access token.' });
    }

    req.userId = decoded.id as string;
    return next();
  });
};
