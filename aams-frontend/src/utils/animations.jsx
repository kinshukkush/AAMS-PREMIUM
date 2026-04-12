/**
 * AAMS Lumina — Framer Motion Animation Variants
 * Import these in any component:
 *   import { fadeUp, scaleIn, slideRight, stagger } from '../utils/animations';
 */

// ─── fadeUp ───────────────────────────────────────────────────────────────
// Use on cards, sections, or any element entering from below.
// Pass custom={index} on the element to stagger siblings.
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

// ─── scaleIn ─────────────────────────────────────────────────────────────
// Use on modals, popovers, dialogs — spring "pop" effect.
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

// ─── slideRight ──────────────────────────────────────────────────────────
// Use on sidebar nav items, list items — slides from left.
export const slideRight = {
  hidden: { opacity: 0, x: -24 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.45,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

// ─── slideLeft ───────────────────────────────────────────────────────────
// Use for drawers sliding in from the right.
export const slideLeft = {
  hidden:  { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, x: 60, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } },
};

// ─── slideDown ───────────────────────────────────────────────────────────
// Use for dropdown panels (notification bell, search overlay).
export const slideDown = {
  hidden:  { opacity: 0, y: -12, scaleY: 0.94 },
  visible: { opacity: 1, y: 0,   scaleY: 1,    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -8,  scaleY: 0.96, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } },
};

// ─── stagger ─────────────────────────────────────────────────────────────
// Wrap a list in a motion.div with variants={stagger} to auto-stagger children.
export const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// ─── staggerFast ─────────────────────────────────────────────────────────
export const staggerFast = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.04 } },
};

// ─── pageTransition ──────────────────────────────────────────────────────
// Use on route-level pages (wrapped in AnimatedPage).
export const pageTransition = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } },
};

// ─── fadeOnly ────────────────────────────────────────────────────────────
export const fadeOnly = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

// ─── Easing presets (for use in manual spring animations) ─────────────────
export const easings = {
  spring: [0.34, 1.56, 0.64, 1],
  smooth: [0.4,  0,    0.2,  1],
  out:    [0,    0,    0.2,  1],
};

// Aliases for backward compatibility
export const pageVariants = pageTransition;
export const containerVariants = stagger;
