import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'violet' | 'cyan' | 'orange' | 'ghost';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  dot = false,
  pulse = false,
  className,
  children,
}) => {
  const variantStyles = {
    default: 'bg-slate-700/80 text-slate-300 border-slate-600/50',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/15 text-red-400 border-red-500/30',
    info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    violet: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    ghost: 'bg-white/5 text-slate-400 border-white/10',
  };

  const dotColors = {
    default: 'bg-slate-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-red-400',
    info: 'bg-blue-400',
    violet: 'bg-violet-400',
    cyan: 'bg-cyan-400',
    orange: 'bg-orange-400',
    ghost: 'bg-slate-500',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded-md',
    sm: 'text-xs px-2 py-0.5 rounded-lg',
    md: 'text-sm px-2.5 py-1 rounded-lg',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span className={cn(
          'rounded-full flex-shrink-0',
          size === 'xs' ? 'w-1 h-1' : 'w-1.5 h-1.5',
          dotColors[variant],
          pulse && 'animate-pulse'
        )} />
      )}
      {children}
    </span>
  );
};

// Status badge helper
export const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className }) => {
  const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string; dot: boolean }> = {
    success: { variant: 'success', label: 'Success', dot: true },
    failure: { variant: 'danger', label: 'Failed', dot: true },
    failed: { variant: 'danger', label: 'Failed', dot: true },
    pending: { variant: 'warning', label: 'Pending', dot: true },
    in_progress: { variant: 'info', label: 'Running', dot: true },
    cancelled: { variant: 'default', label: 'Cancelled', dot: true },
    open: { variant: 'success', label: 'Open', dot: true },
    closed: { variant: 'default', label: 'Closed', dot: false },
    merged: { variant: 'violet', label: 'Merged', dot: true },
    queued: { variant: 'warning', label: 'Queued', dot: true },
    waiting: { variant: 'warning', label: 'Waiting', dot: true },
    complete: { variant: 'success', label: 'Complete', dot: true },
    error: { variant: 'danger', label: 'Error', dot: true },
    processing: { variant: 'info', label: 'Processing', dot: true },
    uploading: { variant: 'cyan', label: 'Uploading', dot: true },
    analyzing: { variant: 'violet', label: 'Analyzing', dot: true },
  };

  const config = statusConfig[status.toLowerCase()] || { variant: 'default' as BadgeProps['variant'], label: status, dot: false };

  return (
    <Badge
      variant={config.variant}
      dot={config.dot}
      pulse={status === 'in_progress' || status === 'uploading' || status === 'analyzing'}
      className={className}
    >
      {config.label}
    </Badge>
  );
};

// Severity badge helper
export const SeverityBadge: React.FC<{ severity: string; className?: string }> = ({ severity, className }) => {
  const severityConfig: Record<string, BadgeProps['variant']> = {
    critical: 'danger',
    high: 'orange',
    medium: 'warning',
    low: 'info',
    info: 'ghost',
  };

  return (
    <Badge
      variant={severityConfig[severity.toLowerCase()] || 'default'}
      dot
      className={className}
    >
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
};

export default Badge;
