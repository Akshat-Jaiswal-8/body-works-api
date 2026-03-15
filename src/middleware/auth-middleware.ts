import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { logControllerError } from '../lib/logger.js';

export const authenticate = (
  req: Request & { userId: string },
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const [scheme, accessToken] = authHeader?.split(' ') ?? [];

  const refreshToken = req.cookies?.['refreshToken'];

  console.log(req);

  console.log(refreshToken, 'refresh');

  // if (!refreshToken || scheme !== 'Bearer' || !accessToken) {
  //   return res.status(401).json({ error: 'Access denied. No token provided.' });
  // }

  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!, (err, decoded) => {
    console.log('decoded', decoded);
    if (err || typeof decoded !== 'object' || !decoded?.id) {
      if (!refreshToken) {
        return res.status(401).send('Access denied. No token provided.');
      }
      try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const accessToken = jwt.sign({ id: decoded }, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: '3h',
        });

        console.log('decoded refresh token', decoded);

        res
          .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' })
          .header('Authorization', accessToken)
          .json({ id: decoded });
      } catch (error) {
        logControllerError(res, 'Token verification failed.', err ?? new Error('Invalid payload'));
        return res.sendStatus(403);
      }
      logControllerError(res, 'Token verification failed.', err ?? new Error('Invalid payload'));
      return res.sendStatus(403);
    }

    req.userId = decoded.id as string;
    next();
  });
};
