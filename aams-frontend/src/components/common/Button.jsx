import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const buttonVariants = {
  base: 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed',
  size: {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  },
  variant: {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'bg-neutral-200 dark:bg-dark-700 text-neutral-900 dark:text-neutral-50 hover:bg-neutral-300 dark:hover:bg-dark-600',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950',
    ghost: 'text-primary-500 hover:bg-primary-50 dark:hover:bg-dark-800',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:translate-y-0.5',
    success: 'bg-green-500 text-white hover:bg-green-600 active:translate-y-0.5',
  },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  loading = false,
  isAnimated = true,
  ...props
}) {
  const classes = clsx(
    buttonVariants.base,
    buttonVariants.size[size],
    buttonVariants.variant[variant],
    className
  );

  const content = (
    <>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </>
  );

  if (isAnimated && !disabled && !loading) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}

export default Button;
