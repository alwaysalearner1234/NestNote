/**
 * Input.jsx
 * 
 * Styled input component used across the frontend.
 * Used in HostDashboard for property setup form.
 */

import { cn } from '../lib/utils.jsx';

const Input = ({
  type = 'text',
  value,
  onChange,
  name,
  placeholder,
  disabled,
  className,
  ...props
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      name={name}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        'w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2',
        className,
      )}
      {...props}
    />
  );
};

Input.displayName = 'Input';

export default Input;