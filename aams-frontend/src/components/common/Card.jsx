import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export function Card({ children, className, hover = true, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      className={clsx(
        'bg-white dark:bg-dark-900 rounded-xl border border-neutral-200 dark:border-dark-700 shadow-md p-6 transition-all duration-300',
        hover && 'hover:shadow-xl',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={clsx('mb-4 pb-4 border-b border-neutral-200 dark:border-dark-700', className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...props }) {
  return (
    <div className={clsx('', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={clsx('mt-4 pt-4 border-t border-neutral-200 dark:border-dark-700 flex gap-3', className)} {...props}>
      {children}
    </div>
  );
}

export default Card;
