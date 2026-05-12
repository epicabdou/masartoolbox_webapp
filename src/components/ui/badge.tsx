import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        {
          'bg-violet-600/20 text-violet-300 border border-violet-600/30': variant === 'default',
          'bg-zinc-700 text-zinc-300': variant === 'secondary',
          'border border-zinc-600 text-zinc-400': variant === 'outline',
          'bg-red-600/20 text-red-300 border border-red-600/30': variant === 'destructive',
        },
        className
      )}
      {...props}
    />
  );
}
