// ============================================================
// CORE TYPES — GitMind AI DevOps OS
// ============================================================

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  github_username?: string;
  created_at: string;
  plan: 'free' | 'pro' | 'enterprise';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Repository {
  id: string;
  name: string;
  full_name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  open_issues: number;
  default_branch: string;
  updated_at: string;
  created_at: string;
  private: boolean;
  url: string;
  topics: string[];
  size: number;
  owner: string;
  avatar_url?: string;
  health_score?: number;
  security_score?: number;
  ai_summary?: string;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  body: string;
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  user: {
    login: string;
    avatar_url: string;
  };
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
  };
  labels: Array<{ name: string; color: string }>;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
  ai_review?: string;
  risk_score?: number;
}

export interface Commit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  committer: {
    name: string;
    email: string;
    date: string;
  };
  url: string;
}

export interface Branch {
  name: string;
  sha: string;
  protected: boolean;
  default: boolean;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  sha: string;
  children?: FileNode[];
  content?: string;
  language?: string;
}

export interface Deployment {
  id: string;
  repo_name: string;
  environment: 'production' | 'staging' | 'preview' | 'development';
  status: 'success' | 'failure' | 'pending' | 'in_progress' | 'cancelled';
  branch: string;
  commit_sha: string;
  commit_message: string;
  created_at: string;
  updated_at: string;
  duration_ms: number;
  url?: string;
  logs: DeploymentLog[];
  triggered_by: string;
}

export interface DeploymentLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success' | 'debug';
  message: string;
  step?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  tokens_used?: number;
  context?: string;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
  repository?: string;
  model: string;
}

export interface AIMemory {
  id: string;
  content: string;
  tags: string[];
  source: 'user' | 'ai' | 'repository' | 'analysis';
  created_at: string;
  updated_at: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  repository?: string;
  embedding_ready?: boolean;
}

export interface SecurityFinding {
  id: string;
  repository: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  type: 'vulnerability' | 'secret' | 'dependency' | 'configuration' | 'code';
  title: string;
  description: string;
  file_path?: string;
  line_number?: number;
  cve_id?: string;
  package_name?: string;
  current_version?: string;
  fixed_version?: string;
  created_at: string;
  status: 'open' | 'acknowledged' | 'fixed' | 'false_positive';
  ai_recommendation?: string;
}

export interface DependencyInfo {
  name: string;
  version: string;
  latest_version: string;
  outdated: boolean;
  vulnerable: boolean;
  license: string;
  description: string;
  weekly_downloads?: number;
  risk_score: number;
}

export interface AnalysisResult {
  id: string;
  repository: string;
  type: 'full' | 'security' | 'dependency' | 'architecture' | 'performance';
  status: 'pending' | 'running' | 'complete' | 'failed';
  created_at: string;
  completed_at?: string;
  summary: string;
  ai_insights: string;
  health_score: number;
  security_score: number;
  maintainability_score: number;
  performance_score: number;
  findings: SecurityFinding[];
  dependencies: DependencyInfo[];
  recommendations: string[];
  architecture_notes: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ai' | 'deployment' | 'security' | 'pr';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  action_url?: string;
  repository?: string;
  metadata?: Record<string, unknown>;
}

export interface Upload {
  id: string;
  filename: string;
  original_name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'processing' | 'extracting' | 'analyzing' | 'complete' | 'error';
  progress: number;
  created_at: string;
  repository_name?: string;
  error?: string;
  analysis_result?: AnalysisResult;
}

export interface WorkflowRun {
  id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'queued' | 'waiting' | 'cancelled' | 'failure' | 'success';
  conclusion: string | null;
  branch: string;
  commit_sha: string;
  created_at: string;
  updated_at: string;
  run_number: number;
  trigger: string;
  duration_ms?: number;
}

export interface AppStats {
  total_repositories: number;
  total_pull_requests: number;
  open_pull_requests: number;
  total_deployments: number;
  successful_deployments: number;
  security_findings: number;
  critical_findings: number;
  ai_messages_sent: number;
  memories_stored: number;
  uploads_processed: number;
  avg_health_score: number;
}

export interface StreamingState {
  isStreaming: boolean;
  currentMessage: string;
  conversationId: string | null;
}

export interface WebSocketMessage {
  type: 'ai_token' | 'ai_complete' | 'deployment_log' | 'upload_progress' | 'notification' | 'activity' | 'error';
  payload: unknown;
  timestamp: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
  description?: string;
}

export interface ThemeConfig {
  mode: 'dark' | 'light';
  accent: 'violet' | 'cyan' | 'emerald' | 'orange';
  glassmorphism: boolean;
  animations: boolean;
}

export interface Settings {
  theme: ThemeConfig;
  github_token: string;
  openrouter_api_key: string;
  default_model: string;
  notifications_enabled: boolean;
  ai_memory_enabled: boolean;
  auto_analyze: boolean;
  upload_max_size_mb: number;
}
