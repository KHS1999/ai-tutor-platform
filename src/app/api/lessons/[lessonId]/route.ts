import { NextResponse } from 'next/server';
import db from '../../../../../database/db'; // Adjust path as needed

export async function GET(request: Request, { params }: { params: { lessonId: string } }) {
  try {
    const { lessonId } = await params;
    const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(lessonId);

    if (!lesson) {
      return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json(lesson, { status: 200 });
  } catch (error) {
    console.error('Error fetching lesson by ID:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}