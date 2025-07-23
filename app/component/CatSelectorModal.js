'use client';

import {useState, useEffect, useRef} from 'react';
import Image from 'next/image';

export default function CatSelectorModal({
  cats,
  selectedCat,
  onSelectCat,
  onClose,
}) {
  const [tempSelectedCat, setTempSelectedCat] = useState(selectedCat);
  const backdropRef = useRef(null);

  useEffect(() => {
    const handleEsc = e => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleBackdropClick = e => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  const handleSelect = () => {
    onSelectCat(tempSelectedCat);
    onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30 transition-opacity duration-300 animate-fadeIn">
      <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg w-full max-w-lg mx-4 relative transform transition-all duration-300 animate-slideUp">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={onClose}>
          &times;
        </button>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
          당신의 할 일을 도와줄 냥이를 선택하세요!
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-6 sm:mb-8">
          {cats.map(cat => (
            <div
              key={cat.name}
              onClick={() => setTempSelectedCat(cat.name)}
              className={`p-2 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                tempSelectedCat === cat.name
                  ? 'bg-sky-100 ring-2 ring-[#B0E2F2] shadow-lg'
                  : 'bg-gray-50 hover:shadow-md'
              }`}>
              <div className="relative w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-2 sm:mb-3">
                <Image
                  src={cat.img}
                  alt={cat.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              </div>
              <div className="text-center">
                <p className="font-bold text-sm sm:text-lg text-gray-800">
                  {cat.name}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  {cat.personality}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
            취소
          </button>
          <button
            onClick={handleSelect}
            className="px-6 py-2 rounded-lg text-white bg-[#B0E2F2] hover:opacity-90 transition-opacity shadow">
            선택 완료
          </button>
        </div>
      </div>
    </div>
  );
}
