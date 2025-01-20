import targetMusclesData from "../data/target-muscles.json" with { type: "json" };

export const getTargetMuscles = (req, res) => {
  try {
    const url = process.env.BASE_URL;
    const limit = parseInt(req.query.limit);

    let paginatedData = targetMusclesData;

    if (limit && limit < targetMusclesData.length) {
      const startIndex = 0;
      const endIndex = startIndex + limit;
      paginatedData = targetMusclesData.slice(startIndex, endIndex);
    }

    const finalTargetMuscles = paginatedData.map((targetMuscle) => {
      return {
        ...targetMuscle,
        imageUrl: url + targetMuscle.imageUrl,
      };
    });
    return res.status(200).send({
      totalTargetMuscles: finalTargetMuscles.length,
      data: finalTargetMuscles,
    });
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch target muscles. Please try again later.",
    });
  }
};
