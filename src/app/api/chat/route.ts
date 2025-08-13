import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient
import { auth } from '../auth/[...nextauth]/route'; // Import 'auth' directly

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY as string);
const prisma = new PrismaClient(); // Initialize Prisma

export async function POST(request: Request) {
  try {
    const session = await auth(); // Call 'auth' as a function
    if (!session || !session.user || !session.user.id) { // Check if user is logged in
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    const userId = session.user.id;

    const { messages } = await request.json();

    // Save user message to DB
    const userMessageText = messages[messages.length - 1].text; // Last message is user's
    await prisma.chatMessage.create({
      data: {
        userId: userId,
        sender: 'user',
        text: userMessageText,
      },
    });

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const history = messages.map((msg: { sender: string; text: string }) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const streamingResult = await model.generateContentStream({
      contents: history,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 200,
      },
    });

    let aiResponseText = ''; // To store full AI response for saving

    // Create a ReadableStream to stream the response back to the client
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of streamingResult.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            aiResponseText += chunkText; // Accumulate AI response
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
        }
        controller.close();

        // Save AI message to DB after stream is complete
        await prisma.chatMessage.create({
          data: {
            userId: userId,
            sender: 'ai',
            text: aiResponseText,
          },
        });
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Google Generative AI API 호출 오류:", error);
    return NextResponse.json({ error: "AI 응답을 가져오는 데 실패했습니다." }, { status: 500 });
  }
}


