import type {
  Repository,
  PullRequest,
  Commit,
  Branch,
  Deployment,
  DeploymentLog,
  SecurityFinding,
  AnalysisResult,
  Notification,
  AIMemory,
  WorkflowRun,
  AppStats,
} from '../types';
import { generateId } from '../utils/cn';

// ============================================================
// MOCK REPOSITORIES
// ============================================================
export const mockRepositories: Repository[] = [
  {
    id: '1',
    name: 'gitmind-core',
    full_name: 'acme-corp/gitmind-core',
    description: 'Core AI orchestration engine powering GitMind platform with multi-model support',
    language: 'TypeScript',
    stars: 2847,
    forks: 312,
    open_issues: 23,
    default_branch: 'main',
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    private: false,
    url: 'https://github.com/acme-corp/gitmind-core',
    topics: ['ai', 'typescript', 'devops', 'openai', 'orchestration'],
    size: 45230,
    owner: 'acme-corp',
    health_score: 94,
    security_score: 88,
    ai_summary: 'High-quality TypeScript codebase with excellent test coverage, modern architecture patterns, and active development. Minor security advisories in transitive dependencies.',
  },
  {
    id: '2',
    name: 'infra-platform',
    full_name: 'acme-corp/infra-platform',
    description: 'Kubernetes-based infrastructure platform with GitOps workflow and automated deployments',
    language: 'Python',
    stars: 1203,
    forks: 89,
    open_issues: 7,
    default_branch: 'main',
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    private: true,
    url: 'https://github.com/acme-corp/infra-platform',
    topics: ['kubernetes', 'gitops', 'devops', 'python', 'terraform'],
    size: 28910,
    owner: 'acme-corp',
    health_score: 87,
    security_score: 92,
    ai_summary: 'Well-maintained Python infrastructure codebase. Strong security practices with secret scanning enabled. Consider upgrading deprecated Kubernetes API usages.',
  },
  {
    id: '3',
    name: 'api-gateway',
    full_name: 'acme-corp/api-gateway',
    description: 'High-performance API gateway with rate limiting, authentication, and load balancing',
    language: 'Go',
    stars: 892,
    forks: 145,
    open_issues: 15,
    default_branch: 'develop',
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    private: false,
    url: 'https://github.com/acme-corp/api-gateway',
    topics: ['go', 'api-gateway', 'microservices', 'grpc', 'rest'],
    size: 18540,
    owner: 'acme-corp',
    health_score: 91,
    security_score: 95,
    ai_summary: 'Excellent Go codebase with high performance benchmarks. Well-structured microservices architecture. Recommend adding integration tests for edge cases.',
  },
  {
    id: '4',
    name: 'ml-pipeline',
    full_name: 'acme-corp/ml-pipeline',
    description: 'End-to-end ML training and inference pipeline with automated model evaluation',
    language: 'Python',
    stars: 567,
    forks: 78,
    open_issues: 31,
    default_branch: 'main',
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    private: true,
    url: 'https://github.com/acme-corp/ml-pipeline',
    topics: ['machine-learning', 'python', 'pytorch', 'mlops', 'data-science'],
    size: 67890,
    owner: 'acme-corp',
    health_score: 73,
    security_score: 61,
    ai_summary: 'Active ML development with multiple open issues. Critical: 3 high-severity vulnerabilities in numpy and scikit-learn. Recommend immediate dependency updates.',
  },
  {
    id: '5',
    name: 'frontend-design-system',
    full_name: 'acme-corp/frontend-design-system',
    description: 'Unified React component library and design tokens for all Acme Corp products',
    language: 'TypeScript',
    stars: 334,
    forks: 56,
    open_issues: 12,
    default_branch: 'main',
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    private: false,
    url: 'https://github.com/acme-corp/frontend-design-system',
    topics: ['react', 'typescript', 'design-system', 'storybook', 'tailwindcss'],
    size: 23450,
    owner: 'acme-corp',
    health_score: 89,
    security_score: 90,
    ai_summary: 'Well-organized React component library with comprehensive Storybook documentation. Good accessibility practices. Minor: update React to v19 for performance improvements.',
  },
  {
    id: '6',
    name: 'data-warehouse',
    full_name: 'acme-corp/data-warehouse',
    description: 'Scalable data warehouse with dbt transformations and real-time analytics',
    language: 'SQL',
    stars: 124,
    forks: 23,
    open_issues: 8,
    default_branch: 'main',
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    private: true,
    url: 'https://github.com/acme-corp/data-warehouse',
    topics: ['dbt', 'sql', 'bigquery', 'analytics', 'data-engineering'],
    size: 12340,
    owner: 'acme-corp',
    health_score: 82,
    security_score: 85,
    ai_summary: 'Solid dbt-based data warehouse with well-documented transformations. Consider implementing column-level lineage tracking for improved data governance.',
  },
];

