import { Router } from 'express';
import { deploymentController } from '../controllers/deploymentController.ts';
import { authMiddleware } from '../middlewares/auth.ts';

const router = Router();

router.get('/', authMiddleware, deploymentController.getDeployments);
router.post('/', authMiddleware, deploymentController.createDeployment);
router.put('/:deploymentId', authMiddleware, deploymentController.updateDeployment);

export default router;