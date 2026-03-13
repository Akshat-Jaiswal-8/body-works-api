import express from "express";
import { getEquipments } from "../controllers/equipments-controller.js";

const router = express.Router();

router.get("/", getEquipments);
export default router;
