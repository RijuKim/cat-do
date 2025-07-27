'use client';

import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  text = '로딩중',
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-8 h-8 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1">
          <span className="text-lg text-gray-700 font-medium">{text}</span>
          <div className="flex gap-1">
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
              style={{animationDelay: '0s'}}></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
              style={{animationDelay: '0.2s'}}></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
              style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
