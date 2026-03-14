import express from 'express';

import { getTargetMuscles } from '../controllers/target-muscles-controller.js';

const router = express.Router();

router.get('/', getTargetMuscles);
export default router;
