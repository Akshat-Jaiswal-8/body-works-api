import equipments from "../data/equipments.json" assert { type: "json" };
export const getEquipments = (req, res) => {
  try {
    const url = "https://body-works-api.up.railway.app";

    const finalEquipments = equipments.map((equipment) => {
      return {
        ...equipment,
        imageUrl: url + equipment.imageUrl,
      };
    });
    return res.status(200).send({
      totalEquipments: finalEquipments.length,
      data: finalEquipments,
    });
  } catch (e) {
    res.status(500).send({ message: "Failed to fetch Equipments." });
  }
};
