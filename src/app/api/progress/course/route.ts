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
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      // Get all course progress for the user
      const progress = db.prepare('SELECT * FROM user_course_progress WHERE user_id = ?').all(userId);
      return NextResponse.json(progress, { status: 200 });
    } else {
      // Get specific course progress
      const progress = db.prepare('SELECT * FROM user_course_progress WHERE user_id = ? AND course_id = ?').get(userId, courseId);
      return NextResponse.json(progress, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching course progress:', error);
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

    const { courseId } = await request.json(); // Only courseId is needed from body

    if (!courseId) {
      return NextResponse.json({ message: 'Course ID is required' }, { status: 400 });
    }

    // --- Logic to calculate and update course progress ---
    console.log(`Calculating progress for userId: ${userId}, courseId: ${courseId}`);

    const totalLessonsResult = db.prepare('SELECT COUNT(*) AS count FROM lessons WHERE course_id = ?').get(courseId);
    const totalLessons = totalLessonsResult ? totalLessonsResult.count : 0;
    console.log(`Total lessons for course ${courseId}: ${totalLessons}`);

    const completedLessonsResult = db.prepare('SELECT COUNT(*) AS count FROM user_lesson_progress WHERE user_id = ? AND lesson_id IN (SELECT id FROM lessons WHERE course_id = ?) AND status = \'completed\'').get(userId, courseId);
    const completedLessons = completedLessonsResult ? completedLessonsResult.count : 0;
    console.log(`Completed lessons for user ${userId} in course ${courseId}: ${completedLessons}`);

    let newProgressPercentage = 0;
    let newStatus = 'in_progress';

    if (totalLessons > 0) {
      newProgressPercentage = (completedLessons / totalLessons) * 100;
      if (completedLessons === totalLessons) {
        newStatus = 'completed';
      }
    } else {
      newStatus = 'not_started'; // No lessons in course
    }
    console.log(`New progress percentage: ${newProgressPercentage}, status: ${newStatus}`);
    // --- End of logic ---

    // Check if progress already exists
    const existingProgress = db.prepare('SELECT * FROM user_course_progress WHERE user_id = ? AND course_id = ?').get(userId, courseId);

    if (existingProgress) {
      // Update existing progress
      const stmt = db.prepare('UPDATE user_course_progress SET status = ?, progress_percentage = ?, last_accessed = CURRENT_TIMESTAMP WHERE user_id = ? AND course_id = ?');
      stmt.run(newStatus, newProgressPercentage, userId, courseId);
    } else {
      // Insert new progress
      const stmt = db.prepare('INSERT INTO user_course_progress (user_id, course_id, status, progress_percentage) VALUES (?, ?, ?, ?)');
      stmt.run(userId, courseId, newStatus, newProgressPercentage);
    }

    return NextResponse.json({ message: 'Course progress updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating course progress:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}