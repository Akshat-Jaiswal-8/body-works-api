import express from "express";
import { getTargetMuscles } from "../controllers/TargetMusclesController.js";

const router = express.Router();

router.get("/", getTargetMuscles);
export default router;
