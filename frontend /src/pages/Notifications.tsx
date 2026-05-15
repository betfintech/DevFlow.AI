import React from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2, Shield, Rocket, GitPullRequest, Brain, Info, AlertTriangle, X } from 'lucide-react';
import { useNotificationStore } from '../store';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatRelativeTime, cn } from '../utils/cn';
import type { Notification } from '../types';

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  security: <Shield size={16} className="text-red-400" />,
  deployment: <Rocket size={16} className="text-emerald-400" />,
  pr: <GitPullRequest size={16} className="text-violet-400" />,
  ai: <Brain size={16} className="text-violet-400" />,
  info: <Info size={16} className="text-blue-400" />,
  warning: <AlertTriangle size={16} className="text-amber-400" />,
  error: <AlertTriangle size={16} className="text-red-400" />,
  success: <Rocket size={16} className="text-emerald-400" />,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  security: 'border-l-red-500',
  deployment: 'border-l-emerald-500',
  pr: 'border-l-violet-500',
  ai: 'border-l-violet-500',
  info: 'border-l-blue-500',
  warning: 'border-l-amber-500',
  error: 'border-l-red-500',
  success: 'border-l-emerald-500',
};

export const Notifications: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotificationStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Activity & Notifications</h2>
          <p className="text-sm text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" leftIcon={<CheckCheck size={14} />} onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} onClick={clearAll}>
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'security', 'deployment', 'pr', 'ai'].map((type) => (
          <button key={type} className="text-xs px-3 py-1.5 rounded-lg capitalize bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200 transition-all">
            {type}
          </button>
        ))}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 font-medium mb-2">No notifications yet</p>
          <p className="text-sm text-slate-500">Activity from your repos, deployments, and AI will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification, idx) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              layout
            >
              <GlassCard
                padding="none"
                animate={false}
                className={cn(
                  'border-l-2 transition-all duration-200',
                  NOTIFICATION_COLORS[notification.type] || 'border-l-slate-600',
                  !notification.read && 'bg-slate-800/40'
                )}
              >
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-800/60 flex items-center justify-center mt-0.5">
                    {NOTIFICATION_ICONS[notification.type] || <Bell size={16} className="text-slate-400" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      {!notification.read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                      )}
                      <p className="text-sm font-semibold text-white">{notification.title}</p>
                      {notification.repository && (
                        <Badge variant="ghost" size="xs">{notification.repository}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mb-1">{notification.message}</p>
                    <p className="text-xs text-slate-600">{formatRelativeTime(notification.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 flex items-center justify-center transition-colors text-[10px] font-medium"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="w-7 h-7 rounded-lg bg-slate-700/60 text-slate-500 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
