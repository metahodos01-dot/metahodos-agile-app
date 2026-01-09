import React from 'react';

interface MetahodosCirclesProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * MetahodosCircles - Three colored circles representing connection and process
 *
 * The three circles (red/coral, orange, green) are a visual element from the
 * Metahodos logo that represent the concepts of:
 * - Connection between people
 * - Process and methodology
 * - Agility and results
 */
export const MetahodosCircles: React.FC<MetahodosCirclesProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const gapClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5',
  };

  return (
    <div className={`flex items-center ${gapClasses[size]} ${className}`}>
      <div className={`${sizeClasses[size]} bg-[#E57373] rounded-full`}></div>
      <div className={`${sizeClasses[size]} bg-[#FFB74D] rounded-full`}></div>
      <div className={`${sizeClasses[size]} bg-[#81C784] rounded-full`}></div>
    </div>
  );
};
