import { Todo } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow mb-2">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo._id)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <span className={`ml-3 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
          {todo.text}
        </span>
      </div>
      <button
        onClick={() => onDelete(todo._id)}
        className="text-red-500 hover:text-red-700"
      >
        Delete
      </button>
    </div>
  );
} 