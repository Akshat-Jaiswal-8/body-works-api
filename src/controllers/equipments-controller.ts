import { count, ilike } from 'drizzle-orm';
import type { Request, Response } from 'express';

import { db } from '../drizzle/db.js';
import { equipments } from '../drizzle/schema.js';
import { logControllerError } from '../lib/logger.js';

interface IEquipmentsRequest extends Request {
  query: {
    limit?: string;
    page?: string;
    search?: string;
  };
}

export const getEquipments = async (req: IEquipmentsRequest, res: Response) => {
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
    const whereClause = searchPattern ? ilike(equipments.name, searchPattern) : undefined;

    const totalResult = await db
      .select({
        count: count(),
      })
      .from(equipments)
      .where(whereClause);

    const equipmentsData = await db
      .select({
        id: equipments.id,
        equipment: equipments.name,
        exerciseCount: equipments.exerciseCount,
        imageUrl: equipments.imageUrl,
      })
      .from(equipments)
      .where(whereClause)
      .offset(offset)
      .limit(limit);

    const totalEquipments = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(totalEquipments / limit);

    return res.status(200).send({
      totalEquipments,
      totalPages,
      count: equipmentsData.length,
      page,
      limit,
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
