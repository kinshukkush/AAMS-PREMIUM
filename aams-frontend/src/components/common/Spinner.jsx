import React from 'react';
import { motion } from 'framer-motion';

export function Spinner({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizeMap[size]} border-4 border-neutral-200 dark:border-dark-700 border-t-primary-500 rounded-full ${className}`}
    />
  );
}

export function LoadingOverlay({ visible = true, message = 'Loading...' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      pointer-events={visible ? 'auto' : 'none'}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.3, repeat: Infinity }}
        className="bg-white dark:bg-dark-900 rounded-lg p-8 flex flex-col items-center gap-4"
      >
        <Spinner size="lg" />
        <p className="text-neutral-600 dark:text-neutral-300">{message}</p>
      </motion.div>
    </motion.div>
  );
}

export default Spinner;
