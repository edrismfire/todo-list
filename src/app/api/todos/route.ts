import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Todo from '@/models/Todo';

export async function GET() {
  try {
    await connectDB();
    const todos = await Todo.find({}).sort({ createdAt: -1 });
    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    await connectDB();
    const todo = await Todo.create({ text });
    return NextResponse.json(todo);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, completed } = await request.json();
    await connectDB();
    const todo = await Todo.findByIdAndUpdate(
      id,
      { completed },
      { new: true }
    );
    return NextResponse.json(todo);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await connectDB();
    await Todo.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
} 