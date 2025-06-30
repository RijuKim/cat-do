'use client';

import {useState, useEffect} from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Image from 'next/image';

import dodoImg from '../public/assets/dodo.png';
import cocoImg from '../public/assets/coco.png';
import kkamnyangImg from '../public/assets/kkamnyang.png';

import useTodos from './hooks/useTodos';
import CatSelectorModal from './component/CatSelectorModal';

export default function Page() {
  const [date, setDate] = useState(new Date());
  const [selectedCat, setSelectedCat] = useState('두두');
  const [showCatModal, setShowCatModal] = useState(false);

  const cats = [
    {name: '두두', personality: '새침한 츤데레', img: dodoImg},
    {name: '코코', personality: '다정한 개냥이', img: cocoImg},
    {name: '깜냥', personality: '불친절한 고양이', img: kkamnyangImg},
  ];

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
  } = useTodos(date, selectedCat); // 🐾 선택한 고양이를 훅에 전달하려면 훅에서도 사용하도록 수정해 주세요.

  useEffect(() => {
    const todayKey = new Date().toLocaleDateString('sv-SE');
    if (!todosByDate[selectedKey] && todosByDate[todayKey]) {
      setDate(new Date());
    }
  }, [todosByDate, selectedKey]);

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🐾 캣두</h1>
        <button
          className="bg-yellow-400 px-4 py-2 rounded-full shadow"
          onClick={() => setShowCatModal(true)}>
          나의 냥이 선택
        </button>
      </div>

      {/* ✅ 모달 */}
      {showCatModal && (
        <CatSelectorModal
          cats={cats}
          selectedCat={selectedCat}
          onSelectCat={setSelectedCat}
          onClose={() => setShowCatModal(false)}
        />
      )}

      <div className="flex flex-col md:flex-row gap-8 mt-8">
        <div className="md:w-1/3 border rounded p-4">
          <h2 className="text-lg mb-4">📅 날짜 선택</h2>

          {mounted && (
            <Calendar
              onChange={value => {
                if (value instanceof Date) {
                  setDate(value);
                } else if (Array.isArray(value) && value[0] instanceof Date) {
                  setDate(value[0]);
                } else {
                  console.warn('Invalid date value:', value);
                }
              }}
              value={date}
              formatDay={(locale, date) => date.getDate().toString()}
              tileContent={({date}) => {
                const key = date.toLocaleDateString('sv-SE');
                const count = todosByDate[key]?.length || 0;
                return count > 0 ? (
                  <div
                    style={{
                      background: '#facc15',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      margin: 'auto',
                      marginTop: 2,
                    }}>
                    {count}
                  </div>
                ) : null;
              }}
            />
          )}

          <p className="mt-4">선택된 날짜: {selectedKey}</p>
        </div>

        <div className="md:w-2/3 border rounded p-4">
          <h2 className="text-lg mb-4 flex items-center gap-2">
            <Image
              src={cats.find(c => c.name === selectedCat)?.img || dodoImg}
              alt="고양이 비서"
              width={24}
              height={24}
              style={{borderRadius: '50%'}}
            />
            {selectedCat} 집사의 할 일
          </h2>

          <div className="mb-4">
            <input
              className="border p-2 mr-2"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="할 일을 입력하세요"
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={addTodo}>
              추가
            </button>
          </div>

          <ul className="mb-4">
            {message && (
              <div className="p-4 border rounded mb-4 flex items-center gap-2 bg-yellow-50">
                <Image
                  src={cats.find(c => c.name === selectedCat)?.img || dodoImg}
                  alt="고양이 비서"
                  width={24}
                  height={24}
                  style={{borderRadius: '50%'}}
                />
                <span className="whitespace-pre-line">
                  {message.replace(/^🐱 /, '')}
                </span>
              </div>
            )}

            {(todosByDate[selectedKey] || []).map((todo, index) => (
              <li key={todo.id} className="mb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo)}
                  />

                  {editIndex === index ? (
                    <>
                      <input
                        className="border p-1"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveEdit();
                        }}
                      />
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={saveEdit}>
                        저장
                      </button>
                    </>
                  ) : (
                    <span
                      className={
                        todo.completed ? 'line-through text-gray-500' : ''
                      }>
                      {todo.text}
                    </span>
                  )}

                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded flex items-center gap-1"
                    onClick={() => getAdvice(todo)}>
                    <Image
                      src={
                        cats.find(c => c.name === selectedCat)?.img || dodoImg
                      }
                      alt="도움말"
                      width={16}
                      height={16}
                      style={{borderRadius: '50%'}}
                    />
                    {selectedCat}
                  </button>
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                    onClick={() => startEdit(index)}>
                    수정
                  </button>
                  <button
                    className="bg-gray-400 text-white px-2 py-1 rounded"
                    onClick={() => deleteTodo(todo)}>
                    삭제
                  </button>

                  {todo.celebration && (
                    <div className="relative ml-4">
                      <div className="relative bg-yellow-200 text-sm px-3 py-2 rounded shadow">
                        <span>{todo.celebration.replace(/^🐱 /, '')}</span>
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-yellow-200"></div>
                      </div>
                    </div>
                  )}
                </div>

                {todo.advice && (
                  <div className="ml-6 mt-1 p-2 border rounded whitespace-pre-line flex items-start gap-2">
                    <Image
                      src={
                        cats.find(c => c.name === selectedCat)?.img || dodoImg
                      }
                      alt="고양이 비서"
                      width={20}
                      height={20}
                      style={{borderRadius: '50%'}}
                    />
                    <span>{todo.advice.replace(/^🐱 /, '')}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
