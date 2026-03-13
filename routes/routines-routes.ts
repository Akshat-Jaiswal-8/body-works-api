import express from "express";
import {
  getRoutine,
  getRoutines,
  getFilteredRoutines,
} from "../controllers/routines-controller.js";

const router = express.Router();

router.get("/", getRoutines);
router.get("/filters", getFilteredRoutines);
router.get("/:id", getRoutine);
export default router;
