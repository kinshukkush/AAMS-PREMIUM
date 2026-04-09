/**
 * Page Transitions & Animation Utilities
 * Framer Motion animation presets for consistent motion
 */

import { motion } from 'framer-motion';

/**
 * Page Fade & Slide In
 */
export const pageVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

/**
 * Stagger children animations
 */
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

/**
 * Slide from left (sidebar, modals)
 */
export const slideLeftVariants = {
  hidden: {
    opacity: 0,
    x: -40
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    x: -40,
    transition: {
      duration: 0.25,
      ease: 'easeIn'
    }
  }
};

/**
 * Slide from right (drawers)
 */
export const slideRightVariants = {
  hidden: {
    opacity: 0,
    x: 40
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    x: 40,
    transition: {
      duration: 0.25,
      ease: 'easeIn'
    }
  }
};

/**
 * Scale and fade in (modal, popup)
 */
export const scaleVariants = {
  hidden: {
    opacity: 0,
    scale: 0.85
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

/**
 * Hover lift effect
 */
export const hoverLift = {
  rest: {
    y: 0,
    transition: {
      duration: 0.2,
      type: 'tween',
      ease: 'easeOut'
    }
  },
  hover: {
    y: -8,
    transition: {
      duration: 0.2,
      type: 'tween',
      ease: 'easeOut'
    }
  }
};

/**
 * Button ripple effect
 */
export const tapScale = {
  initial: { scale: 1 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.1 }
};

/**
 * Loading pulse
 */
export const pulse = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

/**
 * Shimmer loading effect
 */
export const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

/**
 * Bounce animation
 */
export const bounce = {
  animate: {
    y: [-4, 0, -4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

/**
 * Rotate and fade (loading spinner)
 */
export const spin = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

/**
 * Smooth color transition
 */
export const colorTransition = (duration = 0.3) => ({
  transition: {
    duration,
    ease: 'easeInOut'
  }
});

/**
 * ReusablePageTransition wrapper component
 */
export const PageTransition = ({ children, className = '' }) => (
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
 * Stagger container for animating lists
 */
export const StaggerContainer = ({ children, className = '' }) => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * Stagger item for use inside StaggerContainer
 */
export const StaggerItem = ({ children, className = '' }) => (
  <motion.div variants={itemVariants} className={className}>
    {children}
  </motion.div>
);

/**
 * Card hover lift wrapper
 */
export const HoverLiftCard = ({ children, className = '' }) => (
  <motion.div
    variants={hoverLift}
    initial="rest"
    whileHover="hover"
    className={className}
  >
    {children}
  </motion.div>
);

export default {
  pageVariants,
  containerVariants,
  itemVariants,
  slideLeftVariants,
  slideRightVariants,
  scaleVariants,
  hoverLift,
  tapScale,
  pulse,
  shimmer,
  bounce,
  spin,
  colorTransition,
  PageTransition,
  StaggerContainer,
  StaggerItem,
  HoverLiftCard
};
