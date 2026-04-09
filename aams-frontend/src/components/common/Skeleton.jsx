import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export function Skeleton({ className, count = 1, ...props }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={clsx(
            'bg-neutral-200 dark:bg-dark-700 rounded',
            className
          )}
          {...props}
        />
      ))}
    </>
  );
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={clsx('h-4', i === lines - 1 && 'w-3/4', className)}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }) {
  return (
    <div className={clsx('bg-white dark:bg-dark-900 rounded-xl p-6 space-y-4', className)}>
      <Skeleton className="h-6 w-1/3" />
      <SkeletonText lines={2} />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

export default Skeleton;
