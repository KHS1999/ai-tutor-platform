import { NextResponse } from 'next/server';
import db from '../../../../../../database/db'; // Adjust path as needed

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const lessons = db.prepare('SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC').all(id);
    return NextResponse.json(lessons, { status: 200 });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const { title, type, content, order_index } = await request.json();

    if (!title || !type || content === undefined || order_index === undefined) {
      return NextResponse.json({ message: 'Title, type, content, and order_index are required' }, { status: 400 });
    }

    const stmt = db.prepare('INSERT INTO lessons (course_id, title, type, content, order_index) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, title, type, content, order_index);

    return NextResponse.json({ message: 'Lesson added successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error adding lesson:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}