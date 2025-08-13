'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Quiz from '@/components/Quiz';

interface Lesson {
  id: number;
  course_id: number;
  title: string;
  type: string; // e.g., 'video', 'text', 'quiz'
  content: string; // URL for video/text, or quiz data
  order_index: number;
}

export default function LessonDetailPage() {
  const { id, lessonId } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false); // New state for completion
  const [completionMessage, setCompletionMessage] = useState(''); // New state for completion message

  useEffect(() => {
    if (!lessonId) return;

    const fetchLessonAndProgress = async () => {
      try {
        // Fetch lesson details
        const lessonResponse = await fetch(`/api/lessons/${lessonId}`);
        if (!lessonResponse.ok) {
          throw new Error(`HTTP error! status: ${lessonResponse.status}`);
        }
        const lessonData = await lessonResponse.json();
        setLesson(lessonData);

        // Fetch user's lesson progress
        const token = localStorage.getItem('token');
        if (token) {
          const progressResponse = await fetch(`/api/progress/lesson?lessonId=${lessonId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            if (progressData && progressData.status === 'completed') {
              setIsCompleted(true);
              setCompletionMessage('이 레슨을 완료했습니다.');
            }
          } else {
            // If progress not found (404), it means not completed
            setIsCompleted(false);
          }
        }

      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonAndProgress();
  }, [lessonId]);

  const handleMarkCompleted = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCompletionMessage('로그인 후 레슨을 완료할 수 있습니다.');
      return;
    }

    try {
      const response = await fetch('/api/progress/lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ lessonId: lesson?.id, status: 'completed' }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsCompleted(true);
        setCompletionMessage('레슨이 완료로 표시되었습니다!');
        
        // --- Update course progress ---
        if (lesson?.course_id) {
          await fetch('/api/progress/course', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ courseId: lesson.course_id }),
          });
        }
        // --- End update course progress ---

      } else {
        setCompletionMessage(data.message || '레슨 완료 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error marking lesson completed:', error);
      setCompletionMessage('예상치 못한 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <p>레슨 상세 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-red-500">오류: {error}</p>
        <Link href={`/courses/${id}`} className="text-blue-500 hover:underline mt-4">강좌로 돌아가기</Link>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <p>레슨을 찾을 수 없습니다.</p>
        <Link href={`/courses/${id}`} className="text-blue-500 hover:underline mt-4">강좌로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-white rounded-lg shadow-md my-8">
      <h1 className="text-4xl font-bold mb-4">{lesson.title}</h1>
      <p className="text-gray-600 text-sm mb-4">유형: {lesson.type}</p>
      {lesson.type === 'video' && (
        <div className="aspect-w-16 aspect-h-9 mb-6">
          <iframe
            src={lesson.content}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      )}
      {lesson.type === 'text' && (
        <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: lesson.content }}></div>
      )}
      {lesson.type === 'quiz' && (
        <Quiz quizData={lesson.content} />
      )}

      <div className="mt-8 text-center">
        {!isCompleted ? (
          <button
            onClick={handleMarkCompleted}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            레슨 완료로 표시
          </button>
        ) : (
          <p className="text-green-600 font-semibold">{completionMessage}</p>
        )}
        {completionMessage && !isCompleted && (
          <p className="text-red-500 text-sm mt-2">{completionMessage}</p>
        )}
      </div>

      <Link href={`/courses/${id}`} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded inline-block mt-8">
        강좌로 돌아가기
      </Link>
    </div>
  );
}
