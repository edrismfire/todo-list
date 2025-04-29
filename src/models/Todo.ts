import mongoose from 'mongoose';

export interface ITodo {
  text: string;
  completed: boolean;
  createdAt: Date;
}

const todoSchema = new mongoose.Schema<ITodo>({
  text: {
    type: String,
    required: [true, 'Please provide a text for this todo.'],
    maxlength: [200, 'Text cannot be more than 200 characters'],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Todo || mongoose.model<ITodo>('Todo', todoSchema); 