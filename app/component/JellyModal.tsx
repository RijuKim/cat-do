'use client';

import React from 'react';
import {FaHeart} from 'react-icons/fa';

interface JellyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jellyCount: number;
  type?: 'jelly' | 'adopt';
  catName?: string;
  onConfirm?: () => void;
}

const JellyModal: React.FC<JellyModalProps> = ({
  isOpen,
  onClose,
  jellyCount,
  type = 'jelly',
  catName,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 transform transition-all">
        {/* 픽셀 스타일 젤리 모달 */}
        <div className="text-center space-y-4">
          {/* 젤리 아이콘 */}
          <div className="flex justify-center">
            <div className="relative">
              {/* 젤리빈 모양 */}
              <div className="w-20 h-20 bg-pink-400 rounded-full border-4 border-pink-600 shadow-lg relative overflow-hidden">
                {/* 젤리 빛나는 효과 */}
                <div className="absolute top-2 left-2 w-4 h-4 bg-pink-200 rounded-full opacity-60"></div>
                <div className="absolute bottom-3 right-3 w-3 h-3 bg-pink-300 rounded-full opacity-50"></div>
                {/* 젤리 표면 반사 */}
                <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-80"></div>
              </div>
              {/* 젤리 위의 작은 하트들 */}
              <div className="absolute -top-2 -right-2 text-pink-500 animate-bounce">
                <FaHeart size={16} />
              </div>
              <div className="absolute -bottom-1 -left-1 text-pink-400 animate-pulse">
                <FaHeart size={12} />
              </div>
            </div>
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            {type === 'jelly' ? (
              <>
                <h2 className="text-2xl font-bold text-gray-800">
                  Jelly on me!
                </h2>
                <p className="text-gray-600 text-sm">오늘의 젤리를 받았어요!</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800">
                  🐱 고양이 입양
                </h2>
                <p className="text-gray-600 text-sm">
                  {catName}(이)를 데려오시겠습니까?
                </p>
              </>
            )}
          </div>

          {/* 젤리 개수 표시 */}
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-4 border-2 border-pink-200">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-pink-400 rounded-full border-2 border-pink-600"></div>
              <span className="text-lg font-bold text-gray-800">
                {jellyCount}개
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {type === 'jelly' ? '현재 보유 젤리' : '보유 젤리'}
            </p>
            {type === 'adopt' && (
              <p className="text-xs text-pink-600 font-bold mt-2">
                필요 젤리: 10개
              </p>
            )}
          </div>

          {/* 하트 애니메이션 */}
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <FaHeart
                key={i}
                className="text-pink-400 animate-pulse"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s',
                }}
                size={14}
              />
            ))}
          </div>

          {/* 버튼 */}
          {type === 'jelly' ? (
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-500 hover:to-purple-500 transition-all duration-200 transform hover:scale-105 shadow-lg">
              확인
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-400 transition-all duration-200">
                다음에
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-500 hover:to-purple-500 transition-all duration-200 transform hover:scale-105 shadow-lg">
                네
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JellyModal;
