import { NextResponse } from 'next/server';
import db from '../../../../../database/db'; // Corrected path

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
