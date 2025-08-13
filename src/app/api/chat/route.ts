import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY as string);

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
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

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Google Generative AI API 호출 오류:", error);
    return NextResponse.json({ error: "AI 응답을 가져오는 데 실패했습니다." }, { status: 500 });
  }
}

