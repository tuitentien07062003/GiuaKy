import { Router } from 'express';
import * as authController from '../controllers/authController.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/profile', authController.getProfile);

export default router;