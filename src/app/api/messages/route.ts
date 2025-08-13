import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '../auth/[...nextauth]/route'; // Import 'auth' directly

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await auth(); // Call 'auth' as a function
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    const userId = session.user.id;

    const messages = await prisma.chatMessage.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("메시지 가져오기 오류:", error);
    return NextResponse.json({ error: "메시지를 가져오는 데 실패했습니다." }, { status: 500 });
  }
}
