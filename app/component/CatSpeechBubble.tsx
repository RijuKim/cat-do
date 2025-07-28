'use client';

import React from 'react';

interface CatSpeechBubbleProps {
  message: string;
  selectedCat: string;
  isLoading?: boolean;
}

const CatSpeechBubble: React.FC<CatSpeechBubbleProps> = ({
  message,
  selectedCat,
  isLoading = false,
}) => {
  if (!message && !isLoading) return null;

  const getBubbleColor = () => {
    if (isLoading) return 'bg-gray-50 border-gray-300 text-gray-700';

    if (
      message.includes('열심히 생각 중') ||
      message.includes('미안, 지금은 조언을 해줄 수 없어')
    ) {
      return 'bg-yellow-50 border-yellow-300 text-yellow-800';
    }

    if (message.includes('✅') || message.includes('📝')) {
      return 'bg-green-50 border-green-300 text-green-800';
    }

    if (message.includes('❌')) {
      return 'bg-red-50 border-red-300 text-red-800';
    }

    switch (selectedCat) {
      case '두두':
        return 'bg-orange-50 border-orange-300 text-orange-800';
      case '코코':
        return 'bg-green-50 border-green-300 text-green-800';
      case '깜냥':
        return 'bg-gray-50 border-gray-300 text-gray-800';
      default:
        return 'bg-orange-50 border-orange-300 text-orange-800';
    }
  };

  const bubbleColor = getBubbleColor();

  return (
    <div className="relative mb-4">
      {/* 말풍선 */}
      <div
        className={`relative ${bubbleColor} rounded-3xl px-4 py-3 shadow-lg max-w-xs mx-auto border-2`}>
        {/* 메시지 내용 */}
        <div className="flex items-start gap-2">
          <span className="text-lg flex-shrink-0">🐱</span>
          <p className="text-sm font-medium leading-relaxed">
            {isLoading ? '고양이 비서를 불러오는 중...' : message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CatSpeechBubble;
