import { Response } from 'express';
import { pool } from '../config/database.ts';
import { AuthRequest } from '../middlewares/auth.ts';
import axios from 'axios';
import { env } from '../config/env.ts';

export const chatController = {
  createSession: async (req: AuthRequest, res: Response) => {
    try {
      const { title } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await pool.query(
        'INSERT INTO chat_sessions (user_id, title) VALUES ($1, $2) RETURNING *',
        [userId, title || 'New Chat']
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  },

  getSessions: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await pool.query(
        'SELECT * FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC',
        [userId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({ error: 'Failed to get sessions' });
    }
  },

  getMessages: async (req: AuthRequest, res: Response) => {
    try {
      const { sessionId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify session belongs to user
      const sessionCheck = await pool.query(
        'SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2',
        [sessionId, userId]
      );

      if (sessionCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const result = await pool.query(
        'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY timestamp ASC',
        [sessionId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  },

  addMessage: async (req: AuthRequest, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { role, content } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify session belongs to user
      const sessionCheck = await pool.query(
        'SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2',
        [sessionId, userId]
      );

      if (sessionCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const result = await pool.query(
        'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3) RETURNING *',
        [sessionId, role, content]
      );

      // Update session updated_at
      await pool.query(
        'UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [sessionId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Add message error:', error);
      res.status(500).json({ error: 'Failed to add message' });
    }
  },

  streamMessage: async (req: AuthRequest, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { message } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify session belongs to user
      const sessionCheck = await pool.query(
        'SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2',
        [sessionId, userId]
      );

      if (sessionCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Save user message
      await pool.query(
        'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)',
        [sessionId, 'user', message]
      );

      // Get recent messages for context
      const messagesResult = await pool.query(
        'SELECT role, content FROM chat_messages WHERE session_id = $1 ORDER BY timestamp DESC LIMIT 10',
        [sessionId]
      );

      const messages = messagesResult.rows.reverse().map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call OpenRouter API with streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        const response = await axios.post(
          `${env.OPENROUTER_API_URL}/chat/completions`,
          {
            model: 'google/gemini-2.0-flash-exp:free',
            messages: [
              ...messages,
              { role: 'user', content: message },
            ],
            stream: true,
          },
          {
            headers: {
              'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
            },
            responseType: 'stream',
          }
        );

        let fullContent = '';

        response.data.on('data', (chunk: Buffer) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              
              if (data === '[DONE]') {
                res.write(`data: [DONE]\n\n`);
              } else {
                try {
                  const json = JSON.parse(data);
                  const content = json.choices?.[0]?.delta?.content || '';
                  
                  if (content) {
                    fullContent += content;
                    res.write(`data: ${JSON.stringify({ content })}\n\n`);
                  }
                } catch (e) {
                  // Skip parse errors
                }
              }
            }
          }
        });

        response.data.on('end', async () => {
          // Save assistant message
          await pool.query(
            'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)',
            [sessionId, 'assistant', fullContent]
          );

          // Update session updated_at
          await pool.query(
            'UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [sessionId]
          );

          res.end();
        });

        response.data.on('error', (error: Error) => {
          console.error('Stream error:', error);
          res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`);
          res.end();
        });
      } catch (error) {
        console.error('API call error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Failed to get response' })}\n\n`);
        res.end();
      }
    } catch (error) {
      console.error('Stream message error:', error);
      res.status(500).json({ error: 'Failed to stream message' });
    }
  },
};