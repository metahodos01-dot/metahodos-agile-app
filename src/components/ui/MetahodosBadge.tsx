import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface MetahodosBadgeProps {
  /**
   * Badge content
   */
  children: React.ReactNode;

  /**
   * Visual variant
   */
  variant?: BadgeVariant;

  /**
   * Size
   */
  size?: BadgeSize;

  /**
   * Show dot indicator
   */
  dot?: boolean;

  /**
   * Removable badge (shows X button)
   */
  removable?: boolean;

  /**
   * Callback when remove button is clicked
   */
  onRemove?: () => void;

  /**
   * Additional classes
   */
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-metahodos-gray-100 text-metahodos-text-primary border border-metahodos-gray-200',
  success: 'bg-metahodos-green/20 text-metahodos-green-dark border border-metahodos-green/40',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  error: 'bg-metahodos-red/20 text-metahodos-red-dark border border-metahodos-red/40',
  info: 'bg-blue-100 text-blue-800 border border-blue-300',
  primary: 'bg-metahodos-orange/20 text-metahodos-orange border border-metahodos-orange/30',
  secondary: 'bg-metahodos-gray/20 text-metahodos-gray border border-metahodos-gray/30',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-metahodos-text-secondary',
  success: 'bg-metahodos-green',
  warning: 'bg-yellow-500',
  error: 'bg-metahodos-red',
  info: 'bg-blue-500',
  primary: 'bg-metahodos-orange',
  secondary: 'bg-metahodos-gray',
};

/**
 * MetahodosBadge - Branded badge component
 * Styled according to Metahodos design system
 */
export const MetahodosBadge: React.FC<MetahodosBadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-bold
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}

      {children}

      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:bg-black/10 rounded-full p-0.5 transition-colors"
          aria-label="Remove"
        >
          <XMarkIcon className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};
