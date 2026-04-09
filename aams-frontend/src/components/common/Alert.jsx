import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const variants = {
  success: {
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-600 dark:text-green-400'
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
    icon: AlertCircle,
    iconColor: 'text-red-600 dark:text-red-400'
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: AlertTriangle,
    iconColor: 'text-yellow-600 dark:text-yellow-400'
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400'
  }
};

export function Alert({ variant = 'info', title, message, onClose, action }) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={clsx(
        'rounded-lg border p-4',
        config.bg,
        config.border,
        'flex gap-4 items-start'
      )}
    >
      <Icon className={clsx('flex-shrink-0 mt-0.5', config.iconColor)} size={20} />
      
      <div className="flex-1">
        {title && (
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">
            {title}
          </h3>
        )}
        {message && (
          <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
            {message}
          </p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-3 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            {action.label}
          </button>
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          <X size={20} />
        </button>
      )}
    </motion.div>
  );
}

export default Alert;
