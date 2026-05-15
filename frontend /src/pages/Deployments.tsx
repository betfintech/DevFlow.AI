import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, CheckCircle, XCircle, Clock, RefreshCw,
  Terminal, ChevronDown, ChevronRight, ExternalLink,
  Activity, Zap, GitBranch, Filter,
} from 'lucide-react';
import { useDeploymentStore } from '../store';
import { mockDeployments } from '../services/mockData';
import { GlassCard, StatCard } from '../components/ui/GlassCard';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatRelativeTime, cn } from '../utils/cn';
import type { Deployment, DeploymentLog } from '../types';

const LogLine: React.FC<{ log: DeploymentLog }> = ({ log }) => {
  const colors = {
    info: 'text-slate-300',
    warn: 'text-amber-400',
    error: 'text-red-400',
    success: 'text-emerald-400',
    debug: 'text-slate-500',
  };

  const prefixes = {
    info: '→',
    warn: '⚠',
    error: '✗',
    success: '✓',
    debug: '·',
  };

  return (
    <div className={cn('flex gap-2 text-xs font-mono py-0.5', colors[log.level])}>
      <span className="flex-shrink-0 text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
      <span className="flex-shrink-0">{prefixes[log.level]}</span>
      <span>{log.message}</span>
    </div>
  );
};

const DeploymentCard: React.FC<{ deployment: Deployment; isSelected: boolean; onClick: () => void }> = ({
  deployment, isSelected, onClick,
}) => {
  const [showLogs, setShowLogs] = useState(false);

  const statusIcons = {
    success: <CheckCircle size={16} className="text-emerald-400" />,
    failure: <XCircle size={16} className="text-red-400" />,
    pending: <Clock size={16} className="text-amber-400" />,
    in_progress: <RefreshCw size={16} className="text-blue-400 animate-spin" />,
    cancelled: <XCircle size={16} className="text-slate-400" />,
  };

  const envColors: Record<string, string> = {
    production: 'text-red-400',
    staging: 'text-amber-400',
    preview: 'text-blue-400',
    development: 'text-emerald-400',
  };

  const durationStr = deployment.duration_ms > 0
    ? `${Math.floor(deployment.duration_ms / 60000)}m ${Math.floor((deployment.duration_ms % 60000) / 1000)}s`
    : 'In progress';

  return (
    <GlassCard
      padding="none"
      animate={false}
      className={cn('transition-all', isSelected && 'ring-1 ring-violet-500/30')}
      border
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-800/30 transition-colors rounded-t-2xl"
        onClick={onClick}
      >
        <div className="flex-shrink-0">
          {statusIcons[deployment.status] || <Clock size={16} className="text-slate-400" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-sm font-semibold text-white">{deployment.repo_name}</span>
            <StatusBadge status={deployment.status} />
            <span className={cn('text-xs font-medium capitalize', envColors[deployment.environment] || 'text-slate-400')}>
              {deployment.environment}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
            <div className="flex items-center gap-1">
              <GitBranch size={11} />
              <span>{deployment.branch}</span>
            </div>
            <span className="font-mono text-violet-400">{deployment.commit_sha}</span>
            <span>{formatRelativeTime(deployment.created_at)}</span>
            {deployment.duration_ms > 0 && <span>⏱ {durationStr}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {deployment.url && (
            <a
              href={deployment.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setShowLogs(!showLogs); }}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Terminal size={14} />
          </button>
        </div>
      </div>

      {/* Commit message */}
      <div className="px-4 pb-3 text-xs text-slate-500 border-b border-slate-700/40">
        <span className="font-mono text-slate-400">{deployment.commit_message.slice(0, 80)}</span>
        <span className="text-slate-600"> · by {deployment.triggered_by}</span>
      </div>

      {/* Logs */}
      <AnimatePresence>
        {showLogs && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-950/80 border-t border-slate-700/40 p-4 rounded-b-2xl max-h-64 overflow-y-auto">
              {deployment.logs.length === 0 ? (
                <p className="text-xs text-slate-600 font-mono">No logs available</p>
              ) : (
                deployment.logs.map((log) => (
                  <LogLine key={log.id} log={log} />
                ))
              )}
              {deployment.status === 'in_progress' && (
                <div className="flex items-center gap-1 mt-2">
                  <motion.span
                    className="w-2 h-2 rounded-full bg-blue-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-xs text-blue-400 font-mono">Deploying...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

export const Deployments: React.FC = () => {
  const { deployments, setDeployments, isLoading, setLoading } = useDeploymentStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterEnv, setFilterEnv] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setDeployments(mockDeployments);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsRefreshing(false);
  };

  const filtered = deployments.filter(d => {
    const envMatch = filterEnv === 'all' || d.environment === filterEnv;
    const statusMatch = filterStatus === 'all' || d.status === filterStatus;
    return envMatch && statusMatch;
  });

  const stats = {
    total: deployments.length,
    success: deployments.filter(d => d.status === 'success').length,
    failed: deployments.filter(d => d.status === 'failure').length,
    inProgress: deployments.filter(d => d.status === 'in_progress').length,
  };

  const successRate = stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Deployments" value={stats.total} icon={<Rocket size={18} />} color="violet" />
        <StatCard title="Successful" value={stats.success} subtitle={`${successRate}% success rate`} icon={<CheckCircle size={18} />} color="emerald" />
        <StatCard title="Failed" value={stats.failed} icon={<XCircle size={18} />} color={stats.failed > 0 ? 'red' : 'emerald'} />
        <StatCard title="In Progress" value={stats.inProgress} icon={<Activity size={18} />} color="cyan" />
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <span className="text-xs text-slate-500">Environment:</span>
          {(['all', 'production', 'staging', 'preview', 'development'] as const).map((env) => (
            <button
              key={env}
              onClick={() => setFilterEnv(env)}
              className={cn(
                'text-xs px-2 py-1 rounded-lg capitalize transition-all',
                filterEnv === env
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700'
              )}
            >
              {env}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'success', 'failure', 'in_progress', 'pending'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              'text-xs px-2.5 py-1.5 rounded-lg capitalize transition-all',
              filterStatus === s
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700'
            )}
          >
            {s === 'in_progress' ? 'In Progress' : s}
          </button>
        ))}
      </div>

      {/* Deployment List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Rocket size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No deployments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((deployment) => (
            <motion.div
              key={deployment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DeploymentCard
                deployment={deployment}
                isSelected={selectedId === deployment.id}
                onClick={() => setSelectedId(selectedId === deployment.id ? null : deployment.id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Deployments;
