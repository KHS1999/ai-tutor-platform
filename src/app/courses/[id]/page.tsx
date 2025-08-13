'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  price: number;
  image_url: string;
}

interface Lesson {
  id: number;
  course_id: number;
  title: string;
  type: string; // e.g., 'video', 'text', 'quiz'
  content: string; // URL for video/text, or quiz data
  order_index: number;
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]); // Added lessons state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => { // Combined fetch functions
      try {
        // Fetch course details
        const courseResponse = await fetch(`/api/courses/${id}`);
        if (!courseResponse.ok) {
          throw new Error(`HTTP error! status: ${courseResponse.status}`);
        }
        const courseData = await courseResponse.json();
        setCourse(courseData);

        // Fetch lessons for the course
        const lessonsResponse = await fetch(`/api/courses/${id}/lessons`);
        if (!lessonsResponse.ok) {
          throw new Error(`HTTP error! status: ${lessonsResponse.status}`);
        }
        const lessonsData = await lessonsResponse.json();
        setLessons(lessonsData);

      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <p>강좌 상세 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-red-500">오류: {error}</p>
        <Link href="/courses" className="text-blue-500 hover:underline mt-4">강좌 목록으로 돌아가기</Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <p>강좌를 찾을 수 없습니다.</p>
        <Link href="/courses" className="text-blue-500 hover:underline mt-4">강좌 목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-white rounded-lg shadow-md my-8">
      <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
      <img src={course.image_url || 'https://placehold.co/800x400?text=Course+Image'} alt={course.title} className="w-full h-64 object-cover rounded-lg mb-6" />
      <p className="text-gray-800 text-lg mb-4">{course.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-6">
        <div>
          <span className="font-semibold">강사:</span> {course.instructor}
        </div>
        <div>
          <span className="font-semibold">기간:</span> {course.duration}
        </div>
        <div>
          <span className="font-semibold">가격:</span> ${course.price.toFixed(2)}
        </div>
      </div>

      {/* Lessons Section */}
      <div className="mt-8">
        <h2 className="text-3xl font-bold mb-4">레슨 목록</h2>
        {lessons.length === 0 ? (
          <p className="text-gray-600">아직 레슨이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {lessons.map((lesson) => (
              <li key={lesson.id} className="bg-gray-50 p-4 rounded-md shadow-sm flex justify-between items-center">
                <Link href={`/courses/${course.id}/lessons/${lesson.id}`} className="text-lg font-medium text-blue-600 hover:underline">
                  {lesson.order_index}. {lesson.title} ({lesson.type === 'video' ? '비디오' : lesson.type === 'text' ? '텍스트' : '퀴즈'})
                </Link>
                <span className="text-sm text-gray-500">{lesson.type}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link href="/courses" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded inline-block mt-8">
        강좌 목록으로 돌아가기
      </Link>
    </div>
  );
}
