import { and, asc, count, eq, lte } from 'drizzle-orm';
import type { CookieOptions, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import z from 'zod';

import {
  LONG_REFRESH_TOKEN_EXPIRES_MS,
  MAX_DEVICE_SESSIONS,
  SHORT_REFRESH_TOKEN_EXPIRES_MS,
} from '../constants/auth-constant.js';
import { db } from '../drizzle/db.js';
import { refreshTokens, users } from '../drizzle/schema.js';
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  hashRefreshToken,
} from '../helpers/auth-helper.js';
import { logControllerError, serializeError } from '../lib/logger.js';

interface IRegisterUserRequestBody {
  name: string;
  email: string;
  password: string;
}

const refreshCookiePath = '/';

const userSchema = z.object({
  name: z
    .string()
    .min(2, { error: 'Name should contain atleast 2 characters.' })
    .max(50, { error: 'Name should have atmost 50 characters.' }),

  email: z.email(),

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

const getRefreshCookieOptions = (rememberMe: boolean): CookieOptions => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: refreshCookiePath,
    maxAge: rememberMe ? LONG_REFRESH_TOKEN_EXPIRES_MS : SHORT_REFRESH_TOKEN_EXPIRES_MS,
  };
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as IRegisterUserRequestBody;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'All the input fields are required.',
      });
    }

    const [oldUser] = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (oldUser)
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

    const [user] = await db
      .insert(users)
      .values({
        name: parsedSchema.name,
        email: parsedSchema.email,
        passwordHash,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id, false);

    await db.insert(refreshTokens).values({
      token: hashRefreshToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + SHORT_REFRESH_TOKEN_EXPIRES_MS),
    });

    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions(false));

    return res.status(201).json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        accessToken,
      },
      message: 'User created successfully.',
    });
  } catch (error) {
    logControllerError(res, 'auth.register.failed', error, {
      payload: {
        email: req.body?.email,
      },
    });
    return res.status(500).json({
      success: false,
      message: 'Error registering the user.',
      error: serializeError(error),
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

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

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, parsedSchema.email))
      .limit(1);

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
    const refreshToken = generateRefreshToken(user.id, rememberMe);

    await db
      .delete(refreshTokens)
      .where(and(eq(refreshTokens.userId, user.id), lte(refreshTokens.expiresAt, new Date())));

    const sessionCountResult = await db
      .select({
        count: count(),
      })
      .from(refreshTokens)
      .where(eq(refreshTokens.userId, user.id));
    const sessionCount = Number(sessionCountResult[0]?.count || 0);

    if (sessionCount >= MAX_DEVICE_SESSIONS) {
      const [oldest] = await db
        .select({
          id: refreshTokens.id,
        })
        .from(refreshTokens)
        .where(eq(refreshTokens.userId, user.id))
        .orderBy(asc(refreshTokens.createdAt))
        .limit(1);

      if (oldest) {
        await db.delete(refreshTokens).where(eq(refreshTokens.id, oldest.id));
      }
    }

    await db.insert(refreshTokens).values({
      token: hashRefreshToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(
        Date.now() + (rememberMe ? LONG_REFRESH_TOKEN_EXPIRES_MS : SHORT_REFRESH_TOKEN_EXPIRES_MS),
      ),
    });

    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions(rememberMe));

    return res.status(200).json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        accessToken,
      },
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

    const hashedToken = hashRefreshToken(refreshToken);

    const [storedToken] = await db
      .select({
        id: refreshTokens.id,
        userId: refreshTokens.userId,
        expiresAt: refreshTokens.expiresAt,
      })
      .from(refreshTokens)
      .where(eq(refreshTokens.token, hashedToken))
      .limit(1);

    if (!storedToken) {
      await db.delete(refreshTokens).where(eq(refreshTokens.userId, decoded.id as string));
      return res.status(403).json({ error: 'Refresh token has been revoked.' });
    }

    if (storedToken.expiresAt <= new Date()) {
      await db.delete(refreshTokens).where(eq(refreshTokens.token, hashedToken));
      return res.status(403).json({ error: 'Refresh token has expired.' });
    }

    await db.delete(refreshTokens).where(eq(refreshTokens.token, hashedToken));

    const userId = decoded.id as string;
    const accessToken = generateAccessToken(userId);
    const wasRememberMe = !!decoded.rememberMe;
    const nextRefreshToken = generateRefreshToken(userId, wasRememberMe);

    await db.insert(refreshTokens).values({
      token: hashRefreshToken(nextRefreshToken),
      userId,
      expiresAt: new Date(
        Date.now() +
          (wasRememberMe ? LONG_REFRESH_TOKEN_EXPIRES_MS : SHORT_REFRESH_TOKEN_EXPIRES_MS),
      ),
    });

    return res
      .cookie('refreshToken', nextRefreshToken, getRefreshCookieOptions(wasRememberMe))
      .status(200)
      .json({ data: { id: userId, accessToken } });
  } catch (error) {
    logControllerError(res, 'Token verification failed.', error as Error);
    return res.sendStatus(403);
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.['refreshToken'];

  try {
    if (refreshToken) {
      await db.delete(refreshTokens).where(eq(refreshTokens.token, hashRefreshToken(refreshToken)));
    }
  } catch (error) {
    logControllerError(res, 'logout failed.', error as Error);
    return res.status(500).json({
      success: false,
      message: 'Failed to log out user.',
      error: serializeError(error),
    });
  }

  const { maxAge: _, ...clearOptions } = getRefreshCookieOptions(false);
  res.clearCookie('refreshToken', clearOptions);
  return res.status(200).json({ message: 'Logged out successfully.' });
};
