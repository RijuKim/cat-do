'use client';

import {useState, useMemo} from 'react';
import {signOut, useSession} from 'next-auth/react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Image from 'next/image';
import {
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaSave,
  FaPlus,
  FaCat,
  FaLightbulb,
  FaPaw,
} from 'react-icons/fa';

import useTodos from '../hooks/useTodos';
import CatSelectorModal from '../component/CatSelectorModal';

// ✅ 접이식 캘린더 컴포넌트
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  advice?: string;
  adviceCat?: string;
  celebration?: string;
}

const FoldableCalendar = ({
  date,
  setDate,
  todosByDate,
  mounted,
}: {
  date: Date;
  setDate: (date: Date) => void;
  todosByDate: Record<string, Todo[]>;
  mounted: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6 transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
        <span className="font-semibold text-gray-700">📅 캘린더 보기</span>
        {isOpen ? (
          <FaChevronUp className="text-gray-500" />
        ) : (
          <FaChevronDown className="text-gray-500" />
        )}
      </button>
      {isOpen && mounted && (
        <div className="mt-4 flex justify-center">
          <Calendar
            onChange={value => {
              if (value instanceof Date) setDate(value);
            }}
            value={date}
            formatDay={(locale, date) => date.getDate().toString()}
            tileContent={({date, view}) => {
              if (view === 'month') {
                const key = date.toLocaleDateString('sv-SE');
                const todosForDay = todosByDate[key] || [];
                const count = todosForDay.length;
                if (count === 0) return null;

                const allCompleted = todosForDay.every(t => t.completed);

                return (
                  <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
                    {allCompleted ? (
                      <FaPaw className="text-green-500" size={12} />
                    ) : (
                      <div className="w-4 h-4 flex items-center justify-center bg-[#B0E2F2] text-white text-xs rounded-full font-bold">
                        {count}
                      </div>
                    )}
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

// ✅ 메인 페이지 컴포넌트
export default function MainPage() {
  const [date, setDate] = useState(new Date());
  const [selectedCat, setSelectedCat] = useState('두두');
  const [showCatModal, setShowCatModal] = useState(false);
  const [visibleAdviceIds, setVisibleAdviceIds] = useState<string[]>([]);

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

  const { data: session } = useSession();

  const {
    mounted,
    todosByDate,
    input,
    setInput,
    message,
    editIndex,
    editText,
    setEditText,
    selectedKey,
    addTodo,
    toggleComplete,
    deleteTodo,
    getAdvice,
    startEdit,
    saveEdit,
  } = useTodos(date, selectedCat, session);

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

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <main className="max-w-2xl mx-auto p-4 sm:p-6">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FaCat className="text-[#173f6d]" />
            캣두
          </h1>
          <div className="flex gap-4 items-center">
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
            <button
              className="bg-gray-300 px-4 py-2 rounded-full shadow hover:bg-gray-400 transition"
              onClick={() => signOut()}>
              로그아웃
            </button>
          </div>
        </header>

        <FoldableCalendar
          date={date}
          setDate={setDate}
          todosByDate={todosByDate}
          mounted={mounted}
        />

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {selectedKey}
          </h2>

          {message && (
            <div className="bg-sky-50 border-l-4 border-[#B0E2F2] text-sky-800 p-4 mb-6 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Image
                  src={selectedCatInfo.img}
                  alt={selectedCatInfo.name}
                  width={32}
                  height={32}
                  className="rounded-full flex-shrink-0 mt-1"
                />
                <p className="text-sm whitespace-pre-line leading-relaxed">
                  {message.replace(/^🐱 /, '')}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 mb-6">
            <input
              className="flex-grow border-2 border-gray-200 p-3 rounded-lg focus:outline-none focus:border-[#B0E2F2] transition"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTodo()}
              placeholder="오늘의 할 일을 추가하세요!"
            />
            <button
              className="bg-[#B0E2F2] text-white p-3 rounded-lg hover:opacity-90 transition shadow"
              onClick={handleAddTodo}>
              <FaPlus />
            </button>
          </div>

          <ul>
            {(todosByDate[selectedKey] || []).map((todo, index) => (
              <li key={todo.id} className="group mb-2">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition">
                  {editIndex === index ? (
                    <>
                      <input
                        className="flex-grow border-b-2 border-[#B0E2F2] focus:outline-none bg-transparent"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveEdit()}
                      />
                      <button
                        className="p-2 text-gray-600 hover:text-green-500"
                        onClick={saveEdit}>
                        <FaSave />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 flex-grow">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleComplete(todo)}
                          className="w-5 h-5 rounded text-[#B0E2F2] focus:ring-[#B0E2F2] flex-shrink-0"
                        />
                        <span
                          className={`text-gray-700 ${
                            todo.completed ? 'line-through text-gray-400' : ''
                          }`}>
                          {todo.text}
                        </span>
                      </div>
                      <div className="flex items-center opacity-50 group-hover:opacity-100 transition">
                        <button
                          className="p-2 text-gray-500 hover:text-[#B0E2F2]"
                          onClick={() => {
                            if (!todo.advice) getAdvice(todo);
                            toggleAdvice(todo.id);
                          }}>
                          <FaLightbulb />
                        </button>
                        <button
                          className="p-2 text-gray-500 hover:text-yellow-500"
                          onClick={() => startEdit(index)}>
                          <FaEdit />
                        </button>
                        <button
                          className="p-2 text-gray-500 hover:text-red-500"
                          onClick={() => deleteTodo(todo)}>
                          <FaTrash />
                        </button>
                      </div>
                    </>
                  )}
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
                      <span>{todo.advice.replace(/^🐱 /, '')}</span>
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
      </main>

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
