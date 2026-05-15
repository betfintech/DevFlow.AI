import { useSettingsStore } from '../store';
import {
  mockRepositories,
  mockPullRequests,
  mockCommits,
  mockBranches,
} from './mockData';
import type { Repository, PullRequest, Commit, Branch, FileNode } from '../types';
import { sleep } from '../utils/cn';

// ============================================================
// GITHUB API SERVICE
// ============================================================

const GITHUB_API_BASE = 'https://devflow-ai-production-2fcc.up.railway.app/api';

function getHeaders(): HeadersInit {
  const { settings } = useSettingsStore.getState();
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
  if (settings.github_token) {
    headers['Authorization'] = `Bearer ${settings.github_token}`;
  }
  return headers;
}

async function githubFetch<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please add a GitHub token in Settings.');
    }
    if (response.status === 401) {
      throw new Error('Invalid GitHub token. Please update your token in Settings.');
    }
    if (response.status === 404) {
      throw new Error('Repository not found. Check the repository name and your access permissions.');
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ============================================================
// REPOSITORY SERVICES
// ============================================================

export async function fetchUserRepositories(username?: string): Promise<Repository[]> {
  const { settings } = useSettingsStore.getState();
  
  // Return mock data if no GitHub token
  if (!settings.github_token) {
    await sleep(800);
    return mockRepositories;
  }

  try {
    const endpoint = username ? `/users/${username}/repos?per_page=50&sort=updated` : '/user/repos?per_page=50&sort=updated';
    const data = await githubFetch<GHRepository[]>(endpoint);
    return data.map(transformRepository);
  } catch (error) {
    console.warn('GitHub API error, using mock data:', error);
    return mockRepositories;
  }
}

export async function fetchRepository(owner: string, repo: string): Promise<Repository> {
  const { settings } = useSettingsStore.getState();
  
  if (!settings.github_token) {
    await sleep(400);
    return mockRepositories.find(r => r.name === repo) || mockRepositories[0];
  }

  try {
    const data = await githubFetch<GHRepository>(`/repos/${owner}/${repo}`);
    return transformRepository(data);
  } catch (error) {
    console.warn('GitHub API error, using mock data:', error);
    return mockRepositories[0];
  }
}

export async function fetchPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'all'): Promise<PullRequest[]> {
  const { settings } = useSettingsStore.getState();
  
  if (!settings.github_token) {
    await sleep(600);
    return mockPullRequests;
  }

  try {
    const data = await githubFetch<GHPullRequest[]>(`/repos/${owner}/${repo}/pulls?state=${state}&per_page=30`);
    return data.map(transformPullRequest);
  } catch (error) {
    console.warn('GitHub API error, using mock data:', error);
    return mockPullRequests;
  }
}

export async function fetchCommits(owner: string, repo: string, branch?: string): Promise<Commit[]> {
  const { settings } = useSettingsStore.getState();
  
  if (!settings.github_token) {
    await sleep(500);
    return mockCommits;
  }

  try {
    const branchParam = branch ? `?sha=${branch}` : '';
    const data = await githubFetch<GHCommit[]>(`/repos/${owner}/${repo}/commits${branchParam}&per_page=30`);
    return data.map(transformCommit);
  } catch (error) {
    console.warn('GitHub API error, using mock data:', error);
    return mockCommits;
  }
}

export async function fetchBranches(owner: string, repo: string): Promise<Branch[]> {
  const { settings } = useSettingsStore.getState();
  
  if (!settings.github_token) {
    await sleep(400);
    return mockBranches;
  }

  try {
    const data = await githubFetch<GHBranch[]>(`/repos/${owner}/${repo}/branches?per_page=30`);
    return data.map(transformBranch);
  } catch (error) {
    console.warn('GitHub API error, using mock data:', error);
    return mockBranches;
  }
}

