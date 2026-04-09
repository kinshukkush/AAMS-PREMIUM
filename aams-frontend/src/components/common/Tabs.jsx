import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export function Tabs({ tabs, defaultTab = 0, onChange }) {
  const [active, setActive] = useState(defaultTab);

  const handleChange = (index) => {
    setActive(index);
    onChange?.(index, tabs[index]);
  };

  return (
    <div>
      {/* Tab List */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-dark-700 overflow-x-auto">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleChange(index)}
            className={clsx(
              'relative px-4 py-3 font-medium text-sm whitespace-nowrap',
              'transition-colors duration-200',
              active === index
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            )}
          >
            {tab.label}
            {active === index && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500"
                initial={false}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="mt-4"
      >
        {tabs[active].content}
      </motion.div>
    </div>
  );
}

export default Tabs;
