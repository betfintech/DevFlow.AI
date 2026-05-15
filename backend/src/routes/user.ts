import { Router } from 'express';
import { userController } from '../controllers/userController.ts';
import { authMiddleware } from '../middlewares/auth.ts';

const router = Router();

router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);

export default router;