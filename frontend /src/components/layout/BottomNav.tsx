import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  MessageSquare,
  Shield,
  Bell,
  Rocket,
} from 'lucide-react';
import { useNotificationStore } from '../../store';
import { cn } from '../../utils/cn';

const bottomNavItems = [
  { label: 'Home', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Repos', path: '/repositories', icon: <GitBranch size={20} /> },
  { label: 'AI', path: '/ai-chat', icon: <MessageSquare size={20} /> },
  { label: 'Deploy', path: '/deployments', icon: <Rocket size={20} /> },
  { label: 'Security', path: '/security', icon: <Shield size={20} /> },
];

export const BottomNav: React.FC = () => {
  const { unreadCount } = useNotificationStore();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/60 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {bottomNavItems.map((item) => {
          const isBell = item.path === '/notifications';
          const badge = isBell ? unreadCount : 0;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                'relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-0',
                isActive
                  ? 'text-violet-400'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    'p-1.5 rounded-xl transition-all duration-200',
                    isActive && 'bg-violet-500/15'
                  )}>
                    {item.icon}
                  </div>
                  <span className="text-[9px] font-medium leading-tight">{item.label}</span>
                  {badge > 0 && (
                    <span className="absolute top-1 right-2 w-3.5 h-3.5 bg-violet-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
