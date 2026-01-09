import React from 'react';
import type { ButtonVariant, ButtonSize } from '../../lib/types';

interface MetahodosButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant of the button
   */
  variant?: ButtonVariant;

  /**
   * Size of the button
   */
  size?: ButtonSize;

  /**
   * Full width button
   */
  fullWidth?: boolean;

  /**
   * Icon to display on the left side
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to display on the right side
   */
  rightIcon?: React.ReactNode;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Button content
   */
  children: React.ReactNode;
}

/**
 * MetahodosButton - Branded button component
 * Styled according to Metahodos design system
 */
export const MetahodosButton = React.forwardRef<HTMLButtonElement, MetahodosButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      isLoading = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = 'inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md';

    // Variant styles
    const variantStyles = {
      primary: 'bg-metahodos-orange text-white hover:bg-metahodos-orange-dark focus:ring-metahodos-orange disabled:bg-metahodos-gray-300 disabled:cursor-not-allowed',
      secondary: 'bg-metahodos-gray text-white hover:bg-metahodos-gray-dark focus:ring-metahodos-gray disabled:bg-metahodos-gray-300 disabled:cursor-not-allowed',
      outline: 'bg-transparent border-2 border-metahodos-orange text-metahodos-orange hover:bg-metahodos-orange hover:text-white focus:ring-metahodos-orange disabled:border-metahodos-gray-300 disabled:text-metahodos-gray-300 disabled:cursor-not-allowed',
      ghost: 'bg-transparent text-metahodos-gray hover:bg-metahodos-gray-100 focus:ring-metahodos-gray-300 disabled:text-metahodos-gray-300 disabled:cursor-not-allowed',
    };

    // Size styles
    const sizeStyles = {
      sm: 'text-sm px-4 py-2',
      md: 'text-base px-5 py-2.5',
      lg: 'text-lg px-6 py-3',
    };

    // Width style
    const widthStyle = fullWidth ? 'w-full' : '';

    // Combine all styles
    const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={buttonClasses}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {!isLoading && leftIcon && (
          <span className="mr-2 -ml-1">{leftIcon}</span>
        )}

        {children}

        {!isLoading && rightIcon && (
          <span className="ml-2 -mr-1">{rightIcon}</span>
        )}
      </button>
    );
  }
);

MetahodosButton.displayName = 'MetahodosButton';
