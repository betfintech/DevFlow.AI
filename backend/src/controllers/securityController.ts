import { Response } from 'express';
import { pool } from '../config/database.ts';
import { AuthRequest } from '../middlewares/auth.ts';

export const securityController = {
  getAlerts: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await pool.query(
        'SELECT * FROM security_alerts WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Get alerts error:', error);
      res.status(500).json({ error: 'Failed to get alerts' });
    }
  },

  dismissAlert: async (req: AuthRequest, res: Response) => {
    try {
      const { alertId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await pool.query(
        'UPDATE security_alerts SET dismissed = true WHERE id = $1 AND user_id = $2 RETURNING *',
        [alertId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Alert not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Dismiss alert error:', error);
      res.status(500).json({ error: 'Failed to dismiss alert' });
    }
  },
};