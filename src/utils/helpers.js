/**
 * Shared Utility Helpers for LichAntiFast
 * Centralizes commonly used functions to avoid duplication.
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines Tailwind CSS classes with clsx and tailwind-merge.
 * Replaces the duplicate cn() functions across 6+ files.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Shared Framer Motion variants for modal animations.
 * Used by all Modal components.
 */
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }
};

export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};
