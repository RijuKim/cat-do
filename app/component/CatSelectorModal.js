'use client';

import {useEffect, useRef} from 'react';
import Image from 'next/image';

export default function CatSelectorModal({
  cats,
  selectedCat,
  onSelectCat,
  onClose,
}) {
  const backdropRef = useRef(null);

  // ESC 누르면 닫히도록
  useEffect(() => {
    const handleEsc = e => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 바깥 클릭 시 닫히도록
  const handleBackdropClick = e => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30 transition-opacity duration-300 animate-fadeIn">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md relative transform transition-all duration-300 animate-slideUp">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
          onClick={onClose}>
          ✕
        </button>
        <h2 className="text-xl font-bold mb-6 text-center">
          🐱 나의 냥이 선택
        </h2>
        <div className="flex justify-center gap-6">
          {cats.map(cat => (
            <button
              key={cat.name}
              onClick={() => {
                onSelectCat(cat.name);
                onClose();
              }}
              className={`flex flex-col items-center transition ${
                selectedCat === cat.name ? 'ring-4 ring-yellow-400' : ''
              }`}>
              <div className="w-20 h-20 rounded-full overflow-hidden shadow">
                <Image src={cat.img} alt={cat.name} width={80} height={80} />
              </div>
              <span className="text-sm mt-2 font-medium">{cat.name}</span>
              <span className="text-xs text-gray-500">{cat.personality}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
