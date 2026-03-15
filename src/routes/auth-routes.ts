import express from 'express';

import {
  accessTokenFromRefreshToken,
  loginUser,
  registerUser,
} from '../controllers/auth-controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', accessTokenFromRefreshToken);

export default router;
