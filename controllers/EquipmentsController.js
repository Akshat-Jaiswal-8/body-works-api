import { db } from "../lib/db.js";

export const getEquipments = async (req, res) => {
  try {
    const limit = parseInt(req.query?.limit) || 10;
    const offset = parseInt(req.query?.offset) || 0;

    if (offset < 0) {
      return res.status(400).send({
        message: "Offset must be a non-negative integer.",
      });
    }

    const findOptions = {
      skip: offset,
    };

    if (Number.isInteger(limit) && limit > 0) {
      findOptions.take = limit;
    }

    const [total, equipments] = await db.$transaction([
      db.equipments.count(),
      db.equipments.findMany(findOptions),
    ]);

    return res.status(200).send({
      totalEquipments: total,
      count: equipments.length,
      offset: offset,
      limit: limit || null,
      data: equipments,
    });
  } catch (error) {
    console.error("Error fetching equipments:", error.message, {
      query: req.query,
      stack: error.stack,
    });
    res.status(500).send({
      message: "Failed to fetch equipments. Please try again later.",
    });
  }
};
