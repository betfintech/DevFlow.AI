import { Router } from 'express';
import { authController } from '../controllers/authController.ts';
import { authMiddleware } from '../middlewares/auth.ts';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/github-token', authMiddleware, authController.updateGitHubToken);

export default router;