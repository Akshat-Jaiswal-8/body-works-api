import targetMuscles from "../data/target-muscles.json" assert { type: "json" };
export const getTargetMuscles = (req, res) => {
  try {
    const url = `${req.get("host")}`;

    const finalTargetMuscles = targetMuscles.map((targetMuscle) => {
      return {
        ...targetMuscle,
        imageUrl: url + targetMuscle.imageUrl,
      };
    });
    return res.status(200).send({
      totalTargetMuscles: finalTargetMuscles.length,
      data: finalTargetMuscles,
    });
  } catch (e) {
    res.status(500).send({ message: `${e}` });
  }
};
