import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export function Pagination({ current = 1, total, onPageChange, loading = false }) {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const visiblePages = pages.slice(
    Math.max(0, current - 2),
    Math.min(total, current + 3)
  );

  return (
    <div className="flex items-center justify-center gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1 || loading}
        className={clsx(
          'p-2 rounded-lg transition-colors',
          current === 1 || loading
            ? 'bg-neutral-100 dark:bg-dark-800 text-neutral-400 cursor-not-allowed'
            : 'bg-white dark:bg-dark-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-dark-800'
        )}
      >
        <ChevronLeft size={20} />
      </motion.button>

      <div className="flex gap-1">
        {visiblePages.map((page) => (
          <motion.button
            key={page}
            whileHover={{ scale: 1.05 }}
            onClick={() => onPageChange(page)}
            disabled={loading}
            className={clsx(
              'w-10 h-10 rounded-lg font-medium transition-all duration-200',
              page === current
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-dark-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-dark-800'
            )}
          >
            {page}
          </motion.button>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(current + 1)}
        disabled={current === total || loading}
        className={clsx(
          'p-2 rounded-lg transition-colors',
          current === total || loading
            ? 'bg-neutral-100 dark:bg-dark-800 text-neutral-400 cursor-not-allowed'
            : 'bg-white dark:bg-dark-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-dark-800'
        )}
      >
        <ChevronRight size={20} />
      </motion.button>
    </div>
  );
}

export default Pagination;
