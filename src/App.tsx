import { useState, useEffect } from 'react'
import './App.css'
import { getTodos, createTodo, toggleTodo, deleteTodo } from './api/todos'
import type { ITodo } from './models/Todo'

function App() {
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
           (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Load todos on component mount
  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const result = await getTodos();
      if (result.success && result.data) {
        setTodos(result.data);
      } else {
        setError(result.error || 'Failed to load todos');
      }
    } catch (err) {
      setError('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim() === '') return;

    try {
      const result = await createTodo(newTodo);
      if (result.success && result.data) {
        setTodos(prevTodos => [result.data, ...prevTodos]);
        setNewTodo('');
      } else {
        setError(result.error || 'Failed to add todo');
      }
    } catch (err) {
      setError('Failed to add todo');
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      const result = await toggleTodo(id);
      if (result.success && result.data) {
        setTodos(prevTodos =>
          prevTodos.map(todo =>
            todo._id === id ? { ...todo, completed: !todo.completed } : todo
          )
        );
      } else {
        setError(result.error || 'Failed to toggle todo');
      }
    } catch (err) {
      setError('Failed to toggle todo');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const result = await deleteTodo(id);
      if (result.success && result.data) {
        setTodos(prevTodos => prevTodos.filter(todo => todo._id !== id));
      } else {
        setError(result.error || 'Failed to delete todo');
      }
    } catch (err) {
      setError('Failed to delete todo');
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Todo App</h1>
        <button 
          onClick={toggleTheme} 
          className="theme-toggle"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}
      <form onSubmit={handleAddTodo} className="todo-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="todo-input"
        />
        <button type="submit" className="add-button">Add</button>
      </form>
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <div className="todo-content">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleTodo(todo._id)}
                className="todo-checkbox"
              />
              <span className="todo-text">
                {todo.text}
              </span>
            </div>
            <button
              onClick={() => handleDeleteTodo(todo._id)}
              className="delete-button"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
