import React from 'react';

interface MetahodosCardProps {
  /**
   * Card content
   */
  children: React.ReactNode;

  /**
   * Make the card clickable/interactive
   */
  interactive?: boolean;

  /**
   * Click handler (only works if interactive=true)
   */
  onClick?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * MetahodosCard - Branded card component
 * Styled according to Metahodos design system
 */
export const MetahodosCard = React.forwardRef<HTMLDivElement, MetahodosCardProps>(
  ({ children, interactive = false, onClick, className = '' }, ref) => {
    // Base styles
    const baseStyles = 'bg-white rounded-lg p-6 shadow-natural transition-all duration-300';

    // Interactive styles
    const interactiveStyles = interactive
      ? 'hover:shadow-deep cursor-pointer transform hover:-translate-y-0.5'
      : '';

    // Combine all styles
    const cardClasses = `${baseStyles} ${interactiveStyles} ${className}`;

    const handleClick = () => {
      if (interactive && onClick) {
        onClick();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (interactive && onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick();
      }
    };

    return (
      <div
        ref={ref}
        className={cardClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
      >
        {children}
      </div>
    );
  }
);

MetahodosCard.displayName = 'MetahodosCard';
