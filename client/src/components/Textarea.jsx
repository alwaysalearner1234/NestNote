/**
 * Textarea.jsx
 * 
 * Styled textarea component used across the frontend.
 * Used in HostApprovalModal for house rules and welcome message editing.
 */

const Textarea = ({
  value,
  onChange,
  name,
  placeholder,
  disabled,
  className,
  ...props
}) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.name || 'houseRules', e.target.value)}
      name={name}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        'w-full rounded-md border border-border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 resize-y',
        className,
      )}
      {...props}
    />
  );
};

Textarea.displayName = 'Textarea';

export default Textarea;