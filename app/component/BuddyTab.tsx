'use client';

import React, {useState, useEffect} from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const FaHeart = dynamic(
  () => import('react-icons/fa').then(mod => ({default: mod.FaHeart})),
  {
    ssr: false,
    loading: () => <span className="text-orange-500">❤️</span>,
  },
);
import JellyDisplay from './JellyDisplay';

interface BuddyTabProps {
  selectedCat: string;
  onCatChange: (cat: string) => void;
  jellyCount: number;
  unlockedCats: string[];
  onAdoptCat: (catName: string) => Promise<void>;
}

const BuddyTab: React.FC<BuddyTabProps> = ({
  selectedCat,
  onCatChange,
  jellyCount,
  unlockedCats,
  onAdoptCat,
}) => {
  const [tempSelectedCat, setTempSelectedCat] = useState(selectedCat);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [adoptCatName, setAdoptCatName] = useState('');
  const [adoptResult, setAdoptResult] = useState<
    'success' | 'insufficient' | null
  >(null);

  // selectedCat이 변경될 때마다 tempSelectedCat도 업데이트
  useEffect(() => {
    setTempSelectedCat(selectedCat);
  }, [selectedCat]);

  // 고양이 입양 처리
  const handleAdoptConfirm = async () => {
    if (jellyCount < 10) {
      setAdoptResult('insufficient');
      return;
    }

    try {
      await onAdoptCat(adoptCatName);
      setAdoptResult('success');
      setTimeout(() => {
        setShowAdoptModal(false);
        setAdoptResult(null);
      }, 2000);
    } catch (error) {
      console.error('Error adopting cat:', error);
    }
  };

  // 모달 닫기 시 상태 초기화
  const handleCloseModal = () => {
    setShowAdoptModal(false);
    setAdoptResult(null);
    setAdoptCatName('');
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pb-24">
      {/* 제목 */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-gray-800">🐱 Buddy</h2>
          <JellyDisplay jellyCount={jellyCount} size="small" />
        </div>
        <p className="text-gray-600 text-sm">당신의 고양이 비서를 선택하세요</p>
      </div>

      {/* 고양이 선택 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          🐱 고양이 선택
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          당신의 할일을 도와줄 고양이를 선택하세요
        </p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            {
              name: '두두',
              personality: '츤데레 치즈냥',
              img: '/assets/dodo.png',
              cost: 0,
            },
            {
              name: '코코',
              personality: '우아하고 느긋한 완벽주의냥',
              img: '/assets/coco.png',
              cost: 10,
            },
            {
              name: '깜냥',
              personality: '솔직하고 귀찮음이 많은냥',
              img: '/assets/kkamnyang.png',
              cost: 10,
            },
          ].map(cat => {
            const isUnlocked = unlockedCats.includes(cat.name);
            const isSelected = tempSelectedCat === cat.name;

            return (
              <div
                key={cat.name}
                onClick={() => {
                  if (isUnlocked) {
                    setTempSelectedCat(cat.name);
                  } else {
                    setAdoptCatName(cat.name);
                    setShowAdoptModal(true);
                  }
                }}
                className={`p-3 rounded-lg transition-all duration-200 text-center relative ${
                  isUnlocked
                    ? isSelected
                      ? 'bg-orange-50 ring-2 ring-orange-200 shadow-md cursor-pointer'
                      : 'bg-gray-50 hover:bg-gray-100 hover:shadow-sm cursor-pointer'
                    : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                }`}>
                {/* 잠금 오버레이 - 이미지만 덮기 */}
                {!isUnlocked && (
                  <div className="absolute top-0 left-0 right-0 h-20 bg-opacity-30 rounded-lg flex items-center justify-center z-10">
                    <div className="text-white text-center">
                      <div className="text-2xl mb-1">🔒</div>
                    </div>
                  </div>
                )}

                <div className="relative w-16 h-16 mx-auto mb-2">
                  <Image
                    src={cat.img}
                    alt={cat.name}
                    width={64}
                    height={64}
                    className={`w-full h-full object-cover rounded-full ${
                      !isUnlocked ? 'grayscale opacity-85' : ''
                    }`}
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">
                    {cat.name}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {cat.personality}
                  </p>
                  {!isUnlocked && cat.cost > 0 && (
                    <p className="text-xs text-orange-600 font-bold mt-1">
                      젤리 {cat.cost}개 필요
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 현재 선택된 고양이 표시 */}
        <div className="mb-3 p-2 bg-gray-50 rounded-lg text-sm text-gray-600 text-center">
          현재 선택:{' '}
          <span className="font-semibold text-orange-600">{selectedCat}</span>
        </div>

        {/* 선택 완료 버튼 */}
        <button
          onClick={() => onCatChange(tempSelectedCat)}
          disabled={tempSelectedCat === selectedCat}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            tempSelectedCat === selectedCat
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-orange-300 text-white hover:bg-orange-400'
          }`}>
          {tempSelectedCat === selectedCat
            ? '현재 선택됨'
            : `${tempSelectedCat} 선택하기`}
        </button>
      </div>

      {/* 고양이 소개 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          📖 고양이 소개
        </h3>
        <div className="space-y-4">
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Image
                src="/assets/dodo.png"
                alt="두두"
                width={32}
                height={32}
                className="rounded-full"
              />
              <h4 className="font-semibold text-orange-800">두두</h4>
            </div>
            <p className="text-sm text-orange-700">
              츤데레 성격의 치즈냥이예요. 새침하지만 속으로는 집사를 응원해주는
              따뜻한 고양이랍니다.
            </p>
          </div>

          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Image
                src="/assets/coco.png"
                alt="코코"
                width={32}
                height={32}
                className="rounded-full"
              />
              <h4 className="font-semibold text-green-800">코코</h4>
            </div>
            <p className="text-sm text-green-700">
              우아하고 느긋한 고양이예요. 고상하고 절제된 말투로 집사를
              격려해줍니다.
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Image
                src="/assets/kkamnyang.png"
                alt="깜냥"
                width={32}
                height={32}
                className="rounded-full"
              />
              <h4 className="font-semibold text-gray-800">깜냥</h4>
            </div>
            <p className="text-sm text-gray-700">
              솔직하고 귀찮음이 많은 고양이예요. 퉁명스러운 말투에 조금 상처받을
              수도 있어요.
            </p>
          </div>
        </div>
      </div>

      {/* 버전 정보 */}
      <div className="text-center text-gray-500 text-xs mt-8">
        <p>CAT DO v1.0.0</p>
        <p>🐱 고양이와 함께하는 할일 관리</p>
      </div>

      {/* 입양 확인 모달 */}
      {showAdoptModal && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          {/* 배경 클릭으로 모달 닫기 */}
          <div
            className="absolute inset-0 bg-transparent"
            onClick={handleCloseModal}></div>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 transform transition-all relative z-10">
            <div className="text-center space-y-4">
              {adoptResult === null ? (
                <>
                  {/* 제목 */}
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-800">
                      🐱 고양이 입양
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {adoptCatName}(이)를 데려오시겠습니까?
                    </p>
                  </div>

                  {/* 젤리 개수 표시 */}
                  <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg p-4 border-2 border-orange-200">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-6 h-6 bg-orange-400 rounded-full border-2 border-orange-600"></div>
                      <span className="text-lg font-bold text-gray-800">
                        {jellyCount}개
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">보유 젤리</p>
                    <p className="text-xs text-orange-600 font-bold mt-2">
                      필요 젤리: 10개
                    </p>
                  </div>

                  {/* 하트 애니메이션 */}
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaHeart
                        key={i}
                        className="text-orange-400 animate-pulse"
                        style={{
                          animationDelay: `${i * 0.2}s`,
                          animationDuration: '1s',
                        }}
                        size={14}
                      />
                    ))}
                  </div>

                  {/* 버튼 */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleCloseModal}
                      className="flex-1 bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-400 transition-all duration-200">
                      다음에
                    </button>
                    <button
                      onClick={handleAdoptConfirm}
                      className="flex-1 bg-gradient-to-r from-orange-300 to-yellow-300 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-400 hover:to-yellow-400 transition-all duration-200 transform hover:scale-105 shadow-lg">
                      네
                    </button>
                  </div>
                </>
              ) : adoptResult === 'success' ? (
                <>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-green-600">
                      🎉 입양 성공!
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {adoptCatName}가 새로운 가족이 되었어요!
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🐱</div>
                      <p className="text-sm text-green-700 font-bold">
                        {adoptCatName}와 함께하는 시간을 즐겨보세요!
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-red-600">
                      😢 젤리 부족
                    </h2>
                    <p className="text-gray-600 text-sm">
                      보유 젤리가 부족합니다
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🍬</div>
                      <p className="text-sm text-red-700 font-bold">
                        젤리 10개가 필요해요!
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        매일 접속해서 젤리를 모아보세요
                      </p>
                    </div>
                  </div>
                  {/* 나가기 버튼 */}
                  <button
                    onClick={handleCloseModal}
                    className="w-full bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-400 transition-all duration-200">
                    아쉽네요..
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuddyTab;
