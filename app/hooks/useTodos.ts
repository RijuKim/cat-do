'use client';
import {Session} from 'next-auth';
import {useState, useEffect, useCallback} from 'react';

// Todo 타입 선언 (adviceCat 추가)
interface Todo {
  id: string;
  text: string;
  date: string;
  completed: boolean;
  advice?: string;
  adviceCat?: string;
  celebration?: string;
}

export default function useTodos(
  date: Date,
  selectedCat: string,
  session: Session | null,
) {
  const [mounted, setMounted] = useState(false);
  const [todosByDate, setTodosByDate] = useState<Record<string, Todo[]>>({});
  const [completionAdvice, setCompletionAdvice] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const selectedKey = date.toLocaleDateString('sv-SE');

  // 날짜가 바뀌면 완료 조언 초기화
  useEffect(() => {
    setCompletionAdvice(null);
  }, [selectedKey]);

  // 고양이가 바뀌면 완료 조언 초기화
  // useEffect(() => {
  //   setCompletionAdvice(null);
  // }, [selectedCat]);

  // const fetchTodos = useCallback(async () => {
  //   if (!session) return;

  //   const res = await fetch('/api/todos');
  //   if (!res.ok) return;

  //   const todos: Todo[] = await res.json();

  //   const grouped = todos.reduce<Record<string, Todo[]>>((acc, todo) => {
  //     const key = todo.date;
  //     if (!acc[key]) acc[key] = [];
  //     acc[key].push(todo);
  //     return acc;
  //   }, {});

  //   setTodosByDate(grouped);
  // }, [session]);

  // 날짜 또는 고양이가 바뀌면 완료 조언 초기화
  useEffect(() => {
    setCompletionAdvice(null);
  }, [selectedKey, selectedCat]);

  const fetchTodos = useCallback(async () => {
    if (!session) return;

    const res = await fetch('/api/todos');
    const todos: Todo[] = await res.json();

    const grouped = todos.reduce<Record<string, Todo[]>>((acc, todo) => {
      const key = todo.date;
      if (!acc[key]) acc[key] = [];
      acc[key].push(todo);
      return acc;
    }, {});

    // 각 날짜별로 완료되지 않은 할일을 먼저 보여주도록 정렬
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => Number(a.completed) - Number(b.completed));
    });

    setTodosByDate(grouped);
  }, [session]);

  useEffect(() => {
    setMounted(true);
    fetchTodos();
  }, [fetchTodos]);

  const getProcrastinationAdvice = useCallback(async () => {
    const todosForAdvice = todosByDate[selectedKey] || [];
    const allCompleted = todosForAdvice.every(t => t.completed);
    const hasTodos = todosForAdvice.length > 0;

    if (!hasTodos) {
      setMessage(
        '안녕하냥, 집사! 🐾 오늘 할 일이 아직 없다니, 조금 심심하겠는걸?(=｀ω´=) 그래도 오늘을 알차게 보내려면, 해야 할 일 리스트를 작성하는 게 좋겠다냥! 📝',
      );
      return;
    }

    if (allCompleted) {
      if (completionAdvice) {
        setMessage(completionAdvice);
        return;
      }

      // 완료된 할 일 요약
      setMessage('🐱 냐...');

      // DB에서 요약 먼저 확인
      const adviceRes = await fetch(
        `/api/advice?date=${selectedKey}&catName=${selectedCat}`,
      );

      if (adviceRes.ok) {
        const savedAdvice = await adviceRes.json();
        if (savedAdvice) {
          setMessage(savedAdvice.message);
          setCompletionAdvice(savedAdvice.message); // 조언 저장
          return;
        }
      }

      // 없으면 새로 생성
      setMessage('🐱 열심히 생각 중...');
      const generateRes = await fetch('/api/assistant', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          todos: todosForAdvice,
          catName: selectedCat,
          action: 'SUMMARIZE',
          date: selectedKey,
          userId: session?.user?.id || null,
        }),
      });

      const data = await generateRes.json();
      if (generateRes.ok) {
        setMessage(data.message);
        setCompletionAdvice(data.message);
      } else {
        setMessage('미안, 지금은 조언을 해줄 수 없어.');
      }
    } else {
      setMessage('🐱 할 일이 남아있군! 힘내라냥! 🔥');
    }
  }, [
    selectedKey,
    selectedCat,
    todosByDate,
    completionAdvice,
    session?.user?.id,
  ]);

  useEffect(() => {
    if (mounted) {
      getProcrastinationAdvice();
    }
  }, [mounted, getProcrastinationAdvice, todosByDate]); // todosByDate 변경 시 다시 호출

  const addTodo = async () => {
    if (!input.trim()) return;

    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({text: input.trim(), date: selectedKey}),
    });

    const newTodo: Todo = await res.json();

    const newTodos = [...(todosByDate[selectedKey] || []), newTodo];
    // 완료되지 않은 할일을 먼저 보여주도록 정렬
    newTodos.sort((a, b) => Number(a.completed) - Number(b.completed));

    const updated = {
      ...todosByDate,
      [selectedKey]: newTodos,
    };
    setTodosByDate(updated);
    setInput('');
    getProcrastinationAdvice();
  };

  const toggleComplete = async (todo: Todo) => {
    const completed = !todo.completed;

    const res = await fetch(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({completed}),
    });

    const updatedTodo: Todo = await res.json();

    const newTodos = (todosByDate[selectedKey] || []).map(t =>
      t.id === todo.id ? updatedTodo : t,
    );

    newTodos.sort((a, b) => Number(a.completed) - Number(b.completed));

    setTodosByDate({
      ...todosByDate,
      [selectedKey]: newTodos,
    });

    getProcrastinationAdvice();
  };

  const deleteTodo = async (todo: Todo) => {
    await fetch(`/api/todos/${todo.id}`, {method: 'DELETE'});

    const newTodos = (todosByDate[selectedKey] || []).filter(
      t => t.id !== todo.id,
    );

    setTodosByDate({
      ...todosByDate,
      [selectedKey]: newTodos,
    });
    getProcrastinationAdvice();
  };

  const getAdvice = async (todo: Todo) => {
    setMessage('🐱 열심히 생각 중...');

    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        todo: todo.text,
        catName: selectedCat,
        action: 'ADVICE',
      }),
    });

    const data = await res.json();

    const updatedRes = await fetch(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        advice: `🐱 ${data.message}`,
        adviceCat: selectedCat,
      }),
    });

    const updatedTodo: Todo = await updatedRes.json();

    const newTodos = (todosByDate[selectedKey] || []).map(t =>
      t.id === todo.id ? updatedTodo : t,
    );

    // 완료되지 않은 할일을 먼저 보여주도록 정렬
    newTodos.sort((a, b) => Number(a.completed) - Number(b.completed));

    setTodosByDate({
      ...todosByDate,
      [selectedKey]: newTodos,
    });

    setMessage(`🐱 한마디가 추가되었어요!`);
  };

  const startEdit = (index: number) => {
    const todo = todosByDate[selectedKey][index];
    setEditIndex(index);
    setEditText(todo.text);
  };

  const saveEdit = async () => {
    if (editIndex === null) return;

    const todo = todosByDate[selectedKey][editIndex];

    const res = await fetch(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({text: editText.trim()}),
    });

    const updatedTodo: Todo = await res.json();

    const newTodos = [...(todosByDate[selectedKey] || [])];
    newTodos[editIndex] = updatedTodo;

    // 완료되지 않은 할일을 먼저 보여주도록 정렬
    newTodos.sort((a, b) => Number(a.completed) - Number(b.completed));

    setTodosByDate({
      ...todosByDate,
      [selectedKey]: newTodos,
    });

    setEditIndex(null);
    setEditText('');
  };

  const exportToGoogleCalendar = async (todo: Todo) => {
    try {
      setMessage('📝 Google Tasks로 내보내는 중...');

      const res = await fetch('/api/calendar/export', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          todoId: todo.id,
          date: selectedKey,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        // 성공 메시지를 잠시 후 초기화
        setTimeout(() => {
          getProcrastinationAdvice();
        }, 3000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      setMessage('❌ Google Tasks 내보내기에 실패했습니다.');
    }
  };

  return {
    mounted,
    todosByDate,
    input,
    setInput,
    message,
    setMessage,
    editIndex,
    editText,
    setEditText,
    setEditIndex,
    selectedKey,
    addTodo,
    toggleComplete,
    deleteTodo,
    getAdvice,
    getProcrastinationAdvice,
    startEdit,
    saveEdit,
    exportToGoogleCalendar,
  };
}
