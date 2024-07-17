import express from "express";
import { getBodyParts } from "../controllers/BodyPartsController.js";

const router = express.Router();

router.get("/", getBodyParts);
export default router;
