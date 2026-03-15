import type { AuthenticatedRequest, Response } from 'express';
import z from 'zod';

import { db } from '../lib/db.js';
import { logControllerError } from '../lib/logger.js';

const goalSchema = z.enum(['fat_loss', 'muscle_gain', 'strength', 'general_fitness']);
const experienceLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);
const genderSchema = z.enum(['male', 'female', 'other']);
const unitPreferenceSchema = z.enum(['metric', 'imperial']);

const userProfilePatchSchema = z
  .object({
    heightCm: z.number().positive().max(300).optional(),
    goal: goalSchema.optional(),
    experienceLevel: experienceLevelSchema.optional(),
    gender: genderSchema.optional(),
    dateOfBirth: z.iso
      .datetime({ message: 'dateOfBirth must be a valid ISO datetime string.' })
      .transform((date) => new Date(date))
      .refine((date) => date <= new Date(), { error: 'Date of birth cannot be in future' })
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one profile field is required.',
  });

const userSettingsPatchSchema = z
  .object({
    unitPreference: unitPreferenceSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one settings field is required.',
  });

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        profile: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    logControllerError(res, 'user.getMe.failed', error, {
      userId: req.userId,
    });
    return res.status(500).json({ message: 'Failed to fetch user profile.' });
  }
};

export const updateMyProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = userProfilePatchSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const existingUser = await db.user.findUnique({
      where: { id: req.userId },
      select: { id: true, profile: true },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const mergedProfile = {
      ...(existingUser.profile || {}),
      ...parsed.data,
    };

    const updatedUser = await db.user.update({
      where: { id: req.userId },
      data: {
        profile: {
          set: mergedProfile,
        },
      },
      select: {
        id: true,
        profile: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      message: 'Profile updated successfully.',
      data: updatedUser,
    });
  } catch (error) {
    logControllerError(res, 'user.updateProfile.failed', error, {
      userId: req.userId,
      payload: req.body,
    });
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
};

export const updateMySettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = userSettingsPatchSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const existingUser = await db.user.findUnique({
      where: { id: req.userId },
      select: { id: true, settings: true },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const mergedSettings = {
      unitPreference: 'metric' as const,
      ...(existingUser.settings || {}),
      ...parsed.data,
    };

    const updatedUser = await db.user.update({
      where: { id: req.userId },
      data: {
        settings: {
          set: mergedSettings,
        },
      },
      select: {
        id: true,
        settings: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      message: 'Settings updated successfully.',
      data: updatedUser,
    });
  } catch (error) {
    logControllerError(res, 'user.updateSettings.failed', error, {
      userId: req.userId,
      payload: req.body,
    });
    return res.status(500).json({ message: 'Failed to update settings.' });
  }
};
