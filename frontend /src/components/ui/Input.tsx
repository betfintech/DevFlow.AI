import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'glass' | 'minimal';
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  variant = 'default',
  containerClassName,
  className,
  ...props
}, ref) => {
  const variantStyles = {
    default: 'bg-slate-800/80 border-slate-700/60 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20',
    glass: 'bg-white/5 border-white/10 hover:border-white/20 focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20 backdrop-blur-sm',
    minimal: 'bg-transparent border-0 border-b border-slate-700 rounded-none hover:border-slate-500 focus:border-violet-500 focus:ring-0',
  };

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500',
            'border transition-all duration-200 outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            variantStyles[variant],
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: 'default' | 'glass' | 'minimal';
  containerClassName?: string;
  resize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  hint,
  variant = 'default',
  containerClassName,
  className,
  resize = false,
  ...props
}, ref) => {
  const variantStyles = {
    default: 'bg-slate-800/80 border-slate-700/60 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20',
    glass: 'bg-white/5 border-white/10 hover:border-white/20 focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20 backdrop-blur-sm',
    minimal: 'bg-transparent border-0 border-b border-slate-700 rounded-none hover:border-slate-500 focus:border-violet-500 focus:ring-0',
  };

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500',
          'border transition-all duration-200 outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          !resize && 'resize-none',
          variantStyles[variant],
          error && 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Input;
