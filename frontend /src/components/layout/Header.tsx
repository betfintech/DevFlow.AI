import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  Command,
  Upload,
  Zap,
  X,
  GitBranch,
  MessageSquare,
  Shield,
  Rocket,
  Brain,
  ChevronRight,
} from 'lucide-react';
import { useNotificationStore, useAuthStore } from '../../store';
import { cn, formatRelativeTime } from '../../utils/cn';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'AI-powered DevOps overview' },
  '/repositories': { title: 'Repositories', subtitle: 'Manage your GitHub repos' },
  '/pull-requests': { title: 'Pull Requests', subtitle: 'Review and manage PRs' },
  '/ai-chat': { title: 'AI Chat', subtitle: 'Chat with your AI assistant' },
  '/ai-analysis': { title: 'AI Analysis', subtitle: 'Repository intelligence' },
  '/ai-memory': { title: 'AI Memory', subtitle: 'Knowledge base & context' },
  '/deployments': { title: 'Deployments', subtitle: 'Monitor your deployments' },
  '/logs': { title: 'Logs', subtitle: 'System and application logs' },
  '/security': { title: 'Security', subtitle: 'Vulnerability & threat intelligence' },
  '/file-explorer': { title: 'File Explorer', subtitle: 'Browse repository files' },
  '/notifications': { title: 'Activity', subtitle: 'Notifications & activity feed' },
  '/settings': { title: 'Settings', subtitle: 'Platform configuration' },
  '/profile': { title: 'Profile', subtitle: 'Your account' },
};

const SEARCH_SHORTCUTS = [
  { icon: <GitBranch size={14} />, label: 'Go to Repositories', path: '/repositories', shortcut: 'R' },
  { icon: <MessageSquare size={14} />, label: 'Open AI Chat', path: '/ai-chat', shortcut: 'C' },
  { icon: <Shield size={14} />, label: 'Security Center', path: '/security', shortcut: 'S' },
  { icon: <Rocket size={14} />, label: 'Deployments', path: '/deployments', shortcut: 'D' },
  { icon: <Brain size={14} />, label: 'AI Memory', path: '/ai-memory', shortcut: 'M' },
];

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead } = useNotificationStore();
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'GitMind AI', subtitle: 'DevOps Operating System' };

  const filteredShortcuts = SEARCH_SHORTCUTS.filter(s =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60">
      {/* Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden md:flex items-center gap-2 text-slate-500 text-xs">
          <Zap size={12} className="text-violet-400" />
          <span>GitMind AI</span>
          <ChevronRight size={10} />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white leading-tight">{pageInfo.title}</h1>
          <p className="text-[10px] text-slate-500 leading-tight hidden sm:block">{pageInfo.subtitle}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-slate-400 hover:text-slate-200 transition-all duration-200 text-sm"
          >
            <Search size={14} />
            <span className="hidden sm:inline text-xs">Search...</span>
            <div className="hidden sm:flex items-center gap-0.5 ml-1">
              <Command size={10} />
              <span className="text-[10px]">K</span>
            </div>
          </button>

          <AnimatePresence>
            {showSearch && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSearch(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-slate-800/60">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search pages, repos..."
                        className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-violet-500/50"
                      />
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider px-2 py-1">Quick Navigation</p>
                    {filteredShortcuts.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => { navigate(item.path); setShowSearch(false); setSearchQuery(''); }}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/60 hover:text-white transition-all duration-150"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-slate-400">{item.icon}</span>
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <kbd className="text-[10px] bg-slate-800 border border-slate-700 rounded-md px-1.5 py-0.5 text-slate-500">
                          {item.shortcut}
                        </kbd>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Upload Button */}
        <button
          onClick={() => navigate('/ai-analysis')}
          className="hidden sm:flex items-center gap-2 px-3 py-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 rounded-xl text-violet-300 hover:text-violet-200 transition-all duration-200 text-sm"
        >
          <Upload size={14} />
          <span className="hidden lg:inline text-xs font-medium">Upload Repo</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all duration-200"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
                    <h3 className="font-semibold text-white text-sm">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={() => useNotificationStore.getState().markAllAsRead()}
                          className="text-xs text-violet-400 hover:text-violet-300"
                        >
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => setShowNotifications(false)}>
                        <X size={14} className="text-slate-500 hover:text-slate-300" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center">
                        <Bell size={24} className="text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No notifications</p>
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => {
                            markAsRead(notification.id);
                            if (notification.action_url) navigate(notification.action_url);
                            setShowNotifications(false);
                          }}
                          className={cn(
                            'w-full flex gap-3 px-4 py-3 border-b border-slate-800/40 hover:bg-slate-800/40 transition-colors text-left',
                            !notification.read && 'bg-violet-500/5'
                          )}
                        >
                          <div className={cn(
                            'flex-shrink-0 w-2 h-2 rounded-full mt-1.5',
                            !notification.read ? 'bg-violet-500' : 'bg-transparent'
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{notification.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notification.message}</p>
                            <p className="text-[10px] text-slate-600 mt-1">{formatRelativeTime(notification.created_at)}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-2.5 border-t border-slate-800/60">
                    <button
                      onClick={() => { navigate('/notifications'); setShowNotifications(false); }}
                      className="w-full text-center text-xs text-violet-400 hover:text-violet-300 py-1"
                    >
                      View all notifications →
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar */}
        <div
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity shadow-lg shadow-violet-500/20"
        >
          <span className="text-sm font-bold text-white">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
