/**
 * Button.jsx
 * 
 * Simple button component used across the frontend.
 * Variants: default, secondary, ghost, destructive.
 * Sizes: sm, md, lg, icon.
 */

import { cn } from '../lib/utils.jsx';

const Button = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  onClick,
  ...props
}) => {
  const variants = {
    default: 'bg-coral text-white hover:bg-coralLight focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2',
    secondary: 'bg-white text-ink hover:bg-gray-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    ghost: 'hover:bg-gray-light text-ink focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2',
    destructive: 'bg-error text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 ml-2',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg',
    icon: 'h-8 w-8 p-1',
  };

  return (
    <button
      className={cn(variants[variant], sizes[size], className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

Button.displayName = 'Button';

export default Button;