// ============================================================
// MOCK PULL REQUESTS
// ============================================================
export const mockPullRequests: PullRequest[] = [
  {
    id: 1,
    number: 142,
    title: 'feat: Add streaming AI response support with WebSocket integration',
    state: 'open',
    body: '## Summary\n\nThis PR adds full WebSocket-based streaming support for AI responses, enabling real-time token-by-token rendering in the frontend.\n\n## Changes\n- Implemented WebSocket connection manager\n- Added streaming AI endpoint\n- Updated frontend to render tokens progressively\n- Added typing indicators\n\n## Testing\n- Unit tests for streaming handler\n- Integration tests for WebSocket connection\n- Manual testing with multiple concurrent connections',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    merged_at: null,
    user: { login: 'sarah-chen', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
    head: { ref: 'feature/streaming-ai', sha: 'a3f8b2c' },
    base: { ref: 'main' },
    labels: [{ name: 'feature', color: '0075ca' }, { name: 'ai', color: '7057ff' }],
    review_comments: 5,
    commits: 8,
    additions: 342,
    deletions: 67,
    changed_files: 12,
    ai_review: '## AI Review Analysis\n\n**Risk Score: Low (2/10)**\n\nThis PR implements WebSocket streaming correctly with proper error handling. The connection manager pattern is well-architected.\n\n**Positive findings:**\n- Proper cleanup on disconnect\n- Error boundaries implemented\n- Token buffering prevents UI thrashing\n\n**Suggestions:**\n- Consider adding connection retry logic with exponential backoff\n- Add connection timeout handling\n- Consider rate limiting on the server side',
    risk_score: 2,
  },
  {
    id: 2,
    number: 141,
    title: 'fix: Resolve memory leak in repository analysis pipeline',
    state: 'open',
    body: 'Fixes a memory leak in the async analysis pipeline where file handles were not being properly closed after processing.',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    merged_at: null,
    user: { login: 'marcus-dev', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus' },
    head: { ref: 'fix/memory-leak-analysis', sha: 'b7d3e1f' },
    base: { ref: 'main' },
    labels: [{ name: 'bug', color: 'd73a4a' }, { name: 'performance', color: 'e4e669' }],
    review_comments: 3,
    commits: 3,
    additions: 45,
    deletions: 23,
    changed_files: 4,
    ai_review: '## AI Review Analysis\n\n**Risk Score: Medium (4/10)**\n\nMemory leak fix looks correct. Using context managers ensures proper cleanup.\n\n**Concerns:**\n- Test coverage for the fixed scenario should be added\n- Consider adding memory profiling to CI pipeline',
    risk_score: 4,
  },
  {
    id: 3,
    number: 140,
    title: 'refactor: Migrate authentication to JWT RS256 algorithm',
    state: 'merged',
    body: 'Migrates from HS256 to RS256 JWT signing for improved security with asymmetric keys.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    merged_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    user: { login: 'alex-security', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex' },
    head: { ref: 'refactor/jwt-rs256', sha: 'c8e4f2a' },
    base: { ref: 'main' },
    labels: [{ name: 'security', color: 'e11d48' }, { name: 'refactor', color: '0e8a16' }],
    review_comments: 12,
    commits: 5,
    additions: 189,
    deletions: 134,
    changed_files: 8,
    risk_score: 6,
  },
  {
    id: 4,
    number: 139,
    title: 'feat: Implement AI memory system with vector embeddings',
    state: 'open',
    body: 'Implements long-term AI memory with vector embeddings for semantic search and context retrieval.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    merged_at: null,
    user: { login: 'priya-ai', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya' },
    head: { ref: 'feature/ai-memory', sha: 'd9f5g3b' },
    base: { ref: 'main' },
    labels: [{ name: 'feature', color: '0075ca' }, { name: 'ai', color: '7057ff' }, { name: 'needs-review', color: 'fbca04' }],
    review_comments: 8,
    commits: 15,
    additions: 678,
    deletions: 45,
    changed_files: 21,
    risk_score: 3,
  },
  {
    id: 5,
    number: 138,
    title: 'chore: Update all dependencies to latest stable versions',
    state: 'closed',
    body: 'Batch dependency update addressing 3 critical CVEs and 7 medium vulnerabilities.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    merged_at: null,
    user: { login: 'bot-renovate', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bot' },
    head: { ref: 'deps/update-all-2024', sha: 'e1a6h4c' },
    base: { ref: 'main' },
    labels: [{ name: 'dependencies', color: '0366d6' }, { name: 'security', color: 'e11d48' }],
    review_comments: 1,
    commits: 1,
    additions: 234,
    deletions: 234,
    changed_files: 5,
    risk_score: 7,
  },
];

// ============================================================
// MOCK COMMITS
// ============================================================
export const mockCommits: Commit[] = [
  {
    sha: 'a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
    message: 'feat: Add streaming AI response support with WebSocket integration\n\nImplemented WebSocket connection manager with proper cleanup and error handling.',
    author: { name: 'Sarah Chen', email: 'sarah@acme-corp.com', date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    committer: { name: 'Sarah Chen', email: 'sarah@acme-corp.com', date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    url: 'https://github.com/acme-corp/gitmind-core/commit/a3f8b2c',
  },
  {
    sha: 'b7d3e1f2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
    message: 'fix: Resolve memory leak in repository analysis pipeline',
    author: { name: 'Marcus Dev', email: 'marcus@acme-corp.com', date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    committer: { name: 'Marcus Dev', email: 'marcus@acme-corp.com', date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    url: 'https://github.com/acme-corp/gitmind-core/commit/b7d3e1f',
  },
  {
    sha: 'c8e4f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9',
    message: 'docs: Update API documentation with streaming examples',
    author: { name: 'Priya AI', email: 'priya@acme-corp.com', date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
    committer: { name: 'Priya AI', email: 'priya@acme-corp.com', date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
    url: 'https://github.com/acme-corp/gitmind-core/commit/c8e4f2a',
  },
  {
    sha: 'd9f5g3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
    message: 'refactor: Migrate authentication to JWT RS256 algorithm',
    author: { name: 'Alex Security', email: 'alex@acme-corp.com', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    committer: { name: 'Alex Security', email: 'alex@acme-corp.com', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    url: 'https://github.com/acme-corp/gitmind-core/commit/d9f5g3b',
  },
  {
    sha: 'e1a6h4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
    message: 'chore: Update CI/CD pipeline configuration',
    author: { name: 'DevOps Bot', email: 'devops@acme-corp.com', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    committer: { name: 'DevOps Bot', email: 'devops@acme-corp.com', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    url: 'https://github.com/acme-corp/gitmind-core/commit/e1a6h4c',
  },
];

// ============================================================
// MOCK BRANCHES
// ============================================================
export const mockBranches: Branch[] = [
  { name: 'main', sha: 'a3f8b2c', protected: true, default: true },
  { name: 'develop', sha: 'b7d3e1f', protected: true, default: false },
  { name: 'feature/streaming-ai', sha: 'c8e4f2a', protected: false, default: false },
  { name: 'feature/ai-memory', sha: 'd9f5g3b', protected: false, default: false },
  { name: 'fix/memory-leak-analysis', sha: 'e1a6h4c', protected: false, default: false },
  { name: 'refactor/jwt-rs256', sha: 'f2b7i5d', protected: false, default: false },
  { name: 'hotfix/production-crash', sha: 'g3c8j6e', protected: false, default: false },
];

// ============================================================
// MOCK DEPLOYMENTS
// ============================================================
const generateDeploymentLogs = (status: string): DeploymentLog[] => {
  const steps = ['Initialize', 'Install Dependencies', 'Build', 'Test', 'Deploy', 'Health Check'];
  const logs: DeploymentLog[] = [];

  steps.forEach((step, idx) => {
    logs.push({
      id: generateId(),
      timestamp: new Date(Date.now() - (steps.length - idx) * 30000).toISOString(),
      level: 'info',
      message: `Starting ${step}...`,
      step,
    });
    if (idx < steps.length - 1 || status === 'success') {
      logs.push({
        id: generateId(),
        timestamp: new Date(Date.now() - (steps.length - idx) * 25000).toISOString(),
        level: 'success',
        message: `✓ ${step} completed`,
        step,
      });
    } else if (status === 'failure') {
      logs.push({
        id: generateId(),
        timestamp: new Date(Date.now() - (steps.length - idx) * 25000).toISOString(),
        level: 'error',
        message: `✗ ${step} failed: Build output exceeded size limit`,
        step,
      });
    }
  });

  return logs;
};

export const mockDeployments: Deployment[] = [
  {
    id: '1',
    repo_name: 'gitmind-core',
    environment: 'production',
    status: 'success',
    branch: 'main',
    commit_sha: 'a3f8b2c',
    commit_message: 'feat: Add streaming AI response support',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    duration_ms: 187000,
    url: 'https://gitmind.acme-corp.com',
    logs: generateDeploymentLogs('success'),
    triggered_by: 'sarah-chen',
  },
  {
    id: '2',
    repo_name: 'api-gateway',
    environment: 'staging',
    status: 'in_progress',
    branch: 'develop',
    commit_sha: 'b7d3e1f',
    commit_message: 'fix: Resolve memory leak in analysis pipeline',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    duration_ms: 0,
    url: 'https://staging-api.acme-corp.com',
    logs: generateDeploymentLogs('in_progress'),
    triggered_by: 'marcus-dev',
  },
  {
    id: '3',
    repo_name: 'infra-platform',
    environment: 'production',
    status: 'failure',
    branch: 'main',
    commit_sha: 'c8e4f2a',
    commit_message: 'chore: Update Kubernetes configs',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    duration_ms: 94000,
    logs: generateDeploymentLogs('failure'),
    triggered_by: 'devops-bot',
  },
  {
    id: '4',
    repo_name: 'frontend-design-system',
    environment: 'preview',
    status: 'success',
    branch: 'feature/new-components',
    commit_sha: 'd9f5g3b',
    commit_message: 'feat: Add new button variants',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    duration_ms: 125000,
    url: 'https://preview-ds.acme-corp.com',
    logs: generateDeploymentLogs('success'),
    triggered_by: 'priya-ai',
  },
  {
    id: '5',
    repo_name: 'gitmind-core',
    environment: 'staging',
    status: 'success',
    branch: 'develop',
    commit_sha: 'e1a6h4c',
    commit_message: 'refactor: Improve caching performance',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
    duration_ms: 156000,
    url: 'https://staging.acme-corp.com',
    logs: generateDeploymentLogs('success'),
    triggered_by: 'alex-security',
  },
];

// ============================================================
// MOCK SECURITY FINDINGS
// ============================================================
export const mockSecurityFindings: SecurityFinding[] = [
  {
    id: '1',
    repository: 'ml-pipeline',
    severity: 'critical',
    type: 'vulnerability',
    title: 'Remote Code Execution in numpy < 1.24.0',
    description: 'A buffer overflow vulnerability in numpy\'s array handling allows arbitrary code execution when processing malicious input arrays.',
    file_path: 'requirements.txt',
    line_number: 12,
    cve_id: 'CVE-2023-52160',
    package_name: 'numpy',
    current_version: '1.23.1',
    fixed_version: '1.24.0',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    ai_recommendation: 'Immediately upgrade numpy to version 1.24.0 or later. This is a critical RCE vulnerability that can be exploited in production. Run `pip install numpy>=1.24.0` and update requirements.txt.',
  },
  {
    id: '2',
    repository: 'ml-pipeline',
    severity: 'high',
    type: 'secret',
    title: 'AWS Access Key exposed in source code',
    description: 'An AWS access key ID and secret access key were detected in the configuration file. These credentials could allow unauthorized access to AWS resources.',
    file_path: 'config/aws_config.py',
    line_number: 34,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    ai_recommendation: 'Immediately revoke the exposed AWS credentials via the AWS IAM Console. Rotate all access keys. Use environment variables or AWS Secrets Manager instead of hardcoding credentials.',
  },
  {
    id: '3',
    repository: 'gitmind-core',
    severity: 'medium',
    type: 'dependency',
    title: 'Prototype Pollution in lodash < 4.17.21',
    description: 'The lodash dependency contains a prototype pollution vulnerability that could allow attackers to modify the Object prototype.',
    file_path: 'package.json',
    package_name: 'lodash',
    current_version: '4.17.15',
    fixed_version: '4.17.21',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'acknowledged',
    ai_recommendation: 'Update lodash to 4.17.21. Consider switching to lodash-es for better tree-shaking or using native ES6+ methods to reduce dependency on lodash.',
  },
  {
    id: '4',
    repository: 'api-gateway',
    severity: 'low',
    type: 'configuration',
    title: 'CORS policy too permissive',
    description: 'The API gateway CORS configuration allows all origins (*) which may expose APIs to cross-origin attacks.',
    file_path: 'config/cors.go',
    line_number: 23,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    ai_recommendation: 'Restrict CORS to specific allowed origins. Replace `AllowAllOrigins: true` with explicit origin whitelist for production domains.',
  },
  {
    id: '5',
    repository: 'infra-platform',
    severity: 'high',
    type: 'configuration',
    title: 'Kubernetes Pod running as root',
    description: 'Multiple Kubernetes deployments are configured to run containers as root user, violating the principle of least privilege.',
    file_path: 'kubernetes/deployments/app.yaml',
    line_number: 45,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    ai_recommendation: 'Set `securityContext.runAsNonRoot: true` and specify a non-root `runAsUser` in pod specifications. Rebuild container images to run as non-root user.',
  },
  {
    id: '6',
    repository: 'ml-pipeline',
    severity: 'medium',
    type: 'vulnerability',
    title: 'SQL Injection in database query builder',
    description: 'User input is not properly sanitized before being included in SQL queries, potentially allowing SQL injection attacks.',
    file_path: 'src/database/query_builder.py',
    line_number: 78,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'fixed',
    ai_recommendation: 'Use parameterized queries or ORM methods instead of string concatenation for SQL queries.',
  },
];

// ============================================================
// MOCK ANALYSIS RESULTS
// ============================================================
export const mockAnalysisResults: AnalysisResult[] = [
  {
    id: '1',
    repository: 'gitmind-core',
    type: 'full',
    status: 'complete',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    summary: 'gitmind-core is a high-quality TypeScript repository with strong architectural foundations. The codebase follows modern React patterns with proper TypeScript typing, comprehensive error handling, and good separation of concerns.',
    ai_insights: '## Architecture Analysis\n\nThe repository demonstrates excellent software engineering practices:\n\n**Strengths:**\n- Clean separation between UI components, business logic, and data access\n- Consistent TypeScript usage with strict mode enabled\n- Well-structured directory hierarchy following feature-based organization\n- Proper use of React hooks and state management patterns\n\n**Areas for Improvement:**\n- Consider implementing code splitting for better bundle performance\n- Add E2E tests to complement existing unit tests\n- Documentation coverage could be improved for public APIs\n\n**Dependency Health:**\n- 95% of dependencies are up-to-date\n- 1 medium-severity vulnerability in transitive dependency (lodash)\n- No critical CVEs detected',
    health_score: 94,
    security_score: 88,
    maintainability_score: 91,
    performance_score: 86,
    findings: mockSecurityFindings.filter(f => f.repository === 'gitmind-core'),
    dependencies: [],
    recommendations: [
      'Upgrade lodash to 4.17.21 to resolve prototype pollution vulnerability',
      'Implement code splitting with React.lazy for route-based chunks',
      'Add OpenTelemetry instrumentation for distributed tracing',
      'Consider migrating to Vitest for faster test execution',
    ],
    architecture_notes: 'Microservices-ready architecture with clear bounded contexts. The AI orchestration layer is well-isolated with clean interfaces.',
  },
];

// ============================================================
// MOCK NOTIFICATIONS
// ============================================================
export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'security',
    title: 'Critical Vulnerability Detected',
    message: 'RCE vulnerability found in ml-pipeline numpy dependency. Immediate action required.',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
    action_url: '/security',
    repository: 'ml-pipeline',
  },
  {
    id: '2',
    type: 'deployment',
    title: 'Production Deployment Successful',
    message: 'gitmind-core deployed to production. Version 2.4.1 is now live.',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    read: false,
    action_url: '/deployments',
    repository: 'gitmind-core',
  },
  {
    id: '3',
    type: 'pr',
    title: 'PR Review Requested',
    message: 'sarah-chen requested your review on: feat: Add streaming AI response support',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    action_url: '/pull-requests',
    repository: 'gitmind-core',
  },
  {
    id: '4',
    type: 'ai',
    title: 'AI Analysis Complete',
    message: 'Repository analysis for gitmind-core completed. Health score: 94/100.',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: true,
    action_url: '/analysis',
    repository: 'gitmind-core',
  },
  {
    id: '5',
    type: 'warning',
    title: 'Deployment Failed',
    message: 'infra-platform production deployment failed. Build error in step: Deploy.',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: true,
    action_url: '/deployments',
    repository: 'infra-platform',
  },
  {
    id: '6',
    type: 'info',
    title: 'New Pull Request Opened',
    message: 'priya-ai opened PR #139: feat: Implement AI memory system with vector embeddings',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: true,
    action_url: '/pull-requests',
    repository: 'gitmind-core',
  },
];

// ============================================================
// MOCK AI MEMORIES
// ============================================================
export const mockMemories: AIMemory[] = [
  {
    id: '1',
    content: 'The gitmind-core repository uses a Zustand-based state management architecture with domain-specific stores (auth, repository, chat, memory, notifications). Each store is persisted to localStorage with selective partializing.',
    tags: ['architecture', 'zustand', 'state-management', 'gitmind-core'],
    source: 'analysis',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    importance: 'high',
    repository: 'gitmind-core',
  },
  {
    id: '2',
    content: 'ml-pipeline has 3 critical security vulnerabilities: numpy RCE (CVE-2023-52160), exposed AWS credentials in config/aws_config.py, and SQL injection in query_builder.py. All require immediate remediation.',
    tags: ['security', 'critical', 'ml-pipeline', 'vulnerabilities'],
    source: 'analysis',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    importance: 'critical',
    repository: 'ml-pipeline',
  },
  {
    id: '3',
    content: 'Team prefers trunk-based development with short-lived feature branches. PRs require 2 approvals before merge. Main branch is protected with required CI checks including unit tests, integration tests, and security scanning.',
    tags: ['workflow', 'git', 'team-process', 'ci-cd'],
    source: 'user',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    importance: 'medium',
  },
  {
    id: '4',
    content: 'API gateway handles ~2M requests/day with 99.97% uptime SLA. Peak traffic is between 9AM-5PM PST. Current infrastructure can scale to 5x baseline traffic using horizontal pod autoscaling.',
    tags: ['performance', 'infrastructure', 'api-gateway', 'scaling'],
    source: 'analysis',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    importance: 'high',
    repository: 'api-gateway',
  },
  {
    id: '5',
    content: 'User prefers TypeScript strict mode enabled. All new components should use functional components with hooks. Avoid class components. Use Tailwind CSS for styling with custom design tokens.',
    tags: ['preferences', 'typescript', 'react', 'coding-style'],
    source: 'user',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    importance: 'medium',
  },
];

// ============================================================
// MOCK APP STATS
// ============================================================
export const mockAppStats: AppStats = {
  total_repositories: 6,
  total_pull_requests: 5,
  open_pull_requests: 3,
  total_deployments: 5,
  successful_deployments: 4,
  security_findings: 6,
  critical_findings: 1,
  ai_messages_sent: 247,
  memories_stored: 5,
  uploads_processed: 12,
  avg_health_score: 86,
};

// ============================================================
// MOCK WORKFLOW RUNS
// ============================================================
export const mockWorkflowRuns: WorkflowRun[] = [
  {
    id: '1',
    name: 'CI/CD Pipeline',
    status: 'completed',
    conclusion: 'success',
    branch: 'main',
    commit_sha: 'a3f8b2c',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    run_number: 342,
    trigger: 'push',
    duration_ms: 187000,
  },
  {
    id: '2',
    name: 'Security Scan',
    status: 'completed',
    conclusion: 'failure',
    branch: 'main',
    commit_sha: 'b7d3e1f',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    run_number: 341,
    trigger: 'schedule',
    duration_ms: 94000,
  },
  {
    id: '3',
    name: 'Deploy to Staging',
    status: 'in_progress',
    conclusion: null,
    branch: 'develop',
    commit_sha: 'c8e4f2a',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    run_number: 340,
    trigger: 'push',
  },
];

// ============================================================
// GENERATE MOCK CHAT MESSAGES
// ============================================================
export const generateMockAIResponse = (query: string): string => {
  const responses: Record<string, string> = {
    default: `I've analyzed your query about **${query.slice(0, 50)}...** Here's what I found:

## Analysis

Based on my understanding of your codebase and the current context, here are my recommendations:

1. **Code Quality** — The implementation looks solid. Consider adding more comprehensive error handling for edge cases.

2. **Performance** — The current approach has O(n) complexity. You could optimize this with a hash map for O(1) lookups.

3. **Security** — Ensure all user inputs are validated and sanitized before processing.

\`\`\`typescript
// Optimized implementation example
const processData = (items: Item[]): Map<string, Item> => {
  return new Map(items.map(item => [item.id, item]));
};
\`\`\`

4. **Testing** — Add unit tests for the edge cases identified above.

Would you like me to dive deeper into any of these areas?`,
  };

  return responses[query] || responses.default;
};
