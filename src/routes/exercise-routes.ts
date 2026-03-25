import express from 'express';

import { getExercise, getExercises } from '../controllers/exercise-controller.js';
import { authenticate } from '../middleware/auth-middleware.js';

const router = express.Router();

router.get('/', getExercises);
router.get('/:id', getExercise);
export default router;
