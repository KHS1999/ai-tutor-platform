'use client';

import { useState } from 'react';

interface QuizProps {
  quizData: string; // JSON string containing question, options, answer
}

interface QuizContent {
  question: string;
  options: string[];
  answer: string;
}

export default function Quiz({ quizData }: QuizProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null); // New state for AI feedback

  let quizContent: QuizContent;
  try {
    quizContent = JSON.parse(quizData);
  } catch (e) {
    return <p className="text-red-500">퀴즈 데이터를 불러오는 데 오류가 발생했습니다.</p>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called'); // Debug log
    console.log('selectedOption:', selectedOption); // Debug log
    setIsSubmitted(true);
    if (selectedOption === quizContent.answer) {
      setFeedback('정답입니다!');
      setAiFeedback('훌륭합니다! 이 개념을 정확히 이해하고 계시네요. 다음 단계로 나아갈 준비가 되었습니다.');
    } else {
      setFeedback(`오답입니다. 정답은 "${quizContent.answer}"입니다.`);
      setAiFeedback('괜찮습니다. 이 문제는 조금 어려웠을 수 있습니다. 정답을 다시 한번 살펴보시고 관련 레슨을 복습해 보세요. 궁금한 점이 있다면 언제든지 질문해주세요!');
    }
    console.log('isSubmitted after set:', isSubmitted); // Debug log
    console.log('aiFeedback after set:', aiFeedback); // Debug log
  };

  const handleReset = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setFeedback(null);
    setAiFeedback(null); // Reset AI feedback as well
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">퀴즈</h3>
      <p className="mb-4">{quizContent.question}</p>
      <form onSubmit={handleSubmit}>
        <div className="space-y-2 mb-4">
          {quizContent.options.map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="radio"
                name="quizOption"
                value={option}
                checked={selectedOption === option}
                onChange={(e) => setSelectedOption(e.target.value)}
                disabled={isSubmitted}
                className="form-radio text-blue-600"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        {!isSubmitted && (
          <button
            type="submit"
            disabled={selectedOption === null}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            제출
          </button>
        )}
      </form>
      {isSubmitted && (
        <div className="mt-4">
          <p className={`font-bold ${feedback?.startsWith('정답') ? 'text-green-600' : 'text-red-600'}`}>
            {feedback}
          </p>
          {aiFeedback && ( // Display AI feedback
            <p className="text-gray-700 text-sm mt-2">
              <span className="font-semibold">AI 튜터:</span> {aiFeedback}
            </p>
          )}
          <button
            onClick={handleReset}
            className="mt-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            다시 풀기
          </button>
        </div>
      )}
    </div>
  );
}
