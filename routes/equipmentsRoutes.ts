import express from "express";
import { getEquipments } from "../controllers/EquipmentsController.js";

const router = express.Router();

router.get("/", getEquipments);
export default router;
