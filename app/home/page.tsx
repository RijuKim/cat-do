'use client';

import React, {useState, useMemo} from 'react';
import {useSession} from 'next-auth/react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Image from 'next/image';
import {
  FaTrash,
  FaEdit,
  FaSave,
  FaPlus,
  FaCat,
  FaLightbulb,
  FaPaw,
} from 'react-icons/fa';

import useTodos from '../hooks/useTodos';
import TabNavigation from '../component/TabNavigation';
import SettingsTab from '../component/SettingsTab';
import BuddyTab from '../component/BuddyTab';
import JellyModal from '../component/JellyModal';
import JellyDisplay from '../component/JellyDisplay';
import LoadingOverlay from '../component/LoadingOverlay';

// ✅ 접이식 캘린더 컴포넌트
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  advice?: string;
  adviceCat?: string;
}

const FullCalendar = ({
  date,
  setDate,
  todosByDate,
  mounted,
  onDateClick,
}: {
  date: Date;
  setDate: (date: Date) => void;
  todosByDate: Record<string, Todo[]>;
  mounted: boolean;
  onDateClick?: (date: Date) => void;
}) => {
  return (
    <div className="transition-all duration-300">
      {mounted && (
        <div>
          <Calendar
            onChange={value => {
              const newDate = value as Date;
              setDate(newDate);
              if (onDateClick) {
                onDateClick(newDate);
              }
            }}
            value={date}
            locale="ko-KR"
            className="w-full border-none calendar-large mx-auto"
            formatShortWeekday={(locale, date) => {
              const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
              return weekdays[date.getDay()];
            }}
            formatDay={(locale, date) => date.getDate().toString()}
            tileClassName="calendar-tile"
            navigationLabel={({date}) =>
              `${date.getFullYear()}년 ${date.getMonth() + 1}월`
            }
            navigationAriaLabel="월 선택"
            onClickMonth={() => {}} // 월 클릭 비활성화
            onClickYear={() => {}} // 년 클릭 비활성화
            tileContent={({date, view}) => {
              if (view === 'month') {
                const key = date.toLocaleDateString('sv-SE');
                const todosForDay = todosByDate[key] || [];
                if (todosForDay.length === 0) return null;

                const allCompleted = todosForDay.every(t => t.completed);

                return (
                  <div className="w-full h-full relative">
                    {/* 우상단 상태 표시 */}
                    <div className="absolute top-0 right-0 z-10">
                      {allCompleted && (
                        <FaPaw className="text-green-500" size={14} />
                      )}
                    </div>

                    {/* 할 일 목록 간략 표시 - 스크롤 가능한 영역 */}
                    <div
                      className="mt-2 space-y-1 scrollbar-hide"
                      style={{
                        height: 'auto',
                        maxHeight: 'none',
                        overflowY: 'visible',
                      }}>
                      {todosForDay.map(todo => (
                        <div
                          key={todo.id}
                          className={`px-1 py-0.5 rounded text-xs leading-tight flex-shrink-0 whitespace-nowrap overflow-hidden calendar-todo-item ${
                            todo.completed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                          title={todo.text} // 호버시 전체 내용 보기
                          style={{
                            textOverflow: 'ellipsis',
                            lineHeight: '1.2',
                            minWidth: 0,
                            width: '100%',
                          }}>
                          {todo.text}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        </div>
      )}
    </div>
  );
};

export default function MainPage() {
  const [date, setDate] = useState(new Date());
  const [selectedCat, setSelectedCat] = useState<string>('두두');
  const [hasLoadedCat, setHasLoadedCat] = useState(false);

  // selectedCat 상태 변경 추적
  React.useEffect(() => {
    console.log('selectedCat 상태 변경:', selectedCat);
  }, [selectedCat]);
  const [visibleAdviceIds, setVisibleAdviceIds] = useState<string[]>([]);
  const [isLoadingCat, setIsLoadingCat] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'home' | 'calendar' | 'buddy' | 'settings'
  >('home');

  // 젤리 관련 상태
  const [jellyCount, setJellyCount] = useState(0);
  const [showJellyModal, setShowJellyModal] = useState(false);
  const [unlockedCats, setUnlockedCats] = useState<string[]>(['두두']);

  const cats = useMemo(
    () => [
      {
        name: '두두',
        personality: '츤데레 치즈냥이',
        description: '새침하지만 집사를 응원해주는',
        img: '/assets/dodo.png',
      },
      {
        name: '코코',
        personality: '우아한 완벽주의',
        description: '고상하고 절제된 흰색 고양이',
        img: '/assets/coco.png',
      },
      {
        name: '깜냥',
        personality: '직설적인 고양이',
        description: '솔직하고 불친절하지만 정확한',
        img: '/assets/kkamnyang.png',
      },
    ],
    [],
  );

  // 고양이 픽셀아트 이미지 경로 메모이제이션
  const catPixelImage = useMemo(() => {
    const imageMap = {
      두두: '/assets/dodo_pixel.png',
      코코: '/assets/coco_pixel.png',
      깜냥: '/assets/kkamnyang_pixel.png',
    };
    return imageMap[selectedCat as keyof typeof imageMap] || imageMap['두두'];
  }, [selectedCat]);

  const {data: session} = useSession();
  const sessionRef = React.useRef(session);

  // session이 변경될 때마다 ref 업데이트
  React.useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // 선택된 고양이 로드 (캐싱 적용)
  const loadSelectedCat = React.useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session?.user as any)?.id;
    if (!userId) return;

    // 이미 로드된 경우 스킵
    if (hasLoadedCat) {
      console.log('이미 고양이 정보가 로드됨, 스킵');
      setIsLoadingCat(false);
      return;
    }

    console.log('고양이 선택 로드 시작:', userId);

    try {
      console.log('GET 요청 시작:', `/api/user/selected-cat?userId=${userId}`);
      const response = await fetch(`/api/user/selected-cat?userId=${userId}`);
      console.log('GET 응답 상태:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('로드된 고양이 선택:', data);
        console.log('이전 selectedCat:', selectedCat);
        setSelectedCat(data.selectedCat);
        setHasLoadedCat(true);
        console.log('설정된 selectedCat:', data.selectedCat);
      } else {
        console.error('고양이 선택 로드 실패:', response.status);
        setSelectedCat('두두'); // 기본값 설정
        setHasLoadedCat(true);
      }
    } catch (error) {
      console.error('고양이 선택 로드 오류:', error);
      setSelectedCat('두두'); // 기본값 설정
      setHasLoadedCat(true);
    } finally {
      setIsLoadingCat(false);
    }
  }, [session?.user, hasLoadedCat]);

  // 선택된 고양이 저장 (디바운싱 적용)
  const saveSelectedCat = React.useCallback(
    async (catName: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(session?.user as any)?.id) return;

      console.log('고양이 선택 저장 시작:', catName);

      try {
        const response = await fetch('/api/user/selected-cat', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            userId: (session?.user as any)?.id,
            selectedCat: catName,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('저장된 고양이 선택:', data);
          setSelectedCat(catName);
          setHasLoadedCat(true); // 캐시 유지
        } else {
          console.error('고양이 선택 저장 실패:', response.status);
        }
      } catch (error) {
        console.error('고양이 선택 저장 오류:', error);
      }
    },
    [session?.user],
  );

  // 세션이 로드되면 고양이 선택 로드 (캐싱 적용)
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session?.user as any)?.id;
    console.log('useEffect 실행:', {
      userId,
      isLoadingCat,
      hasLoadedCat,
      sessionExists: !!session,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userExists: !!(session?.user as any),
    });

    if (userId && !hasLoadedCat) {
      console.log('loadSelectedCat 호출');
      loadSelectedCat();
    } else if (!userId && session !== undefined) {
      console.log('세션 없음, 로딩 상태 해제');
      setIsLoadingCat(false);
    } else if (hasLoadedCat) {
      console.log('이미 로드됨, 로딩 상태 해제');
      setIsLoadingCat(false);
    }
  }, [session?.user, loadSelectedCat, isLoadingCat, hasLoadedCat]);

  const {
    mounted,
    todosByDate,
    input,
    setInput,
    message,
    editIndex,
    editText,
    setEditText,
    setEditIndex,
    selectedKey,
    addTodo,
    toggleComplete,
    deleteTodo,
    getAdvice,
    startEdit,
    saveEdit,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useTodos(
    date,
    selectedCat,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session as any,
  );

  const handleAddTodo = () => {
    if (input.trim()) addTodo();
  };

  const toggleAdvice = (id: string) => {
    setVisibleAdviceIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  };

  const getCatImage = (catName: string | undefined): string => {
    return cats.find(c => c.name === catName)?.img || '/assets/dodo.png';
  };

  // 젤리 조회
  const fetchJellyData = React.useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session?.user as any)?.id;
    if (!userId) return;

    try {
      const response = await fetch(`/api/user/jelly?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setJellyCount(data.jellyCount);
      }
    } catch (error) {
      console.error('Error fetching jelly data:', error);
    }
  }, [session?.user]);

  // 젤리 획득 시도
  const claimJelly = React.useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session?.user as any)?.id;
    if (!userId) return;

    try {
      const response = await fetch('/api/user/jelly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId}),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setJellyCount(data.jellyCount);
        setShowJellyModal(true);
      }
    } catch (error) {
      console.error('Error claiming jelly:', error);
    }
  }, [session?.user]);

  // 입양된 고양이 목록 조회
  const fetchUnlockedCats = React.useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session?.user as any)?.id;
    if (!userId) return;

    try {
      const response = await fetch(`/api/user/adopt-cat?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUnlockedCats(data.unlockedCats);
      }
    } catch (error) {
      console.error('Error fetching unlocked cats:', error);
    }
  }, [session?.user]);

  // 고양이 입양
  const handleAdoptCat = React.useCallback(
    async (catName: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userId = (session?.user as any)?.id;
      if (!userId) return;

      try {
        const response = await fetch('/api/user/adopt-cat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({userId, catName}),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setJellyCount(data.jellyCount);
          setUnlockedCats(data.unlockedCats);
          // 입양 성공 시 해당 고양이 선택
          saveSelectedCat(catName);
        } else {
          // 에러 메시지 표시 (나중에 토스트나 알림으로 개선 가능)
          console.log(data.message);
        }
      } catch (error) {
        console.error('Error adopting cat:', error);
      }
    },
    [session?.user, saveSelectedCat],
  );

  // 앱 접속 시 젤리 획득 시도 및 입양된 고양이 조회
  React.useEffect(() => {
    if (session?.user) {
      fetchJellyData();
      fetchUnlockedCats();
      claimJelly();
    }
  }, [session?.user, fetchJellyData, fetchUnlockedCats, claimJelly]);

  // 탭별 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'buddy':
        return (
          <BuddyTab
            selectedCat={selectedCat}
            onCatChange={saveSelectedCat}
            jellyCount={jellyCount}
            unlockedCats={unlockedCats}
            onAdoptCat={handleAdoptCat}
          />
        );
      case 'settings':
        return <SettingsTab />;
      case 'calendar':
        return (
          <div className="px-2 py-2 pb-24 flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              📅 Calendar
            </h2>
            <div className="w-full flex justify-center overflow-hidden">
              <FullCalendar
                date={date}
                setDate={setDate}
                todosByDate={todosByDate}
                mounted={mounted}
                onDateClick={(clickedDate: Date) => {
                  setDate(clickedDate);
                  setActiveTab('home');
                }}
              />
            </div>
          </div>
        );
      case 'home':
      default:
        return (
          <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-24">
            <header className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                  <FaCat className="text-[#173f6d]" />
                  CAT DO
                </h1>
                <JellyDisplay jellyCount={jellyCount} size="small" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{selectedKey}</h2>
            </header>

            <div className="px-2">
              <div className="flex justify-center mb-6">
                {isLoadingCat ? (
                  <div className="w-[120px] h-[120px] bg-gray-200 rounded-lg animate-pulse"></div>
                ) : (
                  <Image
                    src={catPixelImage}
                    alt={`${selectedCat} 고양이 비서`}
                    width={120}
                    height={120}
                    className="pixelated"
                    style={{
                      imageRendering: 'pixelated',
                    }}
                  />
                )}
              </div>
              {message ? (
                <div
                  className={`p-4 mb-6 rounded-r-lg border-l-4 ${
                    message.includes('열심히 생각 중') ||
                    message.includes('미안, 지금은 조언을 해줄 수 없어')
                      ? 'bg-yellow-50 border-yellow-300 text-yellow-800' // 로딩/에러 노랑
                      : message.includes('✅') || message.includes('📝')
                      ? 'bg-green-50 border-green-300 text-green-800' // 성공 초록
                      : message.includes('❌')
                      ? 'bg-red-50 border-red-300 text-red-800' // 에러 빨강
                      : selectedCat === '두두'
                      ? 'bg-orange-50 border-orange-300 text-orange-800' // 츤데레 오렌지
                      : selectedCat === '코코'
                      ? 'bg-blue-50 border-blue-300 text-blue-800' // 우아한 파랑
                      : 'bg-gray-50 border-gray-300 text-gray-800' // 직설적 회색
                  }`}>
                  <p className="text-sm">{message}</p>
                </div>
              ) : isLoadingCat ? (
                <div className="bg-gray-50 border-l-4 border-gray-300 text-gray-700 p-4 mb-6 rounded-r-lg">
                  <div className="flex items-center">
                    <span className="mr-2">🐱</span>
                    <span className="text-sm font-medium">
                      고양이 비서를 불러오는 중...
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className={`p-4 mb-6 rounded-r-lg border-l-4 ${
                    selectedCat === '두두'
                      ? 'bg-orange-50 border-orange-300 text-orange-800' // 츤데레 오렌지
                      : selectedCat === '코코'
                      ? 'bg-blue-50 border-blue-300 text-blue-800' // 우아한 파랑
                      : 'bg-gray-50 border-gray-300 text-gray-800' // 직설적 회색
                  }`}>
                  <p className="text-sm font-medium">
                    <span className="mr-2">🐱</span>
                    {selectedCat === '두두' &&
                      '흥, 할 일이 남아있군... 그래도 집사라면 해낼 수 있을 거다냥.'}
                    {selectedCat === '코코' &&
                      '할 일이 있지만~ 하루는 기니까, 마음을 편하게 가져, 야옹~'}
                    {selectedCat === '깜냥' &&
                      '뭐야! 할 일이 이렇게나 남아있는데 뭐하고 있는 거야? 빨리 해라냥!'}
                  </p>
                </div>
              )}

              <div className="relative mb-6">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddTodo()}
                  placeholder={'새로운 할 일을 입력하세요...'}
                  disabled={isLoadingCat}
                  className={`todo-input w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none ${
                    isLoadingCat
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : ''
                  }`}
                />
                <button
                  onClick={handleAddTodo}
                  disabled={isLoadingCat}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 transition flex items-center justify-center ${
                    isLoadingCat
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-300 hover:text-gray-400'
                  }`}>
                  <FaPlus className="w-4 h-4" />
                </button>
              </div>

              <ul className="space-y-3">
                {isLoadingCat ? (
                  <li className="py-3">
                    <div className="flex items-center justify-center">
                      <div className="text-gray-500 text-sm">
                        할 일을 불러오는 중...
                      </div>
                    </div>
                  </li>
                ) : (
                  mounted &&
                  (todosByDate[selectedKey] || []).map((todo, index) => (
                    <li key={todo.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleComplete(todo)}
                            className="todo-checkbox"
                          />

                          {editIndex === index ? (
                            <input
                              type="text"
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              onKeyPress={e => e.key === 'Enter' && saveEdit()}
                              className="todo-input flex-1 px-2 py-1 border rounded"
                              autoFocus
                            />
                          ) : (
                            <span
                              className={`flex-1 todo-text ${
                                todo.completed
                                  ? 'line-through text-gray-500'
                                  : 'text-gray-800'
                              }`}>
                              {todo.text}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {editIndex === index ? (
                            <>
                              <button
                                onClick={saveEdit}
                                className="p-2 text-green-600 hover:text-green-800">
                                <FaSave />
                              </button>
                              <button
                                onClick={() => {
                                  setEditIndex(null);
                                  setEditText('');
                                }}
                                className="p-2 text-gray-500 hover:text-gray-700">
                                취소
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="p-2 text-gray-300 hover:text-gray-400"
                                onClick={() => startEdit(index)}>
                                <FaEdit />
                              </button>
                              <button
                                className="p-2 text-gray-300 hover:text-gray-400"
                                onClick={() => {
                                  if (!todo.advice) getAdvice(todo);
                                  toggleAdvice(todo.id);
                                }}>
                                <FaLightbulb />
                              </button>

                              <button
                                className="p-2 text-gray-300 hover:text-gray-400"
                                onClick={() => deleteTodo(todo)}>
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {visibleAdviceIds.includes(todo.id) && todo.advice && (
                        <div className="ml-10 mr-4 my-2 p-3 bg-gray-100 rounded-lg text-sm text-gray-700">
                          <p className="whitespace-pre-line flex items-start gap-2">
                            <Image
                              src={getCatImage(todo.adviceCat)}
                              alt={todo.adviceCat || '고양이'}
                              width={20}
                              height={20}
                              className="rounded-full flex-shrink-0 mt-1"
                            />
                            <span>
                              {todo.advice?.replace(/^🐱 /, '') || ''}
                            </span>
                          </p>
                        </div>
                      )}
                    </li>
                  ))
                )}
              </ul>

              {!isLoadingCat &&
                mounted &&
                (todosByDate[selectedKey] || []).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>오늘의 할 일이 아직 없어요.</p>
                    <p>첫 번째 할 일을 추가해 보세요!</p>
                  </div>
                )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* 탭 컨텐츠 */}
      {renderTabContent()}

      {/* 하단 탭 네비게이션 */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 젤리 모달 */}
      <JellyModal
        isOpen={showJellyModal}
        onClose={() => setShowJellyModal(false)}
        jellyCount={jellyCount}
        type="jelly"
      />

      {/* 전체 로딩 오버레이 */}
      <LoadingOverlay isVisible={isLoadingCat} text="로딩중" />
    </div>
  );
}
