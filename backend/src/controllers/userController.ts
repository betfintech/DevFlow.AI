import { Response } from 'express';
import { pool } from '../config/database.ts';
import { AuthRequest } from '../middlewares/auth.ts';

export const userController = {
  getProfile: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await pool.query('SELECT id, username, email, github_username FROM users WHERE id = $1', [userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  },

  updateProfile: async (req: AuthRequest, res: Response) => {
    try {
      const { username } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await pool.query(
        'UPDATE users SET username = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username, email, github_username',
        [username, userId]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },
};