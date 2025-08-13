'use client';

import React, { useState } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: '안녕하세요! AI 튜터입니다. 무엇이 궁금하신가요?', sender: 'ai' },
    { id: 2, text: 'Next.js 프로젝트 설정에 대해 알려줘.', sender: 'user' },
    { id: 3, text: '좋은 질문입니다! Next.js 프로젝트 설정은 next.config.mjs 파일에서 시작됩니다. 어떤 설정을 가장 먼저 해볼까요?', sender: 'ai' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage: Message = {
        id: messages.length + 2,
        text: data.response,
        sender: 'ai',
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("AI 응답 가져오기 오류:", error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "AI 응답을 가져오는 데 실패했습니다. 다시 시도해주세요.",
        sender: 'ai',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-lg px-4 py-2 rounded-lg shadow ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                  }`}>
                {message.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-lg px-4 py-2 rounded-lg shadow bg-gray-200 text-gray-800">
                AI가 답변을 생각 중입니다...
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full disabled:bg-gray-400"
            disabled={!input.trim() || isLoading}>
            전송
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
