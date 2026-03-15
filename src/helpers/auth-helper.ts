import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';

import { logger, serializeError } from '../lib/logger.js';

export const hashPassword = async (password: string): Promise<string | undefined> => {
  try {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    logger.error('Failed to hash the password.', {
      error: serializeError(error),
    });
  }
};

export const comparePassword = async (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateAccessToken = (id: string) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '3h',
  });
};

export const generateRefreshToken = (id: string) => {
  return jwt.sign({ id, jti: randomUUID() }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '10d',
  });
};
