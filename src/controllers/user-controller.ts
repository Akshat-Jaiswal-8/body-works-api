import { eq } from 'drizzle-orm';
import type { AuthenticatedRequest, Response } from 'express';
import z from 'zod';

import { db } from '../drizzle/db.js';
import { userProfiles, users } from '../drizzle/schema.js';
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

const extractObject = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value;
};

const extractLegacyData = (value) => {
  const container = extractObject(value);

  return {
    legacyProfile: extractObject(container.legacyProfile),
    legacySettings: extractObject(container.legacySettings),
  };
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        profileUpdatedAt: userProfiles.updatedAt,
        latestBodyComposition: userProfiles.latestBodyComposition,
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(users.id, req.userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { legacyProfile, legacySettings } = extractLegacyData(user.latestBodyComposition);
    const profile = Object.keys(legacyProfile).length > 0 ? legacyProfile : null;
    const settings = Object.keys(legacySettings).length > 0 ? legacySettings : null;

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      profile,
      settings,
      createdAt: user.createdAt,
      updatedAt: user.profileUpdatedAt || user.createdAt,
    };

    return res.status(200).json({ data: payload });
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

    const [existingUser] = await db
      .select({
        id: users.id,
        latestBodyComposition: userProfiles.latestBodyComposition,
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(users.id, req.userId))
      .limit(1);

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const currentMetadata = extractObject(existingUser.latestBodyComposition);
    const { legacyProfile, legacySettings } = extractLegacyData(currentMetadata);

    const mergedProfile = {
      ...legacyProfile,
      ...parsed.data,
    };

    const now = new Date();

    const nextMetadata = {
      ...currentMetadata,
      legacyProfile: mergedProfile,
      legacySettings,
    };

    const [updatedProfile] = await db
      .insert(userProfiles)
      .values({
        userId: req.userId,
        latestBodyComposition: nextMetadata,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          latestBodyComposition: nextMetadata,
          updatedAt: now,
        },
      })
      .returning({
        id: userProfiles.userId,
        updatedAt: userProfiles.updatedAt,
      });

    const responseData = {
      id: updatedProfile?.id || req.userId,
      profile: mergedProfile,
      updatedAt: updatedProfile?.updatedAt || now,
    };

    return res.status(200).json({
      message: 'Profile updated successfully.',
      data: responseData,
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

    const [existingUser] = await db
      .select({
        id: users.id,
        latestBodyComposition: userProfiles.latestBodyComposition,
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(users.id, req.userId))
      .limit(1);

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const currentMetadata = extractObject(existingUser.latestBodyComposition);
    const { legacyProfile, legacySettings } = extractLegacyData(currentMetadata);

    const mergedSettings = {
      unitPreference: 'metric' as const,
      ...legacySettings,
      ...parsed.data,
    };

    const now = new Date();

    const nextMetadata = {
      ...currentMetadata,
      legacyProfile,
      legacySettings: mergedSettings,
    };

    const [updatedSettings] = await db
      .insert(userProfiles)
      .values({
        userId: req.userId,
        unitPreference: mergedSettings.unitPreference,
        latestBodyComposition: nextMetadata,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          unitPreference: mergedSettings.unitPreference,
          latestBodyComposition: nextMetadata,
          updatedAt: now,
        },
      })
      .returning({
        id: userProfiles.userId,
        updatedAt: userProfiles.updatedAt,
      });

    const responseData = {
      id: updatedSettings?.id || req.userId,
      settings: mergedSettings,
      updatedAt: updatedSettings?.updatedAt || now,
    };

    return res.status(200).json({
      message: 'Settings updated successfully.',
      data: responseData,
    });
  } catch (error) {
    logControllerError(res, 'user.updateSettings.failed', error, {
      userId: req.userId,
      payload: req.body,
    });
    return res.status(500).json({ message: 'Failed to update settings.' });
  }
};
