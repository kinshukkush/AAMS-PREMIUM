import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

export function Select({ label, options, value, onChange, error, placeholder, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  return (
    <div className="w-full" ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {label}
        </label>
      )}

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'w-full px-4 py-2.5 rounded-lg border transition-all duration-200',
          'bg-white dark:bg-dark-800 text-neutral-900 dark:text-neutral-50',
          'border-neutral-300 dark:border-dark-600',
          'flex items-center justify-between',
          'hover:border-neutral-400 dark:hover:border-dark-500',
          error && 'border-red-500'
        )}
        type="button"
      >
        <span className={selectedLabel === placeholder ? 'text-neutral-500' : ''}>
          {selectedLabel}
        </span>
        <ChevronDown
          size={18}
          className={clsx(
            'transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={clsx(
              'absolute top-full left-0 right-0 mt-2 z-50',
              'bg-white dark:bg-dark-800 rounded-lg border',
              'border-neutral-300 dark:border-dark-600',
              'shadow-lg max-h-48 overflow-y-auto'
            )}
          >
            {options.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={clsx(
                  'w-full text-left px-4 py-2.5 transition-colors',
                  value === option.value
                    ? 'bg-primary-500 text-white'
                    : 'hover:bg-neutral-100 dark:hover:bg-dark-700 text-neutral-900 dark:text-neutral-50'
                )}
                type="button"
              >
                {option.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

export default Select;
