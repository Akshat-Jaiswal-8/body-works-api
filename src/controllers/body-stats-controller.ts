import { type SQL, and, asc, count, desc, eq, gte, lte } from 'drizzle-orm';
import type { AuthenticatedRequest, Response } from 'express';
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
  bmi: z
    .number()
    .positive({ message: 'bmi must be greater than 0.' })
    .max(100, { message: 'bmi must be 100 or less.' })
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
        bmi: parsed.data.bmi,
        ...(parsed.data.loggedAt ? { measuredAt: new Date(parsed.data.loggedAt) } : {}),
      })
      .returning({
        id: userBodyStats.id,
        userId: userBodyStats.userId,
        weightKg: userBodyStats.weightKg,
        bodyFatPercent: userBodyStats.bodyFatPercent,
        bmi: userBodyStats.bmi,
        measuredAt: userBodyStats.measuredAt,
      });

    const stat = {
      id: created.id,
      userId: created.userId,
      weightKg: created.weightKg,
      bodyFatPct: created.bodyFatPercent,
      bmi: created.bmi,
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

    const from = req.query?.from as string | undefined;
    const to = req.query?.to as string | undefined;
    const sort = (req.query?.sort as string) === 'asc' ? 'asc' : 'desc';

    const conditions: SQL[] = [eq(userBodyStats.userId, req.userId)];

    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate.getTime())) {
        conditions.push(gte(userBodyStats.measuredAt, fromDate));
      }
    }

    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate.getTime())) {
        conditions.push(lte(userBodyStats.measuredAt, toDate));
      }
    }

    const whereClause = and(...conditions);
    const orderFn = sort === 'asc' ? asc : desc;

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
          bmi: userBodyStats.bmi,
          measuredAt: userBodyStats.measuredAt,
        })
        .from(userBodyStats)
        .where(whereClause)
        .orderBy(orderFn(userBodyStats.measuredAt))
        .limit(limit)
        .offset(offset),
    ]);

    const stats = statsRows.map((row) => ({
      id: row.id,
      userId: row.userId,
      weightKg: row.weightKg,
      bodyFatPct: row.bodyFatPercent,
      bmi: row.bmi,
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
