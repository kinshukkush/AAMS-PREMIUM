import React from 'react';
import { clsx } from 'clsx';

const badgeVariants = {
  variant: {
    primary: 'bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300',
    success: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300',
    warning: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300',
    error: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300',
    info: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    neutral: 'bg-neutral-200 dark:bg-dark-700 text-neutral-700 dark:text-neutral-300',
  },
  size: {
    sm: 'px-2 py-1 text-xs rounded',
    md: 'px-3 py-1.5 text-sm rounded-md',
    lg: 'px-4 py-2 text-base rounded-lg',
  },
};

export function Badge({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className,
  ...props 
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium',
        badgeVariants.variant[variant],
        badgeVariants.size[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
