import { User } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { serializeError } from '../lib/logger.js';

export const authenticate = (req: Request & { id: string }, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  const token = authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  const decode = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET!,
    (err: unknown, user: { id: string }) => {
      if (err) {
        serializeError(err);
        return res.sendStatus(403);
      }
      req.id = user.id;
      next();
    },
  );
};
