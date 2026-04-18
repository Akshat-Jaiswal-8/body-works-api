import { count } from 'drizzle-orm';

import { db } from '../drizzle/db.js';
import { targetMuscles } from '../drizzle/schema.js';
import { logControllerError } from '../lib/logger.js';

export const getTargetMuscles = async (req, res) => {
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
      .from(targetMuscles);

    const targetMusclesData =
      Number.isInteger(limit) && limit > 0
        ? await db
            .select({
              id: targetMuscles.id,
              targetMuscle: targetMuscles.name,
              exerciseCount: targetMuscles.exerciseCount,
              imageUrl: targetMuscles.imageUrl,
            })
            .from(targetMuscles)
            .offset(offset)
            .limit(limit)
        : await db
            .select({
              id: targetMuscles.id,
              targetMuscle: targetMuscles.name,
              exerciseCount: targetMuscles.exerciseCount,
              imageUrl: targetMuscles.imageUrl,
            })
            .from(targetMuscles)
            .offset(offset);
    const total = Number(totalResult[0]?.count || 0);

    return res.status(200).send({
      totalTargetMuscles: total,
      count: targetMusclesData.length,
      offset: offset,
      limit: limit || null,
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
