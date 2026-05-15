import React from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Calendar, Star, GitBranch, MessageSquare, Brain,
  Shield, Rocket, Edit3, ExternalLink, Zap, Award,
} from 'lucide-react';
import { useAuthStore, useStatsStore, useMemoryStore } from '../store';
import { GlassCard, StatCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ScoreRing } from '../components/ui/ScoreRing';
import { formatRelativeTime } from '../utils/cn';

export const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const { stats } = useStatsStore();
  const { memories } = useMemoryStore();

  const achievements = [
    { icon: '🤖', label: 'AI Pioneer', desc: `Sent ${stats.ai_messages_sent}+ AI messages`, unlocked: stats.ai_messages_sent > 10 },
    { icon: '🧠', label: 'Memory Master', desc: `Stored ${memories.length}+ memories`, unlocked: memories.length >= 5 },
    { icon: '🔒', label: 'Security Guardian', desc: 'Resolved security findings', unlocked: true },
    { icon: '🚀', label: 'Deploy Pro', desc: `${stats.successful_deployments}+ successful deploys`, unlocked: stats.successful_deployments >= 3 },
    { icon: '⭐', label: 'Code Reviewer', desc: 'Reviewed 10+ pull requests', unlocked: stats.total_pull_requests > 5 },
    { icon: '🏗️', label: 'Architect', desc: 'Analyzed repository architecture', unlocked: true },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-slate-900/40 border border-violet-500/20 rounded-2xl p-6"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start gap-6 flex-wrap">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-violet-500/30 text-2xl font-black text-white">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                user?.username?.[0]?.toUpperCase() || 'U'
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl font-bold text-white">{user?.username}</h2>
              <Badge variant="violet" size="sm">
                {user?.plan || 'free'} plan
              </Badge>
            </div>
            <p className="text-slate-400 text-sm mb-3">{user?.email}</p>
            <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
              {user?.github_username && (
                <div className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  <span>@{user.github_username}</span>
                </div>
              )}
              {user?.created_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>Joined {formatRelativeTime(user.created_at)}</span>
                </div>
              )}
            </div>
          </div>

          <Button variant="outline" size="sm" leftIcon={<Edit3 size={14} />}>
            Edit Profile
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Repositories" value={stats.total_repositories} icon={<GitBranch size={18} />} color="violet" />
        <StatCard title="AI Messages" value={stats.ai_messages_sent} icon={<MessageSquare size={18} />} color="cyan" />
        <StatCard title="Memories" value={memories.length} icon={<Brain size={18} />} color="violet" />
        <StatCard title="Deployments" value={stats.total_deployments} icon={<Rocket size={18} />} color="emerald" />
      </div>

      {/* Platform Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard padding="lg">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Zap size={16} className="text-violet-400" />
            Platform Usage
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Total Repositories', value: stats.total_repositories, max: 50 },
              { label: 'AI Messages Sent', value: stats.ai_messages_sent, max: 1000 },
              { label: 'Memories Stored', value: memories.length, max: 100 },
              { label: 'Deployments Monitored', value: stats.total_deployments, max: 50 },
            ].map(({ label, value, max }) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{label}</span>
                  <span className="text-white font-medium">{value}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard padding="lg">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Award size={16} className="text-amber-400" />
            Achievements
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.label}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all ${
                  achievement.unlocked
                    ? 'bg-violet-600/10 border-violet-500/20'
                    : 'bg-slate-800/40 border-slate-700/30 opacity-40'
                }`}
              >
                <span className="text-2xl">{achievement.icon}</span>
                <span className="text-[10px] font-semibold text-slate-200 leading-tight">{achievement.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Plan Info */}
      <GlassCard padding="lg" glow="violet">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} className="text-amber-400" />
              <h3 className="font-semibold text-white">
                {user?.plan === 'enterprise' ? 'Enterprise' : user?.plan === 'pro' ? 'Pro' : 'Free'} Plan
              </h3>
              <Badge variant={user?.plan === 'pro' || user?.plan === 'enterprise' ? 'violet' : 'ghost'} size="sm">
                Active
              </Badge>
            </div>
            <p className="text-sm text-slate-400">
              {user?.plan === 'free'
                ? 'Upgrade to Pro for unlimited AI messages, advanced security scanning, and priority support.'
                : 'Full access to all GitMind AI features including unlimited AI, advanced analytics, and team collaboration.'}
            </p>
          </div>
          {user?.plan === 'free' && (
            <Button variant="primary" leftIcon={<Zap size={14} />}>
              Upgrade to Pro
            </Button>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default Profile;
