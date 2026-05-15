import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

type GlowColor = 'violet' | 'cyan' | 'emerald' | 'orange' | 'red' | 'none';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  glow?: GlowColor;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  border?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  onClick,
  hover = false,
  glow = 'none',
  padding = 'md',
  animate = true,
  border = true,
}) => {
  const glowStyles: Record<GlowColor, string> = {
    none: '',
    violet: 'shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20',
    cyan: 'shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20',
    emerald: 'shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20',
    orange: 'shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20',
    red: 'shadow-lg shadow-red-500/10 hover:shadow-red-500/20',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const cardClass = cn(
    'bg-slate-900/60 backdrop-blur-xl rounded-2xl transition-all duration-300',
    border && 'border border-slate-700/50',
    hover && 'hover:border-slate-600/70 hover:bg-slate-800/60 cursor-pointer',
    glowStyles[glow],
    paddingStyles[padding],
    className
  );

  if (animate) {
    return (
      <motion.div
        className={cardClass}
        onClick={onClick}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClass} onClick={onClick}>
      {children}
    </div>
  );
};

// Stat card variant
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string; positive?: boolean };
  color?: 'violet' | 'cyan' | 'emerald' | 'orange' | 'red' | 'blue';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'violet',
  className,
}) => {
  const colorStyles: Record<string, { bg: string; text: string; border: string }> = {
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  };

  const glowMap: Record<string, GlowColor> = {
    violet: 'violet', cyan: 'cyan', emerald: 'emerald', orange: 'orange', red: 'red', blue: 'none',
  };

  const styles = colorStyles[color];

  return (
    <GlassCard className={cn('relative overflow-hidden', className)} hover glow={glowMap[color]}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-400 font-medium truncate">{title}</p>
          <p className="text-2xl font-bold text-white mt-1 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              trend.positive !== false ? 'text-emerald-400' : 'text-red-400'
            )}>
              <span>{trend.positive !== false ? '↑' : '↓'}</span>
              <span>{trend.value}% {trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ml-3',
            styles.bg,
            'border',
            styles.border
          )}>
            <span className={styles.text}>{icon}</span>
          </div>
        )}
      </div>
      <div className={cn(
        'absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-5',
        styles.bg
      )} />
    </GlassCard>
  );
};

export default GlassCard;
