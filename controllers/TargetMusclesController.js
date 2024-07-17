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
    return res.send({
      status: 200,
      message: "success",
      totalTargetMuscles: finalTargetMuscles.length,
      data: finalTargetMuscles,
    });
  } catch (e) {
    res.send({ status: 500, message: `${e}` });
  }
};
