export interface User {
  id: string;
  username: string;
  email: string;
  github_token?: string;
  github_username?: string;
  created_at: string;
  updated_at: string;
}

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface MemoryEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Deployment {
  id: string;
  user_id: string;
  repo_name: string;
  status: string;
  environment: string;
  version: string;
  deployed_at: string;
  created_at: string;
}

export interface SecurityAlert {
  id: string;
  user_id: string;
  repo_name?: string;
  severity: string;
  title: string;
  description?: string;
  dismissed: boolean;
  created_at: string;
}