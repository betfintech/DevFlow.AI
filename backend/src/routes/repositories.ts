import { Router } from 'express';
import { repositoryController } from '../controllers/repositoryController.ts';
import { authMiddleware } from '../middlewares/auth.ts';

const router = Router();

router.get('/', authMiddleware, repositoryController.getRepositories);
router.get('/:owner/:repo', authMiddleware, repositoryController.getRepository);
router.get('/:owner/:repo/pulls', authMiddleware, repositoryController.getPullRequests);

export default router;