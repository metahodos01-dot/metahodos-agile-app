import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MetahodosSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /**
   * Label text
   */
  label?: string;

  /**
   * Options to display
   */
  options: SelectOption[];

  /**
   * Error message
   */
  error?: string;

  /**
   * Helper text
   */
  helperText?: string;

  /**
   * Make label required (adds asterisk)
   */
  required?: boolean;

  /**
   * Placeholder option
   */
  placeholder?: string;

  /**
   * Additional class for container
   */
  containerClassName?: string;
}

/**
 * MetahodosSelect - Branded select component
 * Styled according to Metahodos design system
 */
export const MetahodosSelect = React.forwardRef<HTMLSelectElement, MetahodosSelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      required = false,
      disabled = false,
      placeholder,
      containerClassName = '',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    // Generate ID if not provided
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    // Base select styles
    const baseStyles = 'w-full px-3 py-2.5 pr-10 border rounded-md transition-all duration-200 focus:outline-none appearance-none';

    // State styles
    const stateStyles = error
      ? 'border-error focus:border-error focus:ring-2 focus:ring-error/10'
      : 'border-metahodos-gray-300 focus:border-metahodos-orange focus:ring-2 focus:ring-metahodos-orange/10';

    // Disabled styles
    const disabledStyles = disabled
      ? 'bg-metahodos-gray-100 cursor-not-allowed text-metahodos-gray-500'
      : 'bg-white text-metahodos-text-primary';

    // Combine all styles
    const selectClasses = `${baseStyles} ${stateStyles} ${disabledStyles} ${className}`;

    return (
      <div className={containerClassName}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-metahodos-text-primary mb-2"
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={selectClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDownIcon className="h-5 w-5 text-metahodos-text-secondary" />
          </div>
        </div>

        {error && (
          <p
            id={`${selectId}-error`}
            className="mt-1.5 text-sm text-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p
            id={`${selectId}-helper`}
            className="mt-1.5 text-sm text-metahodos-text-secondary"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

MetahodosSelect.displayName = 'MetahodosSelect';
