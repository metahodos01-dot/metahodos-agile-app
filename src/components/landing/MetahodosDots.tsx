import React from 'react';

interface MetahodoDotsProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * MetahodosDots - Le 3 palline colorate iconiche del brand Metahodos
 * Rosso, Arancione, Verde
 */
export const MetahodosDots: React.FC<MetahodoDotsProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const dotSize = sizeClasses[size];

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className={`${dotSize} rounded-full bg-metahodos-red`} />
      <div className={`${dotSize} rounded-full bg-metahodos-orange`} />
      <div className={`${dotSize} rounded-full bg-metahodos-green`} />
    </div>
  );
};
