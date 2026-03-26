import type { AuthenticatedRequest, Response } from 'express';
import z from 'zod';

import { db } from '../lib/db.js';
import { logControllerError } from '../lib/logger.js';

const createBodyStatsSchema = z.object({
  weightKg: z.number().positive({ message: 'weightKg must be greater than 0.' }),
  bodyFatPct: z
    .number()
    .min(0, { message: 'bodyFatPct must be between 0 and 100.' })
    .max(100, { message: 'bodyFatPct must be between 0 and 100.' })
    .optional(),
  loggedAt: z.iso.datetime({ message: 'loggedAt must be a valid ISO datetime string.' }).optional(),
});

export const createUserBodyStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = createBodyStatsSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const stat = await db.userBodyStats.create({
      data: {
        userId: req.userId,
        weightKg: parsed.data.weightKg,
        bodyFatPct: parsed.data.bodyFatPct,
        ...(parsed.data.loggedAt ? { loggedAt: parsed.data.loggedAt } : {}),
      },
    });

    return res.status(201).json({
      message: 'Body stats logged successfully.',
      data: stat,
    });
  } catch (error) {
    logControllerError(res, 'bodyStats.create.failed', error, {
      userId: req.userId,
      payload: req.body,
    });
    return res.status(500).json({ message: 'Failed to log body stats.' });
  }
};

export const getUserBodyStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query?.limit as string, 10) || 20));
    const page = Math.max(1, parseInt(req.query?.page as string, 10) || 1);
    const offset = (page - 1) * limit;

    const [total, stats] = await db.$transaction([
      db.userBodyStats.count({
        where: { userId: req.userId },
      }),
      db.userBodyStats.findMany({
        where: { userId: req.userId },
        orderBy: { loggedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);

    return res.status(200).json({
      data: stats,
      count: stats.length,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    });
  } catch (error) {
    logControllerError(res, 'bodyStats.list.failed', error, {
      userId: req.userId,
      query: req.query,
    });
    return res.status(500).json({ message: 'Failed to fetch body stats.' });
  }
};
