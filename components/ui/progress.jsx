
import React from 'react';
import { cn } from '@/lib/utils';

const Progress = ({ 
  progress = 0, 
  color = 'bg-blue-500',
  height = 'h-2',
  className
}) => {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div 
      className={cn(
        "w-full bg-gray-200 rounded-full overflow-hidden",
        height,
        className
      )}
    >
      <div
        className={cn(
          "h-full transition-all duration-300 ease-in-out rounded-full",
          color
        )}
        style={{ width: `${clampedProgress}%` }}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>
  );
};

export default Progress;

