import { db } from "../lib/db.js";

export const getTargetMuscles = async (req, res) => {
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

    const [total, targetMuscles] = await db.$transaction([
      db.targetMuscles.count(),
      db.targetMuscles.findMany(findOptions),
    ]);

    return res.status(200).send({
      totalTargetMuscles: total,
      count: targetMuscles.length,
      offset: offset,
      limit: limit || null,
      data: targetMuscles,
    });
  } catch (error) {
    console.error("Error fetching target muscles:", error.message, {
      query: req.query,
      stack: error.stack,
    });
    res.status(500).send({
      message: "Failed to fetch target muscles. Please try again later.",
    });
  }
};
