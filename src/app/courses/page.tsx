'use client';

import { useEffect, useState } from 'react';
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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCourses(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <p>Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8">Our Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.length === 0 ? (
          <p className="col-span-full text-center text-gray-600">No courses available yet. Check back soon!</p>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={course.image_url || 'https://via.placeholder.com/400x200?text=Course+Image'} alt={course.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2">{course.title}</h2>
                <p className="text-gray-700 mb-4">{course.description || 'No description available.'}</p>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                  <span>Instructor: {course.instructor || 'N/A'}</span>
                  <span>Duration: {course.duration || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-blue-600">${course.price.toFixed(2)}</span>
                  <Link href={`/courses/${course.id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    상세 보기
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
