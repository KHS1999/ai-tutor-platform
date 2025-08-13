import { NextResponse } from 'next/server';
import db from '../../../../database/db'; // Adjust path as needed

export async function GET() {
  try {
    const courses = db.prepare('SELECT * FROM courses').all();
    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, instructor, duration, price, imageUrl } = await request.json();

    if (!title || !price) {
      return NextResponse.json({ message: 'Title and price are required' }, { status: 400 });
    }

    const stmt = db.prepare('INSERT INTO courses (title, description, instructor, duration, price, image_url) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(title, description, instructor, duration, price, imageUrl);

    return NextResponse.json({ message: 'Course added successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error adding course:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
