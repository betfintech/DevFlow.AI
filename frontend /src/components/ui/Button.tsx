import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'glass';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  animate?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  animate = true,
  className,
  children,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variantStyles = {
    primary: 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 focus:ring-violet-500 border border-violet-500/50',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 shadow-md focus:ring-slate-500 border border-slate-600/50',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white focus:ring-slate-500',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/25 focus:ring-red-500 border border-red-500/50',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 focus:ring-emerald-500 border border-emerald-500/50',
    outline: 'bg-transparent border border-slate-600 hover:border-violet-500 text-slate-300 hover:text-violet-300 focus:ring-violet-500',
    glass: 'bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 text-slate-200 focus:ring-white/20',
  };

  const sizeStyles = {
    xs: 'text-xs px-2.5 py-1.5 rounded-lg',
    sm: 'text-sm px-3.5 py-2',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-5 py-3',
    xl: 'text-lg px-6 py-3.5',
  };

  const isDisabled = disabled || isLoading;

  const buttonContent = (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size={size} />
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {!isLoading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );

  if (animate && !isDisabled) {
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        style={{ display: fullWidth ? 'block' : 'inline-block' }}
        className={fullWidth ? 'w-full' : ''}
      >
        {buttonContent}
      </motion.div>
    );
  }

  return buttonContent;
};

const LoadingSpinner: React.FC<{ size: ButtonProps['size'] }> = ({ size }) => {
  const spinnerSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  return (
    <svg
      className={cn('animate-spin', spinnerSizes[size || 'md'])}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export default Button;
