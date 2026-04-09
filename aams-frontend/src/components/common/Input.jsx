import React from 'react';
import { clsx } from 'clsx';

const Input = React.forwardRef(({ 
  error, 
  label, 
  icon: Icon,
  hint,
  className,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            <Icon size={20} />
          </div>
        )}
        
        <input
          ref={ref}
          className={clsx(
            'w-full px-4 py-2.5 rounded-lg border transition-all duration-200',
            'bg-white dark:bg-dark-800',
            'text-neutral-900 dark:text-neutral-50',
            'border-neutral-300 dark:border-dark-600',
            'placeholder-neutral-500 dark:placeholder-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:ring-red-500',
            Icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
      
      {hint && !error && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
