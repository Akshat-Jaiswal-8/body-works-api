import type { User } from '@prisma/client';
import type { Request, Response } from 'express';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import z from 'zod';

import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
} from '../helpers/auth-helper.js';
import { db } from '../lib/db.js';

interface IRegisterUserRequestBody {
  name: string;
  email: string;
  phone_number: string;
  password: string;
}

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
      res.status(400).json({ message: 'All the input fields are required.' });
    }

    const result = userSchema.pick({ email, password }).safeParse(req.body);

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
      return res.status(200).json({
        success: false,
        message: 'Invalid Password.',
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/refresh-token',
    });

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error logging in the user.',
      error,
    });
  }
};
