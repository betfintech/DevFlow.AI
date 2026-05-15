import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  GitBranch,
  GitPullRequest,
  Rocket,
  Shield,
  MessageSquare,
  Brain,
  FileSearch,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  Activity,
  Upload,
  Terminal,
  Cpu,
  User,
} from 'lucide-react';
import { useAuthStore, useNotificationStore, useUIStore } from '../../store';
import { cn } from '../../utils/cn';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
  group?: string;
  description?: string;
}

const navGroups = [
  {
    label: 'Core',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, description: 'Overview & stats' },
      { label: 'Repositories', path: '/repositories', icon: <GitBranch size={18} />, description: 'Manage repos' },
      { label: 'Pull Requests', path: '/pull-requests', icon: <GitPullRequest size={18} />, description: 'Review PRs' },
    ],
  },
  {
    label: 'AI',
    items: [
      { label: 'AI Chat', path: '/ai-chat', icon: <MessageSquare size={18} />, description: 'Chat with AI' },
      { label: 'AI Analysis', path: '/ai-analysis', icon: <Cpu size={18} />, description: 'Analyze repos' },
      { label: 'AI Memory', path: '/ai-memory', icon: <Brain size={18} />, description: 'Knowledge base' },
    ],
  },
  {
    label: 'DevOps',
    items: [
      { label: 'Deployments', path: '/deployments', icon: <Rocket size={18} />, description: 'Monitor deploys' },
      { label: 'Logs', path: '/logs', icon: <Terminal size={18} />, description: 'System logs' },
      { label: 'Security', path: '/security', icon: <Shield size={18} />, description: 'Security center' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'File Explorer', path: '/file-explorer', icon: <FileSearch size={18} />, description: 'Browse files' },
      { label: 'Activity', path: '/notifications', icon: <Activity size={18} />, description: 'Notifications' },
      { label: 'Settings', path: '/settings', icon: <Settings size={18} />, description: 'Configuration' },
    ],
  },
];

export const Navbar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 240 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden md:flex flex-col h-screen bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/60 fixed left-0 top-0 z-40 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800/60 min-h-[65px]">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-500/25">
          <Zap size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="min-w-0"
            >
              <p className="font-bold text-white text-sm leading-tight">GitMind AI</p>
              <p className="text-[10px] text-slate-500 leading-tight">DevOps OS</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="ml-auto flex-shrink-0 w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all duration-200"
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-3">
            {sidebarOpen && (
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 py-1.5">
                {group.label}
              </p>
            )}
            {!sidebarOpen && (
              <div className="h-px bg-slate-800/60 mx-2 my-2" />
            )}
            {group.items.map((item) => {
              const isNotifications = item.path === '/notifications';
              const badge = isNotifications ? unreadCount : undefined;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onMouseEnter={() => setHoveredPath(item.path)}
                  onMouseLeave={() => setHoveredPath(null)}
                  className={({ isActive }) => cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                    isActive
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
                    !sidebarOpen && 'justify-center px-2'
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <span className={cn(
                        'flex-shrink-0 transition-transform duration-200',
                        isActive ? 'text-violet-400' : '',
                        'group-hover:scale-110'
                      )}>
                        {item.icon}
                      </span>

                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-sm font-medium flex-1 truncate"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {badge && badge > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={cn(
                            'flex-shrink-0 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center',
                            sidebarOpen ? 'w-4 h-4' : 'absolute -top-1 -right-1 w-4 h-4'
                          )}
                        >
                          {badge > 99 ? '99+' : badge}
                        </motion.span>
                      )}

                      {/* Tooltip for collapsed state */}
                      {!sidebarOpen && hoveredPath === item.path && (
                        <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                          {item.label}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-800/60 p-3 space-y-1">
        <NavLink
          to="/profile"
          className={({ isActive }) => cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
            isActive ? 'bg-violet-600/20 text-violet-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
            !sidebarOpen && 'justify-center px-2'
          )}
        >
          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} className="w-7 h-7 rounded-lg object-cover" />
            ) : (
              <User size={14} className="text-white" />
            )}
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-slate-200 truncate">{user?.username || 'User'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.plan || 'free'} plan</p>
              </motion.div>
            )}
          </AnimatePresence>
        </NavLink>

        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200',
            !sidebarOpen && 'justify-center px-2'
          )}
        >
          <LogOut size={16} />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};

export default Navbar;
