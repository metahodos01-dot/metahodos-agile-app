import React, { useEffect, useRef } from 'react';

interface MetahodosTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /**
   * Label text
   */
  label?: string;

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
   * Auto-resize to fit content
   */
  autoResize?: boolean;

  /**
   * Show character counter
   */
  showCounter?: boolean;

  /**
   * Max length (for counter)
   */
  maxLength?: number;

  /**
   * Additional class for container
   */
  containerClassName?: string;
}

/**
 * MetahodosTextarea - Branded textarea component
 * Styled according to Metahodos design system
 */
export const MetahodosTextarea = React.forwardRef<HTMLTextAreaElement, MetahodosTextareaProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      disabled = false,
      autoResize = false,
      showCounter = false,
      maxLength,
      containerClassName = '',
      className = '',
      id,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const combinedRef = ref || textareaRef;

    // Generate ID if not provided
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    // Auto-resize logic
    useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value, autoResize]);

    // Base textarea styles
    const baseStyles = 'w-full px-3 py-2.5 border rounded-md transition-all duration-200 focus:outline-none resize-y';

    // State styles
    const stateStyles = error
      ? 'border-error focus:border-error focus:ring-2 focus:ring-error/10'
      : 'border-metahodos-gray-300 focus:border-metahodos-orange focus:ring-2 focus:ring-metahodos-orange/10';

    // Disabled styles
    const disabledStyles = disabled
      ? 'bg-metahodos-gray-100 cursor-not-allowed text-metahodos-gray-500'
      : 'bg-white text-metahodos-text-primary';

    // Combine all styles
    const textareaClasses = `${baseStyles} ${stateStyles} ${disabledStyles} ${className}`;

    // Character count
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className={containerClassName}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-metahodos-text-primary mb-2"
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={combinedRef as any}
          id={textareaId}
          disabled={disabled}
          className={textareaClasses}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
          }
          {...props}
        />

        {/* Footer: Error, Helper text, or Counter */}
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="flex-1">
            {error && (
              <p
                id={`${textareaId}-error`}
                className="text-sm text-error"
                role="alert"
              >
                {error}
              </p>
            )}

            {!error && helperText && (
              <p
                id={`${textareaId}-helper`}
                className="text-sm text-metahodos-text-secondary"
              >
                {helperText}
              </p>
            )}
          </div>

          {showCounter && maxLength && (
            <p className="text-sm text-metahodos-text-muted shrink-0">
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

MetahodosTextarea.displayName = 'MetahodosTextarea';
