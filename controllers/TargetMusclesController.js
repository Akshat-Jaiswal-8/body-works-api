import targetMuscles from "../data/target-muscles.json" assert { type: "json" };
export const getTargetMuscles = (req, res) => {
  try {
    const url = "https://body-works-api.up.railway.app";

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
