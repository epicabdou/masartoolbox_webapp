import * as React from 'react';
import styles from './button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'destructive' | 'secondary' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const cls = [
      styles.btn,
      styles[size],
      styles[`variant-${variant}`],
      className,
    ].filter(Boolean).join(' ');
    return <button className={cls} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button };
