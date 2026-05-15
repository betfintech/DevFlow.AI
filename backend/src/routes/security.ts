import { Router } from 'express';
import { securityController } from '../controllers/securityController.ts';
import { authMiddleware } from '../middlewares/auth.ts';

const router = Router();

router.get('/alerts', authMiddleware, securityController.getAlerts);
router.put('/alerts/:alertId', authMiddleware, securityController.dismissAlert);

export default router;