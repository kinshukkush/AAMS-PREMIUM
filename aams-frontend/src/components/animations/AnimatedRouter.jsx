/**
 * AnimatedRouter - Routes with Page Transitions
 * Integrates AnimatePresence with React Router for smooth page transitions
 */

import React from 'react';
import { Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AnimatedPage } from './PageTransitions';

/**
 * Wrapper for animated routes
 */
export const AnimatedRoutes = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {React.Children.map(children, (child) =>
          React.cloneElement(child, { key: location.pathname })
        )}
      </Routes>
    </AnimatePresence>
  );
};

/**
 * Animated route wrapper component
 */
export const AnimatedRoute = ({ element, ...props }) => {
  return <AnimatedPage>{element}</AnimatedPage>;
};

export default {
  AnimatedRoutes,
  AnimatedRoute
};
