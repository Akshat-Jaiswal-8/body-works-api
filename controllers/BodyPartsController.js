import { db } from "../lib/db.js";

export const getBodyParts = async (req, res) => {
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

    const [totalBodyParts, bodyParts] = await db.$transaction([
      db.bodyParts.count(),
      db.bodyParts.findMany(findOptions),
    ]);

    return res.status(200).send({
      totalBodyParts: totalBodyParts,
      count: bodyParts.length,
      offset: offset,
      limit: limit || null,
      data: bodyParts,
    });
  } catch (error) {
    console.error("Error fetching body parts:", error.message, {
      query: req.query,
      stack: error.stack,
    });
    res.status(500).send({
      message: "Failed to fetch body parts. Please try again later.",
    });
  }
};
