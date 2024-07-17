import express from "express";
import { getRoutine, getRoutines } from "../controllers/RoutinesController.js";

const router = express.Router();

router.get("/", getRoutines);
router.get("/:id", getRoutine);
export default router;
