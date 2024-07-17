import bodyParts from "../data/bodyparts.json" assert { type: "json" };
export const getBodyParts = (req, res) => {
  try {
    const url = `${req.get("host")}`;

    const finalBodyParts = bodyParts.map((bodyPart) => {
      return {
        ...bodyPart,
        imageUrl: url + bodyPart.imageUrl,
      };
    });
    return res.send({
      status: 200,
      message: "success",
      totalBodyParts: finalBodyParts.length,
      data: finalBodyParts,
    });
  } catch (e) {
    res.send({ status: 500, message: `${e}` });
  }
};
