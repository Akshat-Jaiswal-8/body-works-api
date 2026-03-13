import express from "express";
import { getBodyParts } from "../controllers/body-parts-controller.js";

const router = express.Router();

router.get("/", getBodyParts);
export default router;
