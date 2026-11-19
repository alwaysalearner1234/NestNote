/**
 * utils.jsx — clsx alternative for Tailwind className merging
 * 
 * Simple className merger used across the frontend.
 * Used by Input.jsx and other components.
 */

export const cn = (...classes) => {
  return classes.filter((c) => c && c.length > 0).join(' ');
};