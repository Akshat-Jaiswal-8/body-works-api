import express from "express";
import {getRoutine, getRoutines , getRoutineFilter} from "../controllers/RoutinesController.js";

const router = express.Router();

router.get("/", getRoutines);
router.get("/filters" , getRoutineFilter);
router.get("/:id", getRoutine);
export default router;
