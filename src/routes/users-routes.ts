import express from 'express';

import { createUserBodyStats, getUserBodyStats } from '../controllers/body-stats-controller.js';
import { getMe, updateMyProfile, updateMySettings } from '../controllers/user-controller.js';
import { authenticate } from '../middleware/auth-middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/me', getMe);
router.patch('/me/profile', updateMyProfile);
router.patch('/me/settings', updateMySettings);
router.post('/me/stats', createUserBodyStats);
router.get('/me/stats', getUserBodyStats);

export default router;
