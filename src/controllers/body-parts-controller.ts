import { count, ilike } from 'drizzle-orm';
import type { Request, Response } from 'express';

import { db } from '../drizzle/db.js';
import { bodyParts } from '../drizzle/schema.js';
import { logControllerError } from '../lib/logger.js';

interface IBodyPartsRequest extends Request {
  query: {
    limit?: string;
    page?: string;
    search?: string;
  };
}

export const getBodyParts = async (req: IBodyPartsRequest, res: Response) => {
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
    const whereClause = searchPattern ? ilike(bodyParts.name, searchPattern) : undefined;

    const totalResult = await db
      .select({
        count: count(),
      })
      .from(bodyParts)
      .where(whereClause);

    const bodyPartsData = await db
      .select({
        id: bodyParts.id,
        bodyPart: bodyParts.name,
        exerciseCount: bodyParts.exerciseCount,
        imageUrl: bodyParts.imageUrl,
      })
      .from(bodyParts)
      .where(whereClause)
      .offset(offset)
      .limit(limit);

    const totalBodyParts = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(totalBodyParts / limit);

    return res.status(200).send({
      totalBodyParts,
      totalPages,
      count: bodyPartsData.length,
      page,
      limit,
      data: bodyPartsData,
    });
  } catch (error) {
    logControllerError(res, 'body-parts.list.failed', error, {
      query: req.query,
    });
    res.status(500).send({
      message: 'Failed to fetch body parts. Please try again later.',
    });
  }
};
