import * as React from 'react';
import s from './badge.module.css';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  return <span className={[s.badge, s[variant], className].filter(Boolean).join(' ')} {...props} />;
}
