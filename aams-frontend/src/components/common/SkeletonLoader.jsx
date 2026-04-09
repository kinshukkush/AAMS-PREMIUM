/**
 * Animated Loading Skeletons
 * Shimmer effects for loading states
 */

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

/**
 * Skeleton Text Loader
 */
export const SkeletonText = ({ lines = 1, className = '' }) => {
  return (
    <motion.div
      className={clsx('space-y-2', className)}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'bg-gradient-to-r from-gray-200 to-gray-100 dark:from-slate-700 dark:to-slate-800',
            'rounded-md',
            i === lines - 1 ? 'w-2/3 h-4' : 'w-full h-4'
          )}
        />
      ))}
    </motion.div>
  );
};

/**
 * Skeleton Card Loader
 */
export const SkeletonCard = ({ className = '' }) => {
  return (
    <motion.div
      className={clsx(
        'bg-white dark:bg-slate-800 rounded-lg p-4 space-y-4',
        className
      )}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-lg" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/3" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6" />
        <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-4/6" />
      </div>

      {/* Footer */}
      <div className="flex gap-2 pt-2">
        <div className="flex-1 h-8 bg-gray-200 dark:bg-slate-700 rounded-md" />
        <div className="flex-1 h-8 bg-gray-100 dark:bg-slate-800 rounded-md" />
      </div>
    </motion.div>
  );
};

/**
 * Skeleton Table Row
 */
export const SkeletonTableRow = ({ columns = 5 }) => {
  return (
    <motion.tr
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded" />
        </td>
      ))}
    </motion.tr>
  );
};

/**
 * Skeleton Avatar
 */
export const SkeletonAvatar = ({ size = 'md' }) => {
  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }[size];

  return (
    <motion.div
      className={clsx(
        sizeClass,
        'bg-gray-200 dark:bg-slate-700 rounded-full'
      )}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  );
};

/**
 * Skeleton Button
 */
export const SkeletonButton = ({ className = '' }) => (
  <motion.div
    className={clsx(
      'h-10 bg-gray-200 dark:bg-slate-700 rounded-lg',
      className
    )}
    animate={{ opacity: [0.6, 1, 0.6] }}
    transition={{ duration: 2, repeat: Infinity }}
  />
);

/**
 * Skeleton Chart
 */
export const SkeletonChart = ({ height = 'h-64' }) => {
  return (
    <motion.div
      className={clsx(
        'bg-white dark:bg-slate-800 rounded-lg p-4',
        height
      )}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <div className="space-y-4">
        {/* Title */}
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />

        {/* Chart placeholder */}
        <div className="h-40 bg-gray-100 dark:bg-slate-900 rounded" />

        {/* Legend */}
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Skeleton Dashboard
 */
export const SkeletonDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>

      {/* Table */}
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-900">
            <tr>
              {[1, 2, 3, 4, 5].map((i) => (
                <th key={i} className="px-6 py-3">
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {[1, 2, 3].map((i) => (
              <SkeletonTableRow key={i} />
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

/**
 * Skeleton Analytics Page
 */
export const SkeletonAnalytics = () => {
  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
        <div className="flex gap-2">
          <SkeletonButton className="w-24" />
          <SkeletonButton className="w-24" />
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonButton className="h-10" />
        <SkeletonButton className="h-10" />
        <SkeletonButton className="h-10" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart height="h-80" />
        <SkeletonChart height="h-80" />
      </div>

      {/* Heatmap */}
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-lg p-4"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-100 dark:bg-slate-900 rounded"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default {
  SkeletonText,
  SkeletonCard,
  SkeletonTableRow,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonChart,
  SkeletonDashboard,
  SkeletonAnalytics
};
