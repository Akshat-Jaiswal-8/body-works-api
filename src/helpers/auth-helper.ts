import bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';

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
    expiresIn: '3h',
  });
};

export const generateRefreshToken = (id: string) => {
  return jwt.sign({ id, jti: randomUUID() }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '10d',
  });
};
