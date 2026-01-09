import React from 'react';
import type { InputType } from '../../lib/types';

interface MetahodosInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /**
   * Input type
   */
  type?: InputType;

  /**
   * Label text
   */
  label?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Helper text to display below input
   */
  helperText?: string;

  /**
   * Make label required (adds asterisk)
   */
  required?: boolean;

  /**
   * Additional class for the container
   */
  containerClassName?: string;
}

/**
 * MetahodosInput - Branded input component
 * Styled according to Metahodos design system
 */
export const MetahodosInput = React.forwardRef<HTMLInputElement, MetahodosInputProps>(
  (
    {
      type = 'text',
      label,
      error,
      helperText,
      required = false,
      disabled = false,
      containerClassName = '',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    // Generate ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Base input styles
    const baseStyles = 'w-full px-3 py-2.5 border rounded-md transition-all duration-200 focus:outline-none';

    // State styles
    const stateStyles = error
      ? 'border-error focus:border-error focus:ring-2 focus:ring-error/10'
      : 'border-metahodos-gray-300 focus:border-metahodos-orange focus:ring-2 focus:ring-metahodos-orange/10';

    // Disabled styles
    const disabledStyles = disabled
      ? 'bg-metahodos-gray-100 cursor-not-allowed text-metahodos-gray-500'
      : 'bg-white text-metahodos-text-primary';

    // Combine all styles
    const inputClasses = `${baseStyles} ${stateStyles} ${disabledStyles} ${className}`;

    return (
      <div className={`${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-metahodos-text-primary mb-2"
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />

        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-sm text-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-sm text-metahodos-text-secondary"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

MetahodosInput.displayName = 'MetahodosInput';
