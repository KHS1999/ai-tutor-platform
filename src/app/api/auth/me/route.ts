import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use environment variable

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization token missing' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    const decoded: any = jwt.verify(token, JWT_SECRET);

    // In a real app, you might fetch user details from DB based on decoded.userId
    // For now, we return decoded info
    return NextResponse.json({ user: { id: decoded.userId, username: decoded.username, email: decoded.email } }, { status: 200 });
  } catch (error) {
    console.error('Auth error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
