import express from 'express';

import {
  getFilteredRoutines,
  getRoutine,
  getRoutines,
} from '../controllers/routines-controller.js';

const router = express.Router();

router.get('/', getRoutines);
router.get('/filters', getFilteredRoutines);
router.get('/:id', getRoutine);
export default router;
