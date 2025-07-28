'use client';

import React from 'react';

interface JellyDisplayProps {
  jellyCount: number;
  size?: 'small' | 'medium';
}

const JellyDisplay: React.FC<JellyDisplayProps> = ({
  jellyCount,
  size = 'medium',
}) => {
  const isSmall = size === 'small';

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border-2 border-green-200 shadow-sm ${
        isSmall ? 'text-sm' : 'text-base'
      }`}>
      {/* 젤리 아이콘 */}
      <div className="relative">
        <div
          className={`rounded-full border-2 border-green-500 ${
            isSmall ? 'w-4 h-4' : 'w-5 h-5'
          }`}
          style={{backgroundColor: '#DEE791'}}>
          {/* 젤리 빛나는 효과 */}
          <div
            className={`absolute bg-green-100 rounded-full opacity-60 ${
              isSmall
                ? 'top-0.5 left-0.5 w-1 h-1'
                : 'top-0.5 left-0.5 w-1.5 h-1.5'
            }`}></div>
        </div>
      </div>

      {/* 젤리 개수 */}
      <span
        className={`font-bold text-gray-800 ${
          isSmall ? 'text-sm' : 'text-base'
        }`}>
        {jellyCount}
      </span>
    </div>
  );
};

export default JellyDisplay;
