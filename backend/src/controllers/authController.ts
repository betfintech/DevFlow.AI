import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.ts';
import { jwtService } from '../services/jwtService.ts';
import { AuthRequest } from '../middlewares/auth.ts';
import { User, JWTPayload } from '../types/index.ts';

export const authController = {
  register: async (req: AuthRequest, res: Response) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if user exists
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, hashedPassword]
      );

      const user = result.rows[0];

      // Generate token
      const token = jwtService.generateToken({
        userId: user.id,
        username: user.username,
        email: user.email,
      });

      res.status(201).json({
        user,
        token,
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  },

  login: async (req: AuthRequest, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      // Find user
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];

      // Check password
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = jwtService.generateToken({
        userId: user.id,
        username: user.username,
        email: user.email,
      });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          github_username: user.github_username,
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  updateGitHubToken: async (req: AuthRequest, res: Response) => {
    try {
      const { github_token, github_username } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await pool.query(
        'UPDATE users SET github_token = $1, github_username = $2 WHERE id = $3',
        [github_token, github_username, userId]
      );

      res.json({ message: 'GitHub token updated' });
    } catch (error) {
      console.error('Update GitHub token error:', error);
      res.status(500).json({ error: 'Failed to update GitHub token' });
    }
  },
};