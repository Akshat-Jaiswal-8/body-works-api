import equipments from "../data/equipments.json" with { type: "json" };
import { url } from "../server.js";

export const getEquipments = (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    let paginatedData = equipments;

    if (limit && limit < equipments.length) {
      const startIndex = 0;
      const endIndex = startIndex + limit;
      paginatedData = equipments.slice(startIndex, endIndex);
    }

    const finalEquipments = paginatedData.map((equipment) => {
      return {
        ...equipment,
        imageUrl: url + equipment.imageUrl,
      };
    });
    return res.status(200).send({
      totalEquipments: finalEquipments.length,
      data: finalEquipments,
    });
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch equipments. Please try again later.",
    });
  }
};
