import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middlewares/auth.ts';
import { pool } from '../config/database.ts';

export const repositoryController = {
  getRepositories: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get user's GitHub token
      const userResult = await pool.query('SELECT github_token FROM users WHERE id = $1', [userId]);

      if (userResult.rows.length === 0 || !userResult.rows[0].github_token) {
        return res.status(400).json({ error: 'GitHub token not configured' });
      }

      const githubToken = userResult.rows[0].github_token;

      // Fetch repos from GitHub
      const response = await axios.get('https://api.github.com/user/repos', {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
        params: {
          per_page: 100,
          sort: 'updated',
        },
      });

      const repos = response.data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language,
        updated_at: repo.updated_at,
      }));

      res.json(repos);
    } catch (error: any) {
      console.error('Get repositories error:', error);
      res.status(500).json({ error: 'Failed to fetch repositories' });
    }
  },

  getRepository: async (req: AuthRequest, res: Response) => {
    try {
      const { owner, repo } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get user's GitHub token
      const userResult = await pool.query('SELECT github_token FROM users WHERE id = $1', [userId]);

      if (userResult.rows.length === 0 || !userResult.rows[0].github_token) {
        return res.status(400).json({ error: 'GitHub token not configured' });
      }

      const githubToken = userResult.rows[0].github_token;

      // Fetch repo details
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      const repoData = response.data;

      res.json({
        id: repoData.id,
        name: repoData.name,
        full_name: repoData.full_name,
        description: repoData.description,
        url: repoData.html_url,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        language: repoData.language,
        updated_at: repoData.updated_at,
        owner: repoData.owner.login,
        topics: repoData.topics,
      });
    } catch (error) {
      console.error('Get repository error:', error);
      res.status(500).json({ error: 'Failed to fetch repository' });
    }
  },

  getPullRequests: async (req: AuthRequest, res: Response) => {
    try {
      const { owner, repo } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get user's GitHub token
      const userResult = await pool.query('SELECT github_token FROM users WHERE id = $1', [userId]);

      if (userResult.rows.length === 0 || !userResult.rows[0].github_token) {
        return res.status(400).json({ error: 'GitHub token not configured' });
      }

      const githubToken = userResult.rows[0].github_token;

      // Fetch PRs
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/pulls`,
        {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
          params: {
            state: 'all',
            per_page: 50,
          },
        }
      );

      const prs = response.data.map((pr: any) => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        state: pr.state,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        author: pr.user.login,
        url: pr.html_url,
      }));

      res.json(prs);
    } catch (error) {
      console.error('Get PRs error:', error);
      res.status(500).json({ error: 'Failed to fetch pull requests' });
    }
  },
};