import bodyParts from "../data/bodyparts.json" with { type: "json" };
import { url } from "../server.js";

export const getBodyParts = (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    let paginatedData = bodyParts;

    if (limit && limit < bodyParts.length) {
      const startIndex = 0;
      const endIndex = startIndex + limit;
      paginatedData = bodyParts.slice(startIndex, endIndex);
    }

    const finalBodyParts = paginatedData.map((bodyPart) => {
      return {
        ...bodyPart,
        imageUrl: url + bodyPart.imageUrl,
      };
    });
    return res.status(200).send({
      totalBodyParts: finalBodyParts.length,
      data: finalBodyParts,
    });
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch body parts. Please try again later.",
    });
  }
};
