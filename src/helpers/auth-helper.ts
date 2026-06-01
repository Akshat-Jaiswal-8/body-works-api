import bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';

import {
  ACCESS_TOKEN_EXPIRES_MS,
  LONG_REFRESH_TOKEN_EXPIRES_MS,
  SHORT_REFRESH_TOKEN_EXPIRES_MS,
} from '../constants/auth-constant.js';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export const hashRefreshToken = (token: string): string => {
  return createHash('sha256').update(token, 'utf8').digest('hex');
};

export const comparePassword = async (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateAccessToken = (id: string) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_MS,
  });
};

export const generateRefreshToken = (id: string, rememberMe: boolean) => {
  return jwt.sign({ id, rememberMe, jti: randomUUID() }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: rememberMe ? LONG_REFRESH_TOKEN_EXPIRES_MS : SHORT_REFRESH_TOKEN_EXPIRES_MS,
  });
};
