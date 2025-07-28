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

  // 날짜 또는 고양이가 바뀌면 완료 조언 초기화
  useEffect(() => {
    setCompletionAdvice(null);
  }, [selectedKey, selectedCat]);

  const fetchTodos = useCallback(async () => {
    if (!session) return;

    try {
      const res = await fetch('/api/todos');
      if (!res.ok) return;

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
    } catch (error) {
      console.error('할일 로드 오류:', error);
    }
  }, [session]);

  // 마운트 시 한 번만 실행
  useEffect(() => {
    setMounted(true);
  }, []);

  // 세션이 로드되면 할일 가져오기
  useEffect(() => {
    if (mounted && session) {
      fetchTodos();
    }
  }, [mounted, session, fetchTodos]);

  const getProcrastinationAdvice = useCallback(async () => {
    const todosForAdvice = todosByDate[selectedKey] || [];
    const hasTodos = todosForAdvice.length > 0;
    const allCompleted = hasTodos && todosForAdvice.every(t => t.completed);

    if (!hasTodos) {
      // 각 고양이의 성격에 맞는 메시지
      const emptyMessages = {
        두두: '할 일이 없다니... 그래도 집사라면 뭔가 할 일을 만들어야 하지 않겠냥?',
        코코: '할 일이 없네~ 그래도 괜찮아, 마음 편하게 쉬어도 돼, 야옹~',
        깜냥: '할 일이 없다니? 빈둥거리지마라냥!',
      };

      setMessage(
        emptyMessages[selectedCat as keyof typeof emptyMessages] ||
          emptyMessages['두두'],
      );
      return;
    }

    if (allCompleted) {
      // 완료 조언이 이미 있으면 재사용
      if (completionAdvice) {
        setMessage(completionAdvice);
        return;
      }

      // DB에서 요약 먼저 확인
      try {
        const adviceRes = await fetch(
          `/api/advice?date=${selectedKey}&catName=${selectedCat}`,
        );

        if (adviceRes.ok) {
          const savedAdvice = await adviceRes.json();
          if (savedAdvice) {
            setMessage(savedAdvice.message);
            setCompletionAdvice(savedAdvice.message);
            return;
          }
        }

        // 없으면 새로 생성 (로딩 메시지 표시)
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
      } catch (error) {
        console.error('조언 생성 오류:', error);
        setMessage('할 일이 남아있군! 힘내라냥! 🔥');
      }
    } else {
      // 각 고양이의 성격에 맞는 메시지
      const catMessages = {
        두두: '흥, 할 일이 남아있군... 그래도 집사라면 해낼 수 있을 거라냥.',
        코코: '할 일이 있지만~ 하루는 기니까, 마음을 편하게 가져, 야옹~',
        깜냥: '할 일이 남아있는데 뭐하고 있는 거야? 내 밥을 사주려면 빨리 해라냥!',
      };

      setMessage(
        catMessages[selectedCat as keyof typeof catMessages] ||
          catMessages['두두'],
      );
    }
  }, [
    selectedKey,
    selectedCat,
    todosByDate,
    completionAdvice,
    session?.user?.id,
  ]);

  // 조언 생성 최적화: 필요한 경우에만 호출
  useEffect(() => {
    if (mounted) {
      // 할일 상태가 변경될 때마다 조언 생성
      getProcrastinationAdvice();
    }
  }, [
    mounted,
    selectedKey,
    selectedCat,
    todosByDate,
    getProcrastinationAdvice,
  ]);

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
