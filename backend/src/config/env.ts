import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret_change_in_production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  GITHUB_API_BASE_URL: process.env.GITHUB_API_BASE_URL || 'https://api.github.com',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_API_URL: process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};