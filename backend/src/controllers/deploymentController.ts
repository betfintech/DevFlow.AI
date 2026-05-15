import { Response } from 'express';
import { pool } from '../config/database.ts';
import { AuthRequest } from '../middlewares/auth.ts';

export const deploymentController = {
  getDeployments: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await pool.query(
        'SELECT * FROM deployments WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Get deployments error:', error);
      res.status(500).json({ error: 'Failed to get deployments' });
    }
  },

  createDeployment: async (req: AuthRequest, res: Response) => {
    try {
      const { repo_name, status, environment, version } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await pool.query(
        'INSERT INTO deployments (user_id, repo_name, status, environment, version) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, repo_name, status, environment, version]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create deployment error:', error);
      res.status(500).json({ error: 'Failed to create deployment' });
    }
  },

  updateDeployment: async (req: AuthRequest, res: Response) => {
    try {
      const { deploymentId } = req.params;
      const { status } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await pool.query(
        'UPDATE deployments SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
        [status, deploymentId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Deployment not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update deployment error:', error);
      res.status(500).json({ error: 'Failed to update deployment' });
    }
  },
};