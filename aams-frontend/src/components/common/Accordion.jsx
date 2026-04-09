import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export function Accordion({ items }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={false}
          animate={{
            backgroundColor: expanded === index
              ? 'rgba(0,0,0,0.03)'
              : 'transparent'
          }}
          className="border border-neutral-200 dark:border-dark-700 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => setExpanded(expanded === index ? null : index)}
            className={clsx(
              'w-full px-4 py-3 flex items-center justify-between',
              'text-left font-medium',
              'hover:bg-neutral-50 dark:hover:bg-dark-800',
              'transition-colors duration-200'
            )}
          >
            <span className="text-neutral-900 dark:text-neutral-50">
              {item.title}
            </span>
            <motion.div
              animate={{ rotate: expanded === index ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={20} className="text-primary-500" />
            </motion.div>
          </button>

          <AnimatePresence>
            {expanded === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-neutral-200 dark:border-dark-700"
              >
                <div className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

export default Accordion;
