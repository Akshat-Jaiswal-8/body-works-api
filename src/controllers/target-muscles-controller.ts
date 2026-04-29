import { count, ilike } from 'drizzle-orm';
import type { Request, Response } from 'express';

import { db } from '../drizzle/db.js';
import { targetMuscles } from '../drizzle/schema.js';
import { logControllerError } from '../lib/logger.js';

interface ITargetMusclesRequest extends Request {
  query: {
    limit?: string;
    page?: string;
    search?: string;
  };
}

export const getTargetMuscles = async (req: ITargetMusclesRequest, res: Response) => {
  try {
    const limit = parseInt(req.query?.limit as string) || 10;
    const page = parseInt(req.query?.page as string) || 1;
    const offset = (page - 1) * limit;
    const search = req.query?.search ? decodeURIComponent(req.query.search) : undefined;

    if (page <= 0) {
      return res.status(400).send({
        message: 'Page must be a positive integer.',
      });
    }

    if (limit <= 0) {
      return res.status(400).send({
        message: 'Limit must be a positive integer.',
      });
    }

    const searchPattern = search ? `%${search}%` : undefined;
    const whereClause = searchPattern ? ilike(targetMuscles.name, searchPattern) : undefined;

    const totalResult = await db
      .select({
        count: count(),
      })
      .from(targetMuscles)
      .where(whereClause);

    const targetMusclesData = await db
      .select({
        id: targetMuscles.id,
        targetMuscle: targetMuscles.name,
        exerciseCount: targetMuscles.exerciseCount,
        imageUrl: targetMuscles.imageUrl,
      })
      .from(targetMuscles)
      .where(whereClause)
      .offset(offset)
      .limit(limit);

    const totalTargetMuscles = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(totalTargetMuscles / limit);

    return res.status(200).send({
      totalTargetMuscles,
      totalPages,
      count: targetMusclesData.length,
      page,
      limit,
      data: targetMusclesData,
    });
  } catch (error) {
    logControllerError(res, 'target-muscles.list.failed', error, {
      query: req.query,
    });
    res.status(500).send({
      message: 'Failed to fetch target muscles. Please try again later.',
    });
  }
};
