import { NextResponse } from 'next/server';
import db from '../../../../../database/db'; // Adjust path as needed
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization token missing' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) {
      return NextResponse.json({ message: 'Lesson ID is required' }, { status: 400 });
    }

    const progress = db.prepare('SELECT * FROM user_lesson_progress WHERE user_id = ? AND lesson_id = ?').get(userId, lessonId);
    return NextResponse.json(progress, { status: 200 });
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization token missing' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const { lessonId, status } = await request.json();

    if (!lessonId || !status) {
      return NextResponse.json({ message: 'Lesson ID and status are required' }, { status: 400 });
    }

    // Check if progress already exists
    const existingProgress = db.prepare('SELECT * FROM user_lesson_progress WHERE user_id = ? AND lesson_id = ?').get(userId, lessonId);

    if (existingProgress) {
      // Update existing progress
      const stmt = db.prepare('UPDATE user_lesson_progress SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND lesson_id = ?');
      stmt.run(status, userId, lessonId);
    } else {
      // Insert new progress
      const stmt = db.prepare('INSERT INTO user_lesson_progress (user_id, lesson_id, status, completed_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)');
      stmt.run(userId, lessonId, status);
    }

    return NextResponse.json({ message: 'Lesson progress updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}