"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Image from "next/image";
import { FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import useTodos from "../hooks/useTodos"; // ✅ 훅 경로 맞게!
import CatSelectorModal from "../component/CatSelectorModal";

import dodoImg from "../../public/assets/dodo.png";
import cocoImg from "../../public/assets/coco.png";
import kkamnyangImg from "../../public/assets/kkamnyang.png";

export default function MainPage() {
  const { data: session, status } = useSession();
  const [date, setDate] = useState(new Date());
  const [selectedCat, setSelectedCat] = useState("두두");
  const [showCatModal, setShowCatModal] = useState(false);
  const [isAdviceVisible, setIsAdviceVisible] = useState(false);
  const [visibleAdviceIds, setVisibleAdviceIds] = useState<string[]>([]);

  const cats = [
    { name: "두두", personality: "새침한 츤데레", img: dodoImg },
    { name: "코코", personality: "다정한 개냥이", img: cocoImg },
    { name: "깜냥", personality: "불친절한 고양이", img: kkamnyangImg },
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
    getProcrastinationAdvice,
    startEdit,
    saveEdit,
  } = useTodos(date, selectedCat, session);

  // ✅ 세션 로딩 중
  if (status === "loading") return <div>로딩 중...</div>;
  if (!session) return <div>로그인이 필요합니다</div>;

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🐾 캣두</h1>
        <div className="flex gap-4">
          <button
            className="bg-yellow-400 px-4 py-2 rounded-full shadow"
            onClick={() => setShowCatModal(true)}
          >
            나의 냥이 선택
          </button>
          <button
            className="bg-gray-300 px-4 py-2 rounded-full shadow"
            onClick={() => signOut()}
          >
            로그아웃
          </button>
        </div>
      </div>

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
              onChange={(value) => {
                if (value instanceof Date) {
                  setDate(value);
                } else if (Array.isArray(value) && value[0] instanceof Date) {
                  setDate(value[0]);
                } else {
                  console.warn("Invalid date value:", value);
                }
              }}
              value={date}
              formatDay={(locale, date) => date.getDate().toString()}
              tileContent={({ date }) => {
                const key = date.toLocaleDateString("sv-SE");
                const count = todosByDate[key]?.length || 0;
                return count > 0 ? (
                  <div
                    style={{
                      background: "#facc15",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      textAlign: "center",
                      fontSize: "0.75rem",
                      margin: "auto",
                      marginTop: 2,
                    }}
                  >
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
              src={cats.find((c) => c.name === selectedCat)?.img || dodoImg}
              alt="고양이 비서"
              width={24}
              height={24}
              style={{ borderRadius: "50%" }}
            />
            {selectedCat} 집사의 할 일
          </h2>

          <div className="mb-4">
            <input
              className="border p-2 mr-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="할 일을 입력하세요"
            />
            <button
              className="text-white px-4 py-2 rounded"
              style={{ backgroundColor: "#0275ff" }}
              onClick={addTodo}
            >
              추가
            </button>
          </div>

          <ul className="mb-4">
            {message && (
              <div className="p-4 border rounded mb-4 bg-yellow-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2 overflow-hidden pr-2">
                    <Image
                      src={
                        cats.find((c) => c.name === selectedCat)?.img || dodoImg
                      }
                      alt="고양이 비서"
                      width={24}
                      height={24}
                      style={{ borderRadius: "50%" }}
                      className="flex-shrink-0 cursor-pointer"
                      onClick={getProcrastinationAdvice}
                    />
                    {!isAdviceVisible && (
                      <span className="truncate font-medium text-gray-600">
                        {message.replace(/^🐱 /, "").split("\n")[0]}
                      </span>
                    )}
                  </div>
                  <button
                    className="text-sm text-gray-500 flex-shrink-0 pl-2"
                    onClick={() => setIsAdviceVisible(!isAdviceVisible)}
                  >
                    {isAdviceVisible ? (
                      <FaChevronUp size={16} />
                    ) : (
                      <FaChevronDown size={16} />
                    )}
                  </button>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isAdviceVisible
                      ? "max-h-screen opacity-100 mt-2 ml-8"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <span className="whitespace-pre-line text-gray-800">
                    {message.replace(/^🐱 /, "")}
                  </span>
                </div>
              </div>
            )}

            {(todosByDate[selectedKey] || []).map((todo, index) => (
              <li key={todo.id} className="mb-4">
                <div
                  className="
      flex flex-wrap md:flex-nowrap items-center gap-2
    "
                >
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
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                        }}
                      />
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={saveEdit}
                      >
                        저장
                      </button>
                    </>
                  ) : (
                    <span
                      className={`cursor-pointer ${
                        todo.completed ? "line-through text-gray-500" : ""
                      }`}
                      onClick={() => startEdit(index)}
                    >
                      {todo.text}
                    </span>
                  )}

                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded flex items-center gap-1"
                    onClick={() => {
                      getAdvice(todo);
                      // 조언을 요청하면 바로 해당 조언이 보이도록 ID 추가
                      if (!visibleAdviceIds.includes(todo.id)) {
                        setVisibleAdviceIds([...visibleAdviceIds, todo.id]);
                      }
                    }}
                  >
                    <Image
                      src={
                        cats.find((c) => c.name === selectedCat)?.img || dodoImg
                      }
                      alt="도움말"
                      width={16}
                      height={16}
                      style={{ borderRadius: "50%" }}
                    />
                    {selectedCat}
                  </button>

                  <button
                    className="bg-transparent"
                    onClick={() => deleteTodo(todo)}
                  >
                    <FaTrash size={12} style={{ color: "#a5aaa3" }} />
                  </button>

                  {todo.advice && (
                    <button
                      className="text-xs ml-2 font-medium"
                      onClick={() =>
                        setVisibleAdviceIds((prev) =>
                          prev.includes(todo.id)
                            ? prev.filter((id) => id !== todo.id)
                            : [...prev, todo.id]
                        )
                      }
                    >
                      {visibleAdviceIds.includes(todo.id) ? (
                        <FaChevronUp size={10} style={{ color: "#a5aaa3" }} />
                      ) : (
                        <FaChevronDown size={10} style={{ color: "#a5aaa3" }} />
                      )}
                    </button>
                  )}

                  {todo.celebration && (
                    <div
                      className="
          relative ml-0 mt-2 md:mt-0 md:ml-4 w-full md:w-auto
        "
                    >
                      <div className="relative bg-yellow-200 text-sm px-3 py-2 rounded shadow">
                        <span>{todo.celebration.replace(/^🐱 /, "")}</span>
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-yellow-200"></div>
                      </div>
                    </div>
                  )}
                </div>

                {todo.advice && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      visibleAdviceIds.includes(todo.id)
                        ? "max-h-screen opacity-100 ml-6 mt-1"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="p-2 border rounded whitespace-pre-line flex items-start gap-2">
                      <Image
                        src={
                          cats.find((c) => c.name === todo.adviceCat)?.img ||
                          dodoImg
                        }
                        alt="고양이 비서"
                        width={20}
                        height={20}
                        style={{ borderRadius: "50%" }}
                      />
                      <span>{todo.advice.replace(/^🐱 /, "")}</span>
                    </div>
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
