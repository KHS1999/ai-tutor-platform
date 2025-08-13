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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
    };

    setMessages([...messages, newMessage]);
    setInput('');

    // TODO: Add AI response logic here
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
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full disabled:bg-gray-400"
            disabled={!input.trim()}>
            전송
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
