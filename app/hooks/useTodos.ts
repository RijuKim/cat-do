import {useState, useEffect, useCallback} from 'react';

// Todo 타입 선언 (필요하면 수정)
interface Todo {
  id: string;
  text: string;
  date: string;
  completed: boolean;
  advice?: string;
  celebration?: string;
  adviceCat?: string;
}

export default function useTodos(date: Date, selectedCat: string) {
  const [mounted, setMounted] = useState(false);
  const [todosByDate, setTodosByDate] = useState<Record<string, Todo[]>>({});
  const [completionAdvice, setCompletionAdvice] = useState<string | null>(null); // 완료 조언 저장

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
  useEffect(() => {
    setCompletionAdvice(null);
  }, [selectedCat]);

  const fetchTodos = useCallback(async () => {
    const res = await fetch('/api/todos');
    const todos: Todo[] = await res.json();

    const grouped = todos.reduce<Record<string, Todo[]>>((acc, todo) => {
      const key = todo.date;
      if (!acc[key]) acc[key] = [];
      acc[key].push(todo);
      return acc;
    }, {});

    setTodosByDate(grouped);
  }, []);

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

      setMessage('🐱 냐...');
      const actionType = 'SUMMARIZE';

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

      setMessage('🐱 열심히 생각 중...');
      const generateRes = await fetch('/api/assistant', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          todos: todosForAdvice,
          catName: selectedCat,
          action: actionType,
          date: selectedKey,
        }),
      });

      const data = await generateRes.json();
      if (generateRes.ok) {
        setMessage(data.message);
        setCompletionAdvice(data.message); // 조언 저장
      } else {
        setMessage('미안, 지금은 조언을 해줄 수 없어.');
      }
    } else {
      setMessage('🐱 할 일이 남아있군! 힘내라냥! 🔥');
    }
  }, [selectedKey, selectedCat, todosByDate, completionAdvice]);

  useEffect(() => {
    if (mounted) {
      getProcrastinationAdvice();
    }
  }, [mounted, getProcrastinationAdvice]);

  const addTodo = async () => {
    if (!input.trim()) return;

    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({text: input.trim(), date: selectedKey}),
    });

    const newTodo: Todo = await res.json();

    const updated = {
      ...todosByDate,
      [selectedKey]: [...(todosByDate[selectedKey] || []), newTodo],
    };
    setTodosByDate(updated);
    setInput('');
    getProcrastinationAdvice();
  };

  const toggleComplete = async (todo: Todo) => {
    const completed = !todo.completed;
    const celebration = completed
      ? `🐱 "${todo.text}" 완료! 집사 최고! 🐾`
      : '';

    const res = await fetch(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({completed, celebration}),
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

    setTodosByDate({
      ...todosByDate,
      [selectedKey]: newTodos,
    });

    setEditIndex(null);
    setEditText('');
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
  };
}
