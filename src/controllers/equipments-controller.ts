import { count } from 'drizzle-orm';

import { db } from '../drizzle/db.js';
import { equipments } from '../drizzle/schema.js';
import { logControllerError } from '../lib/logger.js';

export const getEquipments = async (req, res) => {
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
      .from(equipments);

    const equipmentsData =
      Number.isInteger(limit) && limit > 0
        ? await db
            .select({
              id: equipments.id,
              equipment: equipments.name,
              exerciseCount: equipments.exerciseCount,
              imageUrl: equipments.imageUrl,
            })
            .from(equipments)
            .offset(offset)
            .limit(limit)
        : await db
            .select({
              id: equipments.id,
              equipment: equipments.name,
              exerciseCount: equipments.exerciseCount,
              imageUrl: equipments.imageUrl,
            })
            .from(equipments)
            .offset(offset);
    const total = Number(totalResult[0]?.count || 0);

    return res.status(200).send({
      totalEquipments: total,
      count: equipmentsData.length,
      offset: offset,
      limit: limit || null,
      data: equipmentsData,
    });
  } catch (error) {
    logControllerError(res, 'equipments.list.failed', error, {
      query: req.query,
    });
    res.status(500).send({
      message: 'Failed to fetch equipments. Please try again later.',
    });
  }
};
