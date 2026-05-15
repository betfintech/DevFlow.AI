import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitPullRequest, MessageSquare, GitMerge, X, ChevronDown,
  Plus, Minus, FileText, Brain, AlertTriangle, CheckCircle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { mockPullRequests } from '../services/mockData';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { callAI } from '../services/openrouter';
import { formatRelativeTime, cn } from '../utils/cn';
import type { PullRequest } from '../types';

export const PullRequests: React.FC = () => {
  const [prs] = useState(mockPullRequests);
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'merged'>('all');
  const [aiReview, setAiReview] = useState<Record<number, string>>({});
  const [loadingReview, setLoadingReview] = useState<number | null>(null);

  const filtered = prs.filter(pr => {
    if (filter === 'all') return true;
    return pr.state === filter;
  });

  const generateAIReview = async (pr: PullRequest) => {
    if (aiReview[pr.number] || loadingReview) return;
    setLoadingReview(pr.number);
    try {
      const review = await callAI(
        `Review this pull request: "${pr.title}". Body: "${pr.body?.slice(0, 500)}". Changes: +${pr.additions} -${pr.deletions} in ${pr.changed_files} files.`,
        'You are an expert code reviewer. Provide a concise, actionable review with risk assessment.'
      );
      setAiReview(prev => ({ ...prev, [pr.number]: review }));
    } finally {
      setLoadingReview(null);
    }
  };

  const getRiskColor = (score?: number) => {
    if (!score) return 'text-slate-400';
    if (score <= 3) return 'text-emerald-400';
    if (score <= 6) return 'text-amber-400';
    return 'text-red-400';
  };

  const getRiskLabel = (score?: number) => {
    if (!score) return 'Unknown';
    if (score <= 3) return 'Low Risk';
    if (score <= 6) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Pull Requests</h2>
          <p className="text-sm text-slate-500">
            {prs.filter(p => p.state === 'open').length} open · {prs.filter(p => p.state === 'merged').length} merged · {prs.filter(p => p.state === 'closed').length} closed
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<GitPullRequest size={14} />}>
          New PR
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'open', 'merged', 'closed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-200',
              filter === f
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                : 'text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-700'
            )}
          >
            {f}
            <span className="ml-1.5 text-[10px] text-slate-500">
              {f === 'all' ? prs.length : prs.filter(p => p.state === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* PR List */}
      <div className="grid gap-3">
        {filtered.map((pr, idx) => (
          <motion.div
            key={pr.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <GlassCard
              hover
              padding="none"
              animate={false}
              className="cursor-pointer"
              onClick={() => setSelectedPR(pr)}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <img src={pr.user.avatar_url} alt={pr.user.login} className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <StatusBadge status={pr.state} />
                      <span className="text-sm font-semibold text-white">{pr.title}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-2 flex-wrap">
                      <span className="text-violet-400 font-mono">#{pr.number}</span>
                      <span>by {pr.user.login}</span>
                      <span>{pr.head.ref} → {pr.base.ref}</span>
                      <span>{formatRelativeTime(pr.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <div className="flex items-center gap-1 text-emerald-400">
                        <Plus size={11} />
                        <span>{pr.additions}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-400">
                        <Minus size={11} />
                        <span>{pr.deletions}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText size={11} />
                        <span>{pr.changed_files} files</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={11} />
                        <span>{pr.review_comments} comments</span>
                      </div>
                    </div>

                    {pr.labels.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
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

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {pr.risk_score !== undefined && (
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500">Risk Score</p>
                        <p className={cn('text-sm font-bold', getRiskColor(pr.risk_score))}>
                          {pr.risk_score}/10
                        </p>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="xs"
                      leftIcon={<Brain size={11} />}
                      onClick={(e) => { e.stopPropagation(); generateAIReview(pr); setSelectedPR(pr); }}
                      isLoading={loadingReview === pr.number}
                    >
                      AI Review
                    </Button>
                  </div>
                </div>
              </div>

              {/* AI Review Preview */}
              {aiReview[pr.number] && (
                <div className="px-4 pb-4 border-t border-slate-700/40 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={12} className="text-violet-400" />
                    <span className="text-xs font-semibold text-violet-400">AI Review</span>
                    <Badge variant={
                      (pr.risk_score || 0) <= 3 ? 'success' : (pr.risk_score || 0) <= 6 ? 'warning' : 'danger'
                    } size="xs">
                      {getRiskLabel(pr.risk_score)}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{aiReview[pr.number]}</p>
                </div>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* PR Detail Modal */}
      <AnimatePresence>
        {selectedPR && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setSelectedPR(null)}
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-full max-w-2xl bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/60 z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Modal header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusBadge status={selectedPR.state} />
                      <span className="text-violet-400 font-mono text-sm">#{selectedPR.number}</span>
                    </div>
                    <h2 className="text-lg font-bold text-white">{selectedPR.title}</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      by {selectedPR.user.login} · {formatRelativeTime(selectedPR.created_at)}
                    </p>
                  </div>
                  <button onClick={() => setSelectedPR(null)} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Additions', value: `+${selectedPR.additions}`, color: 'text-emerald-400' },
                    { label: 'Deletions', value: `-${selectedPR.deletions}`, color: 'text-red-400' },
                    { label: 'Files', value: selectedPR.changed_files.toString(), color: 'text-blue-400' },
                    { label: 'Commits', value: selectedPR.commits.toString(), color: 'text-violet-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <p className={cn('text-lg font-bold', color)}>{value}</p>
                      <p className="text-xs text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {selectedPR.body && (
                  <GlassCard padding="md" className="mb-4">
                    <h3 className="text-sm font-semibold text-white mb-3">Description</h3>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{selectedPR.body}</ReactMarkdown>
                    </div>
                  </GlassCard>
                )}

                {/* AI Review */}
                <GlassCard padding="md" glow="violet">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Brain size={16} className="text-violet-400" />
                      <h3 className="text-sm font-semibold text-white">AI Code Review</h3>
                    </div>
                    {!aiReview[selectedPR.number] && (
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => generateAIReview(selectedPR)}
                        isLoading={loadingReview === selectedPR.number}
                        leftIcon={<Brain size={11} />}
                      >
                        Generate Review
                      </Button>
                    )}
                  </div>

                  {aiReview[selectedPR.number] ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{aiReview[selectedPR.number]}</ReactMarkdown>
                    </div>
                  ) : selectedPR.ai_review ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{selectedPR.ai_review}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Brain size={32} className="text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Click "Generate Review" to get AI analysis</p>
                    </div>
                  )}

                  {selectedPR.risk_score !== undefined && (
                    <div className="mt-4 pt-4 border-t border-slate-700/40 flex items-center justify-between">
                      <span className="text-sm text-slate-400">Risk Assessment</span>
                      <div className="flex items-center gap-2">
                        {selectedPR.risk_score <= 3 ? <CheckCircle size={14} className="text-emerald-400" /> : <AlertTriangle size={14} className="text-amber-400" />}
                        <span className={cn('text-sm font-semibold', getRiskColor(selectedPR.risk_score))}>
                          {selectedPR.risk_score}/10 — {getRiskLabel(selectedPR.risk_score)}
                        </span>
                      </div>
                    </div>
                  )}
                </GlassCard>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PullRequests;
