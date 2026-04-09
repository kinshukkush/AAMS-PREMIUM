import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export function Tooltip({ text, children, position = 'top' }) {
  const [show, setShow] = useState(false);

  const positions = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={clsx(
              'absolute left-1/2 -translate-x-1/2 z-50 w-max px-2 py-1',
              'bg-neutral-900 dark:bg-neutral-700 text-white text-sm rounded',
              positions[position]
            )}
          >
            {text}
            <div
              className={clsx(
                'absolute w-2 h-2 bg-neutral-900 dark:bg-neutral-700 transform rotate-45',
                position === 'top' && '-bottom-1 left-1/2 -translate-x-1/2',
                position === 'bottom' && '-top-1 left-1/2 -translate-x-1/2'
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Tooltip;
