import { ITodo } from '../models/Todo';

const API_URL = 'http://localhost:5173/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Get all todos
export async function getTodos(): Promise<ApiResponse<ITodo[]>> {
  try {
    const response = await fetch(`${API_URL}/todos`);
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
    const response = await fetch(`${API_URL}/todos`, {
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
    const response = await fetch(`${API_URL}/todos/${id}`, {
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
    const response = await fetch(`${API_URL}/todos/${id}`, {
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