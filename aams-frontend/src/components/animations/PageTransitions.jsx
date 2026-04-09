/**
 * PageLayout with Transitions
 * Wraps pages with automatic enter/exit animations
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, containerVariants } from '../../utils/animations';

/**
 * Animated Page Wrapper
 */
export const AnimatedPage = ({ children, className = '' }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={pageVariants}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * Page Section with Staggered Children
 */
export const PageSection = ({ children, title, className = '' }) => (
  <motion.section
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className={className}
  >
    {title && (
      <motion.h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {title}
      </motion.h2>
    )}
    {children}
  </motion.section>
);

/**
 * Micro-interaction wrapper - Hover lift + tap scale
 */
export const InteractiveElement = ({ children, className = '' }) => (
  <motion.div
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 300, damping: 10 }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * Animated transition between sections
 */
export const SectionTransition = ({ children, direction = 'up', className = '' }) => {
  const variants = {
    up: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    },
    down: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 }
    },
    left: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 }
    },
    right: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 }
    }
  };

  const selectedVariant = variants[direction];

  return (
    <motion.div
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      exit={selectedVariant.exit}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Tab content with smooth transitions
 */
export const AnimatedTabContent = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * Modal backdrop animation
 */
export const AnimatedBackdrop = ({ children, onClick, className = '' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClick}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * Smooth list item animation
 */
export const AnimatedListItem = ({ children, index = 0, className = '' }) => (
  <motion.li
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{
      duration: 0.3,
      delay: index * 0.05,
      ease: 'easeOut'
    }}
    className={className}
  >
    {children}
  </motion.li>
);

/**
 * Number counter animation
 */
export const CountUp = ({ from = 0, to, duration = 1, className = '' }) => {
  const [count, setCount] = React.useState(from);

  React.useEffect(() => {
    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * (to - from) + from));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [from, to, duration]);

  return <span className={className}>{count}</span>;
};

/**
 * Animated progress bar
 */
export const AnimatedProgress = ({ value = 0, max = 100, className = '' }) => {
  const percentage = (value / max) * 100;

  return (
    <div className={`w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
      />
    </div>
  );
};

/**
 * Animated icon rotation (for loading)
 */
export const AnimatedIcon = ({ icon: Icon, className = '' }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
    className={className}
  >
    <Icon />
  </motion.div>
);

/**
 * Success checkmark animation
 */
export const AnimatedCheckmark = ({ className = '' }) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={`w-6 h-6 text-green-500 ${className}`}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
  >
    <motion.path
      fill="currentColor"
      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    />
  </motion.svg>
);

/**
 * Error X animation
 */
export const AnimatedErrorX = ({ className = '' }) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={`w-6 h-6 text-red-500 ${className}`}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
  >
    <motion.path
      fill="currentColor"
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    />
  </motion.svg>
);

export default {
  AnimatedPage,
  PageSection,
  InteractiveElement,
  SectionTransition,
  AnimatedTabContent,
  AnimatedBackdrop,
  AnimatedListItem,
  CountUp,
  AnimatedProgress,
  AnimatedIcon,
  AnimatedCheckmark,
  AnimatedErrorX
};
