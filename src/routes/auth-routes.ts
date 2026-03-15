import express from 'express';

import {
  accessTokenFromRefreshToken,
  loginUser,
  logoutUser,
  registerUser,
} from '../controllers/auth-controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', accessTokenFromRefreshToken);
router.post('/logout', logoutUser);

export default router;