export async function fetchFileTree(owner: string, repo: string, path: string = '', branch?: string): Promise<FileNode[]> {
  const { settings } = useSettingsStore.getState();
  
  if (!settings.github_token) {
    await sleep(600);
    return getMockFileTree();
  }

  try {
    const ref = branch || 'HEAD';
    const data = await githubFetch<GHContent[]>(`/repos/${owner}/${repo}/contents/${path}?ref=${ref}`);
    
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(item => ({
      name: item.name,
      path: item.path,
      type: item.type === 'dir' ? 'dir' : 'file',
      size: item.size,
      sha: item.sha,
    }));
  } catch (error) {
    console.warn('GitHub API error, using mock data:', error);
    return getMockFileTree();
  }
}

export async function fetchFileContent(owner: string, repo: string, path: string, branch?: string): Promise<string> {
  const { settings } = useSettingsStore.getState();
  
  if (!settings.github_token) {
    await sleep(300);
    return getMockFileContent(path);
  }

  try {
    const ref = branch ? `?ref=${branch}` : '';
    const data = await githubFetch<GHFile>(`/repos/${owner}/${repo}/contents/${path}${ref}`);
    if (data.encoding === 'base64' && data.content) {
      return atob(data.content.replace(/\n/g, ''));
    }
    return data.content || '';
  } catch (error) {
    console.warn('GitHub API error, using mock data:', error);
    return getMockFileContent(path);
  }
}

// ============================================================
// TYPE TRANSFORMERS
// ============================================================

interface GHRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  updated_at: string;
  created_at: string;
  private: boolean;
  html_url: string;
  topics: string[];
  size: number;
  owner: { login: string; avatar_url: string };
}

