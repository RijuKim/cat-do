'use client';

import React from 'react';

interface LoadingIndicatorProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  text = '로딩중',
  size = 'medium',
}) => {
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <div className="flex items-center justify-center gap-1">
      <span className={`${sizeClasses[size]} text-gray-600 font-medium`}>
        {text}
      </span>
      <div className="flex gap-1">
        <div
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
          style={{animationDelay: '0s'}}></div>
        <div
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
          style={{animationDelay: '0.2s'}}></div>
        <div
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
          style={{animationDelay: '0.4s'}}></div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
