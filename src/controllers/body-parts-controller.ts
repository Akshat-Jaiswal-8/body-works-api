import { count } from 'drizzle-orm';

import { db } from '../drizzle/db.js';
import { bodyParts } from '../drizzle/schema.js';
import { logControllerError } from '../lib/logger.js';

export const getBodyParts = async (req, res) => {
  try {
    const limit = parseInt(req.query?.limit) || 10;
    const offset = parseInt(req.query?.offset) || 0;

    if (offset < 0) {
      return res.status(400).send({
        message: 'Offset must be a non-negative integer.',
      });
    }

    const totalResult = await db
      .select({
        count: count(),
      })
      .from(bodyParts);

    const bodyPartsData =
      Number.isInteger(limit) && limit > 0
        ? await db
            .select({
              id: bodyParts.id,
              bodyPart: bodyParts.name,
              exerciseCount: bodyParts.exerciseCount,
              imageUrl: bodyParts.imageUrl,
            })
            .from(bodyParts)
            .offset(offset)
            .limit(limit)
        : await db
            .select({
              id: bodyParts.id,
              bodyPart: bodyParts.name,
              exerciseCount: bodyParts.exerciseCount,
              imageUrl: bodyParts.imageUrl,
            })
            .from(bodyParts)
            .offset(offset);
    const totalBodyParts = Number(totalResult[0]?.count || 0);

    return res.status(200).send({
      totalBodyParts: totalBodyParts,
      count: bodyPartsData.length,
      offset: offset,
      limit: limit || null,
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