interface GHPullRequest {
  id: number;
  number: number;
  title: string;
  state: string;
  body: string | null;
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  user: { login: string; avatar_url: string };
  head: { ref: string; sha: string };
  base: { ref: string };
  labels: Array<{ name: string; color: string }>;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

interface GHCommit {
  sha: string;
  commit: {
    message: string;
    author: { name: string; email: string; date: string };
    committer: { name: string; email: string; date: string };
  };
  html_url: string;
}

interface GHBranch {
  name: string;
  commit: { sha: string };
  protected: boolean;
}

interface GHContent {
  name: string;
  path: string;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  size: number;
  sha: string;
}

interface GHFile extends GHContent {
  content?: string;
  encoding?: string;
}

function transformRepository(gh: GHRepository): Repository {
  return {
    id: gh.id.toString(),
    name: gh.name,
    full_name: gh.full_name,
    description: gh.description || '',
    language: gh.language || 'Unknown',
    stars: gh.stargazers_count,
    forks: gh.forks_count,
    open_issues: gh.open_issues_count,
    default_branch: gh.default_branch,
    updated_at: gh.updated_at,
    created_at: gh.created_at,
    private: gh.private,
    url: gh.html_url,
    topics: gh.topics || [],
    size: gh.size,
    owner: gh.owner.login,
    avatar_url: gh.owner.avatar_url,
    health_score: Math.floor(60 + Math.random() * 40),
    security_score: Math.floor(60 + Math.random() * 40),
  };
}

function transformPullRequest(gh: GHPullRequest): PullRequest {
  return {
    id: gh.id,
    number: gh.number,
    title: gh.title,
    state: gh.merged_at ? 'merged' : (gh.state as 'open' | 'closed'),
    body: gh.body || '',
    created_at: gh.created_at,
    updated_at: gh.updated_at,
    merged_at: gh.merged_at,
    user: gh.user,
    head: gh.head,
    base: gh.base,
    labels: gh.labels,
    review_comments: gh.review_comments,
    commits: gh.commits,
    additions: gh.additions,
    deletions: gh.deletions,
    changed_files: gh.changed_files,
  };
}

function transformCommit(gh: GHCommit): Commit {
  return {
    sha: gh.sha,
    message: gh.commit.message,
    author: gh.commit.author,
    committer: gh.commit.committer,
    url: gh.html_url,
  };
}

function transformBranch(gh: GHBranch): Branch {
  return {
    name: gh.name,
    sha: gh.commit.sha,
    protected: gh.protected,
    default: false,
  };
}

// ============================================================
// MOCK FILE TREE
// ============================================================
function getMockFileTree(): FileNode[] {
  return [
    {
      name: 'src',
      path: 'src',
      type: 'dir',
      sha: 'abc123',
      children: [
        { name: 'main.ts', path: 'src/main.ts', type: 'file', size: 1234, sha: 'def456' },
        { name: 'App.tsx', path: 'src/App.tsx', type: 'file', size: 5678, sha: 'ghi789' },
        {
          name: 'components',
          path: 'src/components',
          type: 'dir',
          sha: 'jkl012',
          children: [
            { name: 'Button.tsx', path: 'src/components/Button.tsx', type: 'file', size: 890, sha: 'mno345' },
            { name: 'Input.tsx', path: 'src/components/Input.tsx', type: 'file', size: 1123, sha: 'pqr678' },
          ],
        },
        { name: 'types.ts', path: 'src/types.ts', type: 'file', size: 2345, sha: 'stu901' },
      ],
    },
    { name: 'package.json', path: 'package.json', type: 'file', size: 2100, sha: 'vwx234' },
    { name: 'tsconfig.json', path: 'tsconfig.json', type: 'file', size: 890, sha: 'yza567' },
    { name: 'README.md', path: 'README.md', type: 'file', size: 4500, sha: 'bcd890' },
    { name: '.gitignore', path: '.gitignore', type: 'file', size: 340, sha: 'efg123' },
    {
      name: 'docker',
      path: 'docker',
      type: 'dir',
      sha: 'hij456',
      children: [
        { name: 'Dockerfile', path: 'docker/Dockerfile', type: 'file', size: 780, sha: 'klm789' },
        { name: 'docker-compose.yml', path: 'docker/docker-compose.yml', type: 'file', size: 1240, sha: 'nop012' },
      ],
    },
    {
      name: '.github',
      path: '.github',
      type: 'dir',
      sha: 'qrs345',
      children: [
        {
          name: 'workflows',
          path: '.github/workflows',
          type: 'dir',
          sha: 'tuv678',
          children: [
            { name: 'ci.yml', path: '.github/workflows/ci.yml', type: 'file', size: 2340, sha: 'wxy901' },
            { name: 'deploy.yml', path: '.github/workflows/deploy.yml', type: 'file', size: 3456, sha: 'zab234' },
          ],
        },
      ],
    },
  ];
}

function getMockFileContent(path: string): string {
  const contents: Record<string, string> = {
    'package.json': `{
  "name": "gitmind-core",
  "version": "2.4.1",
  "description": "Core AI orchestration engine powering GitMind platform",
  "main": "dist/index.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "lint": "eslint src --ext ts,tsx"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "framer-motion": "^11.0.0"
  }
}`,
    'README.md': `# GitMind Core

> AI-powered GitHub DevOps Operating System

## Overview

GitMind Core is the central orchestration engine that powers the GitMind platform, providing AI-enhanced repository intelligence, automated code review, security scanning, and deployment monitoring.

## Features

- 🤖 Multi-model AI integration (Claude, GPT-4, Gemini)
- 🔒 Enterprise-grade security scanning
- 📊 Real-time deployment monitoring
- 🧠 AI memory and context persistence
- ⚡ WebSocket streaming responses

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Architecture

\`\`\`
src/
├── components/    # UI components
├── pages/         # Route pages
├── services/      # API services
├── store/         # Zustand state
└── types/         # TypeScript types
\`\`\``,
    '.github/workflows/ci.yml': `name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}`,
  };

  return contents[path] || `// File: ${path}\n// Content not available in demo mode\n// Connect a GitHub token to view real file contents`;
}
