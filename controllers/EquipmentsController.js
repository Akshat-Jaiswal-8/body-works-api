import equipments from "../data/equipments.json" assert { type: "json" };
export const getEquipments = (req, res) => {
  try {
    const url = `${req.get("host")}/api/v1`;

    const finalEquipments = equipments.map((equipment) => {
      return {
        ...equipment,
        imageUrl: url + equipment.imageUrl,
      };
    });
    return res.send({
      status: 200,
      message: "success",
      totalEquipments: finalEquipments.length,
      data: finalEquipments,
    });
  } catch (e) {
    res.send({ status: 500, message: `${e}` });
  }
};
