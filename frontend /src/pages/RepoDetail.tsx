import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch, Star, GitFork, AlertCircle, Clock, Code2,
  GitPullRequest, Lock, Globe, ExternalLink, ChevronRight,
  GitCommit, ArrowLeft, RefreshCw, Shield,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ScoreRing, MultiScore } from '../components/ui/ScoreRing';
import { fetchRepository, fetchPullRequests, fetchCommits, fetchBranches } from '../services/github';
import { formatRelativeTime, formatNumber, getLanguageColor, cn } from '../utils/cn';
import type { Repository, PullRequest, Commit, Branch } from '../types';

type Tab = 'overview' | 'pulls' | 'commits' | 'branches' | 'security';

export const RepoDetail: React.FC = () => {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const navigate = useNavigate();

  const [repository, setRepository] = useState<Repository | null>(null);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (owner && repo) loadData();
  }, [owner, repo]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [repoData, prs, commitData, branchData] = await Promise.all([
        fetchRepository(owner!, repo!),
        fetchPullRequests(owner!, repo!),
        fetchCommits(owner!, repo!),
        fetchBranches(owner!, repo!),
      ]);
      setRepository(repoData);
      setPullRequests(prs);
      setCommits(commitData);
      setBranches(branchData);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode; count?: number }> = [
    { id: 'overview', label: 'Overview', icon: <Code2 size={14} /> },
    { id: 'pulls', label: 'Pull Requests', icon: <GitPullRequest size={14} />, count: pullRequests.filter(p => p.state === 'open').length },
    { id: 'commits', label: 'Commits', icon: <GitCommit size={14} />, count: commits.length },
    { id: 'branches', label: 'Branches', icon: <GitBranch size={14} />, count: branches.length },
    { id: 'security', label: 'Security', icon: <Shield size={14} /> },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-48 bg-slate-800/40 rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-800/40 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!repository) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/repositories')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-4 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Repositories
        </button>

        <GlassCard padding="lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {repository.private ? <Lock size={14} className="text-slate-400" /> : <Globe size={14} className="text-slate-400" />}
                <h1 className="text-xl font-bold text-white">{repository.full_name}</h1>
                {repository.private && <Badge variant="ghost" size="xs">Private</Badge>}
              </div>

              {repository.description && (
                <p className="text-slate-400 mb-4">{repository.description}</p>
              )}

              {repository.topics && repository.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {repository.topics.map(topic => (
                    <span key={topic} className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg px-2 py-0.5">
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                {repository.language && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getLanguageColor(repository.language) }} />
                    <span>{repository.language}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-amber-400" />
                  <span>{formatNumber(repository.stars)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork size={14} />
                  <span>{formatNumber(repository.forks)}</span>
                </div>
                {repository.open_issues > 0 && (
                  <div className="flex items-center gap-1">
                    <AlertCircle size={14} className="text-amber-400" />
                    <span>{repository.open_issues} issues</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>Updated {formatRelativeTime(repository.updated_at)}</span>
                </div>
                <a
                  href={repository.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={12} />
                  <span className="text-xs">GitHub</span>
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <MultiScore
                scores={[
                  { label: 'Health', score: repository.health_score || 0 },
                  { label: 'Security', score: repository.security_score || 0 },
                ]}
                size="md"
              />
              <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={14} />} onClick={loadData}>
                Sync
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/60 border border-slate-700/50 rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
              activeTab === tab.id
                ? 'bg-violet-600/30 text-violet-200 border border-violet-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-violet-600/30 text-violet-300 text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-4">
              <GlassCard padding="lg">
                <h3 className="font-semibold text-white mb-4">Repository Stats</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Default Branch', value: repository.default_branch },
                    { label: 'Total Size', value: `${(repository.size / 1024).toFixed(1)} MB` },
                    { label: 'Created', value: formatRelativeTime(repository.created_at) },
                    { label: 'Last Updated', value: formatRelativeTime(repository.updated_at) },
                    { label: 'Open Issues', value: repository.open_issues.toString() },
                    { label: 'Stars', value: formatNumber(repository.stars) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-1.5 border-b border-slate-700/30 last:border-0">
                      <span className="text-sm text-slate-400">{label}</span>
                      <span className="text-sm text-slate-200 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {repository.ai_summary && (
                <GlassCard padding="lg" glow="violet">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-violet-600/30 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-violet-400">AI</span>
                    </div>
                    <h3 className="font-semibold text-white">AI Summary</h3>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{repository.ai_summary}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    onClick={() => navigate('/ai-analysis')}
                  >
                    Run Full Analysis →
                  </Button>
                </GlassCard>
              )}
            </div>
          )}

          {activeTab === 'pulls' && (
            <div className="space-y-3">
              {pullRequests.length === 0 ? (
                <div className="text-center py-12">
                  <GitPullRequest size={40} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No pull requests found</p>
                </div>
              ) : (
                pullRequests.map((pr) => (
                  <GlassCard key={pr.id} padding="md" hover animate={false}>
                    <div className="flex items-start gap-3">
                      <img src={pr.user.avatar_url} alt={pr.user.login} className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium text-white">#{pr.number}</span>
                          <span className="text-sm text-slate-200">{pr.title}</span>
                          <StatusBadge status={pr.state} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span>by {pr.user.login}</span>
                          <span>{pr.head.ref} → {pr.base.ref}</span>
                          <span>+{pr.additions} -{pr.deletions}</span>
                          <span>{pr.changed_files} files</span>
                          <span>{formatRelativeTime(pr.created_at)}</span>
                        </div>
                        {pr.labels.length > 0 && (
                          <div className="flex gap-1 mt-1.5">
                            {pr.labels.map(label => (
                              <span
                                key={label.name}
                                className="text-[10px] px-1.5 py-0.5 rounded-md"
                                style={{ backgroundColor: `#${label.color}20`, color: `#${label.color}`, border: `1px solid #${label.color}40` }}
                              >
                                {label.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {pr.risk_score !== undefined && (
                        <div className="flex-shrink-0 text-right">
                          <p className="text-[10px] text-slate-500">Risk</p>
                          <p className={cn(
                            'text-sm font-bold',
                            pr.risk_score <= 3 ? 'text-emerald-400' : pr.risk_score <= 6 ? 'text-amber-400' : 'text-red-400'
                          )}>{pr.risk_score}/10</p>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          )}

          {activeTab === 'commits' && (
            <div className="space-y-2">
              {commits.map((commit) => (
                <GlassCard key={commit.sha} padding="md" animate={false}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700/60 flex items-center justify-center flex-shrink-0">
                      <GitCommit size={14} className="text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 font-medium line-clamp-2 mb-1">
                        {commit.message.split('\n')[0]}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="font-mono text-violet-400">{commit.sha.slice(0, 7)}</span>
                        <span>by {commit.author.name}</span>
                        <span>{formatRelativeTime(commit.author.date)}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {activeTab === 'branches' && (
            <div className="grid sm:grid-cols-2 gap-3">
              {branches.map((branch) => (
                <GlassCard key={branch.name} padding="md" animate={false}>
                  <div className="flex items-center gap-3">
                    <GitBranch size={16} className="text-slate-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{branch.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{branch.sha.slice(0, 7)}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {branch.default && <Badge variant="violet" size="xs">default</Badge>}
                      {branch.protected && <Badge variant="info" size="xs">protected</Badge>}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="text-center py-12">
              <Shield size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-medium mb-2">Security Analysis</p>
              <p className="text-sm text-slate-500 mb-4">Run a security scan to detect vulnerabilities, exposed secrets, and dependency risks.</p>
              <Button onClick={() => navigate('/security')} leftIcon={<Shield size={14} />}>
                View Security Center
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default RepoDetail;
