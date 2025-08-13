'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react'; // Import useSession

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const ChatInterface = () => {
  const { data: session, status } = useSession(); // Get session data
  const [messages, setMessages] = useState<Message[]>([]); // Initialize as empty
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true); // New state for history loading
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fetch chat history on component mount
  useEffect(() => {
    const fetchHistory = async () => {
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/messages');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: Message[] = await response.json();
          setMessages(data);
        } catch (error) {
          console.error("대화 기록 가져오기 오류:", error);
          setMessages([{ id: 0, text: "대화 기록을 가져오는 데 실패했습니다.", sender: 'ai' }]);
        } finally {
          setIsFetchingHistory(false);
        }
      } else if (status === 'unauthenticated') {
        setIsFetchingHistory(false);
        setMessages([{ id: 0, text: "로그인 후 대화를 시작할 수 있습니다.", sender: 'ai' }]);
      }
    };

    fetchHistory();
  }, [status]); // Re-run when session status changes

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || isSending) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
    };

    // Optimistically update UI
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsSending(true);

    // Add a placeholder AI message to the state for streaming
    const aiMessageId = messages.length + 2;
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: aiMessageId, text: '', sender: 'ai' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }), // Send full history
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("응답 스트림을 읽을 수 없습니다.");
      }

      const decoder = new TextDecoder();
      let receivedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        receivedText += chunk;

        // Update the last AI message with the new chunk directly
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === aiMessageId ? { ...msg, text: receivedText } : msg
          )
        );
      }

    } catch (error) {
      console.error("AI 응답 가져오기 오류:", error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "AI 응답을 가져오는 데 실패했습니다. 다시 시도해주세요.",
        sender: 'ai',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {isFetchingHistory ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">대화 기록을 불러오는 중...</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-lg px-4 py-2 rounded-lg shadow ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                    }`}>
                  {message.text}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
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
            disabled={isSending || isFetchingHistory}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full disabled:bg-gray-400"
            disabled={!input.trim() || isSending || isFetchingHistory}>
            전송
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
