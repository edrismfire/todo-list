import { ITodo } from '../models/Todo';

// Default to the production URL if environment variable is not set
const API_URL = import.meta.env.VITE_API_URL || 'https://todo-list-iye9.onrender.com';

// Remove any trailing slashes and ensure proper URL construction
const getApiUrl = (endpoint: string) => {
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Get all todos
export async function getTodos(): Promise<ApiResponse<ITodo[]>> {
  try {
    const response = await fetch(getApiUrl('/api/todos'));
    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    return { success: false, error: 'Failed to fetch todos' };
  }
}

// Create a new todo
export async function createTodo(text: string): Promise<ApiResponse<ITodo>> {
  try {
    const response = await fetch(getApiUrl('/api/todos'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      throw new Error('Failed to create todo');
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Failed to create todo:', error);
    return { success: false, error: 'Failed to create todo' };
  }
}

// Toggle todo completion status
export async function toggleTodo(id: string): Promise<ApiResponse<ITodo>> {
  try {
    const response = await fetch(getApiUrl(`/api/todos/${id}`), {
      method: 'PUT',
    });
    if (!response.ok) {
      throw new Error('Failed to toggle todo');
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Failed to toggle todo:', error);
    return { success: false, error: 'Failed to toggle todo' };
  }
}

// Delete a todo
export async function deleteTodo(id: string): Promise<ApiResponse<ITodo>> {
  try {
    const response = await fetch(getApiUrl(`/api/todos/${id}`), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete todo');
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Failed to delete todo:', error);
    return { success: false, error: 'Failed to delete todo' };
  }
} 