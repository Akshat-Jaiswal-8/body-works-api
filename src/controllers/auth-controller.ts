import type { User } from '@prisma/client';
import type { CookieOptions, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import z from 'zod';

import { MAX_DEVICE_SESSIONS, REFRESH_TOKEN_EXPIRES_MS } from '../constants/auth-constant.js';
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
} from '../helpers/auth-helper.js';
import { db } from '../lib/db.js';
import { logControllerError, serializeError } from '../lib/logger.js';

interface IRegisterUserRequestBody {
  name: string;
  email: string;
  phone_number: string;
  password: string;
}

const refreshCookiePath = '/api/v1/auth/refresh-token';

const userSchema = z.object({
  name: z
    .string()
    .min(2, { error: 'Name should contain atleast 2 characters.' })
    .max(50, { error: 'Name should have atmost 50 characters.' }),

  email: z.email(),

  phone_number: z.string().transform((val, ctx) => {
    const phone = parsePhoneNumberFromString(val, {
      defaultCountry: 'IN',
      extract: false,
    });
    if (phone && phone.isValid()) {
      return phone.number;
    }
    ctx.addIssue({
      code: 'custom',
      message: 'Invalid phone number',
    });

    return z.NEVER;
  }),

  password: z
    .string()
    .min(8, {
      error: 'Password should contain atleast 8 characters.',
      abort: true,
    })
    .max(16, {
      error: 'Password should contain at most 16 characters.',
      abort: true,
    }),
});

const loginSchema = userSchema.pick({ email: true, password: true });

const getRefreshCookieOptions = (): CookieOptions => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: refreshCookiePath,
    maxAge: REFRESH_TOKEN_EXPIRES_MS,
  };
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone_number, password } = req.body as IRegisterUserRequestBody;

    if (!name || !email || !phone_number || !password) {
      return res.status(400).json({
        message: 'All the input fields are required.',
      });
    }

    const old_user = await db.user.findUnique({
      where: { email },
    });

    if (old_user)
      return res.status(409).json({ message: 'User already exist. Please login again.' });

    const result = userSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const parsedSchema = result.data;

    const passwordHash = await hashPassword(parsedSchema.password);

    const user: User = await db.user.create({
      data: {
        name: parsedSchema.name,
        email: parsedSchema.email,
        phoneNumber: parsedSchema.phone_number,
        passwordHash,
      },
    });

    return res.status(200).json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      message: 'user created successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering the user.',
      error,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All the input fields are required.' });
    }

    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const parsedSchema = result.data;

    const user = await db.user.findUnique({
      where: { email: parsedSchema.email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email is not registered',
      });
    }

    const matchPassword = await comparePassword(parsedSchema.password, user.passwordHash);

    if (!matchPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Password.',
      });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await db.refreshToken.deleteMany({
      where: {
        userId: user.id,
        expiresAt: { lte: new Date() },
      },
    });

    const sessionCount = await db.refreshToken.count({ where: { userId: user.id } });

    // if max device limit is used, delete the oldest session before adding a new one
    if (sessionCount >= MAX_DEVICE_SESSIONS) {
      const oldest = await db.refreshToken.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      });
      if (oldest) await db.refreshToken.delete({ where: { id: oldest.id } });
    }

    await db.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),
      },
    });

    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      accessToken,
    });
  } catch (error) {
    logControllerError(res, 'Error logging in the user.', error ?? new Error('Login error'));
    return res.status(500).json({
      success: false,
      message: 'Error logging in the user.',
      error: serializeError(error),
    });
  }
};

export const accessTokenFromRefreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.['refreshToken'];

  if (!refreshToken) {
    return res.status(401).json({
      error: 'Access Denied. No refresh token provided.',
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as jwt.JwtPayload;

    if (typeof decoded !== 'object' || !decoded?.id) {
      return res.status(403).json({
        error: 'Access denied.',
      });
    }

    const storedToken = await db.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!storedToken) {
      return res.status(403).json({ error: 'Refresh token has been revoked.' });
    }

    if (storedToken.expiresAt <= new Date()) {
      await db.refreshToken.deleteMany({ where: { token: refreshToken } });
      return res.status(403).json({ error: 'Refresh token has expired.' });
    }

    await db.refreshToken.delete({ where: { token: refreshToken } });

    const userId = decoded.id as string;
    const accessToken = generateAccessToken(userId);
    const nextRefreshToken = generateRefreshToken(userId);

    await db.refreshToken.create({
      data: {
        token: nextRefreshToken,
        userId,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),
      },
    });

    return res
      .cookie('refreshToken', nextRefreshToken, getRefreshCookieOptions())
      .status(200)
      .json({ id: userId, accessToken });
  } catch (error) {
    logControllerError(res, 'Token verification failed.', error as Error);
    return res.sendStatus(403);
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.['refreshToken'];

  if (refreshToken) {
    await db.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => {});
  }

  const { maxAge: _, ...clearOptions } = getRefreshCookieOptions();
  res.clearCookie('refreshToken', clearOptions);
  return res.status(200).json({ message: 'Logged out successfully.' });
};
