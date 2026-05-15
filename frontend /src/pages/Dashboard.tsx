import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GitBranch, GitPullRequest, Rocket, Shield, Brain, Activity,
  TrendingUp, AlertTriangle, CheckCircle, Clock, Zap, ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { GlassCard, StatCard } from '../components/ui/GlassCard';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ScoreRing } from '../components/ui/ScoreRing';
import {
  useRepositoryStore, useNotificationStore, useAuthStore,
  useStatsStore, useSecurityStore, useDeploymentStore,
} from '../store';
import {
  mockRepositories, mockPullRequests, mockDeployments,
  mockSecurityFindings, mockAppStats, mockNotifications,
} from '../services/mockData';
import { formatRelativeTime, formatNumber, getLanguageColor } from '../utils/cn';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';

const activityData = [
  { day: 'Mon', commits: 12, deployments: 2, prs: 4 },
  { day: 'Tue', commits: 18, deployments: 3, prs: 6 },
  { day: 'Wed', commits: 8, deployments: 1, prs: 3 },
  { day: 'Thu', commits: 24, deployments: 5, prs: 8 },
  { day: 'Fri', commits: 16, deployments: 4, prs: 5 },
  { day: 'Sat', commits: 5, deployments: 1, prs: 2 },
  { day: 'Sun', commits: 9, deployments: 2, prs: 3 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700/60 rounded-xl p-3 text-xs shadow-xl">
        <p className="text-slate-400 mb-2 font-medium">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-300">{p.name}:</span>
            <span className="text-white font-semibold">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setRepositories } = useRepositoryStore();
  const { setNotifications } = useNotificationStore();
  const { setStats, stats } = useStatsStore();
  const { setFindings } = useSecurityStore();
  const { setDeployments } = useDeploymentStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setRepositories(mockRepositories);
    setNotifications(mockNotifications);
    setStats(mockAppStats);
    setFindings(mockSecurityFindings);
    setDeployments(mockDeployments);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsRefreshing(false);
  };

  const recentRepos = mockRepositories.slice(0, 4);
  const openPRs = mockPullRequests.filter(pr => pr.state === 'open');
  const criticalFindings = mockSecurityFindings.filter(f => f.severity === 'critical' && f.status === 'open');
  const recentDeployments = mockDeployments.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-slate-900/40 border border-violet-500/20 rounded-2xl p-6"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-violet-400" />
              <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">AI DevOps OS</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Good morning, <span className="text-violet-300">{user?.username || 'Developer'}</span> 👋
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {criticalFindings.length > 0
                ? `⚠️ ${criticalFindings.length} critical security finding${criticalFindings.length > 1 ? 's' : ''} need attention`
                : '✅ All systems healthy. AI is monitoring your repos.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/ai-chat')}
              leftIcon={<Brain size={14} />}
            >
              Ask AI
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Repositories"
          value={stats.total_repositories}
          subtitle="GitHub repos tracked"
          icon={<GitBranch size={18} />}
          color="violet"
          trend={{ value: 12, label: 'this month', positive: true }}
        />
        <StatCard
          title="Open PRs"
          value={stats.open_pull_requests}
          subtitle={`${stats.total_pull_requests} total pull requests`}
          icon={<GitPullRequest size={18} />}
          color="cyan"
        />
        <StatCard
          title="Deployments"
          value={stats.total_deployments}
          subtitle={`${stats.successful_deployments} successful`}
          icon={<Rocket size={18} />}
          color="emerald"
          trend={{ value: 8, label: 'success rate', positive: true }}
        />
        <StatCard
          title="Security Findings"
          value={stats.security_findings}
          subtitle={`${stats.critical_findings} critical`}
          icon={<Shield size={18} />}
          color={stats.critical_findings > 0 ? 'red' : 'emerald'}
        />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2">
          <GlassCard padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">Activity Overview</h3>
                <p className="text-xs text-slate-500">Last 7 days</p>
              </div>
              <Badge variant="violet" dot>Live</Badge>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="commitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="deployGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="commits" stroke="#8b5cf6" fill="url(#commitGrad)" strokeWidth={2} name="Commits" />
                <Area type="monotone" dataKey="deployments" stroke="#22c55e" fill="url(#deployGrad)" strokeWidth={2} name="Deployments" />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Health Scores */}
        <GlassCard padding="lg">
          <h3 className="font-semibold text-white mb-4">Repository Health</h3>
          <div className="flex justify-around mb-4">
            <ScoreRing score={stats.avg_health_score} size="md" label="Overall" />
            <ScoreRing score={88} size="md" label="Security" />
          </div>
          <div className="space-y-3">
            {[
              { label: 'Code Quality', value: 91, color: 'bg-violet-500' },
              { label: 'Test Coverage', value: 74, color: 'bg-blue-500' },
              { label: 'Performance', value: 86, color: 'bg-emerald-500' },
              { label: 'Security', value: 82, color: 'bg-amber-500' },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{metric.label}</span>
                  <span className="text-white font-medium">{metric.value}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    className={`h-full rounded-full ${metric.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Repositories */}
        <GlassCard padding="none">
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <h3 className="font-semibold text-white">Recent Repositories</h3>
            <Button variant="ghost" size="xs" rightIcon={<ArrowRight size={12} />} onClick={() => navigate('/repositories')}>
              View all
            </Button>
          </div>
          <div className="divide-y divide-slate-700/30">
            {recentRepos.map((repo) => (
              <motion.div
                key={repo.id}
                className="flex items-center gap-3 p-4 hover:bg-slate-800/30 cursor-pointer transition-colors"
                onClick={() => navigate(`/repositories/${repo.owner}/${repo.name}`)}
                whileHover={{ x: 2 }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-slate-200 truncate">{repo.name}</span>
                    {repo.private && <Badge variant="ghost" size="xs">Private</Badge>}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{repo.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {repo.language && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getLanguageColor(repo.language) }} />
                        <span className="text-[10px] text-slate-500">{repo.language}</span>
                      </div>
                    )}
                    <span className="text-[10px] text-slate-500">⭐ {formatNumber(repo.stars)}</span>
                    <span className="text-[10px] text-slate-500">{formatRelativeTime(repo.updated_at)}</span>
                  </div>
                </div>
                <ScoreRing score={repo.health_score || 0} size="sm" showGrade={false} animate={false} />
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <div className="space-y-4">
          {/* Open PRs */}
          <GlassCard padding="none">
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              <h3 className="font-semibold text-white text-sm">Open Pull Requests</h3>
              <Button variant="ghost" size="xs" rightIcon={<ArrowRight size={12} />} onClick={() => navigate('/pull-requests')}>
                View all
              </Button>
            </div>
            <div className="divide-y divide-slate-700/30">
              {openPRs.slice(0, 3).map((pr) => (
                <div key={pr.id} className="flex items-start gap-3 p-3 hover:bg-slate-800/30 cursor-pointer transition-colors" onClick={() => navigate('/pull-requests')}>
                  <img src={pr.user.avatar_url} alt={pr.user.login} className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{pr.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-500">#{pr.number}</span>
                      <span className="text-[10px] text-slate-500">{pr.user.login}</span>
                      {pr.risk_score !== undefined && pr.risk_score > 6 && (
                        <Badge variant="warning" size="xs" dot>High Risk</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Recent Deployments */}
          <GlassCard padding="none">
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              <h3 className="font-semibold text-white text-sm">Recent Deployments</h3>
              <Button variant="ghost" size="xs" rightIcon={<ArrowRight size={12} />} onClick={() => navigate('/deployments')}>
                View all
              </Button>
            </div>
            <div className="divide-y divide-slate-700/30">
              {recentDeployments.slice(0, 3).map((deployment) => (
                <div key={deployment.id} className="flex items-center gap-3 p-3 hover:bg-slate-800/30 cursor-pointer transition-colors" onClick={() => navigate('/deployments')}>
                  <StatusBadge status={deployment.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{deployment.repo_name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{deployment.environment} • {deployment.branch}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 flex-shrink-0">{formatRelativeTime(deployment.created_at)}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Security Alert Banner */}
      {criticalFindings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-300">
              {criticalFindings.length} Critical Security {criticalFindings.length === 1 ? 'Finding' : 'Findings'} Detected
            </p>
            <p className="text-xs text-red-400/70 truncate">
              {criticalFindings[0]?.title}
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => navigate('/security')}
            rightIcon={<ArrowRight size={14} />}
          >
            Review Now
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
