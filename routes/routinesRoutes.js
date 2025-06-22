import express from "express";
import {
  getRoutine,
  getRoutines,
  getFilteredRoutines,
} from "../controllers/RoutinesController.js";

const router = express.Router();

router.get("/", getRoutines);
router.get("/filters", getFilteredRoutines);
router.get("/:id", getRoutine);
export default router;
