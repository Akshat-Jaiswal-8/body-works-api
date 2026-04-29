import { count, desc, eq } from 'drizzle-orm';
import type { Request, Response } from 'express';
import z from 'zod';

import { db } from '../drizzle/db.js';
import { userBodyStats } from '../drizzle/schema.js';
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

    const [created] = await db
      .insert(userBodyStats)
      .values({
        userId: req.userId,
        weightKg: parsed.data.weightKg,
        bodyFatPercent: parsed.data.bodyFatPct,
        ...(parsed.data.loggedAt ? { measuredAt: new Date(parsed.data.loggedAt) } : {}),
      })
      .returning({
        id: userBodyStats.id,
        userId: userBodyStats.userId,
        weightKg: userBodyStats.weightKg,
        bodyFatPercent: userBodyStats.bodyFatPercent,
        measuredAt: userBodyStats.measuredAt,
      });

    const stat = {
      id: created.id,
      userId: created.userId,
      weightKg: created.weightKg,
      bodyFatPct: created.bodyFatPercent,
      loggedAt: created.measuredAt,
    };

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

    const whereClause = eq(userBodyStats.userId, req.userId);

    const [countResult, statsRows] = await Promise.all([
      db
        .select({
          count: count(),
        })
        .from(userBodyStats)
        .where(whereClause),
      db
        .select({
          id: userBodyStats.id,
          userId: userBodyStats.userId,
          weightKg: userBodyStats.weightKg,
          bodyFatPercent: userBodyStats.bodyFatPercent,
          measuredAt: userBodyStats.measuredAt,
        })
        .from(userBodyStats)
        .where(whereClause)
        .orderBy(desc(userBodyStats.measuredAt))
        .limit(limit)
        .offset(offset),
    ]);

    const stats = statsRows.map((row) => ({
      id: row.id,
      userId: row.userId,
      weightKg: row.weightKg,
      bodyFatPct: row.bodyFatPercent,
      loggedAt: row.measuredAt,
    }));

    const total = Number(countResult[0]?.count || 0);

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
