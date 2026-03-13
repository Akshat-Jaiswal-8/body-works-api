import express from "express";
import {
  getExercise,
  getExercises,
} from "../controllers/ExerciseController.js";

const router = express.Router();

router.get("/", getExercises);
router.get("/:id", getExercise);
export default router;
