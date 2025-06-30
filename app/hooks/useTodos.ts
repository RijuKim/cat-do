import {useState, useEffect} from 'react';

// Todo 타입 선언 (필요하면 수정)
interface Todo {
  id: string;
  text: string;
  date: string;
  completed: boolean;
  advice?: string;
  celebration?: string;
}

export default function useTodos(date: Date, selectedCat: string) {
  const [mounted, setMounted] = useState(false);
  const [todosByDate, setTodosByDate] = useState<Record<string, Todo[]>>({});

  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const selectedKey = date.toLocaleDateString('sv-SE');

  useEffect(() => {
    setMounted(true);

    const fetchTodos = async () => {
      const res = await fetch('/api/todos');
      const todos: Todo[] = await res.json();

      const grouped = todos.reduce<Record<string, Todo[]>>((acc, todo) => {
        const key = todo.date;
        if (!acc[key]) acc[key] = [];
        acc[key].push(todo);
        return acc;
      }, {});

      setTodosByDate(grouped);
    };

    fetchTodos();
  }, []);

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
  };

  const getAdvice = async (todo: Todo) => {
    setMessage('🐱 생각 중이에요...');

    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        todo: todo.text,
        catName: selectedCat,
      }),
    });

    const data = await res.json();

    const updatedRes = await fetch(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({advice: `🐱 ${data.message}`}),
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
    startEdit,
    saveEdit,
  };
}
