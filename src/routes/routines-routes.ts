import express from 'express';

import {
  getFilteredRoutines,
  getRoutine,
  getRoutines,
  postRoutines,
} from '../controllers/routines-controller.js';
import { authenticate } from '../middleware/auth-middleware.js';

const router = express.Router();

router.get('/', getRoutines);
router.get('/filters', getFilteredRoutines);
router.post('/', authenticate, postRoutines);
router.get('/:id', getRoutine);
export default router;
