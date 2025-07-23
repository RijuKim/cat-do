'use client';

import {useState, useMemo} from 'react';
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
import CatSelectorModal from '../component/CatSelectorModal';
import TabNavigation from '../component/TabNavigation';
import SettingsTab from '../component/SettingsTab';

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
  const [selectedCat, setSelectedCat] = useState('두두');
  const [showCatModal, setShowCatModal] = useState(false);
  const [visibleAdviceIds, setVisibleAdviceIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'settings'>(
    'home',
  );

  const cats = useMemo(
    () => [
      {name: '두두', personality: '새침한 츤데레', img: '/assets/dodo.png'},
      {name: '코코', personality: '다정한 개냥이', img: '/assets/coco.png'},
      {
        name: '깜냥',
        personality: '불친절한 고양이',
        img: '/assets/kkamnyang.png',
      },
    ],
    [],
  );

  const {data: session} = useSession();

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
  } = useTodos(date, selectedCat, session as any);

  const selectedCatInfo = useMemo(
    () => cats.find(c => c.name === selectedCat) || cats[0],
    [cats, selectedCat],
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

  // 탭별 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'settings':
        return (
          <SettingsTab selectedCat={selectedCat} onCatChange={setSelectedCat} />
        );
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
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <FaCat className="text-[#173f6d]" />
                CAT DO
              </h1>
              <div className="flex items-center">
                <button
                  className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => setShowCatModal(true)}>
                  <Image
                    src={selectedCatInfo.img}
                    alt={selectedCatInfo.name}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                  <span className="font-semibold text-gray-700">
                    {selectedCatInfo.name}
                  </span>
                </button>
              </div>
            </header>

            <div className="px-2 py-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {selectedKey}
              </h2>

              {message && (
                <div className="bg-orange-50 border-l-4 border-orange-300 text-orange-800 p-4 mb-6 rounded-r-lg">
                  <p className="text-sm">{message}</p>
                </div>
              )}

              <div className="relative mb-6">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddTodo()}
                  placeholder="새로운 할 일을 입력하세요..."
                  className="todo-input w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none"
                />
                <button
                  onClick={handleAddTodo}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-300 p-2 hover:text-gray-400 transition flex items-center justify-center">
                  <FaPlus className="w-4 h-4" />
                </button>
              </div>

              <ul className="space-y-3">
                {mounted &&
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
                              className={`flex-1 ${
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
                  ))}
              </ul>

              {mounted && (todosByDate[selectedKey] || []).length === 0 && (
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

      {/* 고양이 선택 모달 */}
      {showCatModal && (
        <CatSelectorModal
          cats={cats}
          selectedCat={selectedCat}
          onSelectCat={setSelectedCat}
          onClose={() => setShowCatModal(false)}
        />
      )}
    </div>
  );
}
