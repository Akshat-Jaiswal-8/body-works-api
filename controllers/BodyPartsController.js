import bodyParts from "../data/bodyparts.json" assert { type: "json" };
export const getBodyParts = (req, res) => {
  try {
    const url = "https://body-works-api.up.railway.app";

    const finalBodyParts = bodyParts.map((bodyPart) => {
      return {
        ...bodyPart,
        imageUrl: url + bodyPart.imageUrl,
      };
    });
    return res.status(200).send({
      totalBodyParts: finalBodyParts.length,
      data: finalBodyParts,
    });
  } catch (e) {
    res.status(500).send({ message: "Failed to fetch body parts." });
  }
};
