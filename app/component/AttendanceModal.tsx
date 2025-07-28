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

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCat: string;
  onMoodSubmit: (mood: string) => void;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  selectedCat,
  onMoodSubmit,
}) => {
  const [step, setStep] = useState<'greeting' | 'mood' | 'response'>(
    'greeting',
  );
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [catGreeting, setCatGreeting] = useState<string>('');
  const [catResponse, setCatResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const catImages = {
    두두: '/assets/dodo_pixel.png',
    코코: '/assets/coco_pixel.png',
    깜냥: '/assets/kkamnyang_pixel.png',
  };

  const moodOptions = [
    {emoji: '😊', label: '괜찮아', value: '😊'},
    {emoji: '😐', label: '그냥 그래', value: '😐'},
    {emoji: '😞', label: '좀 힘들어', value: '😞'},
  ];

  // AI를 호출해서 고양이 응답 생성
  const generateCatResponse = async (
    catName: string,
    type: 'greeting' | 'response',
    mood?: string,
  ): Promise<string> => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedCat: catName,
          type,
          mood,
        }),
      });

      if (!response.ok) {
        console.error('API response not ok:', response.status);
        throw new Error(`API error: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        throw new Error('Response is not JSON');
      }

      const data = await response.json();

      if (data.message) {
        return data.message;
      } else {
        throw new Error('No message in response');
      }
    } catch (error) {
      console.error('Error generating cat response:', error);
      // 에러 시 기본 응답
      return type === 'greeting'
        ? '오늘도 잘 왔구나. 기분은 어때?'
        : '고마워. 젤리 하나 쏙! 🍬';
    }
  };

  useEffect(() => {
    if (isOpen && step === 'greeting') {
      setIsLoading(true);
      generateCatResponse(selectedCat, 'greeting').then(greeting => {
        setCatGreeting(greeting);
        setIsLoading(false);
      });
    }
  }, [isOpen, step, selectedCat]);

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    setIsLoading(true);
    const response = await generateCatResponse(selectedCat, 'response', mood);
    setCatResponse(response);
    setIsLoading(false);
    setStep('response');
  };

  const handleSubmit = () => {
    onMoodSubmit(selectedMood);
    setStep('greeting');
    setSelectedMood('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
      {/* 배경 클릭으로 모달 닫기 */}
      <div className="absolute inset-0 bg-transparent" onClick={onClose}></div>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 transform transition-all shadow-2xl relative z-10">
        <div className="text-center space-y-4">
          {/* 고양이 아이콘 */}
          <div className="flex justify-center">
            <div className="relative">
              <Image
                src={
                  catImages[selectedCat as keyof typeof catImages] ||
                  catImages['두두']
                }
                alt={selectedCat}
                width={80}
                height={80}
                className="rounded-full"
              />
              <div className="absolute -top-2 -right-2 text-orange-500 animate-bounce">
                <FaHeart size={16} />
              </div>
            </div>
          </div>

          {/* 컨텐츠 */}
          {step === 'greeting' && (
            <>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-800">
                  🐱 출석 체크
                </h2>
                {isLoading ? (
                  <p className="text-gray-600 text-sm">잠깐만...</p>
                ) : (
                  <p className="text-gray-600 text-sm">{catGreeting}</p>
                )}
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                <p className="text-sm text-gray-700 mb-3">지금 기분은 어때?</p>
                <div className="flex justify-center gap-3">
                  {moodOptions.map(mood => (
                    <button
                      key={mood.value}
                      onClick={() => handleMoodSelect(mood.value)}
                      className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-green-100 transition-colors">
                      <span className="text-2xl">{mood.emoji}</span>
                      <span className="text-xs text-gray-600">
                        {mood.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 'response' && (
            <>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-800">
                  🐱 {selectedCat}의 응답
                </h2>
                {isLoading ? (
                  <p className="text-gray-600 text-sm">잠깐만...</p>
                ) : (
                  <p className="text-gray-600 text-sm">{catResponse}</p>
                )}
              </div>

              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 border-2 border-green-200">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-green-400 rounded-full border-2 border-green-600"></div>
                  <span className="text-lg font-bold text-gray-800">
                    젤리 1개 획득!
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  오늘의 출석 체크 완료
                </p>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-green-300 to-emerald-300 text-white font-bold py-3 px-6 rounded-lg hover:from-green-400 hover:to-emerald-400 transition-all duration-200 transform hover:scale-105 shadow-lg">
                확인
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;